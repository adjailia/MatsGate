// script.js - Logique principale avec améliorations

let allProducts = [];
let selectedProducts = new Set();
let currentPage = 1;
const productsPerPage = 20; // عدد المنتجات في كل صفحة
let filteredProducts = [];

// عناصر DOM
const productGrid = document.getElementById('productGrid');
const loadingSpinner = document.getElementById('loadingSpinner');
const searchInput = document.getElementById('searchInput');
const searchBtn = document.getElementById('searchBtn');
const brandFilter = document.getElementById('brandFilter');
const categoryFilter = document.getElementById('categoryFilter');
const clearFiltersBtn = document.getElementById('clearFilters');
const selectionCount = document.getElementById('selectionCount');
const compareBtn = document.getElementById('compareBtn');
const clearSelectionBtn = document.getElementById('clearSelectionBtn'); // الزر الجديد
const compareModal = document.getElementById('compareModal');
const closeModalBtn = document.querySelector('.close-btn');
const compareTableContainer = document.getElementById('compareTableContainer');
const prevPageBtn = document.getElementById('prevPageBtn');
const nextPageBtn = document.getElementById('nextPageBtn');
const pageInfo = document.getElementById('pageInfo');

// تحميل المنتجات
async function loadProducts() {
  showLoading(true);
  try {
    const response = await fetch('data/products.json');
    if (!response.ok) throw new Error('Erreur de chargement des données');
    allProducts = await response.json();
    
    // استعادة التحديدات من localStorage
    const savedIds = JSON.parse(localStorage.getItem('selectedProductIds') || '[]');
    savedIds.forEach(id => selectedProducts.add(id));

    populateFilters();
    applyFiltersAndRender();
  } catch (error) {
    console.error('Erreur:', error);
    productGrid.innerHTML = `<p class="error">Impossible de charger les produits. Veuillez réessayer plus tard.</p>`;
  } finally {
    showLoading(false);
  }
}

// إظهار/إخفاء مؤشر التحميل
function showLoading(show) {
  loadingSpinner.style.display = show ? 'flex' : 'none';
  productGrid.style.display = show ? 'none' : 'grid';
}

// تعبئة خانات الفلتر
function populateFilters() {
  const brands = new Set();
  const categories = new Set();
  allProducts.forEach(p => {
    if (p.brand) brands.add(p.brand);
    if (p.category) categories.add(p.category);
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
}

// الحصول على المنتجات بعد تطبيق الفلاتر والبحث (مع تحسين البحث في الوصف)
function getFilteredProducts() {
  const searchTerm = searchInput.value.trim().toLowerCase();
  const brand = brandFilter.value;
  const category = categoryFilter.value;

  return allProducts.filter(p => {
    const matchSearch = !searchTerm ||
      p.title.toLowerCase().includes(searchTerm) ||
      (p.brand && p.brand.toLowerCase().includes(searchTerm)) ||
      (p.description && p.description.toLowerCase().includes(searchTerm)); // بحث في الوصف

    const matchBrand = !brand || p.brand === brand;
    const matchCategory = !category || p.category === category;
    return matchSearch && matchBrand && matchCategory;
  });
}

// تطبيق الفلاتر وإعادة الرسم
function applyFiltersAndRender() {
  filteredProducts = getFilteredProducts();
  currentPage = 1;
  renderPage();
  updateCompareBar();
}

// عرض صفحة معينة
function renderPage() {
  const totalPages = Math.ceil(filteredProducts.length / productsPerPage);
  if (currentPage > totalPages) currentPage = totalPages || 1;
  
  const start = (currentPage - 1) * productsPerPage;
  const end = start + productsPerPage;
  const pageItems = filteredProducts.slice(start, end);

  renderProducts(pageItems);
  updatePaginationControls(totalPages);
}

// تحديث أزرار الترقيم
function updatePaginationControls(totalPages) {
  pageInfo.textContent = `Page ${currentPage} / ${totalPages || 1}`;
  prevPageBtn.disabled = currentPage <= 1;
  nextPageBtn.disabled = currentPage >= totalPages;
}

// عرض المنتجات في الشبكة
function renderProducts(products) {
  if (!products || products.length === 0) {
    productGrid.innerHTML = '<p class="no-results">Aucun produit ne correspond à vos critères.</p>';
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

  document.querySelectorAll('.select-product').forEach(cb => {
    cb.addEventListener('change', handleSelectProduct);
  });
}

// التعامل مع تحديد المنتج + حفظ في localStorage
function handleSelectProduct(e) {
  const id = parseInt(e.target.dataset.id);
  if (e.target.checked) {
    selectedProducts.add(id);
  } else {
    selectedProducts.delete(id);
  }
  // حفظ في localStorage
  localStorage.setItem('selectedProductIds', JSON.stringify([...selectedProducts]));
  updateCompareBar();
}

// تحديث شريط المقارنة
function updateCompareBar() {
  const count = selectedProducts.size;
  selectionCount.textContent = `${count} produit(s) sélectionné(s)`;
  compareBtn.disabled = count < 2;
  
  document.querySelectorAll('.select-product').forEach(cb => {
    const id = parseInt(cb.dataset.id);
    cb.checked = selectedProducts.has(id);
  });
}

// --- وظيفة مسح التحديد بالكامل ---
function clearAllSelections() {
  selectedProducts.clear();
  localStorage.setItem('selectedProductIds', JSON.stringify([...selectedProducts]));
  updateCompareBar();
  // لإعادة رسم الحالة في البطاقات المعروضة حالياً
  document.querySelectorAll('.select-product').forEach(cb => {
    cb.checked = false;
  });
}

// عرض مودال المقارنة
function showComparison() {
  if (selectedProducts.size < 2) return;

  const selected = allProducts.filter(p => selectedProducts.has(p.id));
  if (selected.length < 2) return;

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
    selected.forEach(p => {
      let value = p[f.key] || '';
      if (f.key === 'price' && p.sale_price) {
        value = `<span style="text-decoration:line-through;color:#999;">${p.price}</span> <span style="color:#e74c3c;">${p.sale_price}</span>`;
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

// إغلاق المودال
function closeModal() {
  compareModal.classList.remove('show');
}

// --- الأحداث (Events) ---

searchBtn.addEventListener('click', () => { currentPage = 1; applyFiltersAndRender(); });
searchInput.addEventListener('keyup', (e) => {
  if (e.key === 'Enter') { currentPage = 1; applyFiltersAndRender(); }
});
brandFilter.addEventListener('change', () => { currentPage = 1; applyFiltersAndRender(); });
categoryFilter.addEventListener('change', () => { currentPage = 1; applyFiltersAndRender(); });

clearFiltersBtn.addEventListener('click', () => {
  searchInput.value = '';
  brandFilter.value = '';
  categoryFilter.value = '';
  currentPage = 1;
  applyFiltersAndRender();
});

// أزرار الترقيم
prevPageBtn.addEventListener('click', () => {
  if (currentPage > 1) { currentPage--; renderPage(); window.scrollTo({ top: 0, behavior: 'smooth' }); }
});
nextPageBtn.addEventListener('click', () => {
  const totalPages = Math.ceil(filteredProducts.length / productsPerPage);
  if (currentPage < totalPages) { currentPage++; renderPage(); window.scrollTo({ top: 0, behavior: 'smooth' }); }
});

compareBtn.addEventListener('click', showComparison);
clearSelectionBtn.addEventListener('click', clearAllSelections); // حدث الزر الجديد

closeModalBtn.addEventListener('click', closeModal);
window.addEventListener('click', (e) => {
  if (e.target === compareModal) closeModal();
});

// بدء التطبيق
loadProducts();