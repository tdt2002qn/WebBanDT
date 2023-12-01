
const express = require("express");
const dotenv = require('dotenv');
const mongoose = require("mongoose");
const routes = require('./routes')
const cors = require('cors');
const bodyParser = require('body-parser')
const cookieParser = require('cookie-parser')
//socket
const Review = require('./models/Comment')
const { createServer } = require("http");
const { Server } = require("socket.io");
const News = require("./models/News");

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

//========================================================
//Mongoo
mongoose.connect(`${process.env.MONGO_DB}`)
    .then(() => {
        console.log('Connect Db success!')
    })
    .catch((err) => {
        console.log(err)
    })
//========================================================
//Lây lich su danh gia san pham
const getCommentHistory = async () => {
    try {
        const comments = await Review.find().sort({ createdAt: -1 });
        return comments;
    } catch (error) {
        console.error('Lỗi khi lấy lịch sử bình luận:', error);
        return [];
    }
};
//Lay lich su khuyen mai
const getNewsHistoryz = async () => {
    try {
        const news = await News.find().sort({ createdAt: -1 });
        return news;
    } catch (error) {
        console.error('Lỗi khi lấy lịch sử khuyen mai:', error);
        return [];
    }
};
//========================================================
//Socket io
io.on("connection", async function (socket) {
    // Lấy và gửi lịch sử bình luận khi client kết nối
    const commentHistory = await getCommentHistory(socket.productId);
    socket.emit('commentHistory', commentHistory);

    //Lấy và gửi lịch sử news khi client kết nối
    const updatedNewsHistory = await getNewsHistoryz();
    io.sockets.emit('newsHistory', updatedNewsHistory);
    console.log('newsHistory', updatedNewsHistory)
    // JOIN ROOM
    socket.on('joinRoom', (productId) => {
        socket.productId = productId;
        socket.join(productId);
    });
    // CONNECT 
    console.log("Co nguoi ket noi len socket", socket.id);
    //DISCONNECT
    socket.on("disconnect", function () {
        console.log(socket.id + "Ngat ket noi")
    });
    //========================================================    
    // LOGIN
    socket.on("login", function (data) {
        // Xử lý thông tin đăng nhập ở đây, ví dụ kiểm tra thông tin đăng nhập
        const { email } = data;

        // Nếu đăng nhập thành công, có thể thực hiện các hành động cần thiết
        console.log(` ${email} logged in successfully`);

        // Gửi thông báo đăng nhập thành công về cho client
        socket.emit("login_success", { message: "Login successful" });
    });
    //========================================================   
    //LOGOUT
    socket.on("logout", function (data) {
        // Xử lý thông tin xuất ở đây, 
        // const { email } = data;

        // Nếu đăng xuất thành công, có thể thực hiện các hành động cần thiết
        console.log(` ${data} logged out successfully`);

        // Gửi thông báo đăng nhập thành công về cho client
        socket.emit("logout_success", { message: "Logout successful" });
    });
    //========================================================
    // CHAT
    socket.on("chat message", function (message) {
        console.log("Message from client:", message);
        // Gửi lại tin nhắn đến tất cả các clients 
        io.sockets.emit("chat message", message);

    });
    //=====================================================
    // COMMENT
    socket.on('addReview', async (data) => {
        console.log("Comment from client:", data);
        // Lưu vào MongoDB bằng cách sử dụng model
        const { content, rating, user, productId } = data;

        // Lưu đánh giá vào MongoDB bằng cách sử dụng model
        const newReview = new Review({
            content: content.content,

            rating: content.rating,
            user,
            productId,
        });

        await newReview.save();
        const updatedCommentHistory = await getCommentHistory();

        io.to(productId).emit('commentHistory', updatedCommentHistory);
        // Gửi đánh giá mới đến tất cả các client
        //  io.emit('newReview', newReview);
        //console.log('newReview', newReview)
    });

    //========================================================
    //KHUYEN MAI
    socket.on("postNews", async (data) => {
        console.log("Received news from client:", data);
        const { title, content } = data;
        const newNews = new News({
            title,
            content,
        });
        await newNews.save();
        io.emit('newNews', newNews);

    });
    //=========================================================
});
httpServer.listen(port, () => {
    console.log('Server is running in port: ', + port)
})