#!/usr/bin/env bash
# Print a cache key for Wahapedia CSVs: sha256 of Last_update.csv, or "stale"
# if the version file cannot be fetched.
set -u
url='https://wahapedia.ru/wh40k11ed/Last_update.csv'
tmp="$(mktemp)"
if curl -fsSL --retry 2 --retry-delay 3 --max-time 20 -o "$tmp" "$url"; then
  sha256sum "$tmp" | cut -c1-16
else
  echo stale
fi
rm -f "$tmp"
