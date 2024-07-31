require("module-alias/register"); // for absolute path

const express = require("express");
const cors = require("cors");
const { prisma } = require("@/libs/prisma");
const { PostRouter } = require("@/routers/post");
const { UserRouter } = require("@/routers/user")

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }))

app.use("/api/users", UserRouter)
app.use("/api/posts", PostRouter)

app.get("/api/info", (req, res) => {
    res.json({
        message: "Hello World"
    });
})

const server = app.listen(3000, () => {
    console.log("Server running at port 3000...")
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