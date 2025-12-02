'use client'
import { useEffect, useState } from 'react';
import { getRandomInt } from '@/tools/math';

interface RandomWord {
  id: number,
  word_en: string,
  word_fr: string,
  equivalents: string[],
  score_perfect: number,
  score_equivalent: number,
  score_close: number
}

export default function TypeAndFind() {
  const [inputToFind, setInputToFind] = useState("");
  const [tableaudemotA1, setTableaudemotA1] = useState<RandomWord[]>([]);
  const [randomWord, setRandomWord] = useState<RandomWord>();
  const [result, setResult] = useState(true);
  const [messageRes, setMessageRes] = useState("");

  useEffect(() => {
    fetch('/tableaudemotA1.json')
      .then((res) => res.json())
      .then(res => setTableaudemotA1(res));
  }, [])
  
  useEffect(() => {
    // On ne fait rien si le tableau est vide
    if (tableaudemotA1.length === 0 || !result) return;
    
    setRandomWord(tableaudemotA1[getRandomInt(0, tableaudemotA1.length)])
    setResult(false);
  }, [result, tableaudemotA1])

  useEffect(() => {
    if (inputToFind == "" || randomWord == undefined) return;

    //On vérifie si le mot correspond au mot à trouver 
    if (inputToFind.toLocaleLowerCase() == randomWord.word_fr.toLocaleLowerCase()){
      
      //Si c'est le cas alors on valide le result et on passe à true, on vide le champ et on met un message de félicitation
      setResult(true);
      setInputToFind("");
      setMessageRes("Bravo !")
    }else if (inputToFind.toLocaleLowerCase().includes(randomWord.word_fr.toLocaleLowerCase().slice(0, randomWord.word_fr.length - 2))){
      //Si il ne reste plus que deux lettres à deviner alors on affiche un message "on est proche"
      setMessageRes("On est proche !");
    }else if (randomWord.equivalents.includes(inputToFind.toLocaleLowerCase())){
      setMessageRes("On a trouvé un mot équivalent, le bon mot était : " + randomWord.word_fr)
      setResult(true);
      setInputToFind("");
    }else {
      setMessageRes("");
    }
  }, [inputToFind])

  // GESTION DU LOADING
  // Si le tableau est null OU que le mot n'est pas encore choisi
  if (!tableaudemotA1 || !randomWord) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="animate-pulse">Chargement du vocabulaire...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-background transition-colors duration-300">

      {/* En-tête de la page */}
      <header className="mb-8 text-center">
        <h1 className="text-3xl font-bold tracking-tight text-foreground">
          <span className="text-primary">Learn</span> French
        </h1>
        <p className="text-muted-fg text-sm mt-2">Leçon 1 : Vocabulaire de base</p>
      </header>

      {/* Carte principale de l'exercice */}
      <main className="w-full max-w-md bg-card border border-border rounded-card shadow-sm p-8 flex flex-col items-center">

        {/* Zone du mot à traduire (Prompt) */}
        <div className="w-full text-center mb-10">
          <span className="text-xs font-bold tracking-widest text-muted-fg uppercase mb-3 block">
            Traduisez en français
          </span>
          {/* J'ai mis "Apple" en dur pour l'exemple visuel */}
          <div className="text-5xl font-extrabold text-foreground drop-shadow-sm">
            {randomWord.word_en}
          </div>
        </div>

        {/* Zone de saisie (Input) */}
        <div className="w-full group">
          <input
            type="text"
            value={inputToFind}
            onChange={(e) => setInputToFind(e.target.value)}
            placeholder="Tapez ici..."
            autoFocus
            spellCheck="false"
            className="
          w-full 
          bg-muted/50 hover:bg-muted/80 focus:bg-background
          text-foreground placeholder:text-muted-fg/50
          border-2 border-transparent focus:border-primary
          rounded-xl 
          py-4 px-6 
          text-center text-2xl font-medium 
          outline-none 
          transition-all duration-200 
          shadow-sm focus:shadow-[0_4px_20px_-2px_rgba(0,0,0,0.1)]
        "
          />
        </div>

        {/* Zone de Feedback (Feedback Slot) */}
        {/* h-8 permet de réserver la place pour éviter que le layout ne saute quand le message apparaît */}
        <div className="h-8 mt-4 flex items-center justify-center w-full">
          {/* Exemple de structure pour le message (vide par défaut) */}
          {/* Tu pourras conditionner la classe (text-warning, text-error) selon la proximité */}
          <p className="text-sm font-semibold text-warning animate-shake">
            {/* Insère ton message de proximité ici, ex: "Tu chauffes..." */}
            {messageRes}
          </p>
        </div>

      </main>

      {/* Petit indice visuel pour l'UX (optionnel) */}
      <div className="mt-8 text-sm text-muted-fg opacity-60">
        Pas besoin de valider, la vérification est automatique.
      </div>

    </div>
  )
}
