#!/bin/sh

ROOT=$(dirname $(dirname $(readlink -f $0)))
CURRENT_DIR=$(pwd)
TARGET=${ROOT}/dist
TARGET_GID=$(stat -c '%g' ${TARGET})
TARGET_UID=$(stat -c '%u' ${TARGET})

cd "${ROOT}"
npm run build
cd "${CURRENT_DIR}"

if cp -R ${ROOT}/test/assets/* ${ROOT}/dist/; then
    chown $(stat -c '%u:%g' ${ROOT}/dist) -R ${ROOT}/dist/*
else
    echo "No builds as for now."
fi


