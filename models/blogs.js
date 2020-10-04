const mongoose = require('mongoose')

mongoose.set('useFindAndModify', false)

const blogSchema = mongoose.Schema({
    title: {
        type: String,
        required: true,
        minlength: 5
    },
    author: {
        type: String,
        required: true
    },
    url: {
        type: String,
        required: true
    },
    likes: {
        type: String,
        default: 0
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    comments: [
        {
            type: String
        }
    ]
})

blogSchema.set('toJSON', {
    transform: (document, returnedObject) => {
        returnedObject.id = returnedObject._id.toString()
        delete returnedObject._id
        delete returnedObject.__v
        console.log('pre transformation...')
        console.log(returnedObject)
        // if (returnedObject.user) {
        //     console.log('username is...')
        //     console.log(returnedObject.user.username)
        //     console.log(returnedObject.user.toString()) 
        // }
        if (returnedObject.user && returnedObject.user.username) returnedObject.user.id = returnedObject.user.id.toString()
        console.log('post transformation...')
        console.log(returnedObject)
    }
})

module.exports = mongoose.model("Blog", blogSchema)
