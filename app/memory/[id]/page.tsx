'use client';

import Link from "next/link";
import Image from "next/image";
import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { supabase } from "@/lib/supabase";

type Memory = {
  id: string;
  category: string;
  photo_url: string;
  story: string;
  author_name: string;
  created_at: string;
};

type Comment = {
  id: string;
  memory_id: string;
  author_name: string;
  comment_text: string;
  created_at: string;
};

type Reaction = {
  id: string;
  memory_id: string;
  author_name: string;
  created_at: string;
};

export default function MemoryDetail() {
  const params = useParams();
  const id = params.id as string;

  const [memory, setMemory] = useState<Memory | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [reactions, setReactions] = useState<Reaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [newComment, setNewComment] = useState<string>('');
  const [commentAuthor, setCommentAuthor] = useState<string>('');
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);
  const [reactAuthorName, setReactAuthorName] = useState<string>('');
  const [showReactInput, setShowReactInput] = useState(false);

  useEffect(() => {
    if (id) {
      fetchMemory();
      fetchComments();
      fetchReactions();
    }
  }, [id]);

  const fetchMemory = async () => {
    try {
      const { data, error } = await supabase
        .from('memories')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      setMemory(data);
    } catch (err: any) {
      console.error('Error fetching memory:', err);
      setError('No se pudo cargar el recuerdo');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchComments = async () => {
    try {
      const { data, error } = await supabase
        .from('comments')
        .select('*')
        .eq('memory_id', id)
        .order('created_at', { ascending: true });

      if (error) throw error;
      setComments(data || []);
    } catch (err: any) {
      console.error('Error fetching comments:', err);
    }
  };

  const fetchReactions = async () => {
    try {
      const { data, error } = await supabase
        .from('reactions')
        .select('*')
        .eq('memory_id', id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setReactions(data || []);
    } catch (err: any) {
      console.error('Error fetching reactions:', err);
    }
  };

  const handleAddReaction = async () => {
    if (!reactAuthorName.trim()) {
      alert('Por favor ingresa tu nombre');
      return;
    }

    try {
      const { error } = await supabase
        .from('reactions')
        .insert({
          memory_id: id,
          author_name: reactAuthorName.trim(),
        });

      if (error) {
        // Check if already reacted
        if (error.code === '23505') {
          alert('Ya has reaccionado a este recuerdo ❤️');
          return;
        }
        throw error;
      }

      // Refresh reactions
      await fetchReactions();
      setShowReactInput(false);
    } catch (err: any) {
      console.error('Error adding reaction:', err);
      alert('Error al agregar reacción');
    }
  };

  const handleAddComment = async () => {
    if (!newComment.trim() || !commentAuthor.trim()) return;

    setIsSubmittingComment(true);

    try {
      const { error } = await supabase
        .from('comments')
        .insert({
          memory_id: id,
          author_name: commentAuthor.trim(),
          comment_text: newComment.trim(),
        });

      if (error) throw error;

      // Refresh comments
      await fetchComments();
      setNewComment('');
    } catch (err: any) {
      console.error('Error adding comment:', err);
      alert('Error al agregar comentario');
    } finally {
      setIsSubmittingComment(false);
    }
  };

  const getRelativeTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffMins < 1) return 'Ahora';
    if (diffMins < 60) return `Hace ${diffMins} ${diffMins === 1 ? 'minuto' : 'minutos'}`;
    if (diffHours < 24) return `Hace ${diffHours} ${diffHours === 1 ? 'hora' : 'horas'}`;
    if (diffDays === 1) return 'Ayer';
    if (diffDays < 7) return `Hace ${diffDays} días`;
    return date.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' });
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

  const getFormattedDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">⏳</div>
          <p className="text-xl text-accent">Cargando recuerdo...</p>
        </div>
      </div>
    );
  }

  if (error || !memory) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">😕</div>
          <h2 className="text-text mb-4">Recuerdo no encontrado</h2>
          <Link href="/" className="text-primary hover:text-accent text-xl underline">
            ← Volver al inicio
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b-2 border-border">
        <div className="max-w-6xl mx-auto px-4 py-6">
          <Link href="/" className="text-accent hover:text-primary text-xl flex items-center gap-2">
            ← Volver a Recuerdos
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 py-8">
        {/* Category Badge */}
        <div className="flex items-center gap-3 mb-6">
          <span className="text-4xl">{getCategoryIcon(memory.category)}</span>
          <span className="text-xl font-semibold text-accent bg-secondary px-4 py-2 rounded-full">
            {getCategoryLabel(memory.category)}
          </span>
        </div>

        {/* Photo (if exists) */}
        {memory.photo_url && (
          <div className="relative w-full aspect-[4/3] rounded-xl overflow-hidden shadow-lg border-2 border-border mb-6">
            <Image
              src={memory.photo_url}
              alt={memory.story.substring(0, 50)}
              fill
              className="object-cover"
              priority
            />
          </div>
        )}

        {/* Story */}
        <div className="bg-white border-2 border-border rounded-xl p-6 mb-6">
          <p className="text-text text-xl leading-relaxed whitespace-pre-wrap">
            {memory.story}
          </p>
        </div>

        {/* Author and Date */}
        <div className="bg-secondary border-2 border-border rounded-xl p-6 mb-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex items-center gap-3">
              <span className="text-3xl">👤</span>
              <div>
                <p className="text-sm text-accent">Compartido por</p>
                <p className="text-text text-2xl font-semibold">{memory.author_name}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-3xl">📅</span>
              <div>
                <p className="text-sm text-accent">Fecha</p>
                <p className="text-text text-lg">{getFormattedDate(memory.created_at)}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Reactions Section */}
        <div className="bg-white border-2 border-border rounded-xl p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-text text-2xl font-semibold flex items-center gap-2">
              <span>❤️</span>
              {reactions.length} {reactions.length === 1 ? 'Persona' : 'Personas'}
            </h3>
            <button
              onClick={() => setShowReactInput(!showReactInput)}
              className="bg-primary text-white px-6 py-3 rounded-xl hover:bg-accent transition-all text-lg font-semibold"
            >
              ❤️ Me Gusta
            </button>
          </div>

          {/* Who reacted */}
          {reactions.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-4">
              {reactions.map((reaction) => (
                <span
                  key={reaction.id}
                  className="bg-secondary px-4 py-2 rounded-full text-text font-semibold"
                >
                  👤 {reaction.author_name}
                </span>
              ))}
            </div>
          )}

          {/* React input */}
          {showReactInput && (
            <div className="border-t-2 border-border pt-4">
              <input
                type="text"
                value={reactAuthorName}
                onChange={(e) => setReactAuthorName(e.target.value)}
                placeholder="Tu nombre"
                className="w-full p-4 border-2 border-border rounded-xl focus:border-primary focus:outline-none text-text text-lg mb-4"
                onKeyPress={(e) => {
                  if (e.key === 'Enter') handleAddReaction();
                }}
              />
              <button
                onClick={handleAddReaction}
                disabled={!reactAuthorName.trim()}
                className={`w-full py-3 px-6 rounded-xl text-lg font-semibold transition-all ${
                  !reactAuthorName.trim()
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : 'bg-primary text-white hover:bg-accent'
                }`}
              >
                ❤️ Enviar
              </button>
            </div>
          )}
        </div>

        {/* Comments Section */}
        <div className="bg-white border-2 border-border rounded-xl p-6">
          <h3 className="text-text text-2xl font-semibold mb-6 flex items-center gap-2">
            <span>💬</span>
            Comentarios ({comments.length})
          </h3>

          {/* Comments List */}
          <div className="space-y-4 mb-6">
            {comments.length === 0 ? (
              <p className="text-accent text-center py-8">
                No hay comentarios todavía. ¡Sé el primero en comentar!
              </p>
            ) : (
              comments.map((comment) => (
                <div key={comment.id} className="bg-secondary border border-border rounded-lg p-4">
                  <div className="flex items-start justify-between mb-2">
                    <p className="text-text font-semibold text-lg">
                      👤 {comment.author_name}
                    </p>
                    <p className="text-accent text-sm">
                      {getRelativeTime(comment.created_at)}
                    </p>
                  </div>
                  <p className="text-text text-lg whitespace-pre-wrap">
                    {comment.comment_text}
                  </p>
                </div>
              ))
            )}
          </div>

          {/* Add Comment Form */}
          <div className="border-t-2 border-border pt-6">
            <h4 className="text-text text-xl font-semibold mb-4">Agregar Comentario:</h4>

            <input
              type="text"
              value={commentAuthor}
              onChange={(e) => setCommentAuthor(e.target.value)}
              placeholder="Tu nombre"
              className="w-full p-4 border-2 border-border rounded-xl focus:border-primary focus:outline-none text-text text-lg mb-4"
            />

            <textarea
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Escribe tu comentario..."
              rows={4}
              className="w-full p-4 border-2 border-border rounded-xl focus:border-primary focus:outline-none text-text text-lg resize-none mb-4"
            />

            <button
              onClick={handleAddComment}
              disabled={isSubmittingComment || !newComment.trim() || !commentAuthor.trim()}
              className={`w-full py-4 px-8 rounded-xl text-xl font-semibold transition-all ${
                isSubmittingComment || !newComment.trim() || !commentAuthor.trim()
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-primary text-white hover:bg-accent hover:scale-105 active:scale-95'
              }`}
            >
              {isSubmittingComment ? '⏳ Enviando...' : '💬 Comentar'}
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
