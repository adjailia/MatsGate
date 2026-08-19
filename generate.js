// generate.js - Script Node.js pour convertir le CSV en JSON
const fs = require('fs');
const path = require('path');

// Données CSV complètes (copiées depuis le contenu fourni)
// Pour éviter d'écrire tout le contenu ici, on va le lire depuis un fichier products.csv
// mais pour l'exercice, on l'inclut en tant que chaîne (en pratique, on le mettrait dans un fichier séparé)
// Ici, nous allons lire le fichier CSV depuis le disque. On suppose que le fichier products.csv est présent.
// Si vous voulez tout inclure dans ce script, vous pouvez remplacer par la variable contenant le CSV.
// Pour ce générateur, nous allons lire le fichier "products.csv" dans le même répertoire.

// Le contenu CSV est énorme, donc on ne l'inclut pas directement dans le code,
// mais on le lit depuis un fichier séparé (que nous n'avons pas créé).
// Nous allons donc simuler la lecture en supposant que le fichier existe.
// Dans la pratique, le fichier CSV sera fourni.

// Comme nous ne pouvons pas inclure tout le CSV ici, nous allons utiliser la méthode de lecture de fichier.
// On suppose que le fichier "products.csv" est dans le répertoire courant.
// Sinon, nous pouvons créer un fichier products.csv dans le projet.

// Pour cet exemple, nous créons un fichier products.csv avec le contenu fourni par l'utilisateur,
// mais pour la génération, nous allons simplement le lire.

const csvFilePath = path.join(__dirname, 'products.csv');
const outputPath = path.join(__dirname, 'data', 'products.json');

// S'assurer que le dossier data existe
if (!fs.existsSync(path.join(__dirname, 'data'))) {
  fs.mkdirSync(path.join(__dirname, 'data'));
}

function parseCSV(csv) {
  // Supprimer le BOM si présent
  if (csv.charCodeAt(0) === 0xFEFF) {
    csv = csv.slice(1);
  }

  const lines = csv.split(/\r?\n/);
  if (lines.length < 2) return [];

  // Extraire les en-têtes
  const headerLine = lines[0];
  // Parser les en-têtes en tenant compte des guillemets
  const headers = [];
  let current = '';
  let inQuotes = false;
  for (let i = 0; i < headerLine.length; i++) {
    const char = headerLine[i];
    if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === ',' && !inQuotes) {
      headers.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }
  headers.push(current.trim());

  const result = [];

  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;

    // Parser la ligne avec gestion des guillemets
    const values = [];
    let currentVal = '';
    let inQuotesVal = false;
    for (let j = 0; j < line.length; j++) {
      const char = line[j];
      if (char === '"') {
        inQuotesVal = !inQuotesVal;
      } else if (char === ',' && !inQuotesVal) {
        values.push(currentVal.trim());
        currentVal = '';
      } else {
        currentVal += char;
      }
    }
    values.push(currentVal.trim());

    // Construire l'objet
    const obj = {};
    headers.forEach((h, idx) => {
      let val = values[idx] || '';
      // Nettoyer les guillemets doubles
      if (val.startsWith('"') && val.endsWith('"')) {
        val = val.slice(1, -1);
      }
      // Remplacer les entités HTML
      val = val.replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>')
        .replace(/&quot;/g, '"').replace(/&apos;/g, "'").replace(/&#39;/g, "'");
      obj[h] = val;
    });

    // Ne garder que les champs utiles
    const product = {
      id: parseInt(obj.id) || 0,
      title: obj.title || '',
      description: obj.description || '',
      link: obj.link || '',
      image: obj.image_link || '',
      affiliate_link: obj.aw_deep_link || obj.link || '',
      brand: obj.brand || '',
      price: obj.price || '',
      sale_price: obj.sale_price || '',
      category: obj.google_product_category || obj.product_type || '',
      product_type: obj.product_type || '',
      gtin: obj.gtin || '',
      mpn: obj.mpn || '',
      availability: obj.availability || '',
      condition: obj.condition || '',
      gender: obj.gender || '',
      color: obj.color || '',
      size: obj.size || '',
      // ajouter d'autres champs si besoin
    };
    result.push(product);
  }

  return result;
}

// Lire le fichier CSV
console.log('Lecture du fichier CSV...');
const csvData = fs.readFileSync(csvFilePath, 'utf8');

console.log('Parsing du CSV...');
const products = parseCSV(csvData);
console.log(`✅ ${products.length} produits chargés.`);

// Écrire le JSON
fs.writeFileSync(outputPath, JSON.stringify(products, null, 2), 'utf8');
console.log(`✅ Données sauvegardées dans ${outputPath}`);