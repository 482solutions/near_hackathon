use crate::utils::init;
use near_sdk::serde_json::json;
use near_sdk::AccountId;
use near_sdk_sim::types::Gas;
use near_sdk_sim::DEFAULT_GAS;
use token_factory::prices::{NO_DEPOSIT, TOKEN_INIT_BALANCE};

#[test]
fn simulate_create_ft() {
    let (root, contract, test) = init();

    let i3ima_account: AccountId = "i3ima.factory".parse().unwrap();
    let subaccount: AccountId = format!("{}.{}", "i3ima", contract.account_id())
        .parse()
        .unwrap();

    // Init factory contract
    root.call(
        contract.account_id(),
        "new",
        &json!({}).to_string().as_bytes(),
        DEFAULT_GAS,
        NO_DEPOSIT,
    );

    // Create FT
    root.call(
        contract.account_id(),
        "create_ft",
        json!({
            "account_id": i3ima_account.to_string(),
            "reference": "some_json".to_string()
        })
        .to_string()
        .as_bytes(),
        DEFAULT_GAS,
        TOKEN_INIT_BALANCE,
    );

    // Check if it's callable
    let result = test.call(subaccount, "ft_metadata", &[], DEFAULT_GAS, NO_DEPOSIT);

    println!("FT Metadata: {:?}", result.status());

    // Test give_to
    let result = contract.call(
        contract.account_id(),
        "give_to",
        json!({
            "buyer": "tester.factory".to_string(),
            "seller": i3ima_account,
            "amount_near": 1,
            "amount_ft": 1,
        })
        .to_string()
        .as_bytes(),
        DEFAULT_GAS,
        NO_DEPOSIT,
    );

    println!("{:?}", result);

    assert!(result.is_ok());
}
