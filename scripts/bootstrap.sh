#!/usr/bin/env bash
# =============================================================================
# scripts/bootstrap.sh — prepare this repo for its first run
# =============================================================================
# Creates the files Docker Compose needs, then tells you what is still missing.
# Idempotent: re-running never overwrites an existing .env.
#
#   npm run setup          (or: bash scripts/bootstrap.sh)
# =============================================================================
set -euo pipefail

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
REQUIRED_KEYS=(DEEPSEEK_API_KEY NEWSDATA_API_KEY RUNWARE_API_KEY ADMIN_PASSWORD)
# Required by the server itself (src/config/paths.ts throws without them), and
# only ever set in server/.env because the containers get their paths from Compose.
SERVER_REQUIRED_KEYS=(DATABASE_PATH IMAGES_PATH)
PLACEHOLDER_PATTERN='your_[a-z_]+_here|changeme123'
DOCKER_NETWORK='devops_shared'

copy_if_missing() {
  local source_file="$1"
  local target_file="$2"

  if [[ -f "$target_file" ]]; then
    echo "  = ${target_file#"$REPO_ROOT"/} already exists (left untouched)"
    return 0
  fi

  cp "$source_file" "$target_file"
  echo "  + created ${target_file#"$REPO_ROOT"/}"
}

# Prints every required key still holding a placeholder/empty value.
report_placeholders() {
  local env_file="$1"
  local key value

  for key in "${REQUIRED_KEYS[@]}"; do
    value="$(grep -E "^${key}=" "$env_file" | tail -n1 | cut -d= -f2- || true)"

    if [[ -z "$value" || "$value" =~ $PLACEHOLDER_PATTERN ]]; then
      echo "  x ${key}"
    fi
  done
}

# Prints the data-location keys that server/.env does not set.
# The server has no defaults for these (src/config/paths.ts), so a missing value
# would only surface as a crash on the first `npm run dev`.
report_missing_server_paths() {
  local env_file="$1"
  local key value

  for key in "${SERVER_REQUIRED_KEYS[@]}"; do
    value="$(grep -E "^${key}=" "$env_file" | tail -n1 | cut -d= -f2- || true)"

    if [[ -z "$value" ]]; then
      echo "  x ${key} (server/.env)"
    fi
  done
}

# Prints the absolute host directory configured in .env for a variable.
# Relative values resolve against the repo root, matching docker-compose.yml.
# No default on purpose: both mount sources must be explicit, so a forgotten
# value fails here and in `docker compose up` instead of quietly writing into
# the repo.
# Usage: resolve_host_dir DATABASE_DIR
resolve_host_dir() {
  local env_var="$1"
  local configured_dir

  configured_dir="$(grep -E "^${env_var}=" "$REPO_ROOT/.env" 2>/dev/null | tail -n1 | cut -d= -f2- || true)"

  if [[ -z "$configured_dir" ]]; then
    echo "  x ${env_var} is not set in .env" >&2
    return 1
  fi

  if [[ "$configured_dir" != /* ]]; then
    configured_dir="$REPO_ROOT/${configured_dir#./}"
  fi

  printf '%s' "$configured_dir"
}

# Creates the two host directories docker-compose.yml bind-mounts.
# Both variables are required — compose refuses to start without them, so this
# fails first with a clearer message.
ensure_data_dirs() {
  local database_dir images_dir

  database_dir="$(resolve_host_dir DATABASE_DIR)" || return 1
  images_dir="$(resolve_host_dir IMAGES_DIR)" || return 1

  create_host_dir "$database_dir" '/data'
  create_host_dir "$images_dir" '/images'
}

# Usage: create_host_dir <absolute dir> <container mount point>
create_host_dir() {
  local host_dir="$1"
  local mount_point="$2"

  if mkdir -p "$host_dir" 2>/dev/null; then
    echo "  = data dir ready: ${host_dir} (mounted at ${mount_point})"
    return 0
  fi

  echo "  ! cannot create ${host_dir} — create it yourself and make it writable"
}

ensure_docker_network() {
  if ! command -v docker >/dev/null 2>&1; then
    echo "  ! docker not found — skipping network setup"
    return 0
  fi

  if docker network inspect "$DOCKER_NETWORK" >/dev/null 2>&1; then
    echo "  = docker network $DOCKER_NETWORK already exists"
    return 0
  fi

  docker network create "$DOCKER_NETWORK" >/dev/null
  echo "  + created docker network $DOCKER_NETWORK (production needs it; dev makes its own)"
}

print_next_steps() {
  echo
  echo "Next steps:"
  echo "  Production-like:  docker compose up --build -d          (uses the devops_shared network)"
  echo "  Local dev:        docker compose -f docker-compose.yml -f docker-compose.dev.yml up --build -d"
  echo "                    (self-contained: Compose creates its own network)"
  echo "  Apps on the host: cd server && npm run dev   (client/admin: npm run dev)"
  echo
  echo "Docs: docs/configuration.md"
}

main() {
  cd "$REPO_ROOT"
  echo "Bootstrapping $(basename "$REPO_ROOT")…"

  echo "1) Env files"
  copy_if_missing .env.example .env
  copy_if_missing server/.env.example server/.env

  echo "2) Filesystem + docker prerequisites"
  if ! ensure_data_dirs; then
    echo
    echo "Set DATABASE_DIR and IMAGES_DIR in .env (see .env.example), then re-run: npm run setup"
    exit 1
  fi
  ensure_docker_network

  echo "3) Checking required values in .env"
  local missing
  missing="$(report_placeholders .env)"

  if [[ -n "$missing" ]]; then
    echo "$missing"
    echo
    echo "Fill these in .env (see docs/configuration.md), then re-run: npm run setup"
    exit 1
  fi

  echo "4) Checking data locations in server/.env"
  local missing_paths
  missing_paths="$(report_missing_server_paths server/.env)"

  if [[ -n "$missing_paths" ]]; then
    echo "$missing_paths"
    echo
    echo "Set DATABASE_PATH and IMAGES_PATH in server/.env (see server/.env.example),"
    echo "then re-run: npm run setup   (the server has no defaults for them)"
    exit 1
  fi

  echo "  = all required values present"
  print_next_steps
}

main "$@"
