const express = require("express")
const { prisma } = require("@/libs/prisma")

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

        res.json(data)
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

router.delete("/:id", async (req, res) => {
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