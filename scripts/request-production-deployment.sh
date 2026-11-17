#!/usr/bin/env bash

set -euo pipefail

if [[ "$#" -ne 5 ]]; then
  echo "usage: $0 <approved-tag> <digest> <commit> <run-id> <run-attempt>" >&2
  exit 2
fi

approved_tag="$1"
digest="$2"
commit="$3"
run_id="$4"
run_attempt="$5"

for command in gh jq; do
  command -v "$command" >/dev/null || {
    echo "required command is unavailable: $command" >&2
    exit 1
  }
done

: "${GH_TOKEN:?GH_TOKEN is required}"

tag_pattern='^ghcr\.io/samjingwen/landing-profile:master-([0-9]+)-([0-9]+)-([0-9a-f]{40})$'
if [[ ! "$approved_tag" =~ $tag_pattern ]]; then
  echo "approved tag has an invalid format" >&2
  exit 1
fi
tag_run_id="${BASH_REMATCH[1]}"
tag_run_attempt="${BASH_REMATCH[2]}"
tag_commit="${BASH_REMATCH[3]}"

if [[ ! "$digest" =~ ^sha256:[0-9a-f]{64}$ ]]; then
  echo "digest has an invalid format" >&2
  exit 1
fi

if [[ ! "$commit" =~ ^[0-9a-f]{40}$ ]]; then
  echo "commit has an invalid format" >&2
  exit 1
fi

if [[ ! "$run_id" =~ ^[0-9]+$ ]] || [[ ! "$run_attempt" =~ ^[0-9]+$ ]]; then
  echo "run identity has an invalid format" >&2
  exit 1
fi

if [[ "$tag_run_id" != "$run_id" ]] ||
  [[ "$tag_run_attempt" != "$run_attempt" ]] ||
  [[ "$tag_commit" != "$commit" ]]; then
  echo "approved tag does not match its run identity and commit" >&2
  exit 1
fi

jq \
  --null-input \
  --arg approved_tag "$approved_tag" \
  --arg commit "$commit" \
  --arg digest "$digest" \
  --arg run_attempt "$run_attempt" \
  --arg run_id "$run_id" \
  '{
    event_type: "propose-approved-image",
    client_payload: {
      approved_tag: $approved_tag,
      commit: $commit,
      digest: $digest,
      run_attempt: $run_attempt,
      run_id: $run_id
    }
  }' |
  gh api \
    --method POST \
    repos/samjingwen/home-k3s-infra/dispatches \
    --input -

echo "requested production deployment for $approved_tag@$digest"
