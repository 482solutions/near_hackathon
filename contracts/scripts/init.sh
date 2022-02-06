# Add credentials
source neardev/dev-account.env

# Create FT subaccount
near call "$CONTRACT_NAME" new --accountId "$CONTRACT_NAME"
