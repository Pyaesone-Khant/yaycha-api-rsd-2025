const { prisma } = require("@/libs/prisma");
const { auth, isOwner } = require("@/middlewares/authMiddleware");
const express = require("express");

const router = express.Router();

router.post("/", auth, async(req, res) => {
    const {content, postId} = req.body;

    if(!content || !postId){
        return res.status(400).json({message: "Content and postId are required!"})
    }

    const {user} = res.locals;  
    const comment = await prisma.comment.create({
        data: {
            content,
            userId: Number(user.id),
            postId: Number(postId)
        }
    })

    comment.user = user;

    res.json(comment);
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

module.exports = {CommentRouter: router}