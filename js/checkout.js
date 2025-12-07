const STORAGE_KEY = "shop_cart";

function trackEvent(name, params = {}) {
  // GA4
  if (typeof gtag === "function") {
    gtag("event", name, params);
  }
  // Яндекс.Метрика (используем YM_ID из window)
  if (typeof ym === "function" && typeof window.YM_ID === "number") {
    ym(window.YM_ID, "reachGoal", name.toUpperCase());
  }
}

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

let cart = [];

function renderOrderSummary() {
  const orderSummary = document.getElementById("orderSummary");
  const emptyMessage = document.getElementById("emptyMessage");
  const checkoutGrid = document.getElementById("checkoutGrid");

  if (!orderSummary || !emptyMessage || !checkoutGrid) return;

  if (cart.length === 0) {
    emptyMessage.style.display = "block";
    checkoutGrid.style.display = "none";
    return;
  }

  emptyMessage.style.display = "none";
  checkoutGrid.style.display = "grid";

  let totalCount = 0;
  let totalPrice = 0;

  cart.forEach((item) => {
    totalCount += item.qty;
    totalPrice += item.qty * item.price;
  });

  let html = `
    <table class="order-table">
      <thead>
        <tr>
          <th>Товар</th>
          <th>Кол-во</th>
          <th>Сумма</th>
        </tr>
      </thead>
      <tbody>
  `;

  cart.forEach((item) => {
    html += `
      <tr>
        <td>${item.title}</td>
        <td>${item.qty}</td>
        <td>${item.qty * item.price} ₽</td>
      </tr>
    `;
  });

  html += `
      </tbody>
      <tfoot>
        <tr>
          <td><strong>Итого</strong></td>
          <td>${totalCount}</td>
          <td><strong>${totalPrice} ₽</strong></td>
        </tr>
      </tfoot>
    </table>
  `;

  orderSummary.innerHTML = html;
}

function initCheckoutForm() {
  const form = document.getElementById("checkoutForm");
  const messageBox = document.getElementById("formMessage");

  if (!form || !messageBox) return;

  form.addEventListener("submit", (e) => {
    e.preventDefault();

    const formData = new FormData(form);
    const name = formData.get("name")?.toString().trim();
    const phone = formData.get("phone")?.toString().trim();
    const channel = formData.get("orderChannel") || "site";
    const contactHandle = formData.get("contactHandle");

    if (!name || !phone) {
      messageBox.textContent = "Пожалуйста, заполните обязательные поля (Имя и Телефон).";
      messageBox.className = "form-message form-message_error";
      return;
    }
    // ---- PURCHASE TRACKING ----

    // 1. Считаем итоговую сумму заказа
    const totalPrice = cart.reduce((sum, item) => sum + item.qty * item.price, 0);

    // 2. Формируем структуру товаров (как требует GA4)
    const itemsForAnalytics = cart.map(item => ({
        item_id: item.id,
        item_name: item.title,
        price: item.price,
        quantity: item.qty
    }));

    // 3. Отправляем событие в GA4
    trackEvent("purchase", {
        currency: "RUB",
        value: totalPrice,
        items: itemsForAnalytics,
        channel: channel,        // сайт / Telegram / VK / Instagram
        customer_name: name,     // можно удалить, если не хочешь отправлять имя
    });

    // 4. Отправляем цель в Яндекс.Метрику
    if (typeof ym === "function" && typeof window.YM_ID === "number") {
        ym(window.YM_ID, "reachGoal", "PURCHASE");
    }

    // ---- END PURCHASE ----

    console.log("Заказ:", {
      cart,
      name,
      phone,
      email: formData.get("email"),
      contactHandle,
      address: formData.get("address"),
      comment: formData.get("comment"),
      channel
    });

    localStorage.removeItem(STORAGE_KEY);
    cart = [];

    messageBox.textContent = "Спасибо! Ваш заказ отправлен. Мы свяжемся с вами в ближайшее время.";
    messageBox.className = "form-message form-message_success";

    form.reset();
  });
}

document.addEventListener("DOMContentLoaded", () => {
  cart = loadCart();
  renderOrderSummary();
  initCheckoutForm();
});
