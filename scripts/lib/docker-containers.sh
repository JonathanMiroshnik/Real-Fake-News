#!/usr/bin/env bash
# =============================================================================
# scripts/lib/docker-containers.sh — inspect a running stack
# =============================================================================
# Sourced by docker-preflight.sh. These take the compose invocation as $1 so the
# caller decides which files are merged (dev vs prod).
# =============================================================================

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
