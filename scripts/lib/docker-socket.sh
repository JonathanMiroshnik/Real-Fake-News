#!/usr/bin/env bash
# =============================================================================
# scripts/lib/docker-socket.sh — why /var/run/docker.sock said "permission denied"
# =============================================================================
# Sourced by docker-preflight.sh. Kept separate because this one failure mode has
# the longest explanation and the most environment-specific causes.
# =============================================================================

# --- 2b. why the socket refused ----------------------------------------------
# "permission denied" on /var/run/docker.sock has three distinct causes and they
# need three different fixes, so the state is inspected rather than guessed:
#
#   a) user not in the docker group at all        -> usermod
#   b) in /etc/group, but this process is older   -> newgrp (the common one:
#      than the usermod, so its supplementary       a long-lived desktop session
#      groups are stale                             never re-reads the group db)
#   c) group is current, socket mode is wrong      -> check the unit/socket
explain_socket_denial() {
  local socket_path='/var/run/docker.sock'
  local current_user
  local session_groups
  local group_source

  current_user="$(id -un)"
  session_groups="$(id -nG)"
  group_source="$(getent group docker || true)"

  if [[ -z "$group_source" ]]; then
    fail 'permission denied on the docker socket — the docker group does not exist' \
      'create/repair it:  sudo groupadd docker && sudo usermod -aG docker "$USER"' \
      'then log out and back in'
  fi

  if ! grep -qE "(^|[:,])${current_user}(,|$)" <<<"$group_source"; then
    fail "permission denied on the docker socket — ${current_user} is not in the docker group" \
      "docker group: ${group_source}" \
      "add it:   sudo usermod -aG docker ${current_user}" \
      'then fully log out and back in (a new terminal is NOT enough)'
  fi

  # Cause (b): membership is on disk but absent from this process.
  warn "you ARE in the docker group (${group_source}), but this shell is not"
  warn "shell groups: ${session_groups}"
  warn 'the group was added after this session started, and processes never re-read it'
  fail 'docker socket denied — stale group in the current session (not a repo problem)' \
    'immediate fix, in this terminal:' \
    '  newgrp docker          # opens a subshell WITH the group; retry the command there' \
    'permanent fix:' \
    '  log out of the whole desktop session and back in (closing terminals is not enough)' \
    "  socket: $(ls -l "$socket_path" 2>/dev/null || echo 'missing')"
}
