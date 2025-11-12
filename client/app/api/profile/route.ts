import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import prisma from "@/lib/db";
import { hash, compare } from "bcryptjs";

export async function PATCH(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session?.user?.id) {
      return new NextResponse("Non autorisé", { status: 401 });
    }

    const body = await request.json();
    const { email, currentPassword, newPassword } = body;

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
    });

    if (!user) {
      return new NextResponse("Utilisateur non trouvé", { status: 404 });
    }

    // Mise à jour de l'email
    if (email) {
      // Vérifier si l'email est déjà utilisé
      const existingUser = await prisma.user.findUnique({
        where: { email },
      });

      if (existingUser && existingUser.id !== session.user.id) {
        return new NextResponse("Cet email est déjà utilisé", { status: 400 });
      }

      await prisma.user.update({
        where: { id: session.user.id },
        data: { email },
      });

      return new NextResponse("Email mis à jour avec succès", { status: 200 });
    }

    // Mise à jour du mot de passe
    if (currentPassword && newPassword) {
      const isValidPassword = await compare(currentPassword, user.password);
      if (!isValidPassword) {
        return new NextResponse("Mot de passe actuel incorrect", { status: 400 });
      }

      const hashedPassword = await hash(newPassword, 12);
      await prisma.user.update({
        where: { id: session.user.id },
        data: { password: hashedPassword },
      });

      return new NextResponse("Mot de passe mis à jour avec succès", { status: 200 });
    }

    return new NextResponse("Aucune modification demandée", { status: 400 });
  } catch (error) {
    console.error("Erreur lors de la mise à jour du profil:", error);
    return new NextResponse("Erreur interne du serveur", { status: 500 });
  }
}