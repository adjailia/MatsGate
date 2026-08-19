// script.js - Logique principale

let allProducts = [];
let selectedProducts = new Set(); // stocke les IDs des produits sélectionnés

// Éléments DOM
const productGrid = document.getElementById('productGrid');
const searchInput = document.getElementById('searchInput');
const searchBtn = document.getElementById('searchBtn');
const brandFilter = document.getElementById('brandFilter');
const categoryFilter = document.getElementById('categoryFilter');
const clearFiltersBtn = document.getElementById('clearFilters');
const selectionCount = document.getElementById('selectionCount');
const compareBtn = document.getElementById('compareBtn');
const compareModal = document.getElementById('compareModal');
const closeModalBtn = document.querySelector('.close-btn');
const compareTableContainer = document.getElementById('compareTableContainer');

// Chargement des produits
async function loadProducts() {
  try {
    const response = await fetch('data/products.json');
    if (!response.ok) throw new Error('Erreur de chargement des données');
    allProducts = await response.json();
    populateFilters();
    renderProducts(allProducts);
  } catch (error) {
    console.error('Erreur:', error);
    productGrid.innerHTML = `<p class="error">Impossible de charger les produits. Veuillez réessayer plus tard.</p>`;
  }
}

// Remplir les filtres (marques et catégories)
function populateFilters() {
  const brands = new Set();
  const categories = new Set();
  allProducts.forEach(p => {
    if (p.brand) brands.add(p.brand);
    if (p.category) categories.add(p.category);
  });

  // Marques
  brandFilter.innerHTML = '<option value="">Toutes les marques</option>';
  [...brands].sort().forEach(b => {
    const opt = document.createElement('option');
    opt.value = b;
    opt.textContent = b;
    brandFilter.appendChild(opt);
  });

  // Catégories
  categoryFilter.innerHTML = '<option value="">Toutes les catégories</option>';
  [...categories].sort().forEach(c => {
    const opt = document.createElement('option');
    opt.value = c;
    opt.textContent = c;
    categoryFilter.appendChild(opt);
  });
}

// Filtrer les produits selon les critères
function getFilteredProducts() {
  const searchTerm = searchInput.value.trim().toLowerCase();
  const brand = brandFilter.value;
  const category = categoryFilter.value;

  return allProducts.filter(p => {
    const matchSearch = !searchTerm ||
      p.title.toLowerCase().includes(searchTerm) ||
      (p.brand && p.brand.toLowerCase().includes(searchTerm));
    const matchBrand = !brand || p.brand === brand;
    const matchCategory = !category || p.category === category;
    return matchSearch && matchBrand && matchCategory;
  });
}

// Rendu des produits
function renderProducts(products) {
  if (!products || products.length === 0) {
    productGrid.innerHTML = '<p class="no-results">Aucun produit ne correspond à vos critères.</p>';
    updateCompareBar();
    return;
  }

  let html = '';
  products.forEach(p => {
    const isChecked = selectedProducts.has(p.id) ? 'checked' : '';
    const salePriceHtml = p.sale_price ?
      `<span class="sale-price">${p.sale_price}</span>
       <span class="old-price">${p.price}</span>` :
      `<span class="price">${p.price}</span>`;

    html += `
      <div class="product-card" data-id="${p.id}">
        <div class="image-wrapper">
          <img src="${p.image || 'https://via.placeholder.com/200x200?text=No+Image'}" alt="${p.title}" loading="lazy" onerror="this.src='https://via.placeholder.com/200x200?text=Image+indisponible'">
        </div>
        <div class="info">
          <div class="brand">${p.brand || 'Marque inconnue'}</div>
          <div class="title">${p.title}</div>
          <div class="price-block">
            ${salePriceHtml}
          </div>
        </div>
        <div class="actions">
          <label>
            <input type="checkbox" class="select-product" data-id="${p.id}" ${isChecked}>
            Comparer
          </label>
          <a href="${p.affiliate_link || p.link}" target="_blank" rel="nofollow sponsored" class="btn-buy">
            <i class="fas fa-shopping-cart"></i> Acheter
          </a>
        </div>
      </div>
    `;
  });

  productGrid.innerHTML = html;

  // Attacher les événements aux cases à cocher
  document.querySelectorAll('.select-product').forEach(cb => {
    cb.addEventListener('change', handleSelectProduct);
  });

  updateCompareBar();
}

// Gérer la sélection de produits
function handleSelectProduct(e) {
  const id = parseInt(e.target.dataset.id);
  if (e.target.checked) {
    selectedProducts.add(id);
  } else {
    selectedProducts.delete(id);
  }
  updateCompareBar();
}

// Mettre à jour la barre de comparaison
function updateCompareBar() {
  const count = selectedProducts.size;
  selectionCount.textContent = `${count} produit(s) sélectionné(s)`;
  compareBtn.disabled = count < 2;
  // Mettre à jour les cases à cocher si besoin (synchronisation)
  document.querySelectorAll('.select-product').forEach(cb => {
    const id = parseInt(cb.dataset.id);
    cb.checked = selectedProducts.has(id);
  });
}

// Ouvrir la modale de comparaison
function showComparison() {
  if (selectedProducts.size < 2) return;

  const selected = allProducts.filter(p => selectedProducts.has(p.id));
  if (selected.length < 2) return;

  const fields = [
    { key: 'brand', label: 'Marque' },
    { key: 'title', label: 'Produit' },
    { key: 'price', label: 'Prix' },
    { key: 'sale_price', label: 'Prix promo' },
    { key: 'category', label: 'Catégorie' },
    { key: 'description', label: 'Description' }
  ];

  let html = '<table class="compare-table">';
  // En-tête des colonnes
  html += '<tr><th>Caractéristique</th>';
  selected.forEach(p => {
    html += `<th>${p.title}</th>`;
  });
  html += '</tr>';

  // Lignes
  fields.forEach(f => {
    html += `<tr><td><strong>${f.label}</strong></td>`;
    selected.forEach(p => {
      let value = p[f.key] || '';
      if (f.key === 'price' && p.sale_price) {
        value = `<span style="text-decoration:line-through;color:#999;">${p.price}</span> <span style="color:#e74c3c;">${p.sale_price}</span>`;
      } else if (f.key === 'sale_price') {
        // On l'a déjà traité dans price, donc on ignore cette ligne séparée
        // On va afficher les prix dans une seule ligne
        return;
      } else if (f.key === 'description') {
        value = value.substring(0, 120) + (value.length > 120 ? '...' : '');
      } else if (f.key === 'image') {
        // On ajoute une colonne image à part
        return;
      }
      html += `<td>${value}</td>`;
    });
    html += '</tr>';
  });

  // Ligne image
  html += '<tr><td><strong>Image</strong></td>';
  selected.forEach(p => {
    html += `<td><img src="${p.image || 'https://via.placeholder.com/100x100'}" alt="${p.title}" class="product-img" style="max-width:80px;"></td>`;
  });
  html += '</tr>';

  // Lien d'achat
  html += '<tr><td><strong>Achat</strong></td>';
  selected.forEach(p => {
    html += `<td><a href="${p.affiliate_link || p.link}" target="_blank" rel="nofollow sponsored" class="btn-buy-sm">Acheter</a></td>`;
  });
  html += '</tr>';

  html += '</table>';

  compareTableContainer.innerHTML = html;
  compareModal.classList.add('show');
}

// Fermer la modale
function closeModal() {
  compareModal.classList.remove('show');
}

// Événements
searchBtn.addEventListener('click', () => {
  const filtered = getFilteredProducts();
  renderProducts(filtered);
});

searchInput.addEventListener('keyup', (e) => {
  if (e.key === 'Enter') {
    const filtered = getFilteredProducts();
    renderProducts(filtered);
  }
});

brandFilter.addEventListener('change', () => {
  const filtered = getFilteredProducts();
  renderProducts(filtered);
});

categoryFilter.addEventListener('change', () => {
  const filtered = getFilteredProducts();
  renderProducts(filtered);
});

clearFiltersBtn.addEventListener('click', () => {
  searchInput.value = '';
  brandFilter.value = '';
  categoryFilter.value = '';
  const filtered = getFilteredProducts();
  renderProducts(filtered);
});

compareBtn.addEventListener('click', showComparison);

closeModalBtn.addEventListener('click', closeModal);
window.addEventListener('click', (e) => {
  if (e.target === compareModal) closeModal();
});

// Initialisation
loadProducts();