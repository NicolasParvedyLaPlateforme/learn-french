"use client";

import React, { useState, useRef } from 'react';
import { toJpeg } from 'html-to-image';
import { useCallback } from 'react';

// --- TYPES & INTERFACES ---

type Cardinality = '0,1' | '1,1' | '0,n' | '1,n';

interface Entity {
  id: string;
  name: string;
  x: number; // Position X sur le canvas
  y: number; // Position Y sur le canvas
}

interface Relation {
  id: string;
  entity1Id: string;
  verb: string;
  entity2Id: string;
  card1: Cardinality;
  card2: Cardinality;
}

// État temporaire du formulaire (Wizard)
interface DraftData {
  entity1Id: string | 'NEW';
  entity1Name: string;
  verb: string;
  entity2Id: string | 'NEW';
  entity2Name: string;
  card1: Cardinality;
  card2: Cardinality;
}

const INITIAL_DRAFT: DraftData = {
  entity1Id: 'NEW',
  entity1Name: '',
  verb: '',
  entity2Id: 'NEW',
  entity2Name: '',
  card1: '1,1',
  card2: '0,n'
};

// Dimensions des boîtes pour les calculs de lignes
const ENTITY_WIDTH = 128; // w-32 (Tailwind) = 128px
const ENTITY_HEIGHT = 64; // h-16 (Tailwind) = 64px

export default function MeuriseBuilder() {
  // --- STATE ---
  const [entities, setEntities] = useState<Entity[]>([]);
  const [relations, setRelations] = useState<Relation[]>([]);
  
  // Wizard State
  const [step, setStep] = useState<number>(0);
  const [draft, setDraft] = useState<DraftData>(INITIAL_DRAFT);

  // Drag & Drop State
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const canvasRef = useRef<HTMLDivElement>(null);

  // --- ACTIONS ---

  // Gestion des inputs du formulaire
  const handleDraftChange = (field: keyof DraftData, value: string) => {
    setDraft(prev => ({ ...prev, [field]: value }));
  };

  // Sélectionner une entité existante ou une nouvelle
  const handleEntitySelection = (side: 'entity1' | 'entity2', value: string) => {
    setDraft(prev => ({
      ...prev,
      [`${side}Id`]: value,
      // Si on repasse à NEW, on vide le nom, sinon on garde l'ancien nom saisi
      [`${side}Name`]: value === 'NEW' ? '' : prev[`${side}Name`]
    }));
  };

  // Navigation Wizard
  const prevStep = () => {
    if (step > 0) setStep(step - 1);
  };

  const nextStep = () => {
    // Validations
    if (step === 0) {
      if (draft.entity1Id === 'NEW' && !draft.entity1Name.trim()) return alert("Le nom de l'entité est requis");
      if (draft.entity1Id !== 'NEW' && !draft.entity1Id) return alert("Veuillez sélectionner une entité");
    }
    if (step === 1 && !draft.verb.trim()) return alert("Le verbe d'action est requis");
    if (step === 2) {
      if (draft.entity2Id === 'NEW' && !draft.entity2Name.trim()) return alert("Le nom de l'entité est requis");
      if (draft.entity2Id !== 'NEW' && !draft.entity2Id) return alert("Veuillez sélectionner une entité");
    }
    setStep(prev => prev + 1);
  };

  // --- LOGIQUE DE SUPPRESSION ---

  const deleteRelation = (id: string) => {
    if (window.confirm("Supprimer cette relation ?")) {
      setRelations(prev => prev.filter(r => r.id !== id));
    }
  };

  const deleteEntity = (id: string) => {
    const connectedRelations = relations.filter(r => r.entity1Id === id || r.entity2Id === id);
    const warningMsg = connectedRelations.length > 0 
      ? `Cette entité est utilisée dans ${connectedRelations.length} relation(s). Tout sera supprimé. Continuer ?`
      : "Supprimer cette entité ?";

    if (window.confirm(warningMsg)) {
      // 1. Supprimer les relations connectées (Cascade delete)
      setRelations(prev => prev.filter(r => r.entity1Id !== id && r.entity2Id !== id));
      // 2. Supprimer l'entité
      setEntities(prev => prev.filter(e => e.id !== id));
      
      // Reset si le wizard était en cours sur cette entité
      if (draft.entity1Id === id || draft.entity2Id === id) {
        setStep(0);
        setDraft(INITIAL_DRAFT);
      }
    }
  };

  // --- GÉNÉRATION DU MODÈLE ---

  const generateModel = () => {
    let e1Id = draft.entity1Id;
    let e2Id = draft.entity2Id;
    
    // Helper pour position aléatoire propre
    const getRandomPos = () => ({
       x: Math.random() * 300 + 50,
       y: Math.random() * 200 + 50
    });

    const newEntities = [...entities];

    // Création Entité 1 si nouvelle
    if (draft.entity1Id === 'NEW') {
      const pos = getRandomPos();
      const newEnt = { id: crypto.randomUUID(), name: draft.entity1Name, x: pos.x, y: pos.y };
      newEntities.push(newEnt);
      e1Id = newEnt.id;
    }

    // Création Entité 2 si nouvelle
    if (draft.entity2Id === 'NEW') {
      const pos = getRandomPos();
      // On décale un peu la seconde pour pas qu'elle soit sur la première
      const newEnt = { id: crypto.randomUUID(), name: draft.entity2Name, x: pos.x + 200, y: pos.y };
      newEntities.push(newEnt);
      e2Id = newEnt.id;
    }

    setEntities(newEntities);

    // Création de la Relation
    const newRelation: Relation = {
      id: crypto.randomUUID(),
      entity1Id: e1Id,
      entity2Id: e2Id,
      verb: draft.verb,
      card1: draft.card1,
      card2: draft.card2
    };

    setRelations(prev => [...prev, newRelation]);
    
    // Reset du formulaire
    setStep(0);
    setDraft(INITIAL_DRAFT);
  };

  // --- DRAG & DROP HANDLERS ---
  const handleMouseDown = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    setDraggingId(id);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!draggingId || !canvasRef.current) return;
    const rect = canvasRef.current.getBoundingClientRect();
    
    // Calcul de la nouvelle position (centrée sous la souris)
    const x = e.clientX - rect.left - (ENTITY_WIDTH / 2);
    const y = e.clientY - rect.top - (ENTITY_HEIGHT / 2);

    setEntities(prev => prev.map(ent => ent.id === draggingId ? { ...ent, x, y } : ent));
  };

  const handleMouseUp = () => setDraggingId(null);

  // Helper affichage nom
  const getEntityName = (id: string) => entities.find(e => e.id === id)?.name || "Inconnu";

  // --- NOUVELLE FONCTION DE TÉLÉCHARGEMENT ---
  const downloadJpg = useCallback(async () => {
    if (!canvasRef.current) return;

    try {
      // toJpeg gère nativement les couleurs modernes (lab, oklch)
      const dataUrl = await toJpeg(canvasRef.current, { 
        quality: 0.95, 
        backgroundColor: '#f8fafc' // Slate-50 pour correspondre à votre fond
      });
      
      const link = document.createElement('a');
      link.download = `MCD-Meurise-${Date.now()}.jpg`;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error("Erreur génération image:", err);
      alert("Erreur lors de la création de l'image.");
    }
  }, [canvasRef]);


  // --- COMPOSANTS UI INTERNES ---

  const WizardHeader = () => (
    <div className="flex gap-1 h-1 mb-6">
      {[0, 1, 2, 3].map(i => (
        <div key={i} className={`flex-1 rounded-full transition-colors duration-300 ${i <= step ? 'bg-blue-600' : 'bg-slate-200'}`} />
      ))}
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50 p-4 font-sans text-slate-900" onMouseMove={handleMouseMove} onMouseUp={handleMouseUp}>
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* --- COLONNE GAUCHE : WIZARD & LISTES --- */}
        <div className="lg:col-span-4 space-y-6">
          
          {/* Bloc Formulaire */}
          <div className="bg-white p-6 rounded-xl shadow-lg border border-slate-100">
            <h2 className="text-xl font-bold mb-4">Créateur de Relations</h2>
            <WizardHeader />

            {/* ÉTAPE 0 & 2 : SÉLECTION ENTITÉ */}
            {(step === 0 || step === 2) && (
              <div className="animate-in fade-in slide-in-from-left-4 duration-300">
                <h3 className="text-lg font-semibold text-slate-800 mb-4">
                  {step === 0 ? "1. Entité de départ" : "3. Entité d'arrivée"}
                </h3>

                {/* Choix Mode */}
                <div className="flex gap-2 mb-4">
                  {entities.length > 0 && (
                    <button
                      onClick={() => handleEntitySelection(step === 0 ? 'entity1' : 'entity2', entities[0].id)}
                      className={`flex-1 py-2 text-sm font-medium rounded-lg border ${
                        (step === 0 ? draft.entity1Id : draft.entity2Id) !== 'NEW' 
                        ? 'bg-blue-50 border-blue-500 text-blue-700' 
                        : 'bg-white border-slate-200 text-slate-600'
                      }`}
                    >
                      Existante
                    </button>
                  )}
                  <button
                    onClick={() => handleEntitySelection(step === 0 ? 'entity1' : 'entity2', 'NEW')}
                    className={`flex-1 py-2 text-sm font-medium rounded-lg border ${
                      (step === 0 ? draft.entity1Id : draft.entity2Id) === 'NEW' 
                      ? 'bg-blue-50 border-blue-500 text-blue-700' 
                      : 'bg-white border-slate-200 text-slate-600'
                    }`}
                  >
                    Nouvelle
                  </button>
                </div>

                {/* Input */}
                {(step === 0 ? draft.entity1Id : draft.entity2Id) === 'NEW' ? (
                  <div className="space-y-2">
                    <label className="text-sm text-slate-500">Nom de la nouvelle entité</label>
                    <input
                      autoFocus
                      value={step === 0 ? draft.entity1Name : draft.entity2Name}
                      onChange={(e) => handleDraftChange(step === 0 ? 'entity1Name' : 'entity2Name', e.target.value)}
                      className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white text-slate-900"
                      placeholder="Ex: Student"
                      onKeyDown={(e) => e.key === 'Enter' && nextStep()}
                    />
                  </div>
                ) : (
                  <div className="space-y-2">
                    <label className="text-sm text-slate-500">Sélectionner dans la liste</label>
                    <select
                      value={step === 0 ? draft.entity1Id : draft.entity2Id}
                      onChange={(e) => handleEntitySelection(step === 0 ? 'entity1' : 'entity2', e.target.value)}
                      className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white text-slate-900"
                    >
                      {entities.map(e => <option key={e.id} value={e.id}>{e.name}</option>)}
                    </select>
                  </div>
                )}

                <div className="flex gap-2 mt-6">
                  {step > 0 && <button onClick={prevStep} className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg">Retour</button>}
                  <button onClick={nextStep} className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium">Suivant</button>
                </div>
              </div>
            )}

            {/* ÉTAPE 1 : VERBE */}
            {step === 1 && (
              <div className="animate-in fade-in slide-in-from-right-4 duration-300 space-y-4">
                <h3 className="text-lg font-semibold text-slate-800">2. L'Association (Verbe)</h3>
                <p className="text-sm text-slate-600">
                  Quelle action relie <strong className="text-blue-600">{draft.entity1Id === 'NEW' ? draft.entity1Name : getEntityName(draft.entity1Id)}</strong> ?
                </p>
                <input
                  autoFocus
                  value={draft.verb}
                  onChange={(e) => handleDraftChange('verb', e.target.value)}
                  className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white text-slate-900"
                  placeholder="Ex: Register, Buy, Has..."
                  onKeyDown={(e) => e.key === 'Enter' && nextStep()}
                />
                <div className="flex gap-2 mt-4">
                  <button onClick={prevStep} className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg">Retour</button>
                  <button onClick={nextStep} className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium">Suivant</button>
                </div>
              </div>
            )}

            {/* ÉTAPE 3 : CARDINALITÉS INTUITIVES */}
            {step === 3 && (
              <div className="animate-in fade-in zoom-in duration-300 space-y-4">
                <h3 className="text-lg font-semibold text-slate-800">4. Cardinalités</h3>
                
                {/* Question Gauche */}
                <div className="p-3 bg-blue-50 rounded-lg border border-blue-100">
                  <p className="text-xs text-blue-800 font-bold uppercase mb-1">Côté {draft.entity1Id === 'NEW' ? draft.entity1Name : getEntityName(draft.entity1Id)}</p>
                  <p className="text-sm text-slate-700 mb-2">Un élément peut <strong>{draft.verb}</strong> combien de fois ?</p>
                  <select 
                    value={draft.card1} 
                    onChange={(e) => handleDraftChange('card1', e.target.value)} 
                    className="w-full p-2 border rounded bg-white text-slate-900 text-sm"
                  >
                    <option value="1,1">1,1 (Unique & Obligatoire)</option>
                    <option value="0,1">0,1 (Unique & Optionnel)</option>
                    <option value="1,n">1,n (Multiple & Obligatoire)</option>
                    <option value="0,n">0,n (Multiple & Optionnel)</option>
                  </select>
                </div>

                {/* Question Droite */}
                <div className="p-3 bg-indigo-50 rounded-lg border border-indigo-100">
                  <p className="text-xs text-indigo-800 font-bold uppercase mb-1">Côté {draft.entity2Id === 'NEW' ? draft.entity2Name : getEntityName(draft.entity2Id)}</p>
                  <p className="text-sm text-slate-700 mb-2">Un élément peut être <strong>{draft.verb}</strong> par combien d'éléments ?</p>
                  <select 
                    value={draft.card2} 
                    onChange={(e) => handleDraftChange('card2', e.target.value)} 
                    className="w-full p-2 border rounded bg-white text-slate-900 text-sm"
                  >
                    <option value="0,n">0,n (Multiple & Optionnel)</option>
                    <option value="1,1">1,1 (Unique & Obligatoire)</option>
                    <option value="0,1">0,1 (Unique & Optionnel)</option>
                    <option value="1,n">1,n (Multiple & Obligatoire)</option>
                  </select>
                </div>

                <div className="flex gap-2 pt-2">
                  <button onClick={prevStep} className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg">Retour</button>
                  <button 
                    onClick={generateModel} 
                    className="flex-1 bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-bold shadow-lg shadow-green-100 transition transform active:scale-95"
                  >
                    Générer
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* LISTE DES ENTITÉS & RELATIONS (AVEC SUPPRESSION) */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
            <div className="p-4 bg-slate-50 border-b border-slate-100">
              <h4 className="font-bold text-slate-700">Gestion des données</h4>
            </div>
            
            <div className="p-4 space-y-6">
              {/* Liste Entités */}
              <div>
                <h5 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Entités ({entities.length})</h5>
                {entities.length === 0 ? <p className="text-sm text-slate-400 italic">Vide</p> : (
                  <div className="flex flex-wrap gap-2">
                    {entities.map(e => (
                      <div key={e.id} className="group flex items-center bg-white border border-slate-200 rounded-full px-3 py-1 text-sm shadow-sm hover:border-red-300 transition">
                        <span className="font-medium mr-2">{e.name}</span>
                        <button 
                          onClick={() => deleteEntity(e.id)} 
                          className="text-slate-400 hover:text-red-500" 
                          title="Supprimer l'entité et ses relations"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Liste Relations */}
              <div>
                <h5 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Relations ({relations.length})</h5>
                <ul className="space-y-2">
                  {relations.length === 0 ? <p className="text-sm text-slate-400 italic">Vide</p> : relations.map(rel => (
                    <li key={rel.id} className="flex justify-between items-center text-xs p-2 bg-slate-50 rounded border border-slate-100 group hover:bg-white hover:shadow-sm transition">
                      <span>
                        {getEntityName(rel.entity1Id)} <span className="text-slate-400 mx-1">→</span> 
                        <span className="font-bold text-blue-600">{rel.verb}</span> 
                        <span className="text-slate-400 mx-1">←</span> {getEntityName(rel.entity2Id)}
                      </span>
                      <button 
                        onClick={() => deleteRelation(rel.id)} 
                        className="text-slate-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition"
                        title="Supprimer la relation"
                      >
                         <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                           <path fillRule="evenodd" d="M8.75 1A2.75 2.75 0 006 3.75v.443c-.795.077-1.584.176-2.365.298a.75.75 0 10.23 1.482l.149-.022.841 10.518A2.75 2.75 0 007.596 19h4.807a2.75 2.75 0 002.742-2.53l.841-10.52.149.023a.75.75 0 00.23-1.482A41.03 41.03 0 0014 4.193V3.75A2.75 2.75 0 0011.25 1h-2.5zM10 4c.84 0 1.673.025 2.5.075V3.75c0-.69-.56-1.25-1.25-1.25h-2.5c-.69 0-1.25.56-1.25 1.25v.325C8.327 4.025 9.16 4 10 4zM8.58 7.72a.75.75 0 00-1.5.06l.3 7.5a.75.75 0 101.5-.06l-.3-7.5zm4.34.06a.75.75 0 10-1.5-.06l-.3 7.5a.75.75 0 101.5.06l.3-7.5z" clipRule="evenodd" />
                         </svg>
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

        </div>

        {/* --- COLONNE DROITE : CANVAS GRAPHIQUE --- */}
        <div className="lg:col-span-8 flex flex-col gap-4">
          <div className="flex justify-between items-end">
            <h2 className="text-2xl font-bold text-slate-800">Modèle Conceptuel de Données (MCD)</h2>
            {/* BOUTON DE TÉLÉCHARGEMENT */}
            <button 
              onClick={downloadJpg}
              disabled={relations.length === 0}
              className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed text-white px-4 py-2 rounded-lg font-medium shadow-sm transition"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5M16.5 12 12 16.5m0 0L7.5 12m4.5 4.5V3" />
              </svg>
              Télécharger JPG
            </button>
            <span className="text-xs text-slate-400">Drag & Drop activé</span>
          </div>

          <div 
            className="bg-slate-200 rounded-xl border border-slate-300 shadow-inner relative overflow-hidden h-[650px] cursor-grab active:cursor-grabbing select-none"
            ref={canvasRef}
          >
            {entities.length === 0 && (
              <div className="absolute inset-0 flex items-center justify-center text-slate-400 italic pointer-events-none">
                Commencez par ajouter des entités à gauche.
              </div>
            )}

            {/* LAYER 1 : SVG (Lignes & Verbes) */}
            <svg className="absolute top-0 left-0 w-full h-full pointer-events-none z-0">
              {relations.map(rel => {
                const e1 = entities.find(e => e.id === rel.entity1Id);
                const e2 = entities.find(e => e.id === rel.entity2Id);
                if (!e1 || !e2) return null;

                // Centres
                const x1 = e1.x + ENTITY_WIDTH / 2;
                const y1 = e1.y + ENTITY_HEIGHT / 2;
                const x2 = e2.x + ENTITY_WIDTH / 2;
                const y2 = e2.y + ENTITY_HEIGHT / 2;
                
                // Point milieu
                const mx = (x1 + x2) / 2;
                const my = (y1 + y2) / 2;

                return (
                  <g key={rel.id}>
                    {/* Ligne */}
                    <line x1={x1} y1={y1} x2={x2} y2={y2} stroke="#334155" strokeWidth="2" />
                    
                    {/* Cardinalité 1 (Positionnée au 1/4 du chemin) */}
                    <text x={(x1 * 3 + x2) / 4} y={(y1 * 3 + y2) / 4 - 8} fill="#000" fontSize="11" fontWeight="bold" textAnchor="middle" className="bg-white/80 px-1">
                      {rel.card1}
                    </text>
                    
                    {/* Cardinalité 2 (Positionnée aux 3/4 du chemin) */}
                    <text x={(x1 + x2 * 3) / 4} y={(y1 + y2 * 3) / 4 - 8} fill="#000" fontSize="11" fontWeight="bold" textAnchor="middle">
                      {rel.card2}
                    </text>

                    {/* Verbe (Ellipse + Texte) */}
                    <ellipse cx={mx} cy={my} rx="36" ry="18" fill="white" stroke="#334155" strokeWidth="2" />
                    <text x={mx} y={my} dy="4" textAnchor="middle" fill="#1e40af" fontSize="11" fontWeight="bold" fontStyle="italic">
                      {rel.verb}
                    </text>
                  </g>
                );
              })}
            </svg>

            {/* LAYER 2 : HTML (Entités) */}
            {entities.map(ent => (
              <div
                key={ent.id}
                onMouseDown={(e) => handleMouseDown(e, ent.id)}
                style={{
                  transform: `translate(${ent.x}px, ${ent.y}px)`,
                  width: `${ENTITY_WIDTH}px`,
                  height: `${ENTITY_HEIGHT}px`
                }}
                className={`absolute bg-white border-2 border-slate-900 shadow-[3px_3px_0px_0px_rgba(0,0,0,0.8)] 
                           flex items-center justify-center font-bold text-slate-800 text-sm z-10 
                           transition-shadow ${draggingId === ent.id ? 'cursor-grabbing shadow-none translate-x-[2px] translate-y-[2px]' : 'cursor-move'}`}
              >
                {ent.name}
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}