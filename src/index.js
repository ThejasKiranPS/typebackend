const express = require('express')
const { createServer } = require('http')
const { Server } = require('socket.io')

const app = express()
const httpServer = createServer(app)
const io = new Server(httpServer, {});

app.use(express.json())
let users = []

app.get('/', (req, res) => {
    res.send('hey there')
})

const userController = (req, res) => {
    res.send(users)
}
const userExists = (req, res) => {
    console.log(req.body)
    const name = req.body.name
    console.log(name)
    if(name) {
        if (users.indexOf(name) > -1) {
            res.json({exists: true})
        } else {
            res.json({exists: false})
        }
    } else {
        res.status(500).send("please send name")
    }
}
app.get('/users', userController)

app.post('/exists', userExists)
const handleDisconnect = (id) => {
}

const removeId = (id) => {
    return () => {
        const index = users.indexOf(id)
        if(index > -1) {
            users.splice(index, 1)
        }
    }
}

io.on('connection', (socket) => {
    socket.on('name', (uname) => {
        for(u of users) {
            if (u.id === socket.id) {
                return
            }
        }
        users.push({name: uname, id: socket.id, progress: 0})
        console.log(users)
        io.emit('newuser', users)
        if(users.length === 3) {
            io.emit('started', true)
        }
    })
    socket.on('disconnect', () => {
        console.log('user disconnected')
        for(let i = 0; i<users.length; i++) {
            if (users[i].id === socket.id) {
                users.splice(i, 1)
                console.log('removing a users')
                io.emit('newuser', users)
            }
        }
    })
    socket.on('progress', (progress) => {
        for(let i = 0; i<users.length; i++) {
            if (users[i].id === socket.id) {
                users[i].progress = progress
                sortUsers()
                io.emit('progress', users)
                
            }
        }
    })
})
const sortUsers = () => {
    users = users.sort((a, b) => a.progress>b.progress)
}

httpServer.listen(3001, () => {console.log('server started')})
