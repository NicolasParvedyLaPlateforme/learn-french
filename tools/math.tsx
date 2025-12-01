export function getRandomInt(min: number, max: number) {
    // On s'assure que min et max sont bien des entiers
    min = Math.ceil(min);
    max = Math.floor(max);
    
    // La formule magique :
    // (max - min + 1) définit l'écart possible
    // + min permet de décaler le résultat pour commencer au minimum demandé
    return Math.floor(Math.random() * (max - min)) + min;
  };
