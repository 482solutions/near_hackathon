
//feature
class FriendsList {

    friends = [];

    addFriend(name) {
        this.friends.push(name);
        this.announceFriendship(name);
    }

    announceFriendship(name) {
        console.log(`${name} is now a friend!`);

    }

    removeFriend(name) {
        const idx = this.friends.indexOf(name);

        if (idx === -1) {
            throw new Error('Friend not found!')
        }

        this.friends.splice(idx, 1)
    }
}

//tests

describe('FriendLists', () => {

    let friendsList;

    beforeEach(() => {
        friendsList = new FriendsList();
    })
    it('initializes friends list', () => {
        expect(friendsList.friends.length).toEqual(0);
    })

    it('adds a friend to the list', () => {
        friendsList.addFriend('Ara');
        expect(friendsList.friends.length).toEqual(1);


    })

    it('announces frendship', () => {
        friendsList.announceFriendship = jest.fn();
        expect(friendsList.announceFriendship).not.toHaveBeenCalled();
        friendsList.addFriend('Ariel');
        expect(friendsList.announceFriendship).toHaveBeenCalled();
    })

    describe('removeFriend',()=>{
        it('removes a friend from the list', ()=>{
            friendsList.addFriend('Ara');
            expect(friendsList.friends[0]).toEqual('Ara');
            friendsList.removeFriend('Ara')
            expect(friendsList.friends[0]).toBeUndefined();

        })

        it('throws an error as friend does not exist', ()=>{
           expect(()=> friendsList.removeFriend('Ara')).toThrow(new Error('Friend not found!'));
        })
    })
})