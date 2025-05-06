const express = require('express')
const http = require('http')
const socketIo = require('socket.io')
const cors = require('cors');

const app = express();
app.use(cors())

const server = http.createServer(app);
const io = socketIo(server, { cors: { origin: "https://typospeed.onrender.com" }, methods: ['GET', 'POST', 'PUT', 'DELETE'], credentials: true })
// const io = socketIo(server, { cors: { origin: "https://typospeedpro.vercel.app" }, methods: ['GET', 'POST', 'PUT', 'DELETE'], credentials: true })

const rooms = {}
const sampleTexts = [
    'the power of perspective how we view the world often shapes our experience of it when we change our perspective we open ourselves to new ways of thinking and being challenges can feel less overwhelming when we choose to see them as opportunities for growth and setbacks become stepping stones on the path to success shifting perspective is one of the most powerful tools we have for change',
    'the strength of vulnerability is often misunderstood as a weakness but it is in fact a strength being vulnerable means being open about our fears struggles and imperfections it takes courage to be vulnerable but doing so allows us to build deeper more meaningful relationships with others and with ourselves vulnerability fosters connection trust and healing',
    'the beauty of uncertainty life is full of uncertainties and while they can be unsettling they also provide us with freedom not knowing exactly what comes next in life can be daunting but it also leaves room for growth adventure and discovery uncertainty challenges us to become more adaptable resourceful and resilient and its often through uncertainty that we find the most fulfilling experiences',
    'the importance of listening is an often overlooked skill that has the power to transform relationships when we truly listen without interrupting or forming judgments we create a space for others to feel heard and understood this deep listening cultivates empathy strengthens connections and encourages open honest communication listening isnt just about hearing words its about understanding the emotions and intentions behind them',
    'the role of kindness is one of the simplest yet most powerful tools we have to make the world a better place it costs nothing but its impact is immeasurable small acts of kindness whether a smile a compliment or a helping hand have the power to change someone’s day if not their entire outlook when we are kind to others we also become kinder to ourselves creating a ripple effect of positivity',
    'the gift of time is our most valuable resource once gone we cant get it back how we choose to spend our time reflects our priorities taking the time to nurture relationships pursue passions and rest is essential for a fulfilling life we often spend time chasing things we dont need but true fulfillment comes from spending time on the things that matter most people experiences and selfcare',
    'the power of forgiveness just for the person we forgive for us too holding onto anger resentment or past hurts only weighs us down when we forgive we release that burden and free ourselves to move forward forgiveness allows us to heal and to open ourselves to love joy and peace a gift we give ourselves as much as anyone else'
]
io.on('connection', (socket) => {
    socket.on('createRoom', ({ username,userId }) => {
        const roomId = Math.random().toString(36).substring(2, 8);
        rooms[roomId] = {
            hostId: socket.id, players: [{
                id: socket.id,
                userId,
                username,
                wpm: 0,
                progress: 0

            }],
            matchTime: 60

        }
        socket.join(roomId);
        socket.emit('createRoom', { roomId })
    })
    socket.on('joinRoom', ({ roomId, username,userId }) => {
        // socket.join(roomId)
        // if(!rooms[roomId]) rooms[roomId] = {players:[]}
        if (!rooms[roomId]) {
            socket.emit('errorMsg', 'Room does not exist')
            return
        }

        // rooms[roomId].players.push({id:socket.id,username,wpm:0,progress:0})
        // const existing = rooms[roomId].players.find(p => p.username === username)
        // if (existing) {
        //     socket.emit('errorMsg', 'Username already taken in this room');
        //     return;
        // }
        // if(rooms.players[username]){
        //     rooms.players[username].id = socket.id;
        // }else{
        //     rooms[roomId].players.push({
        //         id: socket.id,
        //         username,
        //         wpm: 0,
        //         progress: 0,
        //         matchTime: 60,
    
        //     })
        // }

        const existingPlayer = rooms[roomId].players.find(p => p.userId === userId);
        if (existingPlayer) {
            existingPlayer.id = socket.id; 
        } else {
            const nameTaken = rooms[roomId].players.find(p => p.username === username);
            if (nameTaken) {
                socket.emit('errorMsg', 'Username already taken in this room');
                return;
            }

            rooms[roomId].players.push({
                id: socket.id,
                userId,
                username,
                wpm: 0,
                progress: 0
            });
        }
        
        socket.join(roomId)
        io.to(roomId).emit('roomUpdate', rooms[roomId].players)
        console.log(`user ${username} joined romm ${roomId}`);

    })
    socket.on('startTime',({roomId,time})=>{
        if(rooms[roomId]){
            rooms[roomId].matchTime = time;
            io.to(roomId).emit('updateStartTime',time);
        }
    })
    socket.on('startMatch', (roomId) => {
        
        const room = rooms[roomId]
        if (!room || room.hostId !== socket.id) {
            socket.emit('errorMsg', 'Only the host can start the game');
            return;
        }
        // room.players.progress = 0;
        
        let countDown = 5;
        const interval = setInterval(() => {
            io.to(roomId).emit('countdown', countDown);
            const gameTime = rooms[roomId].matchTime*1000;
            countDown--;
            if (countDown < 0) {
                clearInterval(interval);
                const randomText = sampleTexts[Math.floor(Math.random() * sampleTexts.length)]
                io.to(roomId).emit('startTyping', { text: randomText });

                console.log('Match started', roomId)


                setTimeout(() => {
                    if(!rooms[roomId]) return;
                    // const leaderboard = rooms[roomId].players.sort((a, b) => b.wpm - a.wpm)
                    const leaderboard = [...rooms[roomId].players].sort((a, b) => b.wpm - a.wpm);
                    io.to(roomId).emit('endMatch', leaderboard);
                    console.log('match ended', roomId);
                }, gameTime)

            }


        }, 1000)


    })

    socket.on('startTime', ({ roomId, time }) => {
        if (rooms[roomId]) {
            rooms[roomId].matchTime = time
            io.to(roomId).emit('updateStartTime', time)
        }
    })

    socket.on('updateWPM', ({ roomId, wpm, progress }) => {
        const player = rooms[roomId]?.players.find(p => p.id === socket.id)
        if (player) {
            player.wpm = wpm;
            player.progress = progress;
            io.to(roomId).emit('roomUpdate', rooms[roomId].players)
        }
    })

    socket.on('disconnect', () => {
        for (const roomId in rooms) {
            const index = rooms[roomId].players.findIndex(p => p.id === socket.id)
            if (index !== -1) {
                // const player = rooms[roomId].players[index];
                rooms[roomId].players.splice(index, 1)
                io.to(roomId).emit('roomUpdate', rooms[roomId].players);

                if (rooms[roomId].players.length === 0) {
                    delete rooms[roomId]
                }
            }
            // rooms[roomId].players = rooms[roomId].players.filter(p=>p.id !== socket.id)
        }
        console.log('user disconnected', socket.id);

    })

    socket.on('leaveRoom', ({ roomId }) => {
        if (rooms[roomId]) {
            rooms[roomId].players = rooms[roomId].players.filter(p => p.id !== socket.id)
            socket.leave(roomId);
            io.to(roomId).emit('roomUpdate', rooms[roomId].players);
            console.log(`suer ${socket.id} left room ${roomId}`)
            if (rooms[roomId].players && rooms[roomId].players.length === 0) delete rooms[roomId];
        }
    })

})

const port = 5000 || process.env.port

server.listen(port, () => console.log('server running on port 5000'))
