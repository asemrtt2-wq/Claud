"use server";

import crypto from "crypto";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";

const TOKEN_TTL_MS = 60 * 60 * 1000;

export async function requestPasswordReset(formData: FormData) {
  const email = String(formData.get("email") ?? "")
    .trim()
    .toLowerCase();

  if (email) {
    const customer = await prisma.customer.findUnique({ where: { email } });
    if (customer) {
      const token = crypto.randomBytes(32).toString("hex");
      await prisma.passwordResetToken.create({
        data: {
          customerId: customer.id,
          token,
          expiresAt: new Date(Date.now() + TOKEN_TTL_MS),
        },
      });

      const resetUrl = `${process.env.NEXT_PUBLIC_BASE_URL ?? ""}/reset-password?token=${token}`;
      // No email provider is configured for this app yet, so the reset link can't be
      // emailed to the customer. Logging it here (server-side only, never sent back in
      // the HTTP response) keeps this usable for local/admin-assisted resets without
      // leaking it to whoever submitted the form — see CLAUDE.md for how to wire up a
      // real provider (e.g. Resend) once ready.
      console.log(`[password-reset] ${email} -> ${resetUrl}`);
    }
  }

  // Always return the same generic result whether or not the email exists,
  // so this form can't be used to check which emails have an account.
  return { ok: true };
}

export async function resetPassword(
  token: string,
  formData: FormData
): Promise<{ error: string } | { ok: true }> {
  const password = String(formData.get("password") ?? "");
  if (password.length < 8) {
    return { error: "Le mot de passe doit contenir au moins 8 caractères." };
  }

  const resetToken = await prisma.passwordResetToken.findUnique({ where: { token } });
  if (
    !resetToken ||
    resetToken.usedAt ||
    resetToken.expiresAt.getTime() < Date.now()
  ) {
    return { error: "Ce lien de réinitialisation est invalide ou a expiré." };
  }

  const passwordHash = await bcrypt.hash(password, 10);

  await prisma.$transaction([
    prisma.customer.update({
      where: { id: resetToken.customerId },
      data: { passwordHash },
    }),
    prisma.passwordResetToken.update({
      where: { id: resetToken.id },
      data: { usedAt: new Date() },
    }),
  ]);

  return { ok: true };
}
