// script.js - Logique principale avec toutes les améliorations

let allProducts = [];
let selectedProducts = new Set();
let wishlist = new Set();
let currentPage = 1;
const productsPerPage = 20;
let filteredProducts = [];
let saleFilterActive = false;

// عناصر DOM
const productGrid = document.getElementById('productGrid');
const loadingSpinner = document.getElementById('loadingSpinner');
const searchInput = document.getElementById('searchInput');
const searchBtn = document.getElementById('searchBtn');
const brandFilter = document.getElementById('brandFilter');
const categoryFilter = document.getElementById('categoryFilter');
const clearFiltersBtn = document.getElementById('clearFilters');
const priceMin = document.getElementById('priceMin');
const priceMax = document.getElementById('priceMax');
const priceMinVal = document.getElementById('priceMinVal');
const priceMaxVal = document.getElementById('priceMaxVal');
const saleFilterBtn = document.getElementById('saleFilter');
const selectionCount = document.getElementById('selectionCount');
const compareBtn = document.getElementById('compareBtn');
const clearSelectionBtn = document.getElementById('clearSelectionBtn');
const shareCompareBtn = document.getElementById('shareCompareBtn');
const compareModal = document.getElementById('compareModal');
const closeModalBtn = document.querySelector('.close-btn');
const compareTableContainer = document.getElementById('compareTableContainer');
const priceChart = document.getElementById('priceChart');
const prevPageBtn = document.getElementById('prevPageBtn');
const nextPageBtn = document.getElementById('nextPageBtn');
const pageInfo = document.getElementById('pageInfo');
const resultsCount = document.getElementById('resultsCount');
const darkModeToggle = document.getElementById('darkModeToggle');
const copyToast = document.getElementById('copyToast');

// تحميل المنتجات
async function loadProducts() {
  showLoading(true);
  try {
    const response = await fetch('data/products.json');
    if (!response.ok) throw new Error('Erreur de chargement');
    allProducts = await response.json();
    
    // استعادة البيانات من localStorage
    const savedSelection = JSON.parse(localStorage.getItem('selectedProductIds') || '[]');
    savedSelection.forEach(id => selectedProducts.add(id));
    
    const savedWishlist = JSON.parse(localStorage.getItem('wishlist') || '[]');
    savedWishlist.forEach(id => wishlist.add(id));
    
    // تحميل وضع الألوان
    if (localStorage.getItem('darkMode') === 'true') {
      document.body.classList.add('dark-mode');
      darkModeToggle.innerHTML = '<i class="fas fa-sun"></i>';
    }

    populateFilters();
    applyFiltersAndRender();
    
    // التحقق من رابط المقارنة
    loadCompareFromURL();
  } catch (error) {
    console.error('Erreur:', error);
    productGrid.innerHTML = '<p class="error">Impossible de charger les produits.</p>';
  } finally {
    showLoading(false);
  }
}

function showLoading(show) {
  loadingSpinner.style.display = show ? 'flex' : 'none';
  productGrid.style.display = show ? 'none' : 'grid';
}

function populateFilters() {
  const brands = new Set();
  const categories = new Set();
  let maxPrice = 0;
  
  allProducts.forEach(p => {
    if (p.brand) brands.add(p.brand);
    if (p.category) categories.add(p.category);
    const price = getNumericPrice(p.sale_price || p.price);
    if (price > maxPrice) maxPrice = price;
  });

  brandFilter.innerHTML = '<option value="">Toutes les marques</option>';
  [...brands].sort().forEach(b => {
    const opt = document.createElement('option');
    opt.value = b;
    opt.textContent = b;
    brandFilter.appendChild(opt);
  });

  categoryFilter.innerHTML = '<option value="">Toutes les catégories</option>';
  [...categories].sort().forEach(c => {
    const opt = document.createElement('option');
    opt.value = c;
    opt.textContent = c;
    categoryFilter.appendChild(opt);
  });
  
  // تحديث حد السعر الأقصى
  priceMax.max = Math.ceil(maxPrice);
  priceMax.value = Math.ceil(maxPrice);
  priceMaxVal.textContent = Math.ceil(maxPrice) + '€';
}

function getNumericPrice(priceStr) {
  if (!priceStr) return 0;
  const match = priceStr.match(/[\d,.]+/);
  if (!match) return 0;
  return parseFloat(match[0].replace(',', '.'));
}

function getFilteredProducts() {
  const searchTerm = searchInput.value.trim().toLowerCase();
  const brand = brandFilter.value;
  const category = categoryFilter.value;
  const minP = parseFloat(priceMin.value);
  const maxP = parseFloat(priceMax.value);

  return allProducts.filter(p => {
    const price = getNumericPrice(p.sale_price || p.price);
    
    const matchSearch = !searchTerm ||
      p.title.toLowerCase().includes(searchTerm) ||
      (p.brand && p.brand.toLowerCase().includes(searchTerm)) ||
      (p.description && p.description.toLowerCase().includes(searchTerm));

    const matchBrand = !brand || p.brand === brand;
    const matchCategory = !category || p.category === category;
    const matchPrice = price >= minP && price <= maxP;
    const matchSale = !saleFilterActive || (p.sale_price && p.sale_price.trim() !== '');
    
    return matchSearch && matchBrand && matchCategory && matchPrice && matchSale;
  });
}

function applyFiltersAndRender() {
  filteredProducts = getFilteredProducts();
  currentPage = 1;
  renderPage();
  updateCompareBar();
  updateResultsCount();
}

function updateResultsCount() {
  resultsCount.textContent = `${filteredProducts.length} produit(s) trouvé(s)`;
}

function renderPage() {
  const totalPages = Math.ceil(filteredProducts.length / productsPerPage);
  if (currentPage > totalPages) currentPage = totalPages || 1;
  
  const start = (currentPage - 1) * productsPerPage;
  const end = start + productsPerPage;
  const pageItems = filteredProducts.slice(start, end);

  renderProducts(pageItems);
  updatePaginationControls(totalPages);
}

function updatePaginationControls(totalPages) {
  pageInfo.textContent = `Page ${currentPage} / ${totalPages || 1}`;
  prevPageBtn.disabled = currentPage <= 1;
  nextPageBtn.disabled = currentPage >= totalPages;
}

function renderProducts(products) {
  if (!products || products.length === 0) {
    productGrid.innerHTML = '<p class="no-results">Aucun produit ne correspond à vos critères.</p>';
    return;
  }

  let html = '';
  products.forEach(p => {
    const isChecked = selectedProducts.has(p.id) ? 'checked' : '';
    const isWished = wishlist.has(p.id) ? 'active' : '';
    const hasSale = p.sale_price && p.sale_price.trim() !== '';
    
    const salePriceHtml = hasSale ?
      `<span class="sale-price">${p.sale_price}</span>
       <span class="old-price">${p.price}</span>` :
      `<span class="price">${p.price}</span>`;
    
    const saleBadge = hasSale ? '<span class="sale-badge">PROMO</span>' : '';

    html += `
      <div class="product-card" data-id="${p.id}">
        ${saleBadge}
        <button class="wishlist-btn ${isWished}" data-id="${p.id}" title="Ajouter aux favoris">
          <i class="fas fa-heart"></i>
        </button>
        <div class="image-wrapper">
          <img src="${p.image || 'https://via.placeholder.com/200x200?text=No+Image'}" 
               alt="${p.title}" 
               loading="lazy" 
               onerror="this.src='https://via.placeholder.com/200x200?text=Image+indisponible'">
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

  // إضافة الأحداث
  document.querySelectorAll('.select-product').forEach(cb => {
    cb.addEventListener('change', handleSelectProduct);
  });
  
  document.querySelectorAll('.wishlist-btn').forEach(btn => {
    btn.addEventListener('click', handleWishlist);
  });
}

function handleSelectProduct(e) {
  const id = parseInt(e.target.dataset.id);
  if (e.target.checked) {
    selectedProducts.add(id);
  } else {
    selectedProducts.delete(id);
  }
  localStorage.setItem('selectedProductIds', JSON.stringify([...selectedProducts]));
  updateCompareBar();
}

function handleWishlist(e) {
  const btn = e.currentTarget;
  const id = parseInt(btn.dataset.id);
  if (wishlist.has(id)) {
    wishlist.delete(id);
    btn.classList.remove('active');
  } else {
    wishlist.add(id);
    btn.classList.add('active');
  }
  localStorage.setItem('wishlist', JSON.stringify([...wishlist]));
}

function updateCompareBar() {
  const count = selectedProducts.size;
  selectionCount.textContent = `${count} produit(s) sélectionné(s)`;
  compareBtn.disabled = count < 2;
  
  document.querySelectorAll('.select-product').forEach(cb => {
    const id = parseInt(cb.dataset.id);
    cb.checked = selectedProducts.has(id);
  });
}

function clearAllSelections() {
  selectedProducts.clear();
  localStorage.setItem('selectedProductIds', JSON.stringify([...selectedProducts]));
  updateCompareBar();
  document.querySelectorAll('.select-product').forEach(cb => {
    cb.checked = false;
  });
}

// مشاركة رابط المقارنة
function shareComparison() {
  if (selectedProducts.size < 2) return;
  const ids = [...selectedProducts].join(',');
  const url = `${window.location.origin}${window.location.pathname}?compare=${ids}`;
  
  navigator.clipboard.writeText(url).then(() => {
    copyToast.classList.add('show');
    setTimeout(() => copyToast.classList.remove('show'), 2000);
  }).catch(() => {
    // fallback
    prompt('Copiez ce lien:', url);
  });
}

// تحميل المقارنة من الرابط
function loadCompareFromURL() {
  const params = new URLSearchParams(window.location.search);
  const compareIds = params.get('compare');
  if (compareIds) {
    const ids = compareIds.split(',').map(Number).filter(id => !isNaN(id));
    ids.forEach(id => selectedProducts.add(id));
    localStorage.setItem('selectedProductIds', JSON.stringify([...selectedProducts]));
    if (selectedProducts.size >= 2) {
      setTimeout(() => showComparison(), 500);
    }
  }
}

// عرض مقارنة مع رسم بياني
function showComparison() {
  if (selectedProducts.size < 2) return;

  const selected = allProducts.filter(p => selectedProducts.has(p.id));
  if (selected.length < 2) return;

  // حساب الفروقات
  const prices = selected.map(p => getNumericPrice(p.sale_price || p.price));
  const minPrice = Math.min(...prices);
  const maxPrice = Math.max(...prices);
  const cheapest = selected[prices.indexOf(minPrice)];
  const mostExpensive = selected[prices.indexOf(maxPrice)];
  const savings = maxPrice - minPrice;

  // رسم بياني
  let chartHtml = '<div class="price-chart">';
  const maxBarHeight = 120;
  selected.forEach((p, i) => {
    const price = prices[i];
    const height = (price / maxPrice) * maxBarHeight;
    let barClass = 'normal';
    if (price === minPrice) barClass = 'cheapest';
    if (price === maxPrice) barClass = 'expensive';
    
    chartHtml += `
      <div class="price-bar">
        <div class="bar-price">${price.toFixed(2)}€</div>
        <div class="bar ${barClass}" style="height: ${height}px;"></div>
        <div class="bar-label">${p.title.substring(0, 15)}...</div>
      </div>
    `;
  });
  chartHtml += '</div>';
  
  if (savings > 0) {
    chartHtml += `
      <div class="price-diff savings">
        <i class="fas fa-piggy-bank"></i>
        <strong>Économie possible: ${savings.toFixed(2)}€</strong> 
        (${cheapest.title.substring(0, 20)}... est ${savings.toFixed(2)}€ moins cher)
      </div>
    `;
  }
  
  priceChart.innerHTML = chartHtml;

  // جدول المقارنة
  const fields = [
    { key: 'brand', label: 'Marque' },
    { key: 'title', label: 'Produit' },
    { key: 'price', label: 'Prix' },
    { key: 'category', label: 'Catégorie' },
    { key: 'description', label: 'Description' }
  ];

  let html = '<table class="compare-table">';
  html += '<tr><th>Caractéristique</th>';
  selected.forEach(p => {
    html += `<th>${p.title}</th>`;
  });
  html += '</tr>';

  fields.forEach(f => {
    html += `<tr><td><strong>${f.label}</strong></td>`;
    selected.forEach((p, i) => {
      let value = p[f.key] || '';
      if (f.key === 'price') {
        const price = prices[i];
        let colorClass = '';
        if (price === minPrice) colorClass = 'color:#008552;font-weight:700;';
        if (price === maxPrice) colorClass = 'color:#e74c3c;';
        if (p.sale_price) {
          value = `<span style="text-decoration:line-through;color:#999;">${p.price}</span> <span style="${colorClass}">${p.sale_price}</span>`;
        } else {
          value = `<span style="${colorClass}">${p.price}</span>`;
        }
      } else if (f.key === 'description') {
        value = value.substring(0, 120) + (value.length > 120 ? '...' : '');
      }
      html += `<td>${value}</td>`;
    });
    html += '</tr>';
  });

  // صف الصور
  html += '<tr><td><strong>Image</strong></td>';
  selected.forEach(p => {
    html += `<td><img src="${p.image || 'https://via.placeholder.com/100x100'}" alt="${p.title}" class="product-img" style="max-width:80px;"></td>`;
  });
  html += '</tr>';

  // صف روابط الشراء
  html += '<tr><td><strong>Achat</strong></td>';
  selected.forEach(p => {
    html += `<td><a href="${p.affiliate_link || p.link}" target="_blank" rel="nofollow sponsored" class="btn-buy-sm">Acheter</a></td>`;
  });
  html += '</tr>';

  html += '</table>';
  compareTableContainer.innerHTML = html;
  compareModal.classList.add('show');
}

function closeModal() {
  compareModal.classList.remove('show');
}

// Dark Mode Toggle
function toggleDarkMode() {
  document.body.classList.toggle('dark-mode');
  const isDark = document.body.classList.contains('dark-mode');
  localStorage.setItem('darkMode', isDark);
  darkModeToggle.innerHTML = isDark ? '<i class="fas fa-sun"></i>' : '<i class="fas fa-moon"></i>';
}

// تحديث عرض السعر
function updatePriceDisplay() {
  priceMinVal.textContent = priceMin.value + '€';
  priceMaxVal.textContent = priceMax.value + '€';
}

// --- الأحداث ---
searchBtn.addEventListener('click', () => { currentPage = 1; applyFiltersAndRender(); });
searchInput.addEventListener('keyup', (e) => {
  if (e.key === 'Enter') { currentPage = 1; applyFiltersAndRender(); }
});
brandFilter.addEventListener('change', () => { currentPage = 1; applyFiltersAndRender(); });
categoryFilter.addEventListener('change', () => { currentPage = 1; applyFiltersAndRender(); });

priceMin.addEventListener('input', () => {
  if (parseInt(priceMin.value) > parseInt(priceMax.value)) {
    priceMin.value = priceMax.value;
  }
  updatePriceDisplay();
  applyFiltersAndRender();
});

priceMax.addEventListener('input', () => {
  if (parseInt(priceMax.value) < parseInt(priceMin.value)) {
    priceMax.value = priceMin.value;
  }
  updatePriceDisplay();
  applyFiltersAndRender();
});

saleFilterBtn.addEventListener('click', () => {
  saleFilterActive = !saleFilterActive;
  saleFilterBtn.classList.toggle('active', saleFilterActive);
  applyFiltersAndRender();
});

clearFiltersBtn.addEventListener('click', () => {
  searchInput.value = '';
  brandFilter.value = '';
  categoryFilter.value = '';
  priceMin.value = 0;
  priceMax.value = priceMax.max;
  saleFilterActive = false;
  saleFilterBtn.classList.remove('active');
  updatePriceDisplay();
  currentPage = 1;
  applyFiltersAndRender();
});

prevPageBtn.addEventListener('click', () => {
  if (currentPage > 1) { currentPage--; renderPage(); window.scrollTo({ top: 0, behavior: 'smooth' }); }
});
nextPageBtn.addEventListener('click', () => {
  const totalPages = Math.ceil(filteredProducts.length / productsPerPage);
  if (currentPage < totalPages) { currentPage++; renderPage(); window.scrollTo({ top: 0, behavior: 'smooth' }); }
});

compareBtn.addEventListener('click', showComparison);
clearSelectionBtn.addEventListener('click', clearAllSelections);
shareCompareBtn.addEventListener('click', shareComparison);
darkModeToggle.addEventListener('click', toggleDarkMode);

closeModalBtn.addEventListener('click', closeModal);
window.addEventListener('click', (e) => {
  if (e.target === compareModal) closeModal();
});

// بدء التطبيق
loadProducts();
