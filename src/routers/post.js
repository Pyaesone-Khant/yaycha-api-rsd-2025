const express = require("express")
const { prisma } = require("@/libs/prisma");
const { auth, isOwner } = require("@/middlewares/authMiddleware");

const router = express.Router();

router.get("/", async (req, res) => {
    try {
        const data = await prisma.post.findMany({
            include: {
                user: true,
                comments: true
            },
            orderBy: { id: "desc" },
            take: 20
        })

        setTimeout(() => {
            res.json(data)
        }, 2000);
    } catch (error) {
        res.status(500).json({ error })
    }
})

router.get("/:id", async (req, res) => {
    const { id } = req.params;

    try {
        const data = await prisma.post.findUnique({
            where: { id: Number(id) },
            include: {
                user: true,
                comments: {
                    include: {
                        user: true
                    }
                }
            }
        })
        res.json(data)
    } catch (error) {
        res.status(500).json({ error })
    }
})

router.post("/", auth, async (req, res) => {
    const {content} = req.body;

    if(!content){
        return res.status(400).json({message: "Content is required!"});
    }

    const {user} = res.locals;

    const post = await prisma.post.create({
        data: {
            content,
            userId: user.id
        }
    });

    const data = await prisma.post.findUnique({
        where: {id: Number(post.id)},
        include: {
            user: true,
            comments: {
                include: {
                    user: true
                }
            }
        }
    })

    res.json(data)
})

router.delete("/:id", auth, isOwner("post"), async (req, res) => {
    const { id } = req.params;

    try {
        await prisma.comment.deleteMany({
            where: {
                postId: Number(id)
            }
        })

        await prisma.post.delete({
            where: {
                id: Number(id)
            }
        })
        res.sendStatus(204)
    } catch (error) {
        res.status(500).json({ error })
    }
})

module.exports = { PostRouter: router }