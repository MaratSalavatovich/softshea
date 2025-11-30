// Простой каталог: одна карточка масла ши (можно расширить позже)
const STORAGE_KEY = "shop_cart";

const products = [
  {
    id: 1,
    title: "Масло ши, 30 мл",
    subtitle: "Пробный объём для знакомства и путешествий",
    price: 690,
    volume: "Баночка 30 мл",
    image: "img/shea-30.png"
  },
  {
    id: 2,
    title: "Масло ши, 100 мл",
    subtitle: "Базовый объём для ежедневного ухода",
    price: 1590,
    volume: "Баночка 100 мл"
  },
  {
    id: 3,
    title: "Масло ши, 200 мл",
    subtitle: "Выгодный объём для всей семьи",
    price: 2490,
    volume: "Баночка 200 мл"
  }
];

let cart = [];

function loadCart() {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    if (!data) return [];
    const parsed = JSON.parse(data);
    if (!Array.isArray(parsed)) return [];
    return parsed;
  } catch (e) {
    console.error("Ошибка чтения корзины:", e);
    return [];
  }
}

function saveCart() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(cart));
  } catch (e) {
    console.error("Ошибка сохранения корзины:", e);
  }
}

function renderProducts() {
  const productsContainer = document.getElementById("products");
  productsContainer.innerHTML = "";

  products.forEach((product) => {
    const card = document.createElement("div");
    card.className = "product-card";

    card.innerHTML = `
  <div class="product-image">
    <img src="${product.image}" alt="${product.title}" />
  </div>
  <div class="product-title">${product.title}</div>
  <div class="product-subtitle">${product.subtitle}</div>
  <div class="product-price">${product.price} ₽</div>
  <div class="product-volume">${product.volume}</div>
  <button class="btn btn-primary" data-id="${product.id}">Добавить в корзину</button>
`;

    productsContainer.appendChild(card);
  });
}

function addToCart(productId) {
  const item = cart.find((p) => p.id === productId);
  if (item) {
    item.qty += 1;
  } else {
    const product = products.find((p) => p.id === productId);
    if (!product) return;
    cart.push({ ...product, qty: 1 });
  }
  saveCart();
  updateCartUI();
}

function removeFromCart(productId) {
  cart = cart.filter((item) => item.id !== productId);
  saveCart();
  updateCartUI();
}

function updateCartUI() {
  const cartCount = document.getElementById("cartCount");
  const cartItems = document.getElementById("cartItems");
  const cartTotal = document.getElementById("cartTotal");

  const totalCount = cart.reduce((sum, item) => sum + item.qty, 0);
  const totalPrice = cart.reduce((sum, item) => sum + item.qty * item.price, 0);

  if (cartCount) cartCount.textContent = totalCount;
  if (cartTotal) cartTotal.textContent = totalPrice;

  if (!cartItems) return;

  cartItems.innerHTML = "";

  if (cart.length === 0) {
    cartItems.innerHTML = "<p>Корзина пуста</p>";
    return;
  }

  cart.forEach((item) => {
    const row = document.createElement("div");
    row.className = "cart-item";
    row.innerHTML = `
      <span>${item.title}</span>
      <span>${item.qty} шт.</span>
      <span>${item.price * item.qty} ₽</span>
      <button class="close-btn" data-remove="${item.id}">✕</button>
    `;
    cartItems.appendChild(row);
  });
}

function initCartPanel() {
  const cartBtn = document.getElementById("cartBtn");
  const cartPanel = document.getElementById("cartPanel");
  const closeCart = document.getElementById("closeCart");

  if (!cartBtn || !cartPanel || !closeCart) return;

  cartBtn.addEventListener("click", () => {
    cartPanel.classList.add("open");
  });

  closeCart.addEventListener("click", () => {
    cartPanel.classList.remove("open");
  });

  cartPanel.addEventListener("click", (e) => {
    if (e.target === cartPanel) {
      cartPanel.classList.remove("open");
    }
  });
}

function initEventHandlers() {
  const productsContainer = document.getElementById("products");
  const cartItems = document.getElementById("cartItems");

  if (productsContainer) {
    productsContainer.addEventListener("click", (e) => {
      const btn = e.target.closest("button[data-id]");
      if (!btn) return;
      const id = Number(btn.getAttribute("data-id"));
      addToCart(id);
    });
  }

  if (cartItems) {
    cartItems.addEventListener("click", (e) => {
      const btn = e.target.closest("button[data-remove]");
      if (!btn) return;
      const id = Number(btn.getAttribute("data-remove"));
      removeFromCart(id);
    });
  }
}

document.addEventListener("DOMContentLoaded", () => {
  cart = loadCart();
  renderProducts();
  initCartPanel();
  initEventHandlers();
  updateCartUI();
});
