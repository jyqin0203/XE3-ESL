#!/bin/zsh
set -e
cd "$(dirname "$0")"
exec /usr/bin/env node server.mjs
