const { prisma } = require("@/libs/prisma");
const express = require("express");

const router = express.Router();

router.delete("/:id", async (req, res) => {
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