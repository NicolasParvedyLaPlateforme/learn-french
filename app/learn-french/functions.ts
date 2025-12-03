// Normalise une chaîne (minuscule, trim) pour les comparaisons
export const normalize = (str: string) => str.trim().toLowerCase();

// Vérifie si deux mots sont des anagrammes (mêmes lettres)
export const isAnagram = (str1: string, str2: string) => {
  const s1 = normalize(str1).split('').sort().join('');
  const s2 = normalize(str2).split('').sort().join('');
  return s1 === s2;
};

// Vérifie si l'input contient le début du mot (sauf les 2 dernières lettres)
export const isCloseMatch = (input: string, target: string) => {
  if (target.length <= 2) return false;
  const root = normalize(target).slice(0, -2);
  return normalize(input).includes(root);
};

// Helper pour les couleurs de message
export const getMessageColor = (status: string) => {
  switch (status) {
    case 'success': return 'text-green-600';
    case 'equivalent': return 'text-blue-600';
    case 'close': return 'text-orange-500 animate-pulse'; // ou ta classe warning
    default: return 'text-muted-foreground';
  }
};

// NOUVELLE FONCTION : Retire les accents (ex: "père" -> "pere")
export const removeAccents = (str: string) => {
  return str.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}