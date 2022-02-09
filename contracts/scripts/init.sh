if [[ -z "${DEV}" ]]; then
  echo "Prod init"

  # Create Market subaccount
  near create-account market."$NEAR_ACCOUNT" --masterAccount "$NEAR_ACCOUNT"

  # Deploy contract to it
  near deploy market."$NEAR_ACCOUNT" out/market.wasm

  # Init FT factory
  near call "$NEAR_ACCOUNT" new --accountId "$NEAR_ACCOUNT"

  # Init market
  near call market."$NEAR_ACCOUNT" new '{ "owner_id": "'"$NEAR_ACCOUNT"'"}' --accountId "$NEAR_ACCOUNT"
else
  # Add credentials
  source neardev/dev-account.env

  # Create Market subaccount
  near create-account market."$CONTRACT_NAME" --masterAccount "$CONTRACT_NAME"

  # Deploy contract to it
  near deploy market."$CONTRACT_NAME" out/market.wasm

  # Init FT factory
  near call "$CONTRACT_NAME" new --accountId "$CONTRACT_NAME"

  # Init market
  near call market."$CONTRACT_NAME" new '{ "owner_id": "'"$CONTRACT_NAME"'"}' --accountId "$CONTRACT_NAME"
fi
