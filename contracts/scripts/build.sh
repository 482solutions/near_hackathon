#!/bin/bash
set -e

OUT_DIR=out

if [ ! -d $OUT_DIR ]; then
    echo "Creating '${OUT_DIR}' directory"
    mkdir $OUT_DIR;
fi

# Because we include bytes from FT contract we need to build it before factory

cargo build --release -p nft
cp target/wasm32-unknown-unknown/release/nft.wasm $OUT_DIR

cargo build --release -p market
cp target/wasm32-unknown-unknown/release/market.wasm $OUT_DIR
