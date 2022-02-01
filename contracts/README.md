
## Prerequisites

- `near-cli` - To deploy contracts and execute transcations
- `rust` - With target `wasm32-unknown-unknown` installed to compile smart-contracts into WASM

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

This will deploy smart-contracts into testnet alongside creation of dev account

`sh scripts/deploy.sh`

### To mainnet

WIP