"use client";

import Link from "next/link";
import Image from "next/image";
import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { supabase } from "@/lib/supabase";
import ProtectedPage from "@/components/ProtectedPage";
import { getCurrentUser } from "@/lib/auth";

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
  reaction_type: string; // 'rucho' or 'leo'
  created_at: string;
};

export default function MemoryDetail() {
  const params = useParams();
  const id = params.id as string;
  const user = getCurrentUser();

  const [memory, setMemory] = useState<Memory | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [reactions, setReactions] = useState<Reaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [newComment, setNewComment] = useState<string>("");
  const [commentAuthor, setCommentAuthor] = useState<string>(user?.name || "");
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);
  const [editingCommentId, setEditingCommentId] = useState<string | null>(null);
  const [editCommentText, setEditCommentText] = useState<string>("");
  const [reactAuthorName, setReactAuthorName] = useState<string>(user?.name || "");
  const [showReactInput, setShowReactInput] = useState(false);
  const [selectedReactionType, setSelectedReactionType] = useState<
    string | null
  >(null);

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
        .from("memories")
        .select("*")
        .eq("id", id)
        .single();

      if (error) throw error;
      setMemory(data);
    } catch (err: any) {
      console.error("Error fetching memory:", err);
      setError("No se pudo cargar el recuerdo");
    } finally {
      setIsLoading(false);
    }
  };

  const fetchComments = async () => {
    try {
      const { data, error } = await supabase
        .from("comments")
        .select("*")
        .eq("memory_id", id)
        .order("created_at", { ascending: true });

      if (error) throw error;
      setComments(data || []);
    } catch (err: any) {
      console.error("Error fetching comments:", err);
    }
  };

  const fetchReactions = async () => {
    try {
      const { data, error } = await supabase
        .from("reactions")
        .select("*")
        .eq("memory_id", id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setReactions(data || []);
    } catch (err: any) {
      console.error("Error fetching reactions:", err);
    }
  };

  const handleAddReaction = async (reactionType: string) => {
    const authorName = user?.name || reactAuthorName.trim();

    if (!authorName) {
      alert("Por favor ingresa tu nombre");
      return;
    }

    try {
      const { error } = await supabase.from("reactions").insert({
        memory_id: id,
        author_name: authorName,
        reaction_type: reactionType,
      });

      if (error) {
        // Check if already reacted with this type
        if (error.code === "23505") {
          alert("Ya has reaccionado con esta mascota 🐕");
          return;
        }
        throw error;
      }

      // Refresh reactions
      await fetchReactions();
      setShowReactInput(false);
      setSelectedReactionType(null);
    } catch (err: any) {
      console.error("Error adding reaction:", err);
      alert("Error al agregar reacción");
    }
  };

  const handleAddComment = async () => {
    if (!newComment.trim() || !commentAuthor.trim()) return;

    setIsSubmittingComment(true);

    try {
      const { error } = await supabase.from("comments").insert({
        memory_id: id,
        author_name: commentAuthor.trim(),
        comment_text: newComment.trim(),
      });

      if (error) throw error;

      // Refresh comments
      await fetchComments();
      setNewComment("");
    } catch (err: any) {
      console.error("Error adding comment:", err);
      alert("Error al agregar comentario");
    } finally {
      setIsSubmittingComment(false);
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    if (!confirm("¿Estás seguro de eliminar este comentario?")) {
      return;
    }

    try {
      const { error } = await supabase
        .from("comments")
        .delete()
        .eq("id", commentId);

      if (error) throw error;

      // Refresh comments
      await fetchComments();
    } catch (err: any) {
      console.error("Error deleting comment:", err);
      alert("Error al eliminar comentario");
    }
  };

  const handleEditComment = async (commentId: string) => {
    if (!editCommentText.trim()) {
      alert("El comentario no puede estar vacío");
      return;
    }

    try {
      const { error } = await supabase
        .from("comments")
        .update({ comment_text: editCommentText.trim() })
        .eq("id", commentId);

      if (error) throw error;

      // Refresh comments
      await fetchComments();
      setEditingCommentId(null);
      setEditCommentText("");
    } catch (err: any) {
      console.error("Error editing comment:", err);
      alert("Error al editar comentario");
    }
  };

  const getRelativeTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffMins < 1) return "Ahora";
    if (diffMins < 60)
      return `Hace ${diffMins} ${diffMins === 1 ? "minuto" : "minutos"}`;
    if (diffHours < 24)
      return `Hace ${diffHours} ${diffHours === 1 ? "hora" : "horas"}`;
    if (diffDays === 1) return "Ayer";
    if (diffDays < 7) return `Hace ${diffDays} días`;
    return date.toLocaleDateString("es-ES", { day: "numeric", month: "short" });
  };

  const getCategoryIcon = (category: string) => {
    const icons: Record<string, string> = {
      childhood: "🧒",
      family: "👨‍👩‍👧",
      pets: "🐕",
      work: "💼",
      other: "📌",
    };
    return icons[category] || "📌";
  };

  const getCategoryLabel = (category: string) => {
    const labels: Record<string, string> = {
      childhood: "Niñez",
      family: "Familia",
      pets: "Mascotas",
      work: "Trabajo",
      other: "Otro",
    };
    return labels[category] || "Otro";
  };

  const getFormattedDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("es-ES", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
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
          <Link
            href="/"
            className="text-primary hover:text-accent text-xl underline"
          >
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
          <div className="max-w-6xl mx-auto px-4 py-6">
            <Link
              href="/"
              className="text-accent hover:text-primary text-xl flex items-center gap-2"
            >
              ← Volver a Recuerdos
            </Link>
          </div>
        </header>

        {/* Main Content */}
        <main className="max-w-4xl mx-auto px-4 py-8">
          {/* Category Badge + Edit Button */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <span className="text-4xl">{getCategoryIcon(memory.category)}</span>
              <span className="text-xl font-semibold text-accent bg-secondary px-4 py-2 rounded-full">
                {getCategoryLabel(memory.category)}
              </span>
            </div>
            {/* Edit button - simple, senior friendly */}
            <Link href={`/edit-memory/${memory.id}`}>
              <button className="bg-primary text-white px-6 py-3 rounded-xl hover:bg-accent transition-all text-lg font-semibold flex items-center gap-2">
                ✏️ Editar
              </button>
            </Link>
          </div>

          {/* Main Memory Card - Photo + Story + Author unified */}
          <div className="bg-white border-2 border-border rounded-xl overflow-hidden shadow-lg mb-6">
            {/* Photo (if exists) */}
            {memory.photo_url && (
              <div className="relative w-full aspect-[4/3] border-b-2 border-border">
                <Image
                  src={memory.photo_url}
                  alt={memory.story.substring(0, 50)}
                  fill
                  className="object-contain"
                  priority
                />
              </div>
            )}

            {/* Story */}
            <div className="p-6 border-b-2 border-border">
              <p className="text-text text-xl leading-relaxed whitespace-pre-wrap">
                {memory.story}
              </p>
            </div>

            {/* Author and Date Footer */}
            <div className="bg-secondary p-6 border-b-2 border-border">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div className="flex items-center gap-3">
                  <span className="text-3xl">👤</span>
                  <div>
                    <p className="text-sm text-accent">Compartido por</p>
                    <p className="text-text text-2xl font-semibold">
                      {memory.author_name}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-3xl">📅</span>
                  <div>
                    <p className="text-sm text-accent">Fecha</p>
                    <p className="text-text text-lg">
                      {getFormattedDate(memory.created_at)}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Reactions Section - Pet Reactions (NOW INSIDE CARD!) */}
            <div className="p-6">
              <h3 className="text-text text-2xl font-semibold mb-6 flex items-center gap-2">
                <span>🐾</span>
                Reacciona con:
              </h3>

            {/* Pet Reaction Buttons - ONE CLICK! */}
              <div>
              <div className="grid grid-cols-3 gap-4 mb-4">
                {/* Rucho - Chido */}
                <button
                  onClick={() => handleAddReaction("rucho")}
                  className="flex flex-col items-center gap-3 p-6 bg-secondary border-2 border-border rounded-xl hover:border-primary hover:shadow-lg transition-all hover:scale-105"
                >
                  <Image
                    src="/CoolRucho.png"
                    alt="Chido"
                    width={80}
                    height={80}
                    className="rounded-full"
                  />
                  <span className="text-text text-lg font-semibold">
                    Chido 😎
                  </span>
                  <span className="text-accent text-sm">
                    {
                      reactions.filter((r) => r.reaction_type === "rucho")
                        .length
                    }
                  </span>
                </button>

                {/* Leo - Feliz */}
                <button
                  onClick={() => handleAddReaction("leo")}
                  className="flex flex-col items-center gap-3 p-6 bg-secondary border-2 border-border rounded-xl hover:border-primary hover:shadow-lg transition-all hover:scale-105"
                >
                  <Image
                    src="/happyLeo.png"
                    alt="Feliz"
                    width={80}
                    height={80}
                    className="rounded-full"
                  />
                  <span className="text-text text-lg font-semibold">
                    Feliz 😊
                  </span>
                  <span className="text-accent text-sm">
                    {reactions.filter((r) => r.reaction_type === "leo").length}
                  </span>
                </button>

                {/* Lombriz - El Campion */}
                <button
                  onClick={() => handleAddReaction("lombriz")}
                  className="flex flex-col items-center gap-3 p-6 bg-secondary border-2 border-border rounded-xl hover:border-primary hover:shadow-lg transition-all hover:scale-105"
                >
                  <Image
                    src="/felizLombriz.png"
                    alt="El Campion"
                    width={80}
                    height={80}
                    className="rounded-full"
                  />
                  <span className="text-text text-lg font-semibold">Feliz</span>
                  <span className="text-accent text-sm">
                    {
                      reactions.filter((r) => r.reaction_type === "lombriz")
                        .length
                    }
                  </span>
                </button>

                {/* Gato - Gato Ok */}
                <button
                  onClick={() => handleAddReaction("gato")}
                  className="flex flex-col items-center gap-3 p-6 bg-secondary border-2 border-border rounded-xl hover:border-primary hover:shadow-lg transition-all hover:scale-105"
                >
                  <Image
                    src="/gatoOk.png"
                    alt="Gato Ok"
                    width={80}
                    height={80}
                    className="rounded-full"
                  />
                  <span className="text-text text-lg font-semibold">
                    Gato Ok 👌
                  </span>
                  <span className="text-accent text-sm">
                    {reactions.filter((r) => r.reaction_type === "gato").length}
                  </span>
                </button>

                {/* Heart - Classic */}
                <button
                  onClick={() => handleAddReaction("heart")}
                  className="flex flex-col items-center gap-3 p-6 bg-secondary border-2 border-border rounded-xl hover:border-primary hover:shadow-lg transition-all hover:scale-105"
                >
                  <span className="text-7xl">❤️</span>
                  <span className="text-text text-lg font-semibold">
                    Me Gusta
                  </span>
                  <span className="text-accent text-sm">
                    {reactions.filter((r) => r.reaction_type === "heart").length}
                  </span>
                </button>
              </div>

              {/* Show total reactions count if any */}
              {reactions.filter(r => r.reaction_type).length > 0 && (
                <p className="text-accent text-lg text-center mb-4">
                  {reactions.filter(r => r.reaction_type).length} {reactions.filter(r => r.reaction_type).length === 1 ? 'persona reaccionó' : 'personas reaccionaron'} a este recuerdo
                </p>
              )}
              </div>

            {/* Who reacted - Grouped by reaction type */}
            {reactions.length > 0 && (
              <div className="space-y-4 mb-6">
                {/* Chido (Rucho) reactions */}
                {reactions.filter((r) => r.reaction_type === "rucho").length >
                  0 && (
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <Image
                        src="/CoolRucho.png"
                        alt="Chido"
                        width={30}
                        height={30}
                        className="rounded-full"
                      />
                      <span className="text-text font-semibold">Chido 😎:</span>
                    </div>
                    <div className="flex flex-wrap gap-2 ml-10">
                      {reactions
                        .filter((r) => r.reaction_type === "rucho")
                        .map((reaction) => (
                          <span
                            key={reaction.id}
                            className="bg-secondary px-3 py-1 rounded-full text-text text-sm"
                          >
                            {reaction.author_name}
                          </span>
                        ))}
                    </div>
                  </div>
                )}

                {/* Feliz (Leo) reactions */}
                {reactions.filter((r) => r.reaction_type === "leo").length >
                  0 && (
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <Image
                        src="/happyLeo.png"
                        alt="Feliz"
                        width={30}
                        height={30}
                        className="rounded-full"
                      />
                      <span className="text-text font-semibold">Feliz 😊:</span>
                    </div>
                    <div className="flex flex-wrap gap-2 ml-10">
                      {reactions
                        .filter((r) => r.reaction_type === "leo")
                        .map((reaction) => (
                          <span
                            key={reaction.id}
                            className="bg-secondary px-3 py-1 rounded-full text-text text-sm"
                          >
                            {reaction.author_name}
                          </span>
                        ))}
                    </div>
                  </div>
                )}

                {/* El Campion (Lombriz) reactions */}
                {reactions.filter((r) => r.reaction_type === "lombriz").length >
                  0 && (
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <Image
                        src="/felizLombriz.png"
                        alt="El Campion"
                        width={30}
                        height={30}
                        className="rounded-full"
                      />
                      <span className="text-text font-semibold">
                        El Campion 🏆:
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-2 ml-10">
                      {reactions
                        .filter((r) => r.reaction_type === "lombriz")
                        .map((reaction) => (
                          <span
                            key={reaction.id}
                            className="bg-secondary px-3 py-1 rounded-full text-text text-sm"
                          >
                            {reaction.author_name}
                          </span>
                        ))}
                    </div>
                  </div>
                )}

                {/* Gato Ok reactions */}
                {reactions.filter((r) => r.reaction_type === "gato").length >
                  0 && (
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <Image
                        src="/gatoOk.png"
                        alt="Gato Ok"
                        width={30}
                        height={30}
                        className="rounded-full"
                      />
                      <span className="text-text font-semibold">
                        Gato Ok 👌:
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-2 ml-10">
                      {reactions
                        .filter((r) => r.reaction_type === "gato")
                        .map((reaction) => (
                          <span
                            key={reaction.id}
                            className="bg-secondary px-3 py-1 rounded-full text-text text-sm"
                          >
                            {reaction.author_name}
                          </span>
                        ))}
                    </div>
                  </div>
                )}

                {/* Heart reactions */}
                {reactions.filter((r) => r.reaction_type === "heart").length >
                  0 && (
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-3xl">❤️</span>
                      <span className="text-text font-semibold">
                        Me Gusta:
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-2 ml-10">
                      {reactions
                        .filter((r) => r.reaction_type === "heart")
                        .map((reaction) => (
                          <span
                            key={reaction.id}
                            className="bg-secondary px-3 py-1 rounded-full text-text text-sm"
                          >
                            {reaction.author_name}
                          </span>
                        ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            </div>
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
                  <div
                    key={comment.id}
                    className="bg-secondary border border-border rounded-lg p-4"
                  >
                    {editingCommentId === comment.id ? (
                      // Edit Mode
                      <div>
                        <div className="flex items-center justify-between mb-3">
                          <p className="text-text font-semibold text-lg">
                            ✏️ Editando comentario
                          </p>
                        </div>
                        <textarea
                          value={editCommentText}
                          onChange={(e) => setEditCommentText(e.target.value)}
                          className="w-full p-3 border-2 border-border rounded-lg text-text text-lg resize-none mb-3"
                          rows={3}
                          autoFocus
                        />
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleEditComment(comment.id)}
                            className="bg-primary text-white px-4 py-2 rounded-lg font-semibold hover:bg-accent transition-all"
                          >
                            ✓ Guardar
                          </button>
                          <button
                            onClick={() => {
                              setEditingCommentId(null);
                              setEditCommentText("");
                            }}
                            className="bg-gray-300 text-gray-700 px-4 py-2 rounded-lg font-semibold hover:bg-gray-400 transition-all"
                          >
                            Cancelar
                          </button>
                        </div>
                      </div>
                    ) : (
                      // View Mode
                      <div>
                        <div className="flex items-start justify-between mb-2">
                          <p className="text-text font-semibold text-lg">
                            👤 {comment.author_name}
                          </p>
                          <div className="flex items-center gap-2">
                            <p className="text-accent text-sm">
                              {getRelativeTime(comment.created_at)}
                            </p>
                            <button
                              onClick={() => {
                                setEditingCommentId(comment.id);
                                setEditCommentText(comment.comment_text);
                              }}
                              className="bg-blue-100 text-blue-700 px-3 py-2 rounded-lg text-base font-semibold hover:bg-blue-200 transition-all flex items-center gap-1"
                              aria-label="Editar comentario"
                            >
                              ✏️ <span className="hidden sm:inline">Editar</span>
                            </button>
                            <button
                              onClick={() => handleDeleteComment(comment.id)}
                              className="bg-red-100 text-red-700 px-3 py-2 rounded-lg text-base font-semibold hover:bg-red-200 transition-all flex items-center gap-1"
                              aria-label="Eliminar comentario"
                            >
                              🗑️ <span className="hidden sm:inline">Eliminar</span>
                            </button>
                          </div>
                        </div>
                        <p className="text-text text-lg whitespace-pre-wrap">
                          {comment.comment_text}
                        </p>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>

            {/* Add Comment Form */}
            <div className="border-t-2 border-border pt-6">
              <h4 className="text-text text-xl font-semibold mb-4">
                Agregar Comentario:
              </h4>

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
                disabled={
                  isSubmittingComment ||
                  !newComment.trim() ||
                  !commentAuthor.trim()
                }
                className={`w-full py-4 px-8 rounded-xl text-xl font-semibold transition-all ${
                  isSubmittingComment ||
                  !newComment.trim() ||
                  !commentAuthor.trim()
                    ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                    : "bg-primary text-white hover:bg-accent hover:scale-105 active:scale-95"
                }`}
              >
                {isSubmittingComment ? "⏳ Enviando..." : "💬 Comentar"}
              </button>
            </div>
          </div>
        </main>
      </div>
    </ProtectedPage>
  );
}
