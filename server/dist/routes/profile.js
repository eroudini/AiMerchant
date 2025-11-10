import { Router } from "express";
import { z } from "zod";
import { validate } from "../middleware/validate.js";
import { verifyPassword, hashPassword } from "../utils/hash.js";
import { requireAuth } from "../middleware/auth.js";
import { getPrisma } from "../db.js";
const prisma = getPrisma();
const updateProfileSchema = z.object({
    body: z.object({
        email: z.string().email().optional(),
        currentPassword: z.string().min(1).optional(),
        newPassword: z.string().min(8).optional(),
    }),
});
const router = Router();
router.put("/profile", requireAuth, validate(updateProfileSchema), async (req, res, next) => {
    try {
        const { email, currentPassword, newPassword } = req.body;
        const userId = req.user.sub;
        const user = await prisma.user.findUnique({ where: { id: userId } });
        if (!user)
            return res.status(404).json({ error: "Utilisateur non trouvé" });
        // Mise à jour de l'email
        if (email && email !== user.email) {
            // Vérifier si l'email n'est pas déjà utilisé
            const existingUser = await prisma.user.findUnique({ where: { email } });
            if (existingUser) {
                return res.status(400).json({ error: "Cette adresse email est déjà utilisée" });
            }
        }
        // Mise à jour du mot de passe
        if (currentPassword && newPassword) {
            const isPasswordValid = await verifyPassword(currentPassword, user.passwordHash);
            if (!isPasswordValid) {
                return res.status(400).json({ error: "Mot de passe actuel incorrect" });
            }
            const newPasswordHash = await hashPassword(newPassword);
            await prisma.user.update({
                where: { id: userId },
                data: { passwordHash: newPasswordHash }
            });
        }
        // Mise à jour de l'email si fourni
        if (email && email !== user.email) {
            await prisma.user.update({
                where: { id: userId },
                data: { email }
            });
        }
        res.json({ message: "Profil mis à jour avec succès" });
    }
    catch (e) {
        next(e);
    }
});
export default router;
