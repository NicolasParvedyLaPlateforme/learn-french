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
