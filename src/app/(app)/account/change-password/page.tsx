"use client";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { changePasswordSchema, type ChangePasswordInput } from "@/lib/validations";
import { apiClient } from "@/lib/api.client";
import { toast } from "sonner";

export default function ChangePasswordPage() {
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<ChangePasswordInput>({ resolver: zodResolver(changePasswordSchema) });

  const onSubmit = async (values: ChangePasswordInput) => {
    try {
      await apiClient.patch("/user/password", { currentPassword: values.currentPassword, newPassword: values.newPassword });
      toast.success("Mot de passe mis à jour.");
    } catch (e: any) {
      toast.error(e?.response?.data?.message ?? "Échec de la mise à jour");
    }
  };

  return (
    <div className="max-w-lg space-y-4">
      <h1 className="text-2xl font-semibold">Changer le mot de passe</h1>
      <form onSubmit={handleSubmit(onSubmit)} className="card p-4 space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1" htmlFor="currentPassword">Mot de passe actuel</label>
          <input id="currentPassword" type="password" className="w-full rounded-xl border px-3 py-2" aria-invalid={!!errors.currentPassword} {...register("currentPassword")} />
          {errors.currentPassword && <p role="alert" className="text-sm text-red-600 mt-1">{errors.currentPassword.message}</p>}
        </div>
        <div>
          <label className="block text-sm font-medium mb-1" htmlFor="newPassword">Nouveau mot de passe</label>
          <input id="newPassword" type="password" className="w-full rounded-xl border px-3 py-2" aria-invalid={!!errors.newPassword} {...register("newPassword")} />
          {errors.newPassword && <p role="alert" className="text-sm text-red-600 mt-1">{errors.newPassword.message}</p>}
        </div>
        <div>
          <label className="block text-sm font-medium mb-1" htmlFor="confirmPassword">Confirmer le mot de passe</label>
          <input id="confirmPassword" type="password" className="w-full rounded-xl border px-3 py-2" aria-invalid={!!errors.confirmPassword} {...register("confirmPassword")} />
          {errors.confirmPassword && <p role="alert" className="text-sm text-red-600 mt-1">{errors.confirmPassword.message}</p>}
        </div>
        <button disabled={isSubmitting} className="btn-primary" type="submit">
          {isSubmitting ? "Sauvegarde..." : "Mettre à jour"}
        </button>
      </form>
    </div>
  );
}
