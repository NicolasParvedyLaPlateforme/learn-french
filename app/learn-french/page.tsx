'use client'
import { useEffect, useState } from 'react';
import { getRandomInt } from '@/tools/math';
import { isAnagram, isCloseMatch, normalize } from './functions';
import Header from './components/Header';
import PromptTranslate from './components/PromptTranslate';
import { useCallback } from 'react';

interface RandomWord {
  id: number,
  word_en: string,
  word_fr: string,
  equivalents: string[],
  score_perfect: number,
  score_equivalent: number,
  score_close: number
}

// État du feedback pour gérer la couleur du texte ou les animations
type FeedbackStatus = 'neutral' | 'close' | 'success' | 'equivalent';

export default function TypeAndFind() {
  const [input, setInput] = useState("");
  const [vocabulary, setVocabulary] = useState<RandomWord[]>([]);
  const [currentWord, setCurrentWord] = useState<RandomWord | null>(null);
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState<FeedbackStatus>('neutral');
  const [isLoading, setIsLoading] = useState(true);

  //LOGIQUE 

  // Choisir un nouveau mot (exclut le mot actuel pour éviter la répétition immédiate)
  const pickNewWord = useCallback((list: RandomWord[], current?: RandomWord | null) => {
    if (list.length === 0) return;
    
    //Si current vaut null alors candidates vaut list sinon elle filtre en soustrant le mot actuel
    const candidates = current 
      ? list.filter((w) => w.word_en !== current.word_en) 
      : list;

    const nextWord = candidates[getRandomInt(0, candidates.length)];
    setCurrentWord(nextWord);
    setInput("");
    setMessage("");
    setStatus('neutral');
  }, []);

  //Chargement initial
  useEffect(() => {
    fetch('/tableaudemotA1.json')
      .then((res) => res.json())
      .then(res => {
          setVocabulary(res)
          pickNewWord(res, null);
          setIsLoading(false);
        }
      );
  }, [pickNewWord])

  const validateInput = (value: string, target: RandomWord) => {

    let val = value.toLocaleLowerCase();
    let word_fr = target.word_fr.toLowerCase();

    // 1. Victoire exacte
    if (val === word_fr) {
      handleSuccess("Good !");
      return;
    }

    // 2. Synonyme / Équivalent
    if (target.equivalents.some(eq => normalize(eq) === val)) {
      handleSuccess(`It is another word, the good answer was: ${target.word_fr}`, 'equivalent');
      return;
    }

    // 3. Cas "Proche" (Anagramme ou début similaire)
    let feedback = "";
    let isClose = false;

    if (isCloseMatch(value, target.word_fr)) {
      feedback = "You are close!";
      isClose = true;
      
      // Sous-cas : Anagramme partiel dans le "close"
      if (isAnagram(value, target.word_fr)) {
         feedback += " But there is a little mistake!";
      }
    } else if (isAnagram(value, target.word_fr)) {
      feedback = "Ah! You are near, you can do it!";
      isClose = true;
    }

    // Mise à jour du feedback UI
    if (isClose) {
      setMessage(feedback);
      setStatus('close');
    } else {
      setMessage("");
      setStatus('neutral');
    }
  }

  // Gestion de la victoire
  const handleSuccess = (msg: string, type: FeedbackStatus = 'success') => {
    setMessage(msg);
    setStatus(type);
    
    // Petit délai pour laisser l'utilisateur lire "Bravo" avant de changer
    setTimeout(() => {
      pickNewWord(vocabulary, currentWord);
    }, 800); 
  };

  const handleChangeInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;

    setInput(val);

    if (currentWord){
      validateInput(val, currentWord);
    }
  }
  
  // --- RENDU ---
  // GESTION DU LOADING
  if (isLoading || !currentWord) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="animate-pulse">Chargement du vocabulaire...</p>
      </div>
    );
  }

  // Helper pour les couleurs de message
  const getMessageColor = () => {
    switch (status) {
      case 'success': return 'text-green-600';
      case 'equivalent': return 'text-blue-600';
      case 'close': return 'text-orange-500 animate-pulse'; // ou ta classe warning
      default: return 'text-muted-foreground';
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-background transition-colors duration-300">

      {/* En-tête de la page */}
      <Header />

      {/* Carte principale de l'exercice */}
      <main className="w-full max-w-md bg-card border border-border rounded-card shadow-sm p-8 flex flex-col items-center">

        {/* Zone du mot à traduire (Prompt) */}
        <PromptTranslate word_en={currentWord.word_en} />

        {/* Zone de saisie (Input) */}
        <div className="w-full group">
          <input
            type="text"
            value={input}
            onChange={handleChangeInput}
            placeholder="Tapez ici..."
            autoFocus
            spellCheck="false"
            className={`
              w-full 
              bg-muted/50 hover:bg-muted/80 focus:bg-background
              text-foreground placeholder:text-muted-foreground/50
              border-2 rounded-xl py-4 px-6 
              text-center text-2xl font-medium outline-none 
              transition-all duration-200 
              shadow-sm focus:shadow-lg
              ${status === 'success' ? 'border-green-500' : 'border-transparent focus:border-primary'}
            `}
          />
        </div>

        {/* Zone de Feedback (Feedback Slot) */}
        {/* h-8 permet de réserver la place pour éviter que le layout ne saute quand le message apparaît */}
        <div className="h-8 mt-4 flex items-center justify-center w-full">
          {/* Exemple de structure pour le message (vide par défaut) */}
          {/* Tu pourras conditionner la classe (text-warning, text-error) selon la proximité */}
          <p className={`text-sm font-semibold transition-all duration-300 ${getMessageColor()}`}>
            {/* Insère ton message de proximité ici, ex: "Tu chauffes..." */}
            {message}
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
