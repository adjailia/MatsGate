# Mets Gate - Comparateur de produits 🛍️

![Mets Gate Logo](images/LOGO_150.png)

> **Mets Gate** est une plateforme moderne et intuitive conçue pour comparer les meilleurs produits cosmétiques, parfums et soins de santé au meilleur prix.

---

## 🌟 Fonctionnalités Principales

### Recherche et Filtrage
- 🔍 **Recherche Avancée :** Recherchez par nom, marque ou description
- 🏷️ **Filtrage Dynamique :** Filtrez par marque et catégorie
- 💰 **Filtrage par Prix :** Range Slider pour sélectionner une fourchette de prix
- 🏷️ **Filtrage Promotions :** Affichez uniquement les produits en solde
- 📊 **Compteur de Résultats :** Nombre de produits trouvés affiché en temps réel

### Comparaison
- ⚖️ **Comparateur en Temps Réel :** Sélectionnez et comparez plusieurs produits
- 📈 **Graphique de Prix :** Visualisation graphique des écarts de prix
- 💵 **Calcul des Économies :** Affiche la différence de prix entre produits
- 🔗 **Partage de Comparaison :** Générez un lien unique pour partager

### Expérience Utilisateur
- 🌙 **Mode Sombre :** Thème confortable pour la navigation nocturne
- ❤️ **Liste de Souhaits :** Enregistrez vos produits favoris
- 💾 **Sauvegarde Automatique :** Vos sélections sont sauvegardées (localStorage)
- 📱 **Design Responsive :** Adapté mobile, tablette et ordinateur
- ⏳ **Indicateur de Chargement :** Spinner pendant le chargement des données

### SEO et Performance
- 🎯 **SEO Optimisé :** Meta tags et Open Graph
- ⚡ **Lazy Loading :** Chargement différé des images
- 📄 **Pagination :** 20 produits par page pour de meilleures performances

---

## 🛠️ Technologies Utilisées

| Technologie | Usage |
|-------------|-------|
| **HTML5** | Structure sémantique |
| **CSS3** | Flexbox, Grid, Variables CSS, Dark Mode |
| **JavaScript ES6** | Logique applicative vanilla |
| **Font Awesome** | Iconographie |
| **Cloudflare** | CDN, DNS et sécurité |
| **GitHub Pages** | Hébergement |

---

## 🚀 Installation Locale

### Prérequis
- Git
- Python 3 (pour le serveur local)

### Étapes

1. **Cloner le dépôt :**
   ```bash
   git clone git@github.com:adjailia/MatsGate.git
   cd MatsGate
   ```

2. **Générer les données JSON (optionnel) :**
   ```bash
   node generate.js
   ```

3. **Lancer le serveur local :**
   ```bash
   python3 -m http.server 8000
   ```

4. **Ouvrir dans le navigateur :**
   ```
   http://localhost:8000
   ```

---

## 📁 Structure du Projet

```
MatsGate/
├── index.html          # Page principale
├── style.css           # Styles CSS (Dark Mode inclus)
├── script.js           # Logique JavaScript
├── generate.js         # Convertisseur CSV → JSON
├── package.json        # Configuration du projet
├── wrangler.json       # Configuration Cloudflare Pages
├── CNAME               # Nom de domaine personnalisé
├── data/
│   ├── products.csv    # Données source
│   └── products.json   # Données générées
├── images/
│   └── LOGO_150.png    # Logo du site
└── doc/
    ├── README.md       # Documentation FR
    └── README_AR.md    # Documentation AR
```

---

## 🌐 Site Officiel

Visitez notre site : [https://metsgate.com](https://metsgate.com)

---

## 📝 Licence

Ce projet est sous licence MIT. Libre d'utilisation et d'adaptation.
