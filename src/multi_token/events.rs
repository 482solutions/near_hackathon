// TODO: Events for MT

use near_sdk::AccountId;
use serde::Serialize;

use crate::event::NearEvent;


#[must_use]
#[derive(Serialize, Debug, Clone)]
pub struct MTMint<'a> {
    pub owner_id: &'a AccountId,
    pub token_ids: &'a [&'a str],
    pub amounts: &'a [&'a str],
    #[serde(skip_serializing_if = "Option::is_none")]
    pub memo: Option<&'a str>
}

impl MTMint<'_> {
    pub fn emit(self) {
        Self::emit_many(&[self])
    }

    pub fn emit_many(data: &[MTMint<'_>]) {
        new_246_v1(Nep246EventKind::MTMint(data)).emit()
    }
}


// TODO: Ask why first 3 fields are needed
#[must_use]
#[derive(Serialize, Debug, Clone)]
pub struct MTTransfer<'a> {
    pub old_owner_id: &'a AccountId,
    pub new_owner_id: &'a AccountId,
    pub token_ids: &'a [&'a str],
    pub amounts: &'a [&'a str],
    #[serde(skip_serializing_if = "Option::is_none")]
    pub authorized_id: Option<&'a AccountId>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub memo: Option<&'a str>
}

impl MTTransfer<'_> {
    pub fn emit(self) {
        Self::emit_many(&[self])
    }

    pub fn emit_many(data: &[MTTransfer<'_>]) {
        new_246_v1(Nep246EventKind::MTTransfer(data)).emit()
    }
}

// TODO: Burn event

#[derive(Serialize, Debug)]
pub(crate) struct Nep246Event<'a> {
    version:  &'static str,
    #[serde(flatten)]
    event_kind: Nep246EventKind<'a>
}

#[derive(Serialize, Debug)]
#[serde(tag = "event", content = "data")]
#[serde(rename_all = "snake_case")]
#[allow(clippy::enum_variant_names)]
enum Nep246EventKind<'a> {
    MTMint(&'a [MTMint<'a>]),
    MTTransfer(&'a [MTTransfer<'a>]),
    // NftBurn(&'a [NftBurn<'a>]),
}

fn new_246<'a>(version: &'static str, event_kind: Nep246EventKind<'a>) -> NearEvent<'a> {
    NearEvent::Nep246(Nep246Event { version, event_kind })
}

fn new_246_v1(event_kind: Nep246EventKind) -> NearEvent {
    new_246("1.0.0", event_kind)
}
