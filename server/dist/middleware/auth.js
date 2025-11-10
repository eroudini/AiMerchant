import jwt from "jsonwebtoken";
export const requireAuth = (req, res, next) => {
    try {
        const token = req.cookies?.access_token;
        if (!token)
            return res.status(401).json({ error: "Unauthorized" });
        const secret = process.env.JWT_SECRET || "dev-secret";
        const payload = jwt.verify(token, secret);
        // @ts-ignore
        req.user = payload;
        next();
    }
    catch (e) {
        return res.status(401).json({ error: "Unauthorized" });
    }
};
