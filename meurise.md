## On crée une application de génération de model meurise

Avec une suite logique, il sera alors possible de générer toutes les étapes de meurise, en commençant par MCD

Il faut donc mettre à disposition des champs qui s'afficheront un par un, on pourra lui dire si c'est une entité ou alors un verbe d'action.
Si on met un verbe d'action, il faut forcément une deuxième entité.

Une fois les deux identité + verbes d'action créer.
Il faudra préciser si dans l'une des entité, il peut avoir plusieurs de l'autre entité ou qu'un seul, alors ça vas générer un modèle (dessin html) qui vas relier les deux entités ensemble avec leur cardinalité

Exemple : 
Student (entité)
Register (verbe action)
School (entité)

Student [un(register)] School (Un student est register à une school)
School [plusieurs(register)] Student (une école a plusieurs student)

Le résultat sera : 
student 1.1
Et 0.n school 

Faudrait après qu'il soit possible d'ajouter de nouvelles entités et une relation avec un verbe d'action, mais aussi de pouvoir sélectionner une entité existante pour encore la relier à une autre entité (existante ou une nouvelle avec un verbe d'action.

Résumé IA : 

Voici un résumé structuré et technique de tout ce que nous avons accompli, prêt à être intégré dans votre fichier `README.md` ou votre journal de développement.

-----

# 📘 Générateur de MCD Meurise (MCD Builder)

Application web interactive permettant de générer des Modèles Conceptuels de Données (MCD) selon la méthode Meurise via une interface intuitive et un canvas graphique.

## 🛠 Stack Technique

  * **Framework** : Next.js 16 (App Router / "use client")
  * **Langage** : TypeScript (Typage strict des Entités et Relations)
  * **Styling** : Tailwind CSS (Design responsive, gestion Dark/Light mode)
  * **Export** : `html-to-image` (Support des couleurs modernes CSS comme `lab` et `oklch`)

## ✨ Fonctionnalités Implémentées

### 1\. Assistant de Création (Wizard Step-by-Step)

  * **Processus guidé** en 4 étapes pour créer une relation :
    1.  Choix de l'entité de départ (Nouvelle ou Existante).
    2.  Définition du verbe d'action (l'Association).
    3.  Choix de l'entité d'arrivée (Nouvelle ou Existante).
    4.  Définition des cardinalités via des questions en langage naturel (ex: *"Un étudiant peut emprunter combien de livres ?"*).
  * **Navigation** : Possibilité de revenir à l'étape précédente.
  * **Réutilisabilité** : Système intelligent permettant de sélectionner une entité déjà créée pour la lier à une autre (évite les doublons).

### 2\. Canvas Interactif (Zone de Dessin)

  * **Rendu Hybride** : Utilisation de `HTML/Div` pour les entités (boîtes) et de `SVG` pour les relations (lignes et ellipses).
  * **Drag & Drop** : Les entités sont déplaçables à la souris. Les lignes de relation se redessinent dynamiquement en temps réel.
  * **Design Meurise** : Respect du formalisme (Boîtes rectangulaires, Verbes dans des ovales, Cardinalités 0,n / 1,1 sur les pattes).

### 3\. Gestion des Données (CRUD)

  * **Structure relationnelle** : Séparation des données en deux tableaux : `Entities` (ID, Nom, PosX, PosY) et `Relations` (ID, SourceID, TargetID, Verbe, Cards).
  * **Suppression** :
      * Suppression d'une relation unique.
      * Suppression d'une entité avec **cascade** (supprime automatiquement toutes les relations orphelines liées).

### 4\. Exportation

  * **Téléchargement JPG** : Capture haute définition du canvas via `html-to-image`.
  * **Compatibilité** : Gestion automatique du fond blanc pour l'export, indépendamment du thème de l'utilisateur.

## 📦 Dépendances

```json
{
  "dependencies": {
    "html-to-image": "^1.11.11",
    "next": "16.0.6",
    "react": "^18",
    "react-dom": "^18"
  }
}
```

## 🚀 Correctifs Importants Apportés

  * **Fix Dark Mode** : Force le fond blanc et le texte noir sur les `inputs` pour éviter le texte illisible (blanc sur blanc) quand le système est en mode sombre.
  * **Fix Export Image** : Remplacement de `html2canvas` par `html-to-image` pour corriger les crashs liés aux variables CSS modernes de Tailwind v4 (`Attempting to parse an unsupported color function "lab"`).

-----






