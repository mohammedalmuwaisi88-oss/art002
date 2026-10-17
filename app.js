// ===== 1. إعدادات سوبابيز (Supabase Config) =====
const SUPABASE_URL = 'YOUR_SUPABASE_URL_HERE';
const SUPABASE_ANON_KEY = 'YOUR_SUPABASE_ANON_KEY_HERE';

// تهيئة العميل عند توفر المفاتيح
let supabase = null;
if (typeof supabase !== 'undefined' && SUPABASE_URL !== 'YOUR_SUPABASE_URL_HERE') {
  supabase = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
}

// ===== 2. بيانات مؤقتة افتراضية (في حال عدم الربط الفوري) =====
const mockProducts = [
  { id: '1', title: 'شروق ذهبي تجريدي', price: 45.000, category: 'abstract', image: 'https://images.unsplash.com/photo-1579783902614-a3fb3927b675?auto=format&fit=crop&w=600&q=80' },
  { id: '2', title: 'سكون الطبيعة', price: 38.000, category: 'nature', image: 'https://images.unsplash.com/photo-1541701494587-cb58502866ab?auto=format&fit=crop&w=600&q=80' },
  { id: '3', title: 'سيمفونية الحروف', price: 55.000, category: 'calligraphy', image: 'https://images.unsplash.com/photo-1582562124811-c09040d0a901?auto=format&fit=crop&w=600&q=80' },
  { id: '4', title: 'ظلال عصرية', price: 50.000, category: 'modern', image: 'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?auto=format&fit=crop&w=600&q=80' }
];

let cart = [];

// ===== 3. عناصر الواجهة DOM Elements =====
const productsGrid = document.getElementById('productsGrid');
const cartBtn = document.getElementById('cartBtn');
const closeCartBtn = document.getElementById('closeCart');
const cartSidebar = document.getElementById('cartSidebar');
const overlay = document.getElementById('overlay');
const cartItemsContainer = document.getElementById('cartItems');
const cartTotal = document.getElementById('cartTotal');
const cartBadge = document.getElementById('cartBadge');
const customSizeSelect = document.getElementById('customSize');
const calculatedPrice = document.getElementById('calculatedPrice');

// ===== 4. تحميل المنتجات وعرضها =====
async function fetchProducts() {
  let products = [];
  if (supabase) {
    const { data, error } = await supabase.from('products').select('*');
    if (!error && data.length > 0) {
      products = data;
    } else {
      products = mockProducts;
    }
  } else {
    products = mockProducts;
  }
  renderProducts(products);
}

function renderProducts(items) {
  if (!productsGrid) return;
  productsGrid.innerHTML = '';
  items.forEach(product => {
    const card = document.createElement('div');
    card.className = 'product-card';
    card.innerHTML = `
      <img src="${product.image}" alt="${product.title}" class="product-img">
      <div class="product-info">
        <h3 class="product-title">${product.title}</h3>
        <div class="product-price">${product.price.toFixed(3)} ر.ع</div>
        <button class="btn btn-gold btn-block" onclick="addToCart('${product.id}', '${product.title}', ${product.price})">إضافة للسلة</button>
      </div>
    `;
    productsGrid.appendChild(card);
  });
}

// ===== 5. إدارة سلة التسوق =====
function addToCart(id, title, price) {
  const existing = cart.find(item => item.id === id);
  if (existing) {
    existing.qty += 1;
  } else {
    cart.push({ id, title, price, qty: 1 });
  }
  updateCart();
  openCart();
}

function removeFromCart(id) {
  cart = cart.filter(item => item.id !== id);
  updateCart();
}

function updateCart() {
  cartItemsContainer.innerHTML = '';
  let total = 0;
  let count = 0;

  if (cart.length === 0) {
    cartItemsContainer.innerHTML = '<p class="empty-cart-msg">السلة فارغة حالياً</p>';
  } else {
    cart.forEach(item => {
      total += item.price * item.qty;
      count += item.qty;
      const el = document.createElement('div');
      el.className = 'cart-item';
      el.innerHTML = `
        <div>
          <h4>${item.title}</h4>
          <small>${item.qty} × ${item.price.toFixed(3)} ر.ع</small>
        </div>
        <button onclick="removeFromCart('${item.id}')" style="background:none; border:none; color:red; cursor:pointer;">&times;</button>
      `;
      cartItemsContainer.appendChild(el);
    });
  }

  cartTotal.innerText = total.toFixed(3);
  cartBadge.innerText = count;
}

function openCart() {
  cartSidebar.classList.add('open');
  overlay.classList.add('open');
}

function closeCart() {
  cartSidebar.classList.remove('open');
  overlay.classList.remove('open');
}

// ===== 6. حساب سعر اللوحة الخاصة =====
if (customSizeSelect) {
  customSizeSelect.addEventListener('change', (e) => {
    const val = e.target.value;
    let price = 40.000;
    if (val === 'S') price = 25.000;
    if (val === 'L') price = 60.000;
    calculatedPrice.innerText = price.toFixed(3);
  });
}

// ===== 7. ربط الأحداث (Event Listeners) =====
document.addEventListener('DOMContentLoaded', () => {
  fetchProducts();

  if (cartBtn) cartBtn.addEventListener('click', openCart);
  if (closeCartBtn) closeCartBtn.addEventListener('click', closeCart);
  if (overlay) overlay.addEventListener('click', closeCart);

  // التصفية والبحث
  const searchInput = document.getElementById('searchInput');
  const categoryFilter = document.getElementById('categoryFilter');

  if (searchInput) {
    searchInput.addEventListener('input', () => {
      const query = searchInput.value.toLowerCase();
      const filtered = mockProducts.filter(p => p.title.toLowerCase().includes(query));
      renderProducts(filtered);
    });
  }

  if (categoryFilter) {
    categoryFilter.addEventListener('change', () => {
      const cat = categoryFilter.value;
      if (cat === 'all') {
        renderProducts(mockProducts);
      } else {
        const filtered = mockProducts.filter(p => p.category === cat);
        renderProducts(filtered);
      }
    });
  }
});
