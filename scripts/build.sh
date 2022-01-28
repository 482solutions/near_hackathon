#!/bin/bash
set -e

OUT_DIR=out

if [ ! -d $OUT_DIR ]; then
    echo "Creating res/ directory"
    mkdir $OUT_DIR;
fi

cargo build --all --release
cp target/wasm32-unknown-unknown/release/*.wasm $OUT_DIR