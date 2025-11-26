export interface PromotionalPhrase {
  id: number;
  phrase: string;
  icon: string;
  colors: string[];
}

export const promotionalPhrases = [
  { 
    id: 1, 
    phrase: "¡Descubre un mundo de sabores con nuestros planes personalizados!",
    icon: "restaurant",
    colors: ['#FF6B6B', '#FFC371']
  },
  { 
    id: 2, 
    phrase: "Comer saludable nunca fue tan fácil y delicioso.",
    icon: "heart",
    colors: ['#6B8BFF', '#A1C4FD']
  },
  { 
    id: 3, 
    phrase: "Tu camino hacia una vida más sana empieza aquí.",
    icon: "walk",
    colors: ['#82E0AA', '#AED581']
  },
  { 
    id: 4, 
    phrase: "Ahorra tiempo y dinero con nuestra lista de compras inteligente.",
    icon: "cart",
    colors: ['#F9A825', '#FDD835']
  }
];

// Función para obtener una frase promocional aleatoria
export const getRandomPromotionalPhrase = (): PromotionalPhrase => {
  const randomIndex = Math.floor(Math.random() * promotionalPhrases.length);
  return promotionalPhrases[randomIndex];
};
