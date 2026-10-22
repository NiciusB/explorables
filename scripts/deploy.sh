#!/usr/bin/env bash
# Production deploy on the server: pull main, install, build every app into dist/
# and sync it into the nginx web root. Run by the CI deploy job over SSH (a key
# whose authorized_keys entry forces this script) or by hand.
#
# Everything is inside { ...; exit; } so bash parses the whole script before
# `git reset` can rewrite it mid-run.
{
  set -euo pipefail

  NODE_BIN=/home/ubuntu/.nvm/versions/node/v26.10.0/bin
  export PATH="$NODE_BIN:$PATH"
  REPO=/home/ubuntu/apps/explorables
  WEB_ROOT=/var/www/explorables

  cd "$REPO"
  git fetch --quiet origin main
  git reset --hard origin/main
  echo "Deploying $(git log -1 --format='%h %s')"

  npm ci --no-audit --no-fund
  npm run build:site

  # Copy new hashed assets first and swap the HTML and delete stale files last,
  # so pages already loaded keep finding their files during the swap.
  rsync -a --exclude='*.html' dist/ "$WEB_ROOT/"
  rsync -a --delete dist/ "$WEB_ROOT/"

  echo "Deployed"
  exit
}
