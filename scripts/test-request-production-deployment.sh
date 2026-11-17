#!/usr/bin/env bash

set -euo pipefail

script_directory="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
requester="$script_directory/request-production-deployment.sh"
fixture="$(mktemp -d)"
trap 'rm -rf "$fixture"' EXIT
bin="$fixture/bin"
mkdir -p "$bin"

cat > "$bin/gh" <<'EOF'
#!/usr/bin/env bash
set -euo pipefail
printf '%s\n' "$@" > "$TEST_ARGUMENTS"
cat > "$TEST_PAYLOAD"
EOF
chmod +x "$bin/gh"

export PATH="$bin:$PATH"
export GH_TOKEN=test-token
export TEST_ARGUMENTS="$fixture/arguments"
export TEST_PAYLOAD="$fixture/payload.json"

commit=aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa
digest=sha256:bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb
approved_tag="ghcr.io/samjingwen/landing-profile:master-123-2-${commit}"

"$requester" "$approved_tag" "$digest" "$commit" 123 2 >/dev/null

expected_arguments=$'api\n--method\nPOST\nrepos/samjingwen/home-k3s-infra/dispatches\n--input\n-'
if [[ "$(cat "$TEST_ARGUMENTS")" != "$expected_arguments" ]]; then
  echo "unexpected gh arguments" >&2
  cat "$TEST_ARGUMENTS" >&2
  exit 1
fi

jq \
  --exit-status \
  --arg approved_tag "$approved_tag" \
  --arg commit "$commit" \
  --arg digest "$digest" \
  '
    .event_type == "propose-approved-image" and
    .client_payload == {
      approved_tag: $approved_tag,
      commit: $commit,
      digest: $digest,
      run_attempt: "2",
      run_id: "123"
    }
  ' \
  "$TEST_PAYLOAD" \
  >/dev/null

if "$requester" "$approved_tag" "$digest" "$commit" 124 2; then
  echo "mismatched run ID unexpectedly passed" >&2
  exit 1
fi

if "$requester" "$approved_tag" sha256:invalid "$commit" 123 2; then
  echo "invalid digest unexpectedly passed" >&2
  exit 1
fi

echo "production deployment request tests passed"
