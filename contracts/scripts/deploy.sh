if [[ -z "${CLEAN}" ]]; then
  echo "Using existing account"
else
  echo "Making clear deploy"
  rm -rf neardev
fi

echo "Building contracts"
sh scripts/build.sh

if [[ -z "${DEV}" ]]; then
  echo "Standard deploy"
  near deploy --accountId "$NEAR_ACCOUNT" --wasmFile out/nft.wasm
else
  echo "Deploying to testnet"
  echo "Deploying NFT"
  near dev-deploy out/nft.wasm
fi