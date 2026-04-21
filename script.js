/**
 * =====================================================
 * TechStore — script.js
 * Fullstack JavaScript (Frontend-only) SPA
 * 
 * STATE MANAGEMENT: Semua data disimpan di LocalStorage
 * KEY STORAGE:
 *   - "ts_users"        : Array semua user terdaftar
 *   - "ts_session"      : User yang sedang login (object)
 *   - "ts_cart"         : Array item keranjang per user
 *   - "ts_orders"       : Array semua order per user
 * =====================================================
 */

'use strict';

// ================================================
// SECTION 1: STATE & CONSTANTS
// ================================================

/** Kunci LocalStorage — dipusatkan agar mudah diubah */
const LS_KEYS = {
  USERS   : 'ts_users',
  SESSION : 'ts_session',
  CART    : 'ts_cart',
  ORDERS  : 'ts_orders',
};

/** State global aplikasi (in-memory, disinkronkan dengan LS) */
let STATE = {
  products : [],   // data produk dari products.json
  session  : null, // user yang sedang login
  cart     : [],   // item keranjang
  orders   : [],   // riwayat order
};

/** Filter & sort state untuk halaman produk */
let FILTER = {
  search   : '',
  category : 'all',
  maxPrice : 35000000,
  sort     : 'default',
};

// ================================================
// SECTION 2: LOCALSTORAGE HELPERS
// ================================================

/**
 * Membaca data dari LocalStorage.
 * @param {string} key - Key LS_KEYS
 * @param {*} fallback - Nilai default jika kosong
 */
function lsGet(key, fallback = null) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

/**
 * Menyimpan data ke LocalStorage sebagai JSON.
 * @param {string} key
 * @param {*} value
 */
function lsSet(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

/**
 * Menghapus satu key dari LocalStorage.
 * @param {string} key
 */
function lsRemove(key) {
  localStorage.removeItem(key);
}

// ================================================
// SECTION 3: INIT & DATA LOADING
// ================================================

/**
 * Entry point — dipanggil saat DOM siap.
 * Urutan: load products → restore session → render UI
 */
async function init() {
  await loadProducts();
  restoreSession();
  renderNavAuth();
  renderCategoryGrid();
  renderFeaturedProducts();
  updateCartBadge();
  setupPaymentRadio();
  setupMobileMenu();
  showPage('home');
}

/**
 * Memuat data produk dari products.json.
 * Fallback ke array kosong jika file tidak ditemukan.
 */
async function loadProducts() {
  try {
    const res = await fetch('products.json');
    STATE.products = await res.json();
  } catch (err) {
    console.warn('Gagal memuat products.json:', err);
    STATE.products = [];
  }
}

/**
 * Memulihkan sesi user dari LocalStorage saat halaman di-refresh.
 * Jika ada session tersimpan, isi STATE.session, cart, dan orders.
 */
function restoreSession() {
  // Baca session dari LS
  STATE.session = lsGet(LS_KEYS.SESSION, null);

  if (STATE.session) {
    // Baca cart milik user yang login
    const allCarts = lsGet(LS_KEYS.CART, {});
    STATE.cart = allCarts[STATE.session.email] || [];

    // Baca orders milik user yang login
    const allOrders = lsGet(LS_KEYS.ORDERS, {});
    STATE.orders = allOrders[STATE.session.email] || [];
  } else {
    STATE.cart   = [];
    STATE.orders = [];
  }
}

// ================================================
// SECTION 4: SESSION / AUTH
// ================================================

/**
 * Menyimpan session user ke LocalStorage.
 * Dipanggil setelah login berhasil.
 */
function saveSession(user) {
  STATE.session = user;
  lsSet(LS_KEYS.SESSION, user);

  // Muat cart & orders user ini
  const allCarts  = lsGet(LS_KEYS.CART, {});
  const allOrders = lsGet(LS_KEYS.ORDERS, {});
  STATE.cart   = allCarts[user.email]  || [];
  STATE.orders = allOrders[user.email] || [];
}

/**
 * Menghapus session (logout).
 */
function clearSession() {
  STATE.session = null;
  STATE.cart    = [];
  STATE.orders  = [];
  lsRemove(LS_KEYS.SESSION);
}

/** Handler tombol Login */
function handleLogin() {
  const email    = document.getElementById('login-email').value.trim();
  const password = document.getElementById('login-password').value;
  const errEl    = document.getElementById('login-error');

  // Validasi input kosong
  if (!email || !password) {
    showError(errEl, 'Email dan password wajib diisi!');
    return;
  }

  // Cari user di LS
  const users = lsGet(LS_KEYS.USERS, []);
  const found = users.find(u => u.email === email && u.password === password);

  if (!found) {
    showError(errEl, 'Email atau password salah!');
    return;
  }

  hideError(errEl);
  saveSession(found);
  renderNavAuth();
  updateCartBadge();
  showToast(`Selamat datang, ${found.name}! 👋`, 'success');
  showPage('home');
}

/** Handler tombol Register */
function handleRegister() {
  const name     = document.getElementById('reg-name').value.trim();
  const email    = document.getElementById('reg-email').value.trim();
  const password = document.getElementById('reg-password').value;
  const confirm  = document.getElementById('reg-confirm').value;
  const errEl    = document.getElementById('reg-error');

  // Validasi lengkap
  if (!name || !email || !password || !confirm) {
    showError(errEl, 'Semua field wajib diisi!');
    return;
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    showError(errEl, 'Format email tidak valid!');
    return;
  }
  if (password.length < 6) {
    showError(errEl, 'Password minimal 6 karakter!');
    return;
  }
  if (password !== confirm) {
    showError(errEl, 'Konfirmasi password tidak cocok!');
    return;
  }

  // Cek email unik
  const users = lsGet(LS_KEYS.USERS, []);
  if (users.find(u => u.email === email)) {
    showError(errEl, 'Email sudah terdaftar! Silakan login.');
    return;
  }

  // Simpan user baru ke LS
  const newUser = { name, email, password, createdAt: Date.now() };
  users.push(newUser);
  lsSet(LS_KEYS.USERS, users);

  hideError(errEl);
  saveSession(newUser);
  renderNavAuth();
  updateCartBadge();
  showToast(`Akun berhasil dibuat! Selamat datang, ${name}! 🎉`, 'success');
  showPage('home');
}

/** Logout user */
function handleLogout() {
  const name = STATE.session?.name;
  clearSession();
  renderNavAuth();
  updateCartBadge();
  showToast(`Sampai jumpa, ${name}!`, 'info');
  showPage('home');
}

// ================================================
// SECTION 5: CART MANAGEMENT
// ================================================

/**
 * Menyimpan state cart ke LocalStorage.
 * Cart disimpan per-email agar tidak tercampur antar user.
 */
function saveCart() {
  const allCarts = lsGet(LS_KEYS.CART, {});
  allCarts[STATE.session.email] = STATE.cart;
  lsSet(LS_KEYS.CART, allCarts);
}

/**
 * Menambahkan produk ke keranjang.
 * Jika sudah ada, tingkatkan quantity-nya.
 * @param {number} productId
 * @param {number} qty - jumlah yang ditambahkan (default 1)
 */
function addToCart(productId, qty = 1) {
  // Cek login dulu
  if (!STATE.session) {
    showToast('Silakan login terlebih dahulu!', 'warning');
    showPage('auth');
    return;
  }

  const product = STATE.products.find(p => p.id === productId);
  if (!product) return;

  // Cek apakah sudah ada di cart
  const existing = STATE.cart.find(item => item.id === productId);
  if (existing) {
    existing.quantity = Math.min(existing.quantity + qty, product.stock);
  } else {
    STATE.cart.push({ id: productId, quantity: qty });
  }

  // Simpan ke LS
  saveCart();
  updateCartBadge();
  showToast(`${product.name} ditambahkan ke keranjang! 🛒`, 'success');
}

/**
 * Mengubah quantity item di cart.
 * Jika quantity <= 0, hapus item tersebut.
 * @param {number} productId
 * @param {number} delta - +1 atau -1
 */
function updateCartQty(productId, delta) {
  const item = STATE.cart.find(i => i.id === productId);
  if (!item) return;

  const product = STATE.products.find(p => p.id === productId);
  const newQty = item.quantity + delta;

  if (newQty <= 0) {
    removeFromCart(productId);
    return;
  }

  // Batasi qty maksimal = stok produk
  item.quantity = Math.min(newQty, product?.stock || 99);
  saveCart();
  renderCartPage();
}

/**
 * Menghapus item dari cart berdasarkan productId.
 * @param {number} productId
 */
function removeFromCart(productId) {
  STATE.cart = STATE.cart.filter(i => i.id !== productId);
  saveCart();
  updateCartBadge();
  renderCartPage();
  showToast('Item dihapus dari keranjang', 'info');
}

/** Menghitung total harga cart */
function getCartTotal() {
  return STATE.cart.reduce((sum, item) => {
    const product = STATE.products.find(p => p.id === item.id);
    return sum + (product ? product.price * item.quantity : 0);
  }, 0);
}

/** Menghitung total item (quantity) di cart */
function getCartItemCount() {
  return STATE.cart.reduce((sum, item) => sum + item.quantity, 0);
}

/** Update badge angka di icon cart navbar */
function updateCartBadge() {
  const badge = document.getElementById('cart-badge');
  const count = getCartItemCount();
  if (count > 0) {
    badge.textContent = count > 99 ? '99+' : count;
    badge.classList.remove('hidden');
  } else {
    badge.classList.add('hidden');
  }
}

// ================================================
// SECTION 6: CHECKOUT & ORDERS
// ================================================

/**
 * Menyimpan order baru ke LocalStorage.
 * Order disimpan per-email user.
 * @param {object} order
 */
function saveOrder(order) {
  const allOrders = lsGet(LS_KEYS.ORDERS, {});
  const userOrders = allOrders[STATE.session.email] || [];
  userOrders.unshift(order); // Prepend agar terbaru di atas
  allOrders[STATE.session.email] = userOrders;
  lsSet(LS_KEYS.ORDERS, allOrders);
  STATE.orders = userOrders;
}

/**
 * Mengosongkan cart setelah checkout berhasil.
 */
function clearCart() {
  STATE.cart = [];
  saveCart();
  updateCartBadge();
}

/**
 * Membuat Transaction ID unik format: TS-YYYYMMDD-XXXXXX
 */
function generateTxId() {
  const now  = new Date();
  const date = now.getFullYear().toString() +
               String(now.getMonth() + 1).padStart(2, '0') +
               String(now.getDate()).padStart(2, '0');
  const rand = Math.random().toString(36).substring(2, 8).toUpperCase();
  return `TS-${date}-${rand}`;
}

/** Handler konfirmasi pesanan */
function handleCheckout() {
  const name    = document.getElementById('co-name').value.trim();
  const phone   = document.getElementById('co-phone').value.trim();
  const address = document.getElementById('co-address').value.trim();
  const city    = document.getElementById('co-city').value.trim();
  const postal  = document.getElementById('co-postal').value.trim();
  const payment = document.querySelector('input[name="payment"]:checked')?.value || 'Transfer Bank';
  const errEl   = document.getElementById('co-error');

  // Validasi
  if (!name || !phone || !address || !city || !postal) {
    showError(errEl, 'Semua field pengiriman wajib diisi!');
    return;
  }
  if (!/^[\d\-\+\s]{8,15}$/.test(phone)) {
    showError(errEl, 'Format nomor HP tidak valid!');
    return;
  }

  hideError(errEl);

  // Buat object order
  const txId  = generateTxId();
  const items = STATE.cart.map(item => {
    const p = STATE.products.find(prod => prod.id === item.id);
    return { id: item.id, name: p.name, price: p.price, quantity: item.quantity, image: p.image };
  });

  const order = {
    txId,
    items,
    total      : getCartTotal(),
    shipping   : { name, phone, address, city, postal },
    payment,
    status     : 'Diproses',
    createdAt  : Date.now(),
    user       : STATE.session.email,
  };

  // Simpan ke LS dan bersihkan cart
  saveOrder(order);
  clearCart();

  // Tampilkan halaman sukses
  document.getElementById('success-txid').textContent = `Transaction ID: ${txId}`;
  showPage('success');
}

/** Navigasi ke halaman checkout dengan validasi login dan cart */
function goToCheckout() {
  if (!STATE.session) {
    showToast('Silakan login terlebih dahulu!', 'warning');
    showPage('auth');
    return;
  }
  if (STATE.cart.length === 0) {
    showToast('Keranjang Anda masih kosong!', 'warning');
    return;
  }
  renderCheckoutPage();
  showPage('checkout');
}

// ================================================
// SECTION 7: RENDER FUNCTIONS
// ================================================

/** Render navbar authentication area (login/logout button) */
function renderNavAuth() {
  const el = document.getElementById('nav-auth');
  if (STATE.session) {
    el.innerHTML = `
      <div class="flex items-center gap-3">
        <div class="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-dark-700 border border-slate-700">
          <div class="w-6 h-6 rounded-full bg-gradient-to-br from-cyan-500 to-indigo-500 flex items-center justify-center text-white text-xs font-display font-700">
            ${STATE.session.name.charAt(0).toUpperCase()}
          </div>
          <span class="text-slate-300 text-sm font-medium max-w-[100px] truncate">${STATE.session.name}</span>
        </div>
        <button onclick="handleLogout()" class="px-4 py-2 rounded-xl border border-slate-700 text-slate-400 hover:border-red-500/50 hover:text-red-400 text-sm font-medium transition-all">
          Logout
        </button>
      </div>`;
  } else {
    el.innerHTML = `
      <button onclick="showPage('auth')" class="px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-500 text-white font-display font-700 text-sm tracking-wide btn-glow transition-all">
        Login
      </button>`;
  }
}

/** Render grid kategori di home page */
function renderCategoryGrid() {
  const categories = [...new Set(STATE.products.map(p => p.category))];
  const icons = {
    'Laptop': '💻', 'Smartphone': '📱', 'Audio': '🎧', 'Tablet': '📟',
    'Wearable': '⌚', 'Aksesoris': '🖱️', 'Monitor': '🖥️', 'Drone': '🚁',
    'Kamera': '📷', 'Default': '📦'
  };
  const el = document.getElementById('category-grid');
  el.innerHTML = categories.map(cat => `
    <button onclick="filterByCategory('${cat}')"
            class="product-card rounded-2xl p-4 text-center cursor-pointer group">
      <div class="text-3xl mb-2">${icons[cat] || icons['Default']}</div>
      <div class="font-display font-700 text-white text-sm group-hover:text-cyan-400 transition-colors">${cat}</div>
      <div class="text-slate-600 text-xs mt-0.5">${STATE.products.filter(p=>p.category===cat).length} produk</div>
    </button>
  `).join('');
}

/**
 * Filter by category dari home — navigasi ke halaman products
 * @param {string} category
 */
function filterByCategory(category) {
  FILTER.category = category;
  FILTER.search   = '';
  FILTER.maxPrice = 35000000;
  FILTER.sort     = 'default';
  showPage('products');
}

/** Render 4 produk unggulan (badge atau rating tertinggi) di home */
function renderFeaturedProducts() {
  const featured = STATE.products
    .filter(p => p.badge)
    .slice(0, 4);
  const el = document.getElementById('featured-grid');
  el.innerHTML = featured.map(p => buildProductCard(p)).join('');
}

/**
 * Membangun HTML kartu produk.
 * @param {object} p - Product object
 */
function buildProductCard(p) {
  const badgeColors = {
    'Best Seller': 'bg-amber-500/20 text-amber-400 border-amber-500/30',
    'New'        : 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30',
    'Hot'        : 'bg-red-500/20 text-red-400 border-red-500/30',
    'Sale'       : 'bg-green-500/20 text-green-400 border-green-500/30',
    'Gaming'     : 'bg-purple-500/20 text-purple-400 border-purple-500/30',
    'Best Value' : 'bg-indigo-500/20 text-indigo-400 border-indigo-500/30',
  };
  const discount = p.originalPrice
    ? Math.round((1 - p.price / p.originalPrice) * 100)
    : 0;

  return `
    <div class="product-card rounded-2xl overflow-hidden cursor-pointer group"
         onclick="openProductModal(${p.id})">
      <!-- Image -->
      <div class="relative overflow-hidden h-48 bg-dark-700">
        <img src="${p.image}" alt="${p.name}"
             class="product-img w-full h-full object-cover"/>
        ${p.badge ? `<span class="badge absolute top-3 left-3 px-2.5 py-1 rounded-full border ${badgeColors[p.badge] || 'bg-slate-700 text-slate-300 border-slate-600'}">${p.badge}</span>` : ''}
        ${discount > 0 ? `<span class="absolute top-3 right-3 badge px-2 py-1 rounded-full bg-red-500/20 text-red-400 border border-red-500/30">-${discount}%</span>` : ''}
      </div>
      <!-- Info -->
      <div class="p-4">
        <div class="text-slate-500 text-xs mb-1">${p.category}</div>
        <h3 class="font-display font-700 text-white text-sm mb-2 leading-tight line-clamp-2 group-hover:text-cyan-400 transition-colors">
          ${p.name}
        </h3>
        <!-- Rating -->
        <div class="flex items-center gap-1.5 mb-3">
          <div class="flex">
            ${buildStars(p.rating)}
          </div>
          <span class="text-slate-500 text-xs">(${p.reviews})</span>
        </div>
        <!-- Price -->
        <div class="flex items-end justify-between">
          <div>
            <div class="font-display font-800 text-cyan-400 text-base">${formatPrice(p.price)}</div>
            ${p.originalPrice ? `<div class="text-slate-600 text-xs line-through">${formatPrice(p.originalPrice)}</div>` : ''}
          </div>
          <button onclick="event.stopPropagation(); addToCart(${p.id})"
                  class="p-2.5 rounded-xl bg-gradient-to-r from-cyan-500/20 to-indigo-500/20 border border-cyan-500/30 text-cyan-400 hover:from-cyan-500 hover:to-indigo-500 hover:text-white transition-all duration-300">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
              <path d="M12 5v14M5 12h14"/>
            </svg>
          </button>
        </div>
        <!-- Stock indicator -->
        <div class="mt-2 text-xs ${p.stock <= 5 ? 'text-red-400' : 'text-slate-600'}">
          ${p.stock <= 5 ? `⚠️ Sisa ${p.stock} item` : `✓ Stok tersedia`}
        </div>
      </div>
    </div>`;
}

/** Cache key terakhir untuk avoid re-render identik */
let _lastRenderKey = '';

/** Render halaman produk dengan filter aktif */
function renderProductsPage() {
  const grid     = document.getElementById('products-grid');
  const noResult = document.getElementById('no-results');
  if (!grid) return;

  let filtered = [...STATE.products];

  // Filter: search
  if (FILTER.search) {
    const q = FILTER.search.toLowerCase();
    filtered = filtered.filter(p =>
      p.name.toLowerCase().includes(q) ||
      p.category.toLowerCase().includes(q)
    );
  }

  // Filter: category
  if (FILTER.category !== 'all') {
    filtered = filtered.filter(p => p.category === FILTER.category);
  }

  // Filter: price
  filtered = filtered.filter(p => p.price <= FILTER.maxPrice);

  // Sort
  switch (FILTER.sort) {
    case 'price-asc':  filtered.sort((a,b) => a.price - b.price); break;
    case 'price-desc': filtered.sort((a,b) => b.price - a.price); break;
    case 'rating':     filtered.sort((a,b) => b.rating - a.rating); break;
    case 'name':       filtered.sort((a,b) => a.name.localeCompare(b.name)); break;
  }

  // Buat cache key — skip re-render jika hasil identik (e.g. slider digeser ke nilai sama)
  const renderKey = filtered.map(p => p.id).join(',') + '|' + FILTER.sort;
  const isSameResult = renderKey === _lastRenderKey;

  // Update label count (selalu update)
  const label = document.getElementById('product-count-label');
  if (label) label.textContent = `Menampilkan ${filtered.length} produk`;

  // Sync sidebar filter inputs (hanya nilai, tidak rebuild DOM)
  const searchInput = document.getElementById('search-input');
  const priceRange  = document.getElementById('price-range');
  const sortSelect  = document.getElementById('sort-select');
  if (searchInput && document.activeElement !== searchInput) searchInput.value = FILTER.search;
  if (priceRange)  priceRange.value = FILTER.maxPrice;
  if (sortSelect)  sortSelect.value = FILTER.sort;

  // Update price label tanpa trigger renderProductsPage lagi
  const labelEl = document.getElementById('price-label');
  if (labelEl) labelEl.textContent = FILTER.maxPrice >= 35000000 ? 'Semua' : formatPrice(FILTER.maxPrice);

  if (filtered.length === 0) {
    grid.innerHTML = '';
    noResult.classList.remove('hidden');
    _lastRenderKey = renderKey;
    return;
  }

  noResult.classList.add('hidden');

  // Skip full innerHTML rebuild jika hasilnya sama
  if (!isSameResult) {
    // Gunakan satu string join — lebih cepat dari array append ke DOM satu per satu
    grid.innerHTML = filtered.map(p => buildProductCard(p)).join('');
    _lastRenderKey = renderKey;
  }

  // Selalu render category filter (ringan)
  renderCategoryFilter();
}

/** Render tombol filter kategori di sidebar produk */
function renderCategoryFilter() {
  const categories = ['all', ...new Set(STATE.products.map(p => p.category))];
  const el = document.getElementById('category-filter');
  if (!el) return;
  el.innerHTML = categories.map(cat => {
    const isActive = FILTER.category === cat;
    return `
      <button onclick="setCategoryFilter('${cat}')"
              class="text-left px-3 py-2 rounded-lg text-sm transition-all ${
                isActive
                  ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }">
        ${cat === 'all' ? 'Semua Kategori' : cat}
      </button>`;
  }).join('');
}

/** Render halaman cart */
function renderCartPage() {
  const container = document.getElementById('cart-items-container');
  const emptyEl   = document.getElementById('cart-empty');
  const countEl   = document.getElementById('cart-item-count');
  const subtotalEl= document.getElementById('cart-subtotal');
  const totalEl   = document.getElementById('cart-total-price');
  if (!container) return;

  if (STATE.cart.length === 0) {
    container.innerHTML = '';
    emptyEl.classList.remove('hidden');
  } else {
    emptyEl.classList.add('hidden');
    container.innerHTML = STATE.cart.map(item => {
      const p = STATE.products.find(prod => prod.id === item.id);
      if (!p) return '';
      return `
        <div class="product-card rounded-2xl p-4 flex gap-4 mb-4 items-start">
          <img src="${p.image}" alt="${p.name}"
               class="w-20 h-20 object-cover rounded-xl flex-shrink-0"/>
          <div class="flex-1 min-w-0">
            <div class="text-slate-500 text-xs mb-0.5">${p.category}</div>
            <h4 class="font-display font-700 text-white text-sm leading-tight mb-1 truncate">${p.name}</h4>
            <div class="text-cyan-400 font-display font-800 text-sm">${formatPrice(p.price)}</div>
          </div>
          <div class="flex flex-col items-end gap-2 flex-shrink-0">
            <!-- Quantity control -->
            <div class="flex items-center gap-2 bg-dark-700 rounded-xl border border-slate-700 overflow-hidden">
              <button onclick="updateCartQty(${p.id}, -1)"
                      class="px-3 py-1.5 text-slate-400 hover:text-white hover:bg-slate-700 transition-colors text-sm">−</button>
              <span class="text-white font-display font-700 text-sm min-w-[1.5rem] text-center">${item.quantity}</span>
              <button onclick="updateCartQty(${p.id}, 1)"
                      class="px-3 py-1.5 text-slate-400 hover:text-white hover:bg-slate-700 transition-colors text-sm">+</button>
            </div>
            <!-- Subtotal -->
            <div class="text-slate-400 text-xs">${formatPrice(p.price * item.quantity)}</div>
            <!-- Remove -->
            <button onclick="removeFromCart(${p.id})"
                    class="text-slate-600 hover:text-red-400 transition-colors text-xs flex items-center gap-1">
              <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M3 6h18M19 6l-1 14H6L5 6M10 11v6M14 11v6M9 6V4h6v2"/></svg>
              Hapus
            </button>
          </div>
        </div>`;
    }).join('');
  }

  const total = getCartTotal();
  const count = getCartItemCount();
  if (countEl)   countEl.textContent   = count;
  if (subtotalEl)subtotalEl.textContent= formatPrice(total);
  if (totalEl)   totalEl.textContent   = formatPrice(total);
  updateCartBadge();
}

/** Render halaman checkout — preview item & total */
function renderCheckoutPage() {
  const itemsEl = document.getElementById('co-items');
  const totalEl = document.getElementById('co-total');
  if (!itemsEl) return;

  itemsEl.innerHTML = STATE.cart.map(item => {
    const p = STATE.products.find(prod => prod.id === item.id);
    if (!p) return '';
    return `
      <div class="flex gap-3 items-center">
        <img src="${p.image}" class="w-10 h-10 rounded-lg object-cover flex-shrink-0"/>
        <div class="flex-1 min-w-0">
          <div class="text-white text-xs font-medium truncate">${p.name}</div>
          <div class="text-slate-500 text-xs">x${item.quantity}</div>
        </div>
        <div class="text-cyan-400 text-xs font-display font-700 flex-shrink-0">${formatPrice(p.price * item.quantity)}</div>
      </div>`;
  }).join('');

  if (totalEl) totalEl.textContent = formatPrice(getCartTotal());

  // Pre-fill nama dari session
  if (STATE.session) {
    const coName = document.getElementById('co-name');
    if (coName && !coName.value) coName.value = STATE.session.name;
  }
}

/** Render halaman riwayat order */
function renderHistoryPage() {
  const container = document.getElementById('history-container');
  const emptyEl   = document.getElementById('history-empty');
  if (!container) return;

  if (!STATE.session) {
    container.innerHTML = `
      <div class="text-center py-16 bg-dark-800 rounded-2xl border border-slate-800">
        <p class="font-display text-xl text-slate-400 mb-4">Anda belum login</p>
        <button onclick="showPage('auth')" class="px-6 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-500 text-white font-display font-700 text-sm">
          Login Sekarang
        </button>
      </div>`;
    emptyEl.classList.add('hidden');
    return;
  }

  if (STATE.orders.length === 0) {
    container.innerHTML = '';
    emptyEl.classList.remove('hidden');
    return;
  }

  emptyEl.classList.add('hidden');
  container.innerHTML = STATE.orders.map(order => {
    const date = new Date(order.createdAt).toLocaleDateString('id-ID', {
      year: 'numeric', month: 'long', day: 'numeric',
      hour: '2-digit', minute: '2-digit'
    });
    const statusColors = {
      'Diproses'  : 'bg-amber-500/20 text-amber-400 border-amber-500/30',
      'Dikirim'   : 'bg-blue-500/20 text-blue-400 border-blue-500/30',
      'Selesai'   : 'bg-green-500/20 text-green-400 border-green-500/30',
    };
    return `
      <div class="bg-dark-800 rounded-2xl border border-slate-800 p-6 mb-4 hover:border-cyan-500/20 transition-colors">
        <!-- Header -->
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <div>
            <div class="font-display font-800 text-cyan-400 text-base">${order.txId}</div>
            <div class="text-slate-500 text-sm mt-0.5">${date}</div>
          </div>
          <div class="flex items-center gap-3">
            <span class="badge px-3 py-1.5 rounded-full border ${statusColors[order.status] || statusColors['Diproses']}">${order.status}</span>
            <span class="font-display font-800 text-white text-base">${formatPrice(order.total)}</span>
          </div>
        </div>
        <!-- Items -->
        <div class="flex flex-col gap-2 mb-4">
          ${order.items.map(item => `
            <div class="flex gap-3 items-center">
              <img src="${item.image}" class="w-10 h-10 rounded-lg object-cover flex-shrink-0"/>
              <div class="flex-1 min-w-0">
                <div class="text-white text-sm font-medium truncate">${item.name}</div>
                <div class="text-slate-500 text-xs">x${item.quantity} · ${formatPrice(item.price)}</div>
              </div>
              <div class="text-slate-400 text-sm flex-shrink-0">${formatPrice(item.price * item.quantity)}</div>
            </div>
          `).join('')}
        </div>
        <!-- Shipping Info -->
        <div class="bg-dark-700 rounded-xl p-3 border border-slate-700/50 text-sm">
          <div class="text-slate-500 text-xs uppercase tracking-widest mb-1">Pengiriman ke</div>
          <div class="text-slate-300">${order.shipping.name} · ${order.shipping.phone}</div>
          <div class="text-slate-500 text-xs mt-0.5">${order.shipping.address}, ${order.shipping.city} ${order.shipping.postal}</div>
          <div class="text-slate-500 text-xs mt-0.5">Pembayaran: ${order.payment}</div>
        </div>
      </div>`;
  }).join('');
}

// ================================================
// SECTION 8: PRODUCT DETAIL MODAL
// ================================================

/**
 * Membuka modal detail produk.
 * @param {number} productId
 */
function openProductModal(productId) {
  const p = STATE.products.find(prod => prod.id === productId);
  if (!p) return;

  const modal   = document.getElementById('modal-product');
  const content = document.getElementById('modal-content');
  const discount = p.originalPrice ? Math.round((1 - p.price / p.originalPrice) * 100) : 0;

  content.innerHTML = `
    <div class="relative">
      <!-- Header image -->
      <div class="relative h-56 sm:h-72 overflow-hidden rounded-t-3xl bg-dark-700">
        <img src="${p.image}" alt="${p.name}" class="w-full h-full object-cover"/>
        <button onclick="closeModal()" class="absolute top-4 right-4 w-9 h-9 rounded-xl bg-dark-900/80 backdrop-blur-sm border border-slate-700 flex items-center justify-center text-slate-400 hover:text-white transition-colors">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M18 6L6 18M6 6l12 12"/></svg>
        </button>
        ${discount > 0 ? `<span class="absolute top-4 left-4 badge px-3 py-1.5 rounded-full bg-red-500/20 text-red-400 border border-red-500/30">-${discount}%</span>` : ''}
      </div>
      <!-- Body -->
      <div class="p-6">
        <div class="flex flex-col sm:flex-row sm:items-start justify-between gap-3 mb-4">
          <div>
            <div class="text-slate-500 text-xs mb-1">${p.category}</div>
            <h2 class="font-display font-800 text-white text-xl leading-tight">${p.name}</h2>
            <!-- Rating -->
            <div class="flex items-center gap-2 mt-2">
              <div class="flex">${buildStars(p.rating)}</div>
              <span class="text-slate-400 text-sm">${p.rating} (${p.reviews} ulasan)</span>
            </div>
          </div>
          <div class="text-right flex-shrink-0">
            <div class="font-display font-800 text-cyan-400 text-2xl">${formatPrice(p.price)}</div>
            ${p.originalPrice ? `<div class="text-slate-600 text-sm line-through">${formatPrice(p.originalPrice)}</div>` : ''}
          </div>
        </div>
        <p class="text-slate-400 text-sm leading-relaxed mb-5">${p.description}</p>
        <!-- Specs -->
        <div class="mb-5">
          <div class="text-slate-400 text-xs uppercase tracking-widest mb-3">Spesifikasi</div>
          <div class="grid grid-cols-2 gap-2">
            ${p.specs.map(s => `
              <div class="flex items-center gap-2 text-sm text-slate-300">
                <svg class="w-3.5 h-3.5 text-cyan-500 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20"><path d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"/></svg>
                ${s}
              </div>`).join('')}
          </div>
        </div>
        <!-- Stock & Action -->
        <div class="flex items-center justify-between">
          <div class="text-sm ${p.stock <= 5 ? 'text-red-400' : 'text-green-400'}">
            ${p.stock <= 5 ? `⚠️ Sisa ${p.stock} item` : `✓ Stok: ${p.stock} item`}
          </div>
          <button onclick="addToCart(${p.id}); closeModal()"
                  class="btn-glow px-6 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-500 text-white font-display font-700 text-sm tracking-wide transition-all duration-300 flex items-center gap-2">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M12 5v14M5 12h14"/></svg>
            Tambah ke Keranjang
          </button>
        </div>
      </div>
    </div>`;

  modal.classList.remove('hidden');
  document.body.style.overflow = 'hidden';
}

/** Menutup modal produk */
function closeModal() {
  document.getElementById('modal-product').classList.add('hidden');
  document.body.style.overflow = '';
}

// ================================================
// SECTION 9: FILTER HANDLERS
// ================================================

/** Set filter category dan render ulang produk */
function setCategoryFilter(cat) {
  FILTER.category = cat;
  _lastRenderKey = '';
  renderProductsPage();
}

/** Reset semua filter ke default */
function resetFilters() {
  FILTER = { search: '', category: 'all', maxPrice: 35000000, sort: 'default' };
  _lastRenderKey = '';
  renderProductsPage();
}

/** Update label harga dari slider — hanya dipanggil langsung dari slider oninput */
function updatePriceLabel(val) {
  FILTER.maxPrice = parseInt(val);
  const labelEl = document.getElementById('price-label');
  if (labelEl) labelEl.textContent = FILTER.maxPrice >= 35000000 ? 'Semua' : formatPrice(FILTER.maxPrice);
  // Invalidate render cache agar grid rebuild
  _lastRenderKey = '';
  renderProductsPage();
}

/**
 * Setup event listener untuk filter real-time.
 * Guard flag mencegah listener menumpuk saat halaman dikunjungi berulang kali.
 */
let _filterListenersReady = false;
function setupFilterListeners() {
  if (_filterListenersReady) return; // Sudah terpasang, skip
  _filterListenersReady = true;

  const searchInput = document.getElementById('search-input');
  const sortSelect  = document.getElementById('sort-select');

  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      FILTER.search = e.target.value;
      _lastRenderKey = '';
      renderProductsPage();
    });
  }
  if (sortSelect) {
    sortSelect.addEventListener('change', (e) => {
      FILTER.sort = e.target.value;
      _lastRenderKey = '';
      renderProductsPage();
    });
  }
}

// ================================================
// SECTION 10: PAGE NAVIGATION (SPA)
// ================================================

const ALL_PAGES = ['home', 'products', 'auth', 'cart', 'checkout', 'success', 'history'];

/**
 * Menampilkan satu halaman dan menyembunyikan yang lain.
 * @param {string} pageId - Nama halaman tanpa prefix "page-"
 */
function showPage(pageId) {
  ALL_PAGES.forEach(id => {
    const el = document.getElementById(`page-${id}`);
    if (el) el.classList.add('hidden');
  });

  const target = document.getElementById(`page-${pageId}`);
  if (target) target.classList.remove('hidden');

  // Scroll ke atas — instant, bukan smooth agar navigasi tidak terasa lag
  window.scrollTo(0, 0);

  // Lifecycle hooks per halaman
  switch (pageId) {
    case 'products':
      renderProductsPage();
      setupFilterListeners(); // Guard flag mencegah duplikat, tidak perlu setTimeout
      break;
    case 'cart':
      renderCartPage();
      break;
    case 'checkout':
      // Guard: jika cart kosong, redirect ke cart
      if (STATE.cart.length === 0) {
        showToast('Keranjang Anda kosong!', 'warning');
        showPage('cart');
        return;
      }
      renderCheckoutPage();
      break;
    case 'history':
      renderHistoryPage();
      break;
    case 'auth':
      // Reset form error
      ['login-error','reg-error'].forEach(id => hideError(document.getElementById(id)));
      break;
  }
}

// ================================================
// SECTION 11: AUTH TAB SWITCHER
// ================================================

/**
 * Beralih antara tab login dan register.
 * @param {string} tab - 'login' | 'register'
 */
function switchAuthTab(tab) {
  const loginTab  = document.getElementById('tab-login');
  const regTab    = document.getElementById('tab-register');
  const loginForm = document.getElementById('form-login');
  const regForm   = document.getElementById('form-register');

  if (tab === 'login') {
    loginTab.classList.add('bg-gradient-to-r', 'from-cyan-500', 'to-indigo-500', 'text-white');
    loginTab.classList.remove('text-slate-500');
    regTab.classList.remove('bg-gradient-to-r', 'from-cyan-500', 'to-indigo-500', 'text-white');
    regTab.classList.add('text-slate-500');
    loginForm.classList.remove('hidden');
    regForm.classList.add('hidden');
  } else {
    regTab.classList.add('bg-gradient-to-r', 'from-cyan-500', 'to-indigo-500', 'text-white');
    regTab.classList.remove('text-slate-500');
    loginTab.classList.remove('bg-gradient-to-r', 'from-cyan-500', 'to-indigo-500', 'text-white');
    loginTab.classList.add('text-slate-500');
    regForm.classList.remove('hidden');
    loginForm.classList.add('hidden');
  }
}

// ================================================
// SECTION 12: PAYMENT RADIO UI
// ================================================

/** Setup interaksi visual radio button pembayaran */
function setupPaymentRadio() {
  document.addEventListener('change', (e) => {
    if (e.target.name === 'payment') {
      document.querySelectorAll('.payment-option div').forEach(el => {
        el.className = 'py-2.5 px-3 rounded-xl border border-slate-700 text-center text-xs font-medium text-slate-400 hover:border-cyan-500/30';
      });
      const selected = e.target.closest('.payment-option').querySelector('div');
      selected.className = 'py-2.5 px-3 rounded-xl border border-cyan-500/50 bg-cyan-500/10 text-center text-xs font-medium text-cyan-400';
    }
  });
}

// ================================================
// SECTION 13: MOBILE MENU
// ================================================

function setupMobileMenu() {
  const btn  = document.getElementById('mobile-menu-btn');
  const menu = document.getElementById('mobile-menu');
  if (btn && menu) {
    btn.addEventListener('click', () => menu.classList.toggle('hidden'));
  }
}

function closeMobileMenu() {
  const menu = document.getElementById('mobile-menu');
  if (menu) menu.classList.add('hidden');
}

// ================================================
// SECTION 14: UTILITIES
// ================================================

/**
 * Format angka ke format Rupiah.
 * @param {number} num
 */
function formatPrice(num) {
  return 'Rp ' + num.toLocaleString('id-ID');
}

/**
 * Membuat HTML bintang rating menggunakan karakter Unicode.
 * Jauh lebih ringan dari 5x SVG element per produk.
 * @param {number} rating - Angka 0–5
 */
function buildStars(rating) {
  const filled = Math.round(rating);
  return Array.from({ length: 5 }, (_, i) =>
    `<span style="color:${i < filled ? '#f59e0b' : '#334155'};font-size:13px;line-height:1">★</span>`
  ).join('');
}

/** Tampilkan pesan error di element */
function showError(el, msg) {
  if (!el) return;
  el.textContent = msg;
  el.classList.remove('hidden');
}

/** Sembunyikan pesan error */
function hideError(el) {
  if (!el) return;
  el.classList.add('hidden');
}

/**
 * Tampilkan toast notification.
 * Menggunakan inline style agar warna tidak bergantung pada Tailwind purge/JIT CDN.
 * @param {string} msg - Pesan yang ditampilkan
 * @param {'success'|'error'|'warning'|'info'} type
 */
function showToast(msg, type = 'info') {
  // Inline style — aman dari Tailwind CDN yang tidak mengenali class dinamis
  const borderColors = {
    success : '#4ade80',
    error   : '#f87171',
    warning : '#fbbf24',
    info    : '#22d3ee',
  };
  const icons = {
    success: '✅', error: '❌', warning: '⚠️', info: 'ℹ️',
  };

  const container = document.getElementById('toast-container');
  const toast = document.createElement('div');
  toast.className = 'toast pointer-events-auto flex items-center gap-3 px-4 py-3 rounded-xl shadow-xl max-w-sm';
  toast.style.cssText = `
    background: #0a0f1e;
    border: 1px solid #1e293b;
    border-left: 3px solid ${borderColors[type] || borderColors.info};
  `;
  toast.innerHTML = `
    <span style="font-size:16px;flex-shrink:0">${icons[type]}</span>
    <span style="font-size:14px;color:#cbd5e1;font-weight:500;line-height:1.4">${msg}</span>`;

  container.appendChild(toast);

  // Auto remove setelah 3 detik dengan fade out
  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateY(10px)';
    toast.style.transition = 'all 0.3s ease';
    setTimeout(() => toast.remove(), 300);
  }, 3000);
}

// ================================================
// SECTION 15: EVENT LISTENERS
// ================================================

// Tutup modal saat klik di luar konten
document.getElementById('modal-product').addEventListener('click', function(e) {
  if (e.target === this) closeModal();
});

// Tutup modal dengan Escape key
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') closeModal();
});

// ================================================
// FUNGSI TOGGLE PASSWORD (Show/Hide Password)
// ================================================

/**
 * Fungsi untuk menampilkan/menyembunyikan password
 * @param {string} inputId - ID dari input field password
 * @param {HTMLElement} button - Tombol yang diklik
 */
function togglePassword(inputId, button) {
  const input = document.getElementById(inputId);
  const icon = button.querySelector('i');
  
  if (input.type === 'password') {
    input.type = 'text';
    icon.classList.remove('fa-eye-slash');
    icon.classList.add('fa-eye');
  } else {
    input.type = 'password';
    icon.classList.remove('fa-eye');
    icon.classList.add('fa-eye-slash');
  }
}
// ================================================
// SECTION 16: BOOTSTRAP
// ================================================

// Jalankan aplikasi saat DOM siap
document.addEventListener('DOMContentLoaded', init);