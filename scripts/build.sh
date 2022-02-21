#!/bin/bash
set -e

OUT_DIR=out

if [ ! -d $OUT_DIR ]; then
    echo "Creating '${OUT_DIR}' directory"
    mkdir $OUT_DIR;
fi

# Because we include bytes from FT contract we need to build it before factory

cargo build --release -p near-1155
cp target/wasm32-unknown-unknown/release/near_1155.wasm $OUT_DIR