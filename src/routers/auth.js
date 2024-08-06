const { prisma } = require("@/libs/prisma");
const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken")

const router = express.Router();

router.post("/login", async (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({ message: "Username and password is required!" })
    }

    const user = await prisma.user.findFirst({
        where: {
            username
        },
        include: {
            followers: true,
            following: true
        }
    })

    if (user) {
        if (bcrypt.compare(password, user.password)) {
            const token = jwt.sign(user, process.env.JWT_SECRET)
            return res.json({ token, user })
        }
    }

    return res.status(400).json({ message: "Invalid username or password!" })
})

router.post("/register", async (req, res) => {
    const { name, username, password, bio } = req.body;

    if (!(name && username && password && bio)) {
        return res.status(400).json({ message: "All fields are required!" });
    }

    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        const user = await prisma.user.create({
            data: {
                name,
                username,
                password: hashedPassword,
                bio
            }
        });
        res.json(user);
    } catch (error) {
        return res.status(500).json(error)
    }

})

module.exports = { AuthRouter: router }