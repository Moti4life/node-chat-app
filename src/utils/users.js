// track users

const users = []

//addUser, removeUser, getUser, getUsersInRoom

const addUser = ( { id, username, room } ) => {
    // clean data
    username = username.trim().toLowerCase()
    room = room.trim().toLowerCase()

    // validate data

    if(!username || !room ){
        return {
            error: 'Username and room required'
        }
    }
    
    // check for existing user
    const existingUser = users.find( (user) => {
        // in room same name
        return user.room === room && user.username === username
    })

    //validate username
    if (existingUser) {
        return {
            error: 'Username already taken'
        }
    }

    // store user 
    const user = { id, username, room }
    users.push(user)
    return { user }
}

const removeUser = (id) => {
    const index = users.findIndex( (user) => {
        return user.id === id
    }) 

    // if not -1 there is a match
    if (index !== -1) {
        return users.splice(index, 1)[0]
        //splice returns array
        // access [0] element which is the id { id, username, room } 
    }

}

// get user
//returns object
const getUser = (id) => {
    return users.find( (user) => {
        return user.id === id
    })
}

// getUsersInRoom
const getUsersInRoom = (room) => {
    room = room.trim().toLowerCase()
    return users.filter( (user) => {
        return user.room === room
    })
}

module.exports = {
    addUser, 
    removeUser, 
    getUser, 
    getUsersInRoom
}



//==============

/* addUser({
    id: 20,
    username: ' Moti',
    room: 'rooM 2'
})

addUser({
    id: 42,
    username: 'ceasar',
    room: 'rooM 2'
})

addUser({
    id: 33,
    username: 'ceasar',
    room: ' room 1'
}) */

// console.log(users)

/* const res = addUser({
    id: 33,
    username: 'moti',
    room: 'room 2'
})

console.log(res) */

/* const  removedUser = removeUser(20)
console.log(removedUser)
console.log(users) */

/* const seeUser = getUser(42)
console.log(seeUser) */

/* const seeRoom = getUsersInRoom('room 1')
console.log(seeRoom) */