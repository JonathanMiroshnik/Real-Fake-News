#!/usr/bin/env bash
# =============================================================================
# scripts/docker-dev.sh — DIAGNOSTICS ONLY. It never starts or stops anything.
# =============================================================================
# The stack is driven by stock Compose, with the conventional file names:
#
#   docker compose up --build -d     # dev: docker-compose.override.yml auto-merges
#   docker compose down
#   docker compose -f docker-compose.yml up -d    # production: base file only
#
# This script exists for the case where one of those "does nothing" and the
# reason is not obvious — the classic example being a shell that predates
# `usermod -aG docker`, which fails at the socket before Compose can say why.
#
#   npm run doctor            pre-flight: CLI, daemon, socket access, .env, data dirs
#   npm run doctor:deep       + prove /data and /images are writable in a container
#   npm run doctor:status     container states + seed log + write probe
# =============================================================================
set -uo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
# shellcheck source=lib/docker-preflight.sh
source "${SCRIPT_DIR}/lib/docker-preflight.sh"

# Fail loudly if the helper file is missing: a silent `source` failure would
# leave every check undefined and the report meaningless.
if ! declare -F check_docker_cli >/dev/null; then
  echo 'doctor: could not load scripts/lib/docker-preflight.sh' >&2
  echo "  expected: ${SCRIPT_DIR}/lib/docker-preflight.sh (restore it: git checkout scripts/lib)" >&2
  exit 1
fi

# Dev reads docker-compose.override.yml automatically, so no -f is needed.
DEV_COMPOSE_FILES=(-f "${REPO_ROOT}/docker-compose.yml" -f "${REPO_ROOT}/docker-compose.override.yml")

run_dev_compose() {
  ( cd "$REPO_ROOT" && docker compose "${DEV_COMPOSE_FILES[@]}" "$@" )
}

print_container_status() {
  echo
  echo '  Containers:'
  run_dev_compose ps -a --format 'table {{.Service}}\t{{.State}}\t{{.Status}}' 2>&1 |
    sed 's/^/    /'
}

# The seeder is the only thing that fills an empty dev database and it exits by
# design, so its log is always shown — an empty log is called out rather than
# being mistaken for "seeded fine".
print_seed_log() {
  local seed_log

  seed_log="$(run_dev_compose logs --no-color --tail 15 seed 2>&1)"

  if [[ -z "${seed_log//[[:space:]]/}" ]]; then
    warn 'no `seed` container log — was docker-compose.override.yml picked up?'
    warn 'check: docker compose config --services   (dev should list server seed client admin)'
    return 0
  fi

  echo
  echo '  seed (last 15 lines):'
  printf '%s\n' "$seed_log" | sed 's/^/    /'
}

collect_services() {
  run_dev_compose ps -a --status "$1" --services 2>/dev/null || true
}

# `docker compose ps --status running` also counts a crash-looping container as
# running, so every non-running state is collected explicitly and `seed` is
# judged by its exit code (Exit 0 is its success case).
verify_stack_started() {
  local healthy_services
  local failed_services

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
    diagnose_startup_failure 'no container is running'
  fi

  if [[ -n "$failed_services" ]]; then
    diagnose_startup_failure "these services are not running: $(tr '\n' ' ' <<<"$failed_services")"
  fi

  say "running: $(tr '\n' ' ' <<<"$healthy_services")"
}

# Pulls the facts apart instead of showing a bare "unable to open database file".
diagnose_startup_failure() {
  local headline="$1"

  print_service_log run_dev_compose server
  probe_container_writes run_dev_compose
  fail "$headline" \
    'api log and write probe above; full log: docker compose logs server' \
    'if the probe says DENIED while the host can write, it is SELinux or ownership:' \
    '  docker compose up -d --force-recreate            # re-applies the :z relabel' \
    '  sudo chown -R "$USER" <the directory from .env>'
}

# --- commands -----------------------------------------------------------------
doctor_preflight() {
  check_docker_cli
  check_docker_daemon
  check_env_file
  check_data_dirs
}

cmd_doctor() {
  echo 'docker doctor — pre-flight (nothing is started or stopped)'
  doctor_preflight

  if [[ "$1" == 'deep' ]]; then
    probe_container_writes run_dev_compose
    fail_on_denied_mounts
  fi

  echo
  echo '  all checks passed. Start the stack with:'
  echo '    docker compose up --build -d      (dev — override file merges automatically)'
}

cmd_status() {
  check_docker_cli
  check_docker_daemon
  verify_stack_started
}

print_usage() {
  cat <<'EOF'
Usage: bash scripts/docker-dev.sh <doctor|doctor-deep|status>

Diagnostics only — this script never starts or stops containers.

  doctor       docker CLI, Compose v2, daemon + socket access, .env, data dirs
  doctor-deep  the above, plus a write probe inside a throwaway container
  status       container states, the seed log, and the same write probe

Driving the stack (stock Compose, conventional file names):
  docker compose up --build -d                  # dev (override auto-merged)
  docker compose down
  docker compose -f docker-compose.yml up -d    # production (base file only)
EOF
}

main() {
  case "${1:-doctor}" in
    doctor) cmd_doctor normal ;;
    doctor-deep | deep) cmd_doctor deep ;;
    status) cmd_status ;;
    --help | -h | help) print_usage ;;
    *) print_usage >&2; return 2 ;;
  esac
}

main "$@"
