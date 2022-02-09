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
  near deploy --accountId "$NEAR_ACCOUNT" --wasmFile out/token_factory.wasm
else
  echo "Deploying to testnet"
  echo "Deploying Factory"
  near dev-deploy out/token_factory.wasm
fi