if [[ -z "${CLEAN}" ]]; then
  echo "Making clear deploy"
  rm -rf neardev
else
  echo "Using previous dev-account"
fi

if [ -d neardev ]; then
    echo "Already logged in"
else
    near login
fi

echo "Building contracts"
sh scripts/build.sh

if [[ -z "${DEV}" ]]; then
    echo "Deploying to testnet"
    
    echo "Deploying FT smart-contract"
    near dev-deploy out/fungible_token.wasm

    echo "Deploy FT factory"
    near dev-deploy out/token_factory.wasm
else
    echo "Standard deploy"
    near deploy
fi