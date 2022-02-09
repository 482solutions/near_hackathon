# Add credentials
source neardev/dev-account.env

USERNAME=""

if [[ -z "${DEV}" ]]; then
  echo "Prod init"
  USERNAME=$NEAR_ACCOUNT
else
  USERNAME=$CONTRACT_NAME
fi

# Create Market subaccount
near create-account market."$USERNAME" --masterAccount "$USERNAME"

# Deploy contract to it
near deploy market."$USERNAME" out/market.wasm

# Init FT factory
near call "$USERNAME" new '{ "owner": "'"$USERNAME"'" }' --accountId "$USERNAME"

# Init market
near call market."$USERNAME" new '{ "owner_id": "'"$USERNAME"'"}' --accountId "$USERNAME"