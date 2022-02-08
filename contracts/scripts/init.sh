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
