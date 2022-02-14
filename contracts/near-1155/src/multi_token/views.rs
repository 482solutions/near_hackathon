use near_sdk::collections::Vector;

pub trait MultiTokenView {
    fn token(ids: Vector<TokenId>) -> Vector<Option<Token>>;
}
