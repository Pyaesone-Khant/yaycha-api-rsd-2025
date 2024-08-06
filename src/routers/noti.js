const { prisma } = require("@/libs/prisma");
const { auth } = require("@/middlewares/authMiddleware");
const express = require("express");
const user = require("./user");
const { clients } = require("./ws");

const router = express.Router();

router.get("/", auth, async (req, res) => {

    const { user } = res.locals;

    const notis = await prisma.noti.findMany({
        where: {
            post: {
                userId: Number(user.id)
            }
        },
        include: {
            user: true
        },
        orderBy: {
            id: "desc"
        },
        take: 20
    })

    res.json(notis);
})

router.put("/read", auth, async (req, res) => {

    const { user } = res.locals;

    await prisma.noti.updateMany({
        where: {
            post: {
                userId: Number(user.id)
            },
        },
        data: {
            read: true
        }
    })

    res.json({ message: "Marked all notis read!" });
})

router.put("/:id/read", auth, async (req, res) => {
    const { id } = req.params;

    const noti = await prisma.noti.update({
        where: {
            id: Number(id)
        },
        data: { read: true }
    });

    res.json(noti);
})

async function addNoti({ type, content, postId, userId }) {
    const post = await prisma.post.findUnique({
        where: {
            id: Number(postId)
        }
    })

    if (post.userId == userId) return false;

    clients.map(client => {
        if (client.userId == post.userId) {
            client.ws.send(JSON.stringify({ event: "notis" }));
            console.log(`WS: event sent to ${client.userId}: notis.`)
        }
    })

    return await prisma.noti.create({
        data: {
            type,
            content,
            postId: Number(postId),
            userId: Number(userId),

        }
    })
}

module.exports = { NotiRouter: router, addNoti }