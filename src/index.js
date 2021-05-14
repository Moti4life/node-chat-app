const express = require('express')
const path = require('path')
const http = require('http')
const socketio = require('socket.io')
const filterWords = require('bad-words')

const { generateMessage, generateLocationMessage } = require('./utils/messages')
const { addUser, removeUser, getUser, getUsersInRoom } = require('./utils/users')


const app = express()
//created server outside express library
const server = http.createServer(app)

//socket io expects to be called with the raw http server
//express creates that but we dont have access
const io = socketio(server)

//port set by heroku or 3000 if not provided
const port = process.env.PORT || 3000

const publicDirectoryPath = path.join(__dirname, '../public')

//serve publicDirectory
app.use(express.static(publicDirectoryPath))


//connection message
io.on('connection', (socketConnection) => {
    console.log('new webSocket connection')

    // io.emit | all connected
    // socketConnection.emit | to current socketConnection
    // socketConnection.broadcast.emit | to all connection but not yours
    
    socketConnection.on('join', ( { username, room }, callback ) => {
        
        // addUser needs ( { id, username, room } )
        const { error, user } = addUser( {
            id: socketConnection.id,
            username,
            room
        }) 

        if (error) {
            return callback(error)
        }


        // join room name
        socketConnection.join(user.room)

        //event name and passed greetings 
        //use reusable message in chat.js
        socketConnection.emit('message', generateMessage('system', 'welcome huuuman'))


        //broadcast.emit send a message to 'message' to every connection apart from yours
        socketConnection.broadcast.to(user.room).emit('message', generateMessage('system',`${user.username} has entered the arena`))

        //get users in the room
        io.to(user.room).emit('roomData', {
            room: user.room,
            users: getUsersInRoom(user.room)

        })

        //call callback() without arguments if success
        callback()

        //socketConnection.broadcast.to(room).emit
        //io.to.emit
    })


    //listen for receiveMessage | socket .on
    //listen receiveMessage | passed value, arrow function()
    socketConnection.on('receiveMessage', (chat, acknow) => {
        
        //use getUser to get user.room
        const user = getUser(socketConnection.id)
        
        const filter = new filterWords()

        if (filter.isProfane(chat)) {
            return acknow('use kind words pls')
        }
          

        // io used to emit to every connection
        io.to(user.room).emit('message', generateMessage(user.username, chat) )
        //called acknow and passed value
        acknow()
    })

    //listen to sendLocation 
    socketConnection.on('sendLocation', (latLon, acknow) => {
        const user = getUser(socketConnection.id)
        //send loc to all connected
        //https://www.google.com/maps/@lat,lon

        //emits to locationMessage
        //emit locationMessage with generateLocationMessage pass username and URL
        io.to(user.room).emit('locationMessage', generateLocationMessage(user.username, `https://www.google.com/maps/@${latLon.latitude},${latLon.longitude}`))
        acknow()
    })



    // disconnect is a built in events from socket.io library
    socketConnection.on('disconnect' , () => {
        const user = removeUser(socketConnection.id)

        if(user) {
            io.to(user.room).emit('message', generateMessage('system', `${user.username} has left`))
            io.to(user.room).emit('roomData', {
                room: user.room,
                users: getUsersInRoom(user.room)

            })
        
        }

        

    })

})


// 
server.listen(port, () => {
    console.log('server started on port ' + port)
})