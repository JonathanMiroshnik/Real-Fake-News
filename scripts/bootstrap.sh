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

# Prints the absolute host directory configured in .env for a variable.
# Relative values resolve against the repo root, matching docker-compose.yml.
# Usage: resolve_host_dir DATABASE_DIR ./database
resolve_host_dir() {
  local env_var="$1"
  local default_dir="$2"
  local configured_dir

  configured_dir="$(grep -E "^${env_var}=" "$REPO_ROOT/.env" 2>/dev/null | tail -n1 | cut -d= -f2- || true)"
  configured_dir="${configured_dir:-$default_dir}"

  if [[ "$configured_dir" != /* ]]; then
    configured_dir="$REPO_ROOT/${configured_dir#./}"
  fi

  printf '%s' "$configured_dir"
}

# Creates the two host directories docker-compose.yml bind-mounts.
# Images default to <DATABASE_DIR>/images — the same rule compose applies.
ensure_data_dirs() {
  local database_dir images_dir

  database_dir="$(resolve_host_dir DATABASE_DIR './database')"
  images_dir="$(resolve_host_dir IMAGES_DIR "${database_dir}/images")"

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
  ensure_data_dirs
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

  echo "  = all required values present"
  print_next_steps
}

main "$@"
