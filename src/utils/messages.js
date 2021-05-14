// call generateMessage 
// return object

const generateMessage = (username,text) => {
    return {
        username,
        text,
        createdAt: new Date().getTime()
    }

}

//generateLocationMessage
const generateLocationMessage = (username, location) => {
    return {
        // get passed value of generateLocationMessage
        // send object back with value and time
        username,
        location,
        createdAt: new Date().getTime()

    }

}


module.exports = {
    generateMessage,
    generateLocationMessage
}