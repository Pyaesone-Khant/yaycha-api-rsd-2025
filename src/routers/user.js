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

    const foundedUser = await prisma.user.findUnique({
        where: {
            id: Number(user.id)
        },
        include: {
            followers: true,
            following: true
        }
    })

    if (!foundedUser) {
        return res.status(401).json({ message: "User not found!" })
    }

    res.json(foundedUser);
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

router.get("/:id/followers", async (req, res) => {
    const { id } = req.params;

    const user = await prisma.user.findUnique({
        where: {
            id: Number(id)
        },
        include: {
            followers: true
        }
    })

    const followerIds = user.followers.map((follower) => follower.followingId);

    const followers = await prisma.user.findMany({
        where: {
            id: {
                in: followerIds
            }
        },
        select: {
            id: true,
            name: true,
            username: true,
            bio: true,
            followers: true,
            following: true
        }
    });
    res.json(followers);
})

router.get("/:id/following", async (req, res) => {
    const { id } = req.params;

    try {
        const user = await prisma.user.findUnique({
            where: {
                id: Number(id)
            },
            include: {
                following: true,
            }
        })

        const followingIds = user.following.map((follower) => follower.followerId);

        const following = await prisma.user.findMany({
            where: {
                id: {
                    in: followingIds
                }
            },
            select: {
                id: true,
                name: true,
                username: true,
                bio: true,
                followers: true,
                following: true
            }
        });
        res.json(following);
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

router.get("/following/posts", auth, async (req, res) => {
    const { user } = res.locals;

    const follow = await prisma.follow.findMany({
        where: {
            followerId: Number(user.id)
        }
    });

    const followingUserIds = follow.map((user) => user.followingId);

    const data = await prisma.post.findMany({
        where: {
            userId: {
                in: followingUserIds
            }
        },
        include: {
            user: true,
            comments: true,
            likes: true
        },
        orderBy: { id: "desc" },
        take: 20
    })

    res.json(data)

})

module.exports = { UserRouter: router }