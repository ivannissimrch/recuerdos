"use client";

import Link from "next/link";
import { useState, useRef } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import ProtectedPage from "@/components/ProtectedPage";
import { getCurrentUser } from "@/lib/auth";
import { DEEP_QUESTIONS, type DeepQuestion } from "@/lib/deep-questions";

type Category = "childhood" | "family" | "pets" | "work" | "other";
type Mode = "choose" | "guided" | "freeform";

export default function AddMemory() {
  const user = getCurrentUser();
  const [mode, setMode] = useState<Mode>("choose");
  const [selectedQuestion, setSelectedQuestion] = useState<DeepQuestion | null>(
    null
  );
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(
    null
  );
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [story, setStory] = useState<string>("");
  const [authorName, setAuthorName] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const galleryInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  const handlePhotoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setPhotoFile(file);
      const previewUrl = URL.createObjectURL(file);
      setPhotoPreview(previewUrl);
    }
  };

  // Simple placeholders by category
  const placeholders: Record<Category, string> = {
    childhood:
      "¿Quiénes aparecen en la foto? ¿Dónde estaban? ¿Qué recuerdas de ese día?",
    family:
      "¿Quiénes están en la foto? ¿Qué estaban celebrando? Cuenta la historia...",
    pets: "Describe a tu mascota... ¿Qué estaba haciendo? ¿Por qué es especial este momento?",
    work: "¿Dónde fue tomada esta foto? ¿Quiénes aparecen? ¿Qué representa para ti?",
    other:
      "Describe qué ves en la foto... ¿Cuándo fue? ¿Por qué es especial para ti?",
  };

  const handleQuestionSelect = (question: DeepQuestion) => {
    setSelectedQuestion(question);
    setSelectedCategory(question.category);
    setStory(question.prompt + "\n\n");
    setMode("freeform"); // Go to the form
  };

  const handlePromptClick = (prompt: string) => {
    setStory(prompt + " ");
  };

  const handleSubmit = async () => {
    // Validation
    if (!selectedCategory || !story.trim() || !authorName.trim()) {
      setError("Por favor completa todos los campos");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      let photoUrl = null;

      // 1. Upload photo to Supabase Storage (if photo exists)
      if (photoFile) {
        const fileExt = photoFile.name.split(".").pop();
        const fileName = `${Date.now()}-${Math.random()
          .toString(36)
          .substring(7)}.${fileExt}`;
        const filePath = `memories/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from("memory-photos")
          .upload(filePath, photoFile);

        if (uploadError) {
          throw new Error("Error al subir la foto: " + uploadError.message);
        }

        // 2. Get public URL
        const {
          data: { publicUrl },
        } = supabase.storage.from("memory-photos").getPublicUrl(filePath);

        photoUrl = publicUrl;
      }

      // 3. Insert memory into database
      const { error: insertError } = await supabase.from("memories").insert({
        category: selectedCategory,
        photo_url: photoUrl,
        story: story.trim(),
        author_name: authorName.trim(),
      });

      if (insertError) {
        throw new Error("Error al guardar el recuerdo: " + insertError.message);
      }

      // Success! Redirect to home
      router.push("/");
    } catch (err: unknown) {
      console.error("Submit error:", err);
      setError(
        err instanceof Error ? err.message : "Algo salió mal. Intenta de nuevo."
      );
      setIsSubmitting(false);
    }
  };

  const categories = [
    { id: "childhood" as Category, icon: "🧒", label: "Niñez" },
    { id: "family" as Category, icon: "👨‍👩‍👧", label: "Familia" },
    { id: "pets" as Category, icon: "🐕", label: "Mascotas" },
    { id: "work" as Category, icon: "💼", label: "Trabajo" },
    { id: "other" as Category, icon: "📌", label: "Otro" },
  ];

  return (
    <ProtectedPage>
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b-2 border-border">
        <div className="max-w-6xl mx-auto px-4 py-6 flex items-center">
          <Link href="/" className="text-accent hover:text-primary text-xl">
            ← Volver
          </Link>
          <h1 className="text-center text-primary text-2xl flex-1">
            Agregar Recuerdo
          </h1>
          <div className="w-20"></div> {/* Spacer for centering */}
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 py-8">
        {/* Step 0: Choose Mode (Guided vs Free-form) */}
        {mode === "choose" && (
          <section className="mb-8">
            <h2 className="text-text mb-6 text-center text-3xl">
              ¿Qué quieres compartir?
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Guided Path - Answer a Question */}
              <button
                onClick={() => setMode("guided")}
                className="bg-white border-2 border-border rounded-xl p-8 hover:border-primary hover:shadow-lg transition-all hover:scale-105 text-left"
              >
                <div className="text-6xl mb-4">💭</div>
                <h3 className="text-text text-2xl font-semibold mb-2">
                  Responder una Pregunta
                </h3>
                <p className="text-accent text-lg">
                  Te mostraré preguntas especiales para ayudarte a compartir
                  historias profundas
                </p>
              </button>

              {/* Free-form Path - Share a Memory */}
              <button
                onClick={() => setMode("freeform")}
                className="bg-white border-2 border-border rounded-xl p-8 hover:border-primary hover:shadow-lg transition-all hover:scale-105 text-left"
              >
                <div className="text-6xl mb-4">📸</div>
                <h3 className="text-text text-2xl font-semibold mb-2">
                  Compartir un Recuerdo
                </h3>
                <p className="text-accent text-lg">
                  Sube una foto y escribe libremente sobre lo que quieras
                  compartir
                </p>
              </button>
            </div>
          </section>
        )}

        {/* Guided Mode: Show Deep Questions */}
        {mode === "guided" && (
          <section className="mb-8">
            <div className="flex items-center justify-between mb-6">
              <button
                onClick={() => setMode("choose")}
                className="text-accent hover:text-primary text-xl"
              >
                ← Volver
              </button>
              <h2 className="text-text text-2xl">Elige una Pregunta:</h2>
              <div className="w-20"></div>
            </div>

            <div className="space-y-4">
              {DEEP_QUESTIONS.map((question) => (
                <button
                  key={question.id}
                  onClick={() => handleQuestionSelect(question)}
                  className="w-full text-left p-6 bg-white border-2 border-border rounded-xl hover:border-primary hover:shadow-md transition-all text-text text-xl leading-relaxed"
                >
                  {question.text}
                </button>
              ))}
            </div>
          </section>
        )}

        {/* Free-form Mode: Show Category Selection + Form */}
        {mode === "freeform" && !selectedCategory && (
          <section className="mb-8">
            <div className="flex items-center justify-between mb-6">
              <button
                onClick={() => setMode("choose")}
                className="text-accent hover:text-primary text-xl"
              >
                ← Volver
              </button>
              <h2 className="text-text text-2xl">Elige una Categoría:</h2>
              <div className="w-20"></div>
            </div>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`
                  flex flex-col items-center justify-center
                  p-6 rounded-xl border-2
                  transition-all duration-200
                  ${
                    selectedCategory === category.id
                      ? "bg-primary text-white border-primary shadow-lg scale-105"
                      : "bg-white text-text border-border hover:border-primary hover:shadow-md"
                  }
                `}
              >
                <span className="text-5xl mb-2">{category.icon}</span>
                <span className="text-xl font-semibold">{category.label}</span>
              </button>
            ))}
          </div>
          </section>
        )}

        {/* Step 2: Photo Upload (only show after category selected in both modes) */}
        {mode === "freeform" && selectedCategory && (
          <section className="mb-8">
            <div className="flex items-center gap-3 mb-6">
              <h2 className="text-text">Agregar una Foto:</h2>
              <span className="text-accent text-lg bg-secondary px-3 py-1 rounded-full">
                Opcional
              </span>
            </div>

            {/* Hidden file input */}
            <input
              ref={galleryInputRef}
              type="file"
              accept="image/*"
              onChange={handlePhotoSelect}
              className="hidden"
            />

            {/* Photo button */}
            <div className="mb-6">
              <button
                onClick={() => galleryInputRef.current?.click()}
                className="w-full flex items-center justify-center gap-3 bg-primary text-white py-4 px-6 rounded-xl hover:bg-accent shadow-md hover:scale-105 transition-all text-xl font-semibold"
              >
                <span className="text-3xl">🖼️</span>
                <span>Elegir Foto (Opcional)</span>
              </button>
            </div>

            {/* Photo Preview */}
            {photoPreview && (
              <div className="mt-6">
                <div className="relative w-full max-w-md mx-auto rounded-xl overflow-hidden shadow-lg border-2 border-primary">
                  <Image
                    src={photoPreview}
                    alt="Selected photo preview"
                    width={500}
                    height={500}
                    className="w-full h-auto object-cover"
                  />
                </div>
                <div className="text-center mt-4">
                  <button
                    onClick={() => {
                      setPhotoFile(null);
                      setPhotoPreview(null);
                    }}
                    className="text-accent hover:text-primary underline text-lg"
                  >
                    Quitar foto
                  </button>
                </div>
              </div>
            )}
          </section>
        )}

        {/* Step 3: Story Text Area (show after category is selected in both modes) */}
        {mode === "freeform" && selectedCategory && (
          <section className="mb-8">
            {/* Show question if coming from guided mode */}
            {selectedQuestion && (
              <div className="bg-primary text-white rounded-xl p-6 mb-6">
                <p className="text-sm mb-2">Respondiendo a:</p>
                <h3 className="text-2xl font-semibold">{selectedQuestion.text}</h3>
              </div>
            )}

            <h2 className="text-text mb-6">Escribe tu Historia:</h2>

            <textarea
              value={story}
              onChange={(e) => setStory(e.target.value)}
              placeholder={selectedQuestion ? "" : placeholders[selectedCategory]}
              rows={4}
              className="w-full p-4 border-2 border-border rounded-xl focus:border-primary focus:outline-none text-text text-lg resize-none"
              maxLength={1000}
            />

            {/* Character count */}
            <div className="text-right mt-2 text-accent">
              {story.length} / 1000 caracteres
            </div>
          </section>
        )}

        {/* Step 4: Author Name & Submit (show in both modes) */}
        {mode === "freeform" && selectedCategory && story.trim() && (
          <section className="mb-8">
            <h2 className="text-text mb-6">¿Quién comparte este recuerdo?</h2>

            <input
              type="text"
              value={authorName}
              onChange={(e) => setAuthorName(e.target.value)}
              placeholder="Tu nombre (ej: Mamá, Papá, Ivan...)"
              className="w-full p-4 border-2 border-border rounded-xl focus:border-primary focus:outline-none text-text text-lg mb-6"
            />

            {/* Error message */}
            {error && (
              <div className="mb-6 p-4 bg-red-100 border-2 border-red-400 rounded-xl text-red-700 text-lg">
                {error}
              </div>
            )}

            {/* Submit button */}
            <button
              onClick={handleSubmit}
              disabled={isSubmitting || !authorName.trim()}
              className={`w-full py-4 px-8 rounded-xl text-xl font-semibold shadow-lg transition-all ${
                isSubmitting || !authorName.trim()
                  ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                  : "bg-success text-white hover:bg-accent hover:scale-105 active:scale-95"
              }`}
            >
              {isSubmitting ? "⏳ Guardando..." : "✓ Compartir Recuerdo"}
            </button>
          </section>
        )}
      </main>
    </div>
    </ProtectedPage>
  );
}
