import React from 'react'

export default function PromptTranslate({word_en}: {word_en: string}) {
  return (
    <div className="w-full text-center mb-10">
        <span className="text-xs font-bold tracking-widest text-muted-fg uppercase mb-3 block">
        Traduisez en français
        </span>
        {/* J'ai mis "Apple" en dur pour l'exemple visuel */}
        <div className="text-5xl font-extrabold text-foreground drop-shadow-sm">
        {word_en}
        </div>
    </div>
  )
}
