import Link from "next/link";

export default function AuthError() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <div className="text-6xl mb-6">🔒</div>
        <h1 className="text-text text-3xl font-bold mb-4">
          Link Inválido o Expirado
        </h1>
        <p className="text-accent text-xl mb-8">
          El link que usaste no es válido o ya expiró. Por favor, solicita un
          nuevo link de acceso.
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
