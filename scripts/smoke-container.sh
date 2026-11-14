#!/usr/bin/env bash

set -euo pipefail

if [[ "$#" -ne 2 ]]; then
  echo "usage: $0 <image> <expected-revision>" >&2
  exit 2
fi

image="$1"
expected_revision="$2"
container_id=""

cleanup() {
  exit_code="$?"
  trap - EXIT

  if [[ -n "$container_id" ]]; then
    if [[ "$exit_code" -ne 0 ]]; then
      docker logs "$container_id" >&2 || true
    fi

    docker rm --force "$container_id" >/dev/null 2>&1 || true
  fi

  exit "$exit_code"
}

trap cleanup EXIT

if ! docker image inspect "$image" >/dev/null 2>&1; then
  docker pull --platform linux/arm64 "$image"
fi

configured_user="$(docker image inspect --format '{{.Config.User}}' "$image")"
if [[ "$configured_user" != "10001:10001" ]]; then
  echo "expected image user 10001:10001, found ${configured_user:-<empty>}" >&2
  exit 1
fi

container_id="$(
  docker run \
    --detach \
    --platform linux/arm64 \
    --read-only \
    --cap-drop ALL \
    --security-opt no-new-privileges:true \
    --tmpfs /config:rw,noexec,nosuid,nodev,size=16m \
    --tmpfs /data:rw,noexec,nosuid,nodev,size=16m \
    --publish 127.0.0.1::8080 \
    "$image"
)"

port="$(docker port "$container_id" 8080/tcp | awk -F: 'NR == 1 { print $NF }')"
if [[ -z "$port" ]]; then
  echo "failed to determine the published HTTP port" >&2
  exit 1
fi

base_url="http://127.0.0.1:${port}"
ready=false

for _ in {1..30}; do
  if curl --fail --silent --show-error "${base_url}/healthz" >/dev/null 2>&1; then
    ready=true
    break
  fi

  if [[ "$(docker inspect --format '{{.State.Running}}' "$container_id")" != "true" ]]; then
    break
  fi

  sleep 1
done

if [[ "$ready" != "true" ]]; then
  echo "container did not become healthy" >&2
  exit 1
fi

health_body="$(curl --fail --silent --show-error "${base_url}/healthz")"
if [[ "$health_body" != "ok" ]]; then
  echo "unexpected health response: $health_body" >&2
  exit 1
fi

curl --fail --silent --show-error "${base_url}/" | grep --fixed-strings --quiet "Sam Jing Wen"

version_body="$(curl --fail --silent --show-error "${base_url}/version.json")"
expected_version="{\"revision\":\"${expected_revision}\"}"
if [[ "$version_body" != "$expected_version" ]]; then
  echo "unexpected version response: $version_body" >&2
  exit 1
fi

echo "container security, health, homepage, and revision checks passed"
