"use client";

import Link from "next/link";
import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { useRouter, useParams } from "next/navigation";
import { supabase } from "@/lib/supabase";
import ProtectedPage from "@/components/ProtectedPage";

type Category = "childhood" | "family" | "pets" | "work" | "other";

type Memory = {
  id: string;
  category: Category;
  photo_url: string | null;
  story: string;
  author_name: string;
  created_at: string;
};

export default function EditMemory() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const [memory, setMemory] = useState<Memory | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [story, setStory] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const galleryInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (id) {
      fetchMemory();
    }
  }, [id]);

  const fetchMemory = async () => {
    try {
      const { data, error } = await supabase
        .from("memories")
        .select("*")
        .eq("id", id)
        .single();

      if (error) throw error;

      setMemory(data);
      setSelectedCategory(data.category);
      setStory(data.story);
      setPhotoPreview(data.photo_url);
    } catch (err: any) {
      console.error("Error fetching memory:", err);
      setError("No se pudo cargar el recuerdo");
    } finally {
      setIsLoading(false);
    }
  };

  const handlePhotoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setPhotoFile(file);
      const previewUrl = URL.createObjectURL(file);
      setPhotoPreview(previewUrl);
    }
  };

  const handleSubmit = async () => {
    if (!selectedCategory || !story.trim()) {
      setError("Por favor completa todos los campos");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      let photoUrl = memory?.photo_url;

      // Upload new photo if selected
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

        const {
          data: { publicUrl },
        } = supabase.storage.from("memory-photos").getPublicUrl(filePath);

        photoUrl = publicUrl;
      }

      // Update memory in database
      const { error: updateError } = await supabase
        .from("memories")
        .update({
          category: selectedCategory,
          photo_url: photoUrl,
          story: story.trim(),
        })
        .eq("id", id);

      if (updateError) {
        throw new Error("Error al actualizar el recuerdo: " + updateError.message);
      }

      // Success! Redirect back to memory detail
      router.push(`/memory/${id}`);
    } catch (err: unknown) {
      console.error("Update error:", err);
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

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">⏳</div>
          <p className="text-xl text-accent">Cargando...</p>
        </div>
      </div>
    );
  }

  if (error && !memory) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">😕</div>
          <h2 className="text-text mb-4">No se pudo cargar el recuerdo</h2>
          <Link href="/" className="text-primary hover:text-accent text-xl underline">
            ← Volver al inicio
          </Link>
        </div>
      </div>
    );
  }

  return (
    <ProtectedPage>
      <div className="min-h-screen bg-background">
        {/* Header */}
        <header className="border-b-2 border-border">
          <div className="max-w-6xl mx-auto px-4 py-6 flex items-center">
            <Link href={`/memory/${id}`} className="text-accent hover:text-primary text-xl">
              ← Volver
            </Link>
            <h1 className="text-center text-primary text-2xl flex-1">
              Editar Recuerdo
            </h1>
            <div className="w-20"></div>
          </div>
        </header>

        {/* Main Content */}
        <main className="max-w-4xl mx-auto px-4 py-8">
          {/* Category Selection */}
          <section className="mb-8">
            <h2 className="text-text mb-6 text-2xl">Categoría:</h2>
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

          {/* Photo Section */}
          <section className="mb-8">
            <div className="flex items-center gap-3 mb-6">
              <h2 className="text-text">Foto:</h2>
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
                <span>{photoPreview ? "Cambiar Foto" : "Agregar Foto"}</span>
              </button>
            </div>

            {/* Photo Preview */}
            {photoPreview && (
              <div className="mt-6">
                <div className="relative w-full max-w-md mx-auto rounded-xl overflow-hidden shadow-lg border-2 border-primary">
                  <Image
                    src={photoPreview}
                    alt="Preview"
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

          {/* Story Text Area */}
          <section className="mb-8">
            <h2 className="text-text mb-6">Historia:</h2>

            <textarea
              value={story}
              onChange={(e) => setStory(e.target.value)}
              placeholder="Escribe tu historia..."
              rows={8}
              className="w-full p-4 border-2 border-border rounded-xl focus:border-primary focus:outline-none text-text text-lg resize-none"
              maxLength={1000}
            />

            {/* Character count */}
            <div className="text-right mt-2 text-accent">
              {story.length} / 1000 caracteres
            </div>
          </section>

          {/* Error message */}
          {error && (
            <div className="mb-6 p-4 bg-red-100 border-2 border-red-400 rounded-xl text-red-700 text-lg">
              {error}
            </div>
          )}

          {/* Submit button */}
          <button
            onClick={handleSubmit}
            disabled={isSubmitting || !selectedCategory || !story.trim()}
            className={`w-full py-4 px-8 rounded-xl text-xl font-semibold shadow-lg transition-all ${
              isSubmitting || !selectedCategory || !story.trim()
                ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                : "bg-success text-white hover:bg-accent hover:scale-105 active:scale-95"
            }`}
          >
            {isSubmitting ? "⏳ Guardando..." : "✓ Guardar Cambios"}
          </button>
        </main>
      </div>
    </ProtectedPage>
  );
}
