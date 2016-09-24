#!/bin/sh

ROOT=$(dirname $(dirname $(readlink -f $0)))
CURRENT_DIR=$(pwd)

cd "${ROOT}"
npm run build
cd "${CURRENT_DIR}"

cp -R ${ROOT}/test/assets/* ${ROOT}/dist/ || echo "No builds as for now."

#cp -R ${ROOT}/src/* ${ROOT}/dist/ || echo "No files in source."

