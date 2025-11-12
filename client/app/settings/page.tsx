"use client";
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";

const ACCENT_FROM = "from-indigo-500";
const ACCENT_TO = "to-fuchsia-500";
const CARD = "bg-[#2b2324]/80 backdrop-blur-xl border border-white/10 rounded-2xl shadow-[0_8px_30px_rgba(0,0,0,0.35)]";

export default function SettingsPage() {
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [successMessage, setSuccessMessage] = React.useState<string | null>(null);
  
  // État pour la modification de l'email
  const [newEmail, setNewEmail] = React.useState("");
  
  // État pour la modification du mot de passe
  const [currentPassword, setCurrentPassword] = React.useState("");
  const [newPassword, setNewPassword] = React.useState("");
  const [confirmPassword, setConfirmPassword] = React.useState("");

  const handleUpdateEmail = async () => {
    if (!newEmail) {
      setError("Veuillez entrer une nouvelle adresse email");
      return;
    }
    
    setLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/profile", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email: newEmail }),
      });
      
      if (!response.ok) {
        throw new Error("Erreur lors de la mise à jour de l'email");
      }
      
      setSuccessMessage("Email mis à jour avec succès");
      setNewEmail("");
    } catch (e: any) {
      setError(e.message || "Erreur lors de la mise à jour de l'email");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdatePassword = async () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      setError("Veuillez remplir tous les champs");
      return;
    }
    
    if (newPassword !== confirmPassword) {
      setError("Les mots de passe ne correspondent pas");
      return;
    }

    if (newPassword.length < 8) {
      setError("Le nouveau mot de passe doit contenir au moins 8 caractères");
      return;
    }
    
    setLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/profile", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          currentPassword,
          newPassword
        }),
      });
      
      if (!response.ok) {
        throw new Error("Erreur lors de la mise à jour du mot de passe");
      }
      
      setSuccessMessage("Mot de passe mis à jour avec succès");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (e: any) {
      setError(e.message || "Erreur lors de la mise à jour du mot de passe");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-3 md:p-6 space-y-6">
      <div className="text-xl font-semibold tracking-tight text-white/90">Paramètres</div>
      
      {/* Préférences générales */}
      <Card className={CARD}>
        <CardContent className="p-5 space-y-4">
          <div className="text-sm font-medium text-white/90">Préférences</div>
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm text-white/90">Notifications par e-mail</div>
              <div className="text-xs text-muted-foreground">Alertes et mises à jour</div>
            </div>
            <Switch defaultChecked />
          </div>
          <div className="grid gap-2 md:grid-cols-2">
            <div>
              <div className="text-xs text-muted-foreground mb-1">Nom d'affichage</div>
              <Input placeholder="Votre nom" defaultValue="Eroudini" />
            </div>
            <div>
              <div className="text-xs text-muted-foreground mb-1">Langue</div>
              <Input placeholder="Français" defaultValue="Français" />
            </div>
          </div>
          <div className="pt-2">
            <Button className={`rounded-xl bg-gradient-to-r ${ACCENT_FROM} ${ACCENT_TO} text-white hover:opacity-95`}>
              Enregistrer
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Messages de succès ou d'erreur */}
      {error && (
        <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-3 rounded-xl text-sm">
          {error}
        </div>
      )}
      {successMessage && (
        <div className="bg-green-500/10 border border-green-500/20 text-green-400 p-3 rounded-xl text-sm">
          {successMessage}
        </div>
      )}

      {/* Modification de l'email */}
      <Card className={CARD}>
        <CardContent className="p-5 space-y-4">
          <div className="text-sm font-medium text-white/90">Modifier l'adresse email</div>
          <div>
            <div className="text-xs text-muted-foreground mb-1">Nouvelle adresse email</div>
            <Input 
              type="email" 
              placeholder="nouvelle@email.com" 
              value={newEmail}
              onChange={(e) => setNewEmail(e.target.value)}
            />
          </div>
          <div className="pt-2">
            <Button 
              onClick={handleUpdateEmail}
              disabled={loading || !newEmail}
              className={`rounded-xl bg-gradient-to-r ${ACCENT_FROM} ${ACCENT_TO} text-white hover:opacity-95`}
            >
              {loading ? "Mise à jour..." : "Mettre à jour l'email"}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Modification du mot de passe */}
      <Card className={CARD}>
        <CardContent className="p-5 space-y-4">
          <div className="text-sm font-medium text-white/90">Modifier le mot de passe</div>
          <div>
            <div className="text-xs text-muted-foreground mb-1">Mot de passe actuel</div>
            <Input 
              type="password" 
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
            />
          </div>
          <div>
            <div className="text-xs text-muted-foreground mb-1">Nouveau mot de passe</div>
            <Input 
              type="password" 
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
            />
          </div>
          <div>
            <div className="text-xs text-muted-foreground mb-1">Confirmer le nouveau mot de passe</div>
            <Input 
              type="password" 
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
          </div>
          <div className="pt-2">
            <Button 
              onClick={handleUpdatePassword}
              disabled={loading || !currentPassword || !newPassword || !confirmPassword}
              className={`rounded-xl bg-gradient-to-r ${ACCENT_FROM} ${ACCENT_TO} text-white hover:opacity-95`}
            >
              {loading ? "Mise à jour..." : "Mettre à jour le mot de passe"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}