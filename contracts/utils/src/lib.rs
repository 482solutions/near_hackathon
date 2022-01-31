pub mod utils {
    use near_sdk::{env, log, require, PromiseResult};

    pub fn resolve_promise_bool() -> bool {
        require!(env::promise_results_count() == 1, "Too many results");
        let result = env::promise_result(0);
        log!("Value received {:?}", &result);
        match result {
            PromiseResult::NotReady => unreachable!(),
            PromiseResult::Successful(val) => {
                if let Ok(result) = near_sdk::serde_json::from_slice::<bool>(&val) {
                    result
                } else {
                    env::panic_str("Wrong value received");
                }
            }
            PromiseResult::Failed => env::panic_str("Call failed"),
        }
    }
}
