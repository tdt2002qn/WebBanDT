const express = require("express");
const dotenv = require('dotenv');
const mongoose = require("mongoose");
const routes = require('./routes')
const cors = require('cors');
const bodyParser = require('body-parser')
const cookieParser = require('cookie-parser')

dotenv.config()
mongoose.set('strictQuery', false);

const app = express()
const server = require('http').createServer(app);  // Tạo một server HTTP
const io = require('socket.io')(server);  // Kết nối Socket.io với server



const port = process.env.PORT || 3001
app.use(cors({ origin: true, credentials: true }));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb' }));
app.use(bodyParser.json())
app.use(cookieParser())
routes(app);


//Mongoo
mongoose.connect(`${process.env.MONGO_DB}`)
    .then(() => {
        console.log('Connect Db success!')
    })
    .catch((err) => {
        console.log(err)
    })

io.on("connection", function (socket) {
    console.log("Co nguoi ket noi len socket", socket.id);
    socket.on("disconnect", function () {
        console.log(socket.id + "Ngat ket noi")
    });

    // Xử lý các sự kiện Socket.io ở đây
    socket.on("chat message", function (message) {
        console.log("Message from client:", message);

        // Gửi lại tin nhắn đến tất cả các clients (hoặc có thể chỉ gửi đến một phòng cụ thể)
        io.sockets.emit("chat message", message);
    });
});
server.listen(port, () => {
    console.log('Server is running in port: ', + port)
})