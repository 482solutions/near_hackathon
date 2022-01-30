#!/bin/bash
set -e

OUT_DIR=out

if [ ! -d $OUT_DIR ]; then
    echo "Creating '${OUT_DIR}' directory"
    mkdir $OUT_DIR;
fi

# Because we include bytes from FT contract we need to build it before factory

cargo build --release --target ft
cp target/wasm32-unknown-unknown/release/*.wasm $OUT_DIR

cargo build --release --target factory
cp target/wasm32-unknown-unknown/release/*.wasm $OUT_DIR