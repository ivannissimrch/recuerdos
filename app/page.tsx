'use client';

import Link from "next/link";
import Image from "next/image";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import ProtectedPage from "@/components/ProtectedPage";
import { getCurrentUser, canAddMemories } from "@/lib/auth";

type Memory = {
  id: string;
  category: string;
  photo_url: string;
  story: string;
  author_name: string;
  created_at: string;
};

export default function Home() {
  const [memories, setMemories] = useState<Memory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const user = getCurrentUser();
  const canAdd = canAddMemories();

  useEffect(() => {
    fetchMemories();
  }, []);

  const fetchMemories = async () => {
    try {
      const { data, error } = await supabase
        .from('memories')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setMemories(data || []);
    } catch (error) {
      console.error('Error fetching memories:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getCategoryIcon = (category: string) => {
    const icons: Record<string, string> = {
      childhood: '🧒',
      family: '👨‍👩‍👧',
      pets: '🐕',
      work: '💼',
      other: '📌',
    };
    return icons[category] || '📌';
  };

  const getCategoryLabel = (category: string) => {
    const labels: Record<string, string> = {
      childhood: 'Niñez',
      family: 'Familia',
      pets: 'Mascotas',
      work: 'Trabajo',
      other: 'Otro',
    };
    return labels[category] || 'Otro';
  };

  const getRelativeTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'Hoy';
    if (diffDays === 1) return 'Ayer';
    if (diffDays < 7) return `Hace ${diffDays} días`;
    if (diffDays < 30) return `Hace ${Math.floor(diffDays / 7)} semanas`;
    return date.toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' });
  };
  return (
    <ProtectedPage>
      <div className="min-h-screen bg-background">
        {/* Header */}
        <header className="border-b-2 border-border">
          <div className="max-w-6xl mx-auto px-4 py-6">
            <h1 className="text-center text-primary text-2xl">
              🌅 Recuerdos
            </h1>
            <p className="text-center text-xl mt-2 text-accent">
              Memorias Familiares
            </p>
            {user && (
              <p className="text-center text-accent text-sm mt-2">
                Bienvenido, {user.name} 👋
              </p>
            )}
          </div>
        </header>

        {/* Main Content */}
        <main className="max-w-6xl mx-auto px-4 py-8">
          {/* Add Memory Button - Only for family (not guests) */}
          {canAdd && (
            <div className="mb-8">
              <Link href="/add-memory">
                <button className="w-full bg-primary text-white text-lg font-semibold py-4 px-8 rounded-xl shadow-lg hover:bg-accent transition-all hover:scale-105 active:scale-95">
                  ➕ Agregar Recuerdo
                </button>
              </Link>
            </div>
          )}

          {/* Guest message */}
          {!canAdd && (
            <div className="mb-8 bg-secondary border-2 border-border rounded-xl p-6">
              <p className="text-text text-lg text-center">
                👀 Estás viendo como invitado. Solo puedes ver recuerdos.
              </p>
            </div>
          )}

        {/* Loading State */}
        {isLoading && (
          <div className="text-center py-16">
            <div className="text-6xl mb-4">⏳</div>
            <p className="text-xl text-accent">Cargando recuerdos...</p>
          </div>
        )}

        {/* Empty State */}
        {!isLoading && memories.length === 0 && (
          <div className="text-center py-16">
            <div className="text-8xl mb-6">📸</div>
            <h2 className="mb-4 text-text">No hay recuerdos todavía</h2>
            <p className="text-xl text-accent">
              ¡Agrega tu primer recuerdo para comenzar!
            </p>
            <p className="text-lg mt-4 opacity-75 text-text">
              Comparte fotos e historias con tu familia
            </p>
          </div>
        )}

        {/* Memory Cards Grid */}
        {!isLoading && memories.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {memories.map((memory) => (
              <Link
                key={memory.id}
                href={`/memory/${memory.id}`}
                className="block bg-white border-2 border-border rounded-xl overflow-hidden hover:border-primary hover:shadow-lg transition-all hover:scale-105"
              >
                {/* Photo (if exists) */}
                {memory.photo_url && (
                  <div className="relative w-full h-64 bg-secondary">
                    <Image
                      src={memory.photo_url}
                      alt={memory.story.substring(0, 50)}
                      fill
                      className="object-cover"
                    />
                  </div>
                )}

                {/* Content */}
                <div className="p-4">
                  {/* Category badge */}
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-2xl">{getCategoryIcon(memory.category)}</span>
                    <span className="text-sm font-semibold text-accent bg-secondary px-3 py-1 rounded-full">
                      {getCategoryLabel(memory.category)}
                    </span>
                  </div>

                  {/* Story preview */}
                  <p className="text-text text-lg mb-4 line-clamp-3">
                    {memory.story.length > 100
                      ? memory.story.substring(0, 100) + '...'
                      : memory.story}
                  </p>

                  {/* Author and date */}
                  <div className="flex items-center justify-between text-accent text-base">
                    <span className="font-semibold">👤 {memory.author_name}</span>
                    <span>📅 {getRelativeTime(memory.created_at)}</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>
    </div>
    </ProtectedPage>
  );
}
