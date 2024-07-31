const express = require("express");
const bcrypt = require("bcrypt");
const { prisma } = require("@/libs/prisma");

const router = express.Router();

router.get("/", async (req, res) => {
    try {
        const data = await prisma.user.findMany();
        res.json(data);
    } catch (error) {
        res.status(500).json({ error })
    }
})

router.get("/:id", async (req, res) => {
    const { id } = req.params;
    try {
        const data = await prisma.user.findUnique({
            where: {
                id: Number(id)
            }
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

module.exports = { UserRouter: router }