"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { validateInviteCode } from "@/lib/invite-codes";

export default function JoinPage() {
  const params = useParams();
  const router = useRouter();
  const code = params.code as string;
  const [status, setStatus] = useState<"validating" | "valid" | "invalid">(
    "validating"
  );
  const [userName, setUserName] = useState("");

  useEffect(() => {
    // Validate the invite code
    const invite = validateInviteCode(code);

    if (invite) {
      setStatus("valid");
      setUserName(invite.name);

      // Store in localStorage (simple auth for MVP)
      localStorage.setItem("inviteCode", code);
      localStorage.setItem("userName", invite.name);
      localStorage.setItem("userRole", invite.role);

      // Redirect to home after 2 seconds
      setTimeout(() => {
        router.push("/");
      }, 2000);
    } else {
      setStatus("invalid");
    }
  }, [code, router]);

  if (status === "validating") {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-4">
        <div className="text-center">
          <div className="text-6xl mb-4 animate-pulse">⏳</div>
          <p className="text-text text-2xl">Validando tu código...</p>
        </div>
      </div>
    );
  }

  if (status === "valid") {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <div className="text-6xl mb-6">✅</div>
          <h1 className="text-text text-3xl font-bold mb-4">
            ¡Bienvenido, {userName}!
          </h1>
          <p className="text-accent text-xl mb-8">
            Redirigiendo a los recuerdos familiares...
          </p>
          <div className="animate-spin text-primary text-4xl mx-auto">⭐</div>
        </div>
      </div>
    );
  }

  // Invalid code
  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <div className="text-6xl mb-6">🔒</div>
        <h1 className="text-text text-3xl font-bold mb-4">Código Inválido</h1>
        <p className="text-accent text-xl mb-8">
          El código que usaste no es válido. Por favor, verifica el link que
          recibiste.
        </p>
        <div className="bg-secondary border-2 border-border rounded-xl p-6">
          <p className="text-text text-lg">
            Contacta al administrador para recibir un nuevo link de invitación
            📱
          </p>
        </div>
      </div>
    </div>
  );
}
