#!/usr/bin/env bash
# =============================================================================
# scripts/lib/docker-preflight.sh — checks used by docker-dev.sh
# =============================================================================
# Sourced, not executed: docker-dev.sh owns the command line, this file owns the
# "why did nothing start?" answers. Each check prints what it verified and exits
# non-zero through fail() with a copy-pasteable fix.
#
# Order matters — each step needs the previous one:
#   1. docker CLI + Compose v2          (installed?)
#   2. the daemon                       (running? may this shell talk to it?)
#   3. the root .env                    (the ${VAR:?} keys Compose aborts on)
#   4. DATABASE_DIR / IMAGES_DIR        (exists, writable, actually writable)
#
# Why this exists at all: `docker compose up` creates the bind-mount directories
# before it discovers the daemon is unreachable, so a plain one-liner left two
# empty root-owned directories and no container — with the real reason
# ("permission denied while trying to connect to the docker API") buried in a
# log nobody kept.
# =============================================================================

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
REQUIRED_KEYS=(DEEPSEEK_API_KEY NEWSDATA_API_KEY RUNWARE_API_KEY ADMIN_PASSWORD)
DATA_DIR_KEYS=(DATABASE_DIR IMAGES_DIR)

# Progress goes to stdout, failures to stderr, so redirecting the log still
# leaves the error visible on screen.
say() { printf '  %s\n' "$*"; }
warn() { printf '  ! %s\n' "$*" >&2; }

# Usage: fail <headline> <hint line>...
fail() {
  local headline="$1"
  shift

  {
    echo
    echo "docker:dev failed — ${headline}"
    for hint_line in "$@"; do
      echo "  ${hint_line}"
    done
    echo
  } >&2
  exit 1
}

# --- 1. docker CLI + Compose v2 ---------------------------------------------
# `docker compose` (with a space) is Compose v2; the compose files rely on v2
# merge semantics and the base file has no deprecated `version:` key.
check_docker_cli() {
  if ! command -v docker >/dev/null 2>&1; then
    fail 'the docker CLI is not installed' \
      'Fedora:  sudo dnf install moby-engine docker-buildx docker-compose' \
      'then:    sudo systemctl enable --now docker'
  fi

  if ! docker compose version >/dev/null 2>&1; then
    fail 'docker is installed but the Compose v2 plugin is not' \
      'Fedora:  sudo dnf install docker-compose' \
      'check:   docker compose version   (must print v2.x or newer)'
  fi

  say 'docker CLI + Compose v2: found'
}

# --- 2. the daemon -----------------------------------------------------------
# Separate from the CLI check because the fixes differ: a missing CLI is a dnf
# problem, "permission denied on docker.sock" is group membership and needs a
# fresh login shell.
check_docker_daemon() {
  local probe_output
  local probe_status

  if probe_output="$(docker info 2>&1)"; then
    say 'docker daemon: reachable'
    return 0
  fi
  probe_status="$?"

  if grep -q 'permission denied' <<<"$probe_output"; then
    fail 'this shell may not talk to the docker daemon (docker.sock permission denied)' \
      'group changes only apply to new logins, so this shell is still unprivileged' \
      'fix once:  sudo usermod -aG docker "$USER"' \
      'then:      log out and back in (or run: newgrp docker) and retry' \
      'verify:    docker ps'
  fi

  if grep -qE 'cannot connect|Is the docker daemon running|connection refused' <<<"$probe_output"; then
    fail 'the docker daemon is not running' \
      'start it:  sudo systemctl enable --now docker' \
      'check:     systemctl status docker'
  fi

  warn "docker info failed (exit ${probe_status}):"
  printf '%s\n' "$probe_output" | sed 's/^/    /' >&2
  fail 'cannot reach the docker daemon' 'see the message above'
}

# --- 3. root .env ------------------------------------------------------------
# Compose interpolates ${VAR:?} before any container exists; catching it here
# turns a YAML wall into the name of the missing key.
#
# Only EMPTY values are fatal. `.env.example`'s `your_deepseek_api_key_here`
# placeholders are left alone on purpose: with ENABLE_SCHEDULED_JOBS=false (the
# dev overlay) nothing calls a paid API, and the seeder needs no keys at all, so
# a local dev stack runs fine on the example values. Production fills them in.
read_env_value() {
  local env_file="$1"
  local key="$2"

  grep -E "^${key}=" "$env_file" 2>/dev/null | tail -n1 | cut -d= -f2-
}

is_empty_value() {
  local value="$1"

  [[ -z "${value//[[:space:]]/}" ]]
}

check_required_keys() {
  local env_file="$1"
  local missing_keys=()
  local key value

  for key in "${REQUIRED_KEYS[@]}"; do
    value="$(read_env_value "$env_file" "$key")"
    is_empty_value "$value" && missing_keys+=("$key")
  done

  if ((${#missing_keys[@]} > 0)); then
    fail 'required keys are empty in .env (the ${VAR:?} guards abort on that)' \
      "empty: $(printf '%s ' "${missing_keys[@]}")" \
      'a copied .env.example is fine for local dev; production needs real values'
  fi

  say '.env: required keys set (placeholders are allowed for local dev)'
}

check_data_dir_keys() {
  local env_file="$1"
  local key

  for key in "${DATA_DIR_KEYS[@]}"; do
    if is_empty_value "$(read_env_value "$env_file" "$key")"; then
      fail "${key} is not set in .env (it has no default on purpose)" \
        'set it in .env (see .env.example), then retry'
    fi
  done

  say '.env: data directories configured'
}

check_env_file() {
  local env_file="${REPO_ROOT}/.env"

  if [[ ! -f "$env_file" ]]; then
    fail 'the root .env is missing (Compose reads it for every ${VAR})' \
      'create it:  cp .env.example .env' \
      'then:       npm run setup'
  fi

  check_required_keys "$env_file"
  check_data_dir_keys "$env_file"
}

# --- 4. host data directories + permissions ----------------------------------
# Relative values resolve against the repo root, exactly like Compose does.
resolve_host_dir() {
  local configured_dir

  configured_dir="$(read_env_value "${REPO_ROOT}/.env" "$1")"

  if [[ "$configured_dir" != /* ]]; then
    configured_dir="${REPO_ROOT}/${configured_dir#./}"
  fi

  printf '%s' "$configured_dir"
}

describe_owner() {
  stat -c '(owner %U:%G, mode %a)' "$1" 2>/dev/null || true
}

# A plain `-w` test lies on ACLs, read-only mounts and full filesystems, so the
# check is a real file create in the directory the container will mount.
probe_dir_write() {
  local host_dir="$1"
  local probe_file="${host_dir}/.write-probe.$$"

  if ! ( : >"$probe_file" ) 2>/dev/null; then
    return 1
  fi

  rm -f "$probe_file"
  return 0
}

ensure_dir_writable() {
  local env_var="$1"
  local host_dir="$2"

  if [[ ! -w "$host_dir" ]]; then
    warn "${env_var}=${host_dir} is not writable by $(id -un) $(describe_owner "$host_dir")"

    if sudo -n chown -R "$(id -un):$(id -gn)" "$host_dir" 2>/dev/null; then
      say "${env_var}: ownership repaired to $(id -un)"
    else
      fail "${env_var} is not writable and not repairable without a password" \
        "manual fix:  sudo chown -R \"$(id -un)\" ${host_dir}" \
        'why it matters: the seeder writes the SQLite file and images there'
    fi
  fi

  if ! probe_dir_write "$host_dir"; then
    fail "${env_var}=${host_dir} rejected a write although it exists" \
      'check the mount/ACL, or point the variable at another directory'
  fi
}

# Creates the directory if missing, repairs a root-owned leftover from an
# earlier failed `up`, and refuses to continue when neither works.
prepare_data_dir() {
  local env_var="$1"
  local host_dir

  host_dir="$(resolve_host_dir "$env_var")"

  if [[ ! -e "$host_dir" ]] && mkdir -p "$host_dir" 2>/dev/null; then
    say "${env_var}: created ${host_dir}"
  fi

  if [[ ! -d "$host_dir" ]]; then
    fail "${env_var} does not point at a directory: ${host_dir}" \
      'fix the value in .env (absolute paths are recommended)'
  fi

  ensure_dir_writable "$env_var" "$host_dir"
  say "${env_var}: ready (${host_dir})"
}

check_data_dirs() {
  local env_var

  for env_var in "${DATA_DIR_KEYS[@]}"; do
    prepare_data_dir "$env_var"
  done
}

# --- container-side inspection -------------------------------------------------
# Moved from docker-dev.sh to keep both files small. They need the compose
# invocation, so it is passed in as $1 instead of being called here.

# Usage: print_service_log <compose-invocation> <service>
print_service_log() {
  local compose_cmd="$1"
  local service="$2"
  local service_log

  service_log="$($compose_cmd logs --no-color --tail 20 "$service" 2>&1)"
  [[ -n "${service_log//[[:space:]]/}" ]] || return 0

  echo
  echo "  ${service} (last 20 lines):"
  printf '%s\n' "$service_log" | sed 's/^/    /'
}

# Proves the container user can write the bind mounts. The host can look fine
# (owner boo, 755) while the container is refused: SELinux labels on /home and
# btrfs subvolume ownership both deny writes the host user may make. Sets
# CONTAINER_PROBE_DENIED=1 so `--deep` can stop before `up`.
# Usage: probe_container_writes <compose-invocation>
probe_container_writes() {
  local compose_cmd="$1"
  local probe_output

  CONTAINER_PROBE_DENIED=0

  if ! probe_output="$($compose_cmd run --rm --no-deps -T --entrypoint sh seed -c '
    id -un
    for target in /data /images; do
      if touch "${target}/.write-probe" 2>/dev/null; then
        echo "WRITABLE ${target}"; rm -f "${target}/.write-probe"
      else
        echo "DENIED ${target} (owner $(stat -c %U:%G "${target}" 2>/dev/null || echo missing))"
      fi
    done' 2>&1)"; then
    warn 'could not probe the bind mounts from inside a container'
    printf '%s\n' "$probe_output" | sed 's/^/    /' >&2
    return 0
  fi

  echo
  echo '  write probe (inside a container):'
  printf '%s\n' "$probe_output" | sed 's/^/    /'
  grep -q '^DENIED' <<<"$probe_output" && CONTAINER_PROBE_DENIED=1
  return 0
}

# `--deep` is opt-in, but its answer must be final: a refused mount makes `up`
# fail anyway, one build cycle later and with a less specific message.
fail_on_denied_mounts() {
  if [[ "${CONTAINER_PROBE_DENIED:-0}" != '1' ]]; then
    return 0
  fi

  fail 'a container cannot write DATABASE_DIR/IMAGES_DIR even though the host can' \
    'the mounts already carry :z, so this is not the SELinux label alone' \
    'try, in order:' \
    '  docker compose up -d --force-recreate      # re-applies the :z relabel' \
    '  sudo chown -R "$USER:$USER" <the directory from .env>   # btrfs subvolume ownership' \
    '  check the filesystem is mounted read-write: findmnt <the directory>'
}
