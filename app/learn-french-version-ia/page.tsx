'use client'
import React, { useEffect, useState, useCallback } from 'react';
import { Sparkles, Brain, Keyboard } from 'lucide-react';

// --- TYPES ---
interface RandomWord {
  id: number;
  word_en: string;
  word_fr: string;
  equivalents: string[];
}

type FeedbackStatus = 'neutral' | 'close' | 'success' | 'equivalent';

// --- MOCK DATA (Remplace ton fetch pour la démo) ---
const MOCK_VOCABULARY: RandomWord[] = [
  { id: 1, word_en: "Apple", word_fr: "Pomme", equivalents: ["Une pomme"] },
  { id: 2, word_en: "House", word_fr: "Maison", equivalents: ["Une maison", "Logement"] },
  { id: 3, word_en: "Car", word_fr: "Voiture", equivalents: ["Une voiture", "Auto", "Automobile"] },
  { id: 4, word_en: "Dog", word_fr: "Chien", equivalents: ["Un chien", "Toutou"] },
  { id: 5, word_en: "Cat", word_fr: "Chat", equivalents: ["Un chat", "Minou"] },
  { id: 6, word_en: "Book", word_fr: "Livre", equivalents: ["Un livre", "Bouquin"] },
  { id: 7, word_en: "Sun", word_fr: "Soleil", equivalents: ["Le soleil"] },
  { id: 8, word_en: "Water", word_fr: "Eau", equivalents: ["De l'eau"] },
  { id: 9, word_en: "Friend", word_fr: "Ami", equivalents: ["Amie", "Copain", "Pote"] },
  { id: 10, word_en: "School", word_fr: "École", equivalents: ["Une école", "L'école"] },
];

// --- FUNCTIONS (Simule ton fichier functions.ts) ---
const normalize = (str: string) => str.trim().toLowerCase();

const isAnagram = (str1: string, str2: string) => {
  const s1 = normalize(str1).split('').sort().join('');
  const s2 = normalize(str2).split('').sort().join('');
  return s1 === s2;
};

const isCloseMatch = (input: string, target: string) => {
  if (target.length <= 2) return false;
  const root = normalize(target).slice(0, -2);
  return normalize(input).includes(root);
};

const getRandomInt = (min: number, max: number) => {
  return Math.floor(Math.random() * (max - min)) + min;
};

// --- COMPONENTS (Simule tes fichiers composants) ---

const Header = () => (
  <header className="mb-8 text-center animate-in fade-in slide-in-from-top-4 duration-700">
    <div className="flex items-center justify-center gap-2 mb-2">
      <Brain className="w-8 h-8 text-primary" />
    </div>
    <h1 className="text-4xl font-bold tracking-tight text-slate-900">
      <span className="text-blue-600">Learn</span> French
    </h1>
    <p className="text-slate-500 text-sm mt-2 font-medium">Leçon 1 : Vocabulaire de base</p>
  </header>
);

const PromptTranslate = ({ word_en }: { word_en: string }) => (
  <div className="w-full text-center mb-10">
    <span className="text-xs font-bold tracking-widest text-slate-400 uppercase mb-3 flex items-center justify-center gap-2">
      <Keyboard size={14} />
      Traduisez en français
    </span>
    <div key={word_en} className="text-5xl font-extrabold text-slate-800 drop-shadow-sm animate-in zoom-in duration-300">
      {word_en}
    </div>
  </div>
);

// --- MAIN COMPONENT ---

export default function TypeAndFind() {
  const [input, setInput] = useState("");
  const [vocabulary, setVocabulary] = useState<RandomWord[]>([]);
  const [currentWord, setCurrentWord] = useState<RandomWord | null>(null);
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState<FeedbackStatus>('neutral');
  const [isLoading, setIsLoading] = useState(true);

  // LOGIQUE 
  const pickNewWord = useCallback((list: RandomWord[], current?: RandomWord | null) => {
    if (list.length === 0) return;
    
    const candidates = current 
      ? list.filter((w) => w.word_en !== current.word_en) 
      : list;

    const nextWord = candidates[getRandomInt(0, candidates.length)];
    setCurrentWord(nextWord);
    setInput("");
    setMessage("");
    setStatus('neutral');
  }, []);

  // Chargement initial (Simulé ici)
  useEffect(() => {
    // Simulation d'un fetch avec un petit délai pour l'UX
    const fakeLoad = async () => {
      setTimeout(() => {
        setVocabulary(MOCK_VOCABULARY);
        pickNewWord(MOCK_VOCABULARY, null);
        setIsLoading(false);
      }, 800);
    };
    fakeLoad();
  }, [pickNewWord]);

  const validateInput = (value: string, target: RandomWord) => {
    let val = normalize(value);
    let word_fr = normalize(target.word_fr);

    // 1. Victoire exacte
    if (val === word_fr) {
      handleSuccess("Excellent !");
      return;
    }

    // 2. Synonyme / Équivalent
    if (target.equivalents.some(eq => normalize(eq) === val)) {
      handleSuccess(`Correct ! La réponse principale était : ${target.word_fr}`, 'equivalent');
      return;
    }

    // 3. Cas "Proche"
    let feedback = "";
    let isClose = false;

    if (isCloseMatch(value, target.word_fr)) {
      feedback = "Tu chauffes !";
      isClose = true;
      
      if (isAnagram(value, target.word_fr)) {
         feedback += " (Mais attention à l'ordre des lettres)";
      }
    } else if (isAnagram(value, target.word_fr)) {
      feedback = "Presque ! C'est le bon mot mais mélangé.";
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

  const handleSuccess = (msg: string, type: FeedbackStatus = 'success') => {
    setMessage(msg);
    setStatus(type);
    
    setTimeout(() => {
      // On vérifie que vocabulary n'est pas vide pour TypeScript, même si c'est garanti ici
      if (vocabulary.length > 0) {
        pickNewWord(vocabulary, currentWord);
      }
    }, 1200); 
  };

  const handleChangeInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setInput(val);
    if (currentWord) {
      validateInput(val, currentWord);
    }
  }
  
  // --- RENDU ---
  
  if (isLoading || !currentWord) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 text-slate-600 gap-4">
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
        <p className="animate-pulse font-medium">Chargement du vocabulaire...</p>
      </div>
    );
  }

  const getMessageColor = () => {
    switch (status) {
      case 'success': return 'text-green-600 scale-110';
      case 'equivalent': return 'text-blue-600';
      case 'close': return 'text-orange-500 animate-pulse';
      default: return 'text-slate-400';
    }
  };

  const getBorderColor = () => {
    switch (status) {
        case 'success': return 'border-green-500 ring-4 ring-green-100';
        case 'equivalent': return 'border-blue-500 ring-4 ring-blue-100';
        case 'close': return 'border-orange-300';
        default: return 'border-slate-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-50';
    }
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-slate-50 font-sans transition-colors duration-300">

      <Header />

      <main className="w-full max-w-lg bg-white border border-slate-200 rounded-2xl shadow-xl shadow-slate-200/50 p-8 flex flex-col items-center relative overflow-hidden">
        
        {/* Décoration d'arrière plan */}
        <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 opacity-80"></div>

        <PromptTranslate word_en={currentWord.word_en} />

        <div className="w-full group relative">
          <input
            type="text"
            value={input}
            onChange={handleChangeInput}
            placeholder="Tapez votre réponse..."
            autoFocus
            spellCheck="false"
            className={`
              w-full 
              bg-slate-50 hover:bg-white
              text-slate-800 placeholder:text-slate-300
              border-2 rounded-xl py-5 px-6 
              text-center text-3xl font-bold outline-none 
              transition-all duration-200 
              shadow-inner
              ${getBorderColor()}
            `}
          />
          {status === 'success' && (
            <div className="absolute right-4 top-1/2 -translate-y-1/2 text-green-500 animate-in zoom-in">
              <Sparkles size={24} />
            </div>
          )}
        </div>

        <div className="h-12 mt-6 flex items-center justify-center w-full">
          <p className={`text-lg font-bold transition-all duration-300 flex items-center gap-2 ${getMessageColor()}`}>
            {message}
          </p>
        </div>

      </main>

      <div className="mt-8 text-sm text-slate-400 text-center max-w-xs leading-relaxed">
        Tapez simplement le mot. <br/>Pas besoin d'appuyer sur Entrée.
      </div>

    </div>
  )
}