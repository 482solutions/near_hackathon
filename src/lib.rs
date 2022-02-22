#![allow(clippy::too_many_arguments)]
#![allow(clippy::ptr_arg)]
#![allow(unused_variables)]

//! ERC-1155 Implementation
//!
//! NOTES:
//! * All amounts, balances and allowance are limited by U128 (max value 2**128 - 1).
//! * Token standard uses JSON for serialization of arguments and results.
//! * Amounts in arguments and results are serialized as Base-10 strings, e.g. "100". This is done to avoid JSON limitation of max integer value of 2**53.
//! * The contract must track the change in storage when adding to and removing from collections. This is not included in this core multi token standard but instead in the Storage Standard.
//! * To prevent the deployed contract from being modified or deleted, it should not have any access keys on its account.
pub mod multi_token;
