const { prisma } = require("@/libs/prisma");
const { auth, isOwner } = require("@/middlewares/authMiddleware");
const express = require("express");
const { addNoti } = require("./noti");

const router = express.Router();

router.get("/:id/likes", async (req, res) => {
    const { id } = req.params;

    const data = await prisma.commentLike.findMany({
        where: {
            commentId: Number(id),
        },
        include: {
            user: {
                include: {
                    followers: true,
                    following: true
                }
            }
        }
    })

    res.json(data)
})

router.post("/", auth, async (req, res) => {
    const { content, postId } = req.body;

    if (!content || !postId) {
        return res.status(400).json({ message: "Content and postId are required!" })
    }

    const { user } = res.locals;
    const comment = await prisma.comment.create({
        data: {
            content,
            userId: Number(user.id),
            postId: Number(postId)
        }
    })

    await addNoti({
        type: "comment",
        content: "reply your post!",
        postId,
        userId: user.id
    })

    comment.user = user;

    res.json(comment);
})

router.post("/:id/like", auth, async (req, res) => {
    const { id } = req.params;
    const { user } = res.locals;

    const like = await prisma.commentLike.create({
        data: {
            commentId: Number(id),
            userId: Number(user.id)
        },
        include: {
            comment: true,
        }
    })

    await addNoti({
        type: "like",
        content: "likes your comment!",
        postId: like.comment.postId,
        userId: user.id
    })

    res.json({ like })
})

router.delete("/:id/unlike", auth, async (req, res) => {
    const { id } = req.params;
    const { user } = res.locals;

    await prisma.commentLike.deleteMany({
        where: {
            commentId: Number(id),
            userId: Number(user.id)
        }
    });

    res.json({ message: `Unlike comment ${id}` })
})

router.delete("/:id", auth, isOwner("comment"), async (req, res) => {
    const { id } = req.params;

    try {
        await prisma.comment.delete({
            where: {
                id: Number(id)
            }
        })
        res.sendStatus(204)
    } catch (error) {
        res.status(500).json({ error })
    }
})

module.exports = { CommentRouter: router }