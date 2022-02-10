
## Prerequisites

- `near-cli` - To deploy contracts and execute transcations
- `rust` - With target `wasm32-unknown-unknown` installed to compile smart-contracts into WASM

## Gas

Requirements of Gas for most important operation:
* Direct Sell - 300000000000000 YoctoNEAR
* Place Ask - 300000000000000 YoctoNEAR
* Process Bid - 300000000000000 YoctoNEAR

## Building

Execute following command

`sh ./build.sh`

## Testing

Before testing you need to build all packages:

`cargo build --all --release`

Then you can rust tests:

`cargo test --target x86_64-unknown-linux-gnu -- --nocapture`

## Included scripts
- `build` - compiles crates sequentially
- `deploy` - deploys contracts, has clean deploy mode (to enable set env variable CLEAN)
- `init` - Routine for testing: inits factory, creates FT, makes give_to

## Deploying smart-contracts

### To testnet

Set environment `NEAR_ACCOUNT` with name of account. Or set `DEV` & `CLEAN` env variables to have clear deploy

`sh scripts/deploy.sh && sh scripts/init.sh`

### To mainnet

WIP