const express = require("express");
const bcrypt = require("bcrypt");
const { prisma } = require("@/libs/prisma");
const { auth } = require("@/middlewares/authMiddleware");

const router = express.Router();

router.get("/", async (req, res) => {
    try {
        const data = await prisma.user.findMany({
            include: {
                posts: true,
                comments: true,
                followers: true,
                following: true
            },
            orderBy: {
                id: "desc"
            },
            take: 20
        });
        res.json(data);
    } catch (error) {
        res.status(500).json({ error })
    }
})

router.get("/verify", auth, async (req, res) => {
    const { user } = res.locals;
    res.json(user);
})

router.get("/:id", async (req, res) => {
    const { id } = req.params;
    try {
        const data = await prisma.user.findUnique({
            where: {
                id: Number(id)
            },
            select: {
                id: true,
                name: true,
                username: true,
                bio: true,
                posts: {
                    include: {
                        user: true,
                        likes: true,
                        comments: true
                    }
                },
                followers: true,
                following: true
            },
        });
        res.json(data);
    } catch (error) {
        res.status(500).json({ error })
    }
})

router.post("/", async (req, res) => {
    const { name, username, bio, password } = req.body;
    if (!name || !username || !bio || !password) {
        return res.status(400).json({ message: "All fields are required!" })
    }

    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        const user = await prisma.user.create({
            data: {
                name,
                username,
                bio,
                password: hashedPassword
            }
        });

        res.json(user);
    } catch (error) {
        res.status(500).json({ error })
    }
})

router.post("/:id/follow", auth, async (req, res) => {
    const { user } = res.locals
    const { id } = req.params;

    const data = await prisma.follow.create({
        data: {
            followerId: Number(user.id),
            followingId: Number(id)
        }
    })

    res.json(data)
});

router.delete("/:id/unfollow", auth, async (req, res) => {
    const { user } = res.locals
    const { id } = req.params;

    await prisma.follow.deleteMany({
        where: {
            followerId: Number(user.id),
            followingId: Number(id)
        }
    })

    res.json({ message: `Unfollowed user ${id}` });
})

module.exports = { UserRouter: router }