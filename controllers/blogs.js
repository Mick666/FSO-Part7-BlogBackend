const blogsRouter = require('express').Router()
const jwt = require('jsonwebtoken')
const Blog = require('../models/blogs')
const User = require('../models/user')

blogsRouter.get('/', async (request, response, next) => {
    let blogs = await Blog
      .find({}).populate('user', 'username name id')
    response.json(blogs)
})

blogsRouter.post('/', async (request, response, next) => {
    const body = request.body
    const decodedToken = jwt.verify(request.token, process.env.SECRET)

    if (!request.token || !decodedToken.id) {
        return response.status(401).json({error: 'token missing or invalid'})
    }
    const user = await User.findById(decodedToken.id)

    const blog = new Blog({
        title: body.title,
        author: body.author,
        url: body.url,
        likes: !body.likes ? 0 : body.likes,
        user: user._id,
        comments: []
    })
    const savedBlog = await blog.save()

    const updatedUser = {
        username: user.username,
        name: user.name,
        passwordHash: user.passwordHash,
        blogs: user.blogs.concat(savedBlog._id)
    }


    const savedUser = await User.findByIdAndUpdate(decodedToken.id, updatedUser, { new: true })

    response.status(201).json(savedBlog)
})

blogsRouter.delete('/:id', async (request, response) => {
    if (request.token === null) return response.status(401).json({error: 'Invalid token'})
    const decodedToken = jwt.verify(request.token, process.env.SECRET)
    console.log(request.params.id)
    const blog = await Blog.findById(request.params.id)
    if (blog.user.toString() === decodedToken.id.toString()) {
        await Blog.findByIdAndRemove(request.params.id)
        
        let user = await User.findById(decodedToken.id)
        const updatedUser = {
            username: user.username,
            name: user.name,
            passwordHash: user.passwordHash,
            blogs: user.blogs.filter(x => x.toString() !== request.params.id)
        }
        const savedUser = await User.findByIdAndUpdate(decodedToken.id, updatedUser, { new: true })
        return response.status(204).end();
    } 
    return response.status(401).json({error: 'Invalid token'})
    
})

blogsRouter.put('/:id', async (request, response) => {
    let updatedBlog = {
        ...request.body,
        user: request.body.user && request.body.user.id ? request.body.user.id : request.body.user
    }
    updatedBlog = await Blog
    .findByIdAndUpdate(request.params.id, updatedBlog, { new: true })
    .populate('user', 'username name id')
    console.log('updated blog is...')
    console.log(updatedBlog)
    response.json(updatedBlog)
})

module.exports = blogsRouter
