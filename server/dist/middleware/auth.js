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
export function requireRole(role) {
    return (req, res, next) => {
        const user = req.user;
        if (!user)
            return res.status(401).json({ error: 'Unauthorized' });
        const r = user.role || 'viewer';
        if (role === 'viewer')
            return next();
        if (role === 'admin' && r === 'admin')
            return next();
        return res.status(403).json({ error: 'Forbidden' });
    };
}
