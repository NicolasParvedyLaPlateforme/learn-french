import React from 'react'

// On définit ce que le composant attend comme données
interface WordInputProps {
  value: string;
  // C'est ici que la magie opère : on dit qu'on attend une fonction
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  status: 'neutral' | 'close' | 'success' | 'equivalent';
}

export default function WordInput({value, onChange, status}: WordInputProps) {
  return (
    <div className="w-full group">
        <input
        type="text"
        value={value}
        onChange={onChange}
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
  )
}
