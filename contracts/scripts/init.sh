# Add credentials
source neardev/dev-account.env

# Init factory
near call "$CONTRACT_NAME" new --accountId "$CONTRACT_NAME";

# Create FT subaccount
near call "$CONTRACT_NAME" create_ft '{ "prefix": "test", "reference": "some_json" }' --accountId "$CONTRACT_NAME" --deposit 3;

# Test some stuff
near call "$CONTRACT_NAME" give_to '{ "buyer": "tester", "seller": "test", "amount": 1 }' --accountId "$CONTRACT_NAME";