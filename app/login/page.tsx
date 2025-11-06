import Link from "next/link";

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="text-center max-w-lg">
        <div className="text-6xl mb-6">🔒</div>
        <h1 className="text-text text-4xl font-bold mb-4">
          Recuerdos Familiares
        </h1>
        <p className="text-accent text-xl mb-8">
          Esta aplicación es privada. Necesitas un link de invitación para
          acceder.
        </p>

        <div className="bg-secondary border-2 border-border rounded-xl p-8 mb-6">
          <h2 className="text-text text-2xl font-semibold mb-4">
            ¿Cómo accedo?
          </h2>
          <div className="text-left text-text text-lg space-y-4">
            <p className="flex items-start gap-3">
              <span className="text-2xl">📱</span>
              <span>
                Si eres parte de la familia, ya deberías tener un link personal
                vía WhatsApp
              </span>
            </p>
            <p className="flex items-start gap-3">
              <span className="text-2xl">🔗</span>
              <span>
                El link se ve así:{" "}
                <code className="bg-white px-2 py-1 rounded">
                  recuerdos.app/join/tu-codigo
                </code>
              </span>
            </p>
            <p className="flex items-start gap-3">
              <span className="text-2xl">💾</span>
              <span>
                Guarda ese link en tus favoritos para acceder siempre
              </span>
            </p>
          </div>
        </div>

        <div className="bg-white border-2 border-border rounded-xl p-6">
          <p className="text-text text-lg">
            ¿No tienes link? Contacta al administrador 📞
          </p>
        </div>
      </div>
    </div>
  );
}
