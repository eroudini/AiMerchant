"use client";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { changeEmailSchema, type ChangeEmailInput } from "@/lib/validations";
import { apiClient } from "@/lib/api.client";
import { toast } from "sonner";

export default function ChangeEmailPage() {
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<ChangeEmailInput>({ resolver: zodResolver(changeEmailSchema) });

  const onSubmit = async (values: ChangeEmailInput) => {
    try {
      const res = await apiClient.patch("/user/email", values);
      if ((res.data as any)?.pendingVerification) {
        toast.success("Email de vérification envoyé à la nouvelle adresse.");
      } else {
        toast.success("Demande prise en compte.");
      }
    } catch (e: any) {
      toast.error(e?.response?.data?.message ?? "Impossible de modifier l'e-mail");
    }
  };

  return (
    <div className="max-w-lg space-y-4">
      <h1 className="text-2xl font-semibold">Changer d'e-mail</h1>
      <form onSubmit={handleSubmit(onSubmit)} className="card p-4 space-y-4 bg-white/5 border-white/10">
        <div>
          <label className="block text-sm font-medium mb-1" htmlFor="newEmail">Nouvel e-mail</label>
          <input id="newEmail" type="email" className="w-full rounded-xl border px-3 py-2 bg-transparent" aria-invalid={!!errors.newEmail} {...register("newEmail")} />
          {errors.newEmail && <p role="alert" className="text-sm text-red-400 mt-1">{errors.newEmail.message}</p>}
        </div>
        <button disabled={isSubmitting} className="btn-primary" type="submit">
          {isSubmitting ? "Envoi..." : "Envoyer la vérification"}
        </button>
      </form>
    </div>
  );
}
