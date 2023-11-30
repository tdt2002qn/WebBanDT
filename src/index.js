const express = require("express");
const dotenv = require('dotenv');
const mongoose = require("mongoose");
const routes = require('./routes')
const cors = require('cors');
const bodyParser = require('body-parser')
const cookieParser = require('cookie-parser')
//socket

const { createServer } = require("http");
const { Server } = require("socket.io");

dotenv.config()
mongoose.set('strictQuery', false);

const app = express()
const httpServer = createServer(app);
const io = new Server(httpServer);
// const server = require('http').createServer(app);  // Tạo một server HTTP
// const io = require('socket.io')(server);  // Kết nối Socket.io với server



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
//Socket io
io.on("connection", function (socket) {

    // CONNECT 
    console.log("Co nguoi ket noi len socket", socket.id);

    //DISCONNECT
    socket.on("disconnect", function () {
        console.log(socket.id + "Ngat ket noi")
    });

    // LOGIN
    socket.on("login", function (data) {
        // Xử lý thông tin đăng nhập ở đây, ví dụ kiểm tra thông tin đăng nhập
        const { email } = data;

        // Nếu đăng nhập thành công, có thể thực hiện các hành động cần thiết
        console.log(` ${email} logged in successfully`);

        // Gửi thông báo đăng nhập thành công về cho client
        socket.emit("login_success", { message: "Login successful" });
    });
    //LOGOUT
    socket.on("logout", function (data) {
        // Xử lý thông tin xuất ở đây, 
        // const { email } = data;

        // Nếu đăng xuất thành công, có thể thực hiện các hành động cần thiết
        console.log(` ${data} logged out successfully`);

        // Gửi thông báo đăng nhập thành công về cho client
        socket.emit("logout_success", { message: "Logout successful" });
    });
    // CHAT
    socket.on("chat message", function (message) {
        console.log("Message from client:", message);
        // Gửi lại tin nhắn đến tất cả các clients 
        io.sockets.emit("chat message", message);

    });
});
httpServer.listen(port, () => {
    console.log('Server is running in port: ', + port)
})