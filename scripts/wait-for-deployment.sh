#!/usr/bin/env bash

set -euo pipefail

if [[ "$#" -ne 3 ]]; then
  echo "usage: $0 <base-url> <expected-revision> <timeout-seconds>" >&2
  exit 2
fi

base_url="${1%/}"
expected_revision="$2"
timeout_seconds="$3"
poll_interval_seconds="${DEPLOYMENT_POLL_INTERVAL_SECONDS:-15}"

if [[ ! "$base_url" =~ ^https:// ]]; then
  echo "base URL must use HTTPS" >&2
  exit 2
fi

if [[ ! "$expected_revision" =~ ^[0-9a-f]{40}$ ]]; then
  echo "expected revision must be a full lowercase Git SHA" >&2
  exit 2
fi

if [[ ! "$timeout_seconds" =~ ^[1-9][0-9]*$ ]]; then
  echo "timeout must be a positive number of seconds" >&2
  exit 2
fi

if [[ ! "$poll_interval_seconds" =~ ^[1-9][0-9]*$ ]]; then
  echo "poll interval must be a positive number of seconds" >&2
  exit 2
fi

expected_body="{\"revision\":\"${expected_revision}\"}"
deadline=$((SECONDS + timeout_seconds))
last_response="<unavailable>"

while ((SECONDS < deadline)); do
  version_body="$(
    curl \
      --fail \
      --silent \
      --show-error \
      --max-time 10 \
      "${base_url}/version.json?expected=${expected_revision}" \
      2>/dev/null || true
  )"

  if [[ -n "$version_body" ]]; then
    last_response="${version_body:0:200}"
  fi

  if [[ "$version_body" == "$expected_body" ]]; then
    health_body="$(
      curl \
        --fail \
        --silent \
        --show-error \
        --max-time 10 \
        "${base_url}/healthz" \
        2>/dev/null || true
    )"
    homepage_body="$(
      curl \
        --fail \
        --silent \
        --show-error \
        --max-time 10 \
        "${base_url}/" \
        2>/dev/null || true
    )"

    if [[ "$health_body" == "ok" ]] && \
      grep --fixed-strings --quiet "Sam Jing Wen" <<< "$homepage_body"; then
      echo "deployment verified at revision $expected_revision"
      exit 0
    fi
  fi

  remaining=$((deadline - SECONDS))
  if ((remaining <= 0)); then
    break
  fi

  if ((remaining < poll_interval_seconds)); then
    sleep "$remaining"
  else
    sleep "$poll_interval_seconds"
  fi
done

echo "deployment did not reach revision $expected_revision within ${timeout_seconds}s" >&2
echo "last version response: $last_response" >&2
exit 1
