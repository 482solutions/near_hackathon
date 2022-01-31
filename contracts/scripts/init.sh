# Add credentials
source neardev/dev-account.env

echo "Enter your near account name (example: test.testnet)"
read -r ID

# Init factory
near call "$CONTRACT_NAME" new --accountId "$CONTRACT_NAME";

# Create FT subaccount
near call "$CONTRACT_NAME" create_ft '{ "account_id": "'$ID'", "reference": "some_json" }' --accountId "$CONTRACT_NAME" --deposit 3;

# Test some stuff

# Get prefix cuz yes
#ID_PREFIX="$(cut -d'.' -f1 <<<"$ID")"

near call "$CONTRACT_NAME" give_to '{ "buyer": "tester.testnet", "seller": "'$ID'", "amount_near": 1, "amount_ft": 2 }' --accountId "$CONTRACT_NAME"