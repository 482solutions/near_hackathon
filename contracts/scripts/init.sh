# Add credentials
source neardev/dev-account.env

echo "Enter your near account name (example: test.testnet)"
read -r ID

# Init factory
near call "$CONTRACT_NAME" new --accountId "$CONTRACT_NAME";

# Create FT subaccount
near call "$CONTRACT_NAME" create_ft '{ "reference": "some_json" }' --accountId "$CONTRACT_NAME" --deposit 3;

# Test some stuff

# Get prefix cuz yes
#ID_PREFIX="$(cut -d'.' -f1 <<<"$ID")"

near call ft."$CONTRACT_NAME" ft_mint '{ "amount": 10 }' --accountId "$CONTRACT_NAME"

near call "$CONTRACT_NAME" give_to '{ "buyer": "tester.testnet", "seller": "'$ID'", "amount_near": 1, "amount_ft": 10 }' --accountId "$CONTRACT_NAME"