const express = require("express")
const { prisma } = require("@/libs/prisma");
const { auth, isOwner } = require("@/middlewares/authMiddleware");

const router = express.Router();

router.get("/", async (req, res) => {
    try {
        const data = await prisma.post.findMany({
            include: {
                user: true,
                comments: true,
                likes: true
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

router.get("/:id/likes", async (req, res) => {
    const {id} = req.params;

    const data = await prisma.postLike.findMany({
        where: {
            postId: Number(id),
        },
        include: {
            user: {
                include: {
                    followers: true,
                    following: true
                }
            }
        }
    });

    res.json(data)
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
                        user: true,
                        likes: true
                    }
                },
                likes: true
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

router.post("/:id/like", auth, async (req, res) => {
    const {id} = req.params;
    const {user} = res.locals;



    const like = await prisma.postLike.create({
        data: {
            postId: Number(id),
            userId: Number(user.id)
        }
    })

    res.json({like})
})

router.delete("/:id/unlike", auth, async (req, res) => {
    const {id} = req.params;
    const {user} = res.locals;

    await prisma.postLike.deleteMany({
        where: {
            postId: Number(id),
            userId: Number(user.id)
        }
    });
    
    res.json({message: `Unlike post ${id}.`})
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