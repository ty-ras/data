TYRAS_NODE_VERSION="${1}"
if [ -n "$(echo "${TYRAS_NODE_VERSION}" | grep --color=never -E '^[0-9]+$')" ]; then
  shift
else
  TYRAS_NODE_VERSION='16'
fi

# Always use Alpine-based image
TYRAS_NODE_VERSION="${TYRAS_NODE_VERSION}-alpine"

TYRAS_LIB_DIR="$1"

if [ -z "${TYRAS_LIB_DIR}" ]; then
  echo 'Please specify library directory as argument' 1>&2
  exit 1
fi

shift

yarn ()
{
  docker run \
    --rm \
    -t \
    --volume "$(pwd):$(pwd):rw" \
    --entrypoint yarn \
    --workdir "$(pwd)/${TYRAS_LIB_DIR}" \
    --env YARN_CACHE_FOLDER="$(pwd)/.yarn" \
    --env NODE_PATH="$(pwd)/${TYRAS_LIB_DIR}/node_modules" \
    "node:${TYRAS_NODE_VERSION}" \
    "$@"
}