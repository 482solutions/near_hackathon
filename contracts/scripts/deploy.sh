if [[ -z "${CLEAN}" ]]; then
  echo "Making clear deploy"
  rm -rf neardev
else
  echo "Using previous dev-account"
fi

echo "Building contracts"
sh scripts/build.sh

if [[ -z "${DEV}" ]]; then
    echo "Deploying to testnet"
    
    echo "Deploying Factory"
    near dev-deploy out/token_factory.wasm
else
    echo "Standard deploy"
    near deploy
fi