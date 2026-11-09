#!/usr/bin/env bash
# =============================================================================
# scripts/docker-dev.sh — every `npm run docker:*` goes through here
# =============================================================================
# `docker compose up` alone can create the bind-mount directories and then die
# because the daemon is unreachable — leaving two empty root-owned directories,
# no container, and the actual reason lost in a log. This wrapper runs the
# pre-flight in scripts/lib/docker-preflight.sh first, streams compose output to
# the terminal, and verifies afterwards that the stack really came up (including
# what the one-shot `seed` container did, since that is what fills the database).
#
# Usage (normally via npm):
#   npm run docker:dev          build + start the dev stack (overlay merged)
#   npm run docker:dev:check    pre-flight only, start nothing
#   npm run docker:dev:logs     follow the API log
#   npm run docker:dev:down     stop, keep data
#   npm run docker:prod         base file only
#   npm run docker:down
#
#   bash scripts/docker-dev.sh <up|check|logs|down> [--dev|--prod]
# =============================================================================
set -uo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
# shellcheck source=lib/docker-preflight.sh
source "${SCRIPT_DIR}/lib/docker-preflight.sh"

# A silently failed `source` would leave every check undefined and the script
# would then "run" and produce meaningless errors, so fail loudly instead.
if ! declare -F check_docker_cli >/dev/null; then
  echo 'docker:dev failed — could not load scripts/lib/docker-preflight.sh' >&2
  echo "  expected helpers at: ${SCRIPT_DIR}/lib/docker-preflight.sh" >&2
  echo '  the file is missing or unreadable — restore it (git checkout scripts/lib)' >&2
  exit 1
fi

DEV_OVERLAY='docker-compose.dev.yml'
BASE_FILE='docker-compose.yml'
# Containers survive `up -d` for a moment even when they then crash-loop, so the
# status check lets the API finish booting before judging it.
SETTLE_SECONDS=2

# --- compose plumbing ---------------------------------------------------------
# Compose still owns the work; this only picks the files for the profile and runs
# from the repo root so relative paths in the YAML resolve as documented.
build_compose_files() {
  COMPOSE_FILES=(-f "${REPO_ROOT}/${BASE_FILE}")

  if [[ "$1" == 'dev' ]]; then
    COMPOSE_FILES+=(-f "${REPO_ROOT}/${DEV_OVERLAY}")
  fi
}

run_compose() {
  ( cd "$REPO_ROOT" && docker compose "${COMPOSE_FILES[@]}" "$@" )
}

print_container_status() {
  echo
  echo '  Containers:'
  run_compose ps -a --format 'table {{.Service}}\t{{.State}}\t{{.Status}}' 2>&1 |
    sed 's/^/    /'
}

# The seeder is the only thing that fills an empty dev database, and it exits by
# design — so its log is printed even on success, and an empty log is called out
# instead of being mistaken for "seeded fine".
print_seed_log() {
  local seed_log

  seed_log="$(run_compose logs --no-color --tail 15 seed 2>&1)"

  if [[ -z "${seed_log//[[:space:]]/}" ]]; then
    warn 'no `seed` container log — was the dev overlay applied?'
    warn 'check: docker compose -f docker-compose.yml -f docker-compose.dev.yml config --services'
    return 0
  fi

  echo
  echo '  seed (last 15 lines):'
  printf '%s\n' "$seed_log" | sed 's/^/    /'
}


# The regression this wrapper exists for: `up` exits, the only trace is two empty
# directories, and nothing says why. So the stack is inspected afterwards.
#
# `docker compose ps --status running` also reports a container that is
# crash-looping as "running", which hid a restarting API behind a success line.
# Every non-running state is therefore collected explicitly, and `seed` is judged
# by its exit code instead of its state (Exit 0 is its success case).
verify_stack_started() {
  local healthy_services
  local failed_services

  sleep "$SETTLE_SECONDS"
  print_container_status
  print_seed_log

  healthy_services="$(collect_services running)"
  failed_services="$(
    {
      collect_services restarting
      collect_services exited | grep -vx 'seed' || true
      collect_services dead
    } | grep -vE '^$' || true
  )"

  if [[ -z "$healthy_services" ]]; then
    diagnose_startup_failure 'no container is running after `up`'
  fi

  if [[ -n "$failed_services" ]]; then
    diagnose_startup_failure "these services are not running: $(tr '\n' ' ' <<<"$failed_services")"
  fi

  say "running: $(tr '\n' ' ' <<<"$healthy_services")"
}

# Service names in one state, one per line; `docker compose` support for
# --status varies, so a failure here must not abort the report.
collect_services() {
  run_compose ps -a --status "$1" --services 2>/dev/null || true
}

# Pulls the facts apart instead of printing a bare "unable to open database file":
# what the container said, and whether it can write to the bind mounts at all.
diagnose_startup_failure() {
  local headline="$1"

  print_service_log run_compose server
  probe_container_writes run_compose
  fail "$headline" \
    'api log and write probe above; full log: npm run docker:dev:logs' \
    'if the probe says DENIED while the host can write, it is SELinux or ownership:' \
    '  the mounts use :z, so re-create them: docker compose up -d --force-recreate' \
    '  if it still fails: sudo chown -R "$USER" <DATABASE_DIR>'
}

# Everything `up` needs, in dependency order; returns only when fully configured.
run_preflight() {
  check_docker_cli
  check_docker_daemon
  check_env_file
  check_data_dirs
  build_compose_files "$1"

  if [[ "${DEEP_CHECK:-0}" == '1' ]]; then
    probe_container_writes run_compose
    fail_on_denied_mounts
  fi
}

# --- commands -----------------------------------------------------------------
# `up` is deliberately a thin alias for `docker compose up --build -d`: no gate,
# no verdict. `docker compose down` / `docker compose up` must keep working
# without this script, so the script must not become the only supported path.
# The checks live in `check`/`status` below, which you run when something looks
# wrong — they are not a toll booth in front of the build.
cmd_up() {
  build_compose_files "$1"
  run_compose up --build -d
  local compose_status="$?"

  echo
  echo "  exit ${compose_status} — state: docker compose ps -a"
  echo '  API log:  npm run docker:dev:logs     checks: npm run docker:dev:check'
  return "$compose_status"
}

cmd_logs() {
  check_docker_cli
  check_docker_daemon
  build_compose_files "$1"
  run_compose logs --no-color -f server
}

cmd_down() {
  check_docker_cli
  check_docker_daemon
  build_compose_files "$1"
  run_compose down
}

# Exits 0 only when the stack is configured *and* healthy: pre-flight first, then
# the same verdict `up` no longer renders. This is what you run when the site is
# blank or a container keeps restarting.
cmd_check() {
  echo "docker:dev check (profile: ${1})"
  run_preflight "$1"
  verify_stack_started
  echo '  all checks passed — stack is configured and running'
}

# Post-up verdict only (no pre-flight, nothing started): the old `up` behaviour,
# available on demand.
cmd_status() {
  build_compose_files "$1"
  verify_stack_started
}

print_usage() {
  cat <<'EOF'
Usage: bash scripts/docker-dev.sh <command> [--dev|--prod] [--deep]

  up [flags]      = docker compose up --build -d   (plain alias, no checks)
  check [flags]   pre-flight + running-stack verdict, starts nothing
  status [flags]  container table, seed log, write probe — no changes
  logs [flags]    follow the API container log
  down [flags]    stop the stack (the data directories are kept)

  --dev           merge docker-compose.dev.yml (default)
  --prod          base file only
  --deep          check only: also prove /data and /images are writable from
                  inside a container (catches SELinux/ownership mismatches)

`docker compose up -d` / `docker compose down` work directly — this script only
adds diagnostics. Use it when something looks wrong, not as the only way in.
EOF
}

parse_profile() {
  local argument

  PROFILE='dev'
  DEEP_CHECK='0'
  for argument in "$@"; do
    case "$argument" in
      --dev) PROFILE='dev' ;;
      --prod) PROFILE='prod' ;;
      --deep) DEEP_CHECK='1' ;;
      *) print_usage >&2; return 2 ;;
    esac
  done
}

main() {
  local command="${1:-up}"

  case "$command" in
    --help | -h | help) print_usage; return 0 ;;
  esac

  shift || true
  parse_profile "$@" || return 2

  case "$command" in
    up) cmd_up "$PROFILE" ;;
    check) cmd_check "$PROFILE" ;;
    status) cmd_status "$PROFILE" ;;
    logs) cmd_logs "$PROFILE" ;;
    down) cmd_down "$PROFILE" ;;
    *) print_usage >&2; return 2 ;;
  esac
}

main "$@"
