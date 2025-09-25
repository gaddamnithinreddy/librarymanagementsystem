const jwt = require("jsonwebtoken");
const { JWT_ADMIN_PASSWORD } = require("../config");

function adminMiddleware(req, res, next) {
    const token = req.headers.token;
    try {
        const decodedData = jwt.verify(token, JWT_ADMIN_PASSWORD);
        if (decodedData) {
            req.userId = decodedData.id;
            next()
        } else {
            res.status(403).json({
                message: "You are not signed up"
            })
        }
    } catch (error) {
        res.status(403).json({
            message: "Invalid token"
        })
    }
}
module.exports = {
    adminMiddleware: adminMiddleware
}