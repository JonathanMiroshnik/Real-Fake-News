#!/usr/bin/env bash
# Re-apply the read-only lock on contracts/.
#
# Files are 0444 and the directory is 0555: not even the owner can rewrite a contract in place,
# and the directory cannot be renamed over or deleted from. Run this after editing a contract.
set -euo pipefail

readonly ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
readonly CONTRACTS_DIR="$ROOT/contracts"

if [[ ! -d "$CONTRACTS_DIR" ]]; then
  echo "error: $CONTRACTS_DIR does not exist" >&2
  exit 1
fi

# Unlock the directory first, otherwise chmod on its children still works but the
# follow-up edits a human wants to make do not.
chmod u+w "$CONTRACTS_DIR"

# Prettier and editors write through a temp file + rename, so a read-only *file* is not
# enough on its own; contract files must stay writable long enough to format.
find "$CONTRACTS_DIR" -maxdepth 1 -type f -name '*.md' -exec chmod 0444 {} +

# The directory lock is the real guard: it blocks create, rename-over and unlink.
chmod 0555 "$CONTRACTS_DIR"

echo "locked:"
ls -ld "$CONTRACTS_DIR"
ls -l "$CONTRACTS_DIR"/*.md
