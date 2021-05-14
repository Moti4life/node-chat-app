const clientSocket = io()

// elements

const $messageForm = document.querySelector('#message-form')
const $messageFormInput = $messageForm.querySelector('input')
const $messageFormButton = $messageForm.querySelector('button')
const $sendLocationButton = document.querySelector('#send-location-button')
const $messages = document.querySelector('#messages')


// templates

const messageTemplate = document.querySelector('#message-template').innerHTML
const locationTemplate = document.querySelector('#location-template').innerHTML
const sidebarTemplate = document.querySelector('#sidebar-template').innerHTML


// options... 
//this returns an object
// destructured
const { username, room }  = Qs.parse(location.search, { ignoreQueryPrefix: true } )

// mustache lib in index.html scripts
// moment lib in index.html scripts

//autoScroll
const autoScroll = () => {
    // new message element get latest elemet
    const $newMessage = $messages.lastElementChild

    // height of the new message
    const newMessageStyles = getComputedStyle($newMessage)
    const newMessageMargin = parseInt(newMessageStyles.marginBottom)
    const newMessageHeight = $newMessage.offsetHeight + newMessageMargin

    //console.log(newMessageHeight)

    // visible height
    const visibleHeight = $messages.offsetHeight

    // height of messages container
    const containerHeight = $messages.scrollHeight

    // how far we have scrolled?
    const scrollOffset = $messages.scrollTop + visibleHeight

    
    if( (containerHeight - newMessageHeight) <= scrollOffset ) {
        //scroll to bottom
        $messages.scrollTop = $messages.scrollHeight
    }
}


// should have the same event name in index.js
clientSocket.on('message', (incomingMessage) => {
    console.log(incomingMessage)

    // use of Mustache
    const html = Mustache.render(messageTemplate, {
        // in html
        username: incomingMessage.username,
        message: incomingMessage.text,
        createdAt: moment(incomingMessage.createdAt).format('h:mm a')
    })
    $messages.insertAdjacentHTML('beforeend', html)
    autoScroll()
})

//locationMessage event
//receive emit with passed value
clientSocket.on('locationMessage', (locationObject) => {
    console.log(locationObject)

    // use of Mustache render
    const html = Mustache.render(locationTemplate, {
        // in html... location : locationObject.location
        username: locationObject.username,
        location: locationObject.location,
        createdAt: moment(locationObject.createdAt).format('h:mm a')
    })
    $messages.insertAdjacentHTML('beforeend', html)
    autoScroll()
})

//roomData
clientSocket.on('roomData', ({ room, users }) => {
    const html = Mustache.render(sidebarTemplate, {
        room,
        users
    })
    document.querySelector('#sidebar').innerHTML = html
})



//get sendMessage button in html and listen to click
$messageForm.addEventListener('submit' , (e) => {
    //e.preventDefault() will prevent page refresh
    e.preventDefault()

    //      disable form
    $messageFormButton.setAttribute('disabled', 'disabled')

    console.log('clicked on send')
    // get value of input field chatMessage
    //e.target gets access to the message-form FORM
    const chat = e.target.elements.chatMessage.value
    //console.log(chat)
    //.emit | name of event | passed value | passed arrow function
    //arrow function got called with value 
    clientSocket.emit('receiveMessage', chat, (errorMessage) => {
        
        //      enable form
        $messageFormButton.removeAttribute('disabled')
        $messageFormInput.value = ''
        $messageFormInput.focus()

        if (errorMessage){
            return console.log(errorMessage)
        }
        
        console.log('message has been delivered')

    })

})


$sendLocationButton.addEventListener('click', () => {
    
    
    if(!navigator.geolocation) {
        return alert('Geolocation is not supported.')
    }

    // disable while loading
    $sendLocationButton.setAttribute('disabled', 'disabled')

    navigator.geolocation.getCurrentPosition( (position) => {
        //position.coords.latitude
        //console.log(position.coords.latitude)
        const latLon = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude 
        }
        //emit sendLocation | latlon value | acknow or error arrow function
        clientSocket.emit('sendLocation', latLon, (errorMessage) => {
            
            
            if(errorMessage) { 
                return console.log(errorMessage)
            }
            $sendLocationButton.removeAttribute('disabled')
            console.log('location has been shared')

        })
        //console.log(latLon)

    })

       
})

clientSocket.emit('join', { username, room }, (error) => {
    if (error) {
        alert(error)
        location.href = '/'
    }
})