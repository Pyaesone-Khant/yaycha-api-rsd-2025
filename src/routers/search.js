const { prisma } = require("@/libs/prisma");
const express = require("express");

const router = express.Router();

router.get("/", async (req, res) => {
    const { q } = req.query;

    const data = await prisma.user.findMany({
        where: {
            name: {
                contains: q,
            }
        },
        include: {
            followers: true,
            following: true
        },
        take: 20
    });

    res.json(data);
})

module.exports = { SearchRouter: router }