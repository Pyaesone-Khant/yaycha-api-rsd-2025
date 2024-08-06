require("module-alias/register"); // for absolute path

const { prisma } = require("@/libs/prisma");
const express = require("express");
const cors = require("cors");

const app = express();

// web-socket
require("express-ws")(app);

// routers
const { PostRouter } = require("@/routers/post");
const { UserRouter } = require("@/routers/user");
const { AuthRouter } = require("@/routers/auth");
const { CommentRouter } = require("@/routers/comment");
const { SearchRouter } = require("@/routers/search");
const { NotiRouter } = require("@/routers/noti");
const { wsRouter } = require("@/routers/ws");

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }))

app.use("/api", wsRouter)
app.use("/api/auth", AuthRouter)
app.use("/api/users", UserRouter)
app.use("/api/posts", PostRouter)
app.use("/api/comments", CommentRouter)
app.use("/api/search", SearchRouter)
app.use("/api/notis", NotiRouter)

app.get("/api/info", (req, res) => {
    res.json({
        message: "Hello World"
    });
})

const server = app.listen(8000, () => {
    console.log("Server running at port 8000...")
})

const gracefulShutdown = async () => {
    await prisma.$disconnect()
    server.close(() => {
        console.log("Yaycha Api closed.");
        process.exit(0)
    })
}

process.on("SIGTERM", gracefulShutdown);
process.on("SIGINT", gracefulShutdown);