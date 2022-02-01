use near_sdk::AccountId;
use near_sdk_sim::{init_simulator, to_yocto, UserAccount, STORAGE_AMOUNT};

pub const CONTRACT_ID: &str = "factory";

near_sdk_sim::lazy_static_include::lazy_static_include_bytes! {
    // update `contract.wasm` for your contract's name
    CONTRACT_WASM_BYTES => "../target/wasm32-unknown-unknown/release/token_factory.wasm",
}

pub fn init() -> (UserAccount, UserAccount, UserAccount) {
    let root = init_simulator(None);

    let contract_account: AccountId = CONTRACT_ID.parse().unwrap();

    let contract = root.deploy(&CONTRACT_WASM_BYTES, contract_account, STORAGE_AMOUNT);

    let test = root.create_user("test".parse().unwrap(), to_yocto("100"));

    (root, contract, test)
}
