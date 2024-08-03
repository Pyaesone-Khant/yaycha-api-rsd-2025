const { prisma } = require("@/libs/prisma");
const express = require("express");
const jwt = require("jsonwebtoken");

/***
 * @param {express.Request} req
 * @param {express.Response} res
 * @param {express.NextFunction} next
 */

function auth(req, res, next) {
    const { authorization } = req.headers;
    const token = authorization && authorization.split(" ")[1];

    if (!token) {
        return res.status(400).json({ message: "Token required!" });
    }

    const user = jwt.decode(token, process.env.JWT_SECRET);

    if (!user) {
        return res.status(401).json({ message: "Invalid token!" });
    }

    res.locals.user = user;
    next();
}

/***
 * @param {('post' | 'comment')} type
 */

function isOwner(type) {
    /***
     * @param {express.Request} req
     * @param {express.Response} res
     * @param {express.NextFunction} next
     */

    return async(req, res, next) => {
        const { id } = req.params;
        const { user } = res.locals;

       if(type === "post"){
        const post = await prisma.post.findUnique({
            where: {
                id: Number(id)
            }
        })

        if(post.userId == user.id) return next();
       }

       if(type === "comment"){
        const comment = await prisma.comment.findUnique({
            where: {id: Number(id)},
            include: {
                post: true,
            }
        })

        if(comment.userId == user.id || comment.post.userId == user.id) return next();
       }

       res.status(403).json({message: "You have no access to delete! Unauthorized!"})
    }
}

module.exports = { auth, isOwner };
