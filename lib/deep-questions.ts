/**
 * Deep Connection Questions for Reconnecting with Family
 *
 * Research-based questions designed to trigger episodic memory
 * and create emotional depth after 27 years of separation
 */

export type DeepQuestion = {
  id: number;
  text: string;
  category: "childhood" | "family" | "pets" | "work" | "other";
  prompt: string; // Guiding text that appears in the story textbox
};

export const DEEP_QUESTIONS: DeepQuestion[] = [
  // ===== CHILDHOOD & ORIGINS =====
  {
    id: 1,
    text: "¿Cuál es tu primer recuerdo de tu infancia?",
    category: "childhood",
    prompt:
      "Describe ese momento: ¿Dónde estabas? ¿Qué sentiste? ¿Quiénes estaban contigo?",
  },
  {
    id: 2,
    text: "¿Cómo era la casa donde creciste?",
    category: "childhood",
    prompt:
      "Describe cada detalle: ¿Qué habitaciones tenía? ¿Qué olores recuerdas? ¿Cuál era tu lugar favorito?",
  },
  {
    id: 3,
    text: "¿Qué comida te hacía tu mamá que nunca has olvidado?",
    category: "childhood",
    prompt: "¿Cómo la preparaba? ¿En qué ocasiones? ¿Por qué te gustaba tanto?",
  },
  {
    id: 4,
    text: "¿Cuál fue tu primer trabajo y cuánto te pagaban?",
    category: "work",
    prompt: "¿Cómo conseguiste ese trabajo? ¿Qué hacías? ¿Qué aprendiste?",
  },
  {
    id: 5,
    text: "¿A qué jugabas cuando eras niño/a?",
    category: "childhood",
    prompt: "¿Con quién jugabas? ¿Dónde? ¿Cuál era tu juego favorito?",
  },
  {
    id: 6,
    text: "¿Cómo era tu escuela cuando eras niño/a?",
    category: "childhood",
    prompt:
      "Describe tu salón de clases, tus maestros, tus amigos. ¿Qué materia te gustaba más?",
  },

  // ===== FAMILY & LOVE =====
  {
    id: 7,
    text: "¿Cómo conociste a mamá/papá?",
    category: "family",
    prompt: "Cuenta toda la historia: ¿Dónde fue? ¿Qué dijiste?",
  },
  {
    id: 8,
    text: "¿Qué recuerdas del día que nací?",
    category: "family",
    prompt:
      "¿Dónde estabas? ¿Qué sentiste? ¿Qué pensaste cuando me viste por primera vez?",
  },
  {
    id: 9,
    text: "¿Qué esperabas para mí cuando era niño?",
    category: "family",
    prompt:
      "¿Qué soñabas que sería mi vida? ¿Qué te hacía feliz de verme crecer?",
  },
  {
    id: 10,
    text: "¿Cuál es tu recuerdo favorito de cuando yo era pequeño?",
    category: "family",
    prompt:
      "¿Qué hacíamos juntos? ¿Por qué ese momento quedó grabado en tu memoria?",
  },
  {
    id: 11,
    text: "¿Cómo eran tus padres (mis abuelos)?",
    category: "family",
    prompt:
      "¿Cómo era su personalidad? ¿Qué les gustaba hacer? ¿Qué recuerdos tienes con ellos?",
  },
  {
    id: 12,
    text: "¿Qué tradición familiar te gustaría que nunca se pierda?",
    category: "family",
    prompt:
      "¿Por qué es importante esa tradición? ¿De dónde viene? ¿Cómo la celebraban?",
  },

  // ===== LIFE WISDOM & DEEP REFLECTION =====
  {
    id: 13,
    text: "¿Cuál fue el momento más difícil de tu vida y cómo lo superaste?",
    category: "other",
    prompt:
      "Cuenta qué pasó, cómo te sentiste, y qué te dio fuerzas para seguir adelante.",
  },
  {
    id: 14,
    text: "Si pudieras decirle algo a tu yo de 20 años, ¿qué sería?",
    category: "other",
    prompt: "¿Qué consejo le darías? ¿Qué le dirías que no se preocupe tanto?",
  },
  {
    id: 15,
    text: "¿Qué es algo que hiciste que nadie sabe?",
    category: "other",
    prompt:
      "Puede ser algo travieso, algo valiente, o simplemente algo que guardaste para ti...",
  },
  {
    id: 16,
    text: "¿De qué momento de tu vida te sientes más orgulloso?",
    category: "other",
    prompt: "¿Qué lograste? ¿Por qué significa tanto para ti?",
  },
  {
    id: 17,
    text: "¿Qué lección de tus padres nunca olvidaste?",
    category: "family",
    prompt: "¿Qué te enseñaron? ¿Cómo cambió tu vida esa lección?",
  },
  {
    id: 18,
    text: "¿Cuál ha sido el día más feliz de tu vida?",
    category: "other",
    prompt:
      "Describe ese día: ¿Qué pasó? ¿Quién estaba contigo? ¿Por qué fue tan especial?",
  },

  // ===== WORK & PASSIONS =====
  {
    id: 19,
    text: "¿Cuál fue el trabajo que más disfrutaste en tu vida?",
    category: "work",
    prompt:
      "¿Por qué te gustaba tanto? ¿Qué aprendiste? ¿Qué historias tienes de ese tiempo?",
  },
  {
    id: 20,
    text: "¿Qué te apasionaba hacer cuando eras joven?",
    category: "other",
    prompt: "¿Era un hobby, un deporte, un arte? ¿Por qué te hacía feliz?",
  },

  // ===== SENSORY & SPECIFIC MEMORIES (These trigger the best stories) =====
  {
    id: 21,
    text: "¿Qué sonido de tu infancia nunca has olvidado?",
    category: "childhood",
    prompt: "¿Qué era ese sonido? ¿Dónde lo escuchabas? ¿Qué recuerdos trae?",
  },
  {
    id: 22,
    text: "¿Qué olor te transporta inmediatamente a tu niñez?",
    category: "childhood",
    prompt: "¿Qué es ese olor? ¿A qué momento o lugar te lleva?",
  },
  {
    id: 23,
    text: "¿Cuál era tu lugar favorito cuando eras joven?",
    category: "childhood",
    prompt: "¿Por qué ibas ahí? ¿Qué hacías? ¿Cómo te sentías en ese lugar?",
  },
  {
    id: 24,
    text: "¿Qué canción o música te recuerda a tu juventud?",
    category: "other",
    prompt: "¿Quién la cantaba? ¿Dónde la escuchabas? ¿Qué recuerdos trae?",
  },

  // ===== CONNECTION WITH IVAN (Personalized) =====
  {
    id: 25,
    text: "¿Qué quieres que sepa sobre ti que nunca te he preguntado?",
    category: "other",
    prompt:
      "Puede ser cualquier cosa: una historia, un sentimiento, un secreto, un sueño...",
  },
  {
    id: 26,
    text: "¿Qué te hubiera gustado decirme antes de que pasaran estos 27 años?",
    category: "family",
    prompt: "Sin juzgar el pasado, solo comparte lo que llevas en el corazón.",
  },
  {
    id: 27,
    text: "¿Qué esperas para nuestro futuro juntos?",
    category: "family",
    prompt:
      "¿Qué te gustaría que hagamos? ¿Qué conversaciones quieres tener? ¿Qué tiempo quieres compartir?",
  },
];

/**
 * Get questions by category
 */
export function getQuestionsByCategory(
  category: "childhood" | "family" | "pets" | "work" | "other"
): DeepQuestion[] {
  return DEEP_QUESTIONS.filter((q) => q.category === category);
}

/**
 * Get a random question (for suggesting to users)
 */
export function getRandomQuestion(): DeepQuestion {
  const randomIndex = Math.floor(Math.random() * DEEP_QUESTIONS.length);
  return DEEP_QUESTIONS[randomIndex];
}

/**
 * Get question by ID
 */
export function getQuestionById(id: number): DeepQuestion | null {
  return DEEP_QUESTIONS.find((q) => q.id === id) || null;
}
