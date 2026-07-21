// ============================
// Artora - Shared Utilities
// ============================

// ---------- Toast Notification System ----------
function showToast(message, type = "success", duration = 3000) {
  const existing = document.querySelector(".toast-container");
  if (!existing) {
    const container = document.createElement("div");
    container.className = "toast-container";
    container.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      z-index: 10000;
      display: flex;
      flex-direction: column;
      gap: 10px;
    `;
    document.body.appendChild(container);
  }

  const toast = document.createElement("div");
  toast.className = `toast toast-${type}`;
  const bgColor =
    type === "success"
      ? "#28a745"
      : type === "error"
        ? "#dc3545"
        : type === "warning"
          ? "#ffc107"
          : "#17a2b8";
  toast.style.cssText = `
    background: ${bgColor};
    color: white;
    padding: 14px 24px;
    border-radius: 8px;
    font-size: 15px;
    font-weight: 500;
    box-shadow: 0 4px 15px rgba(0,0,0,0.2);
    animation: slideInRight 0.3s ease;
    min-width: 250px;
    max-width: 400px;
    cursor: pointer;
  `;
  toast.textContent = message;

  document.querySelector(".toast-container").appendChild(toast);

  setTimeout(() => {
    toast.style.animation = "slideOutRight 0.3s ease";
    setTimeout(() => toast.remove(), 300);
  }, duration);

  toast.addEventListener("click", () => {
    toast.style.animation = "slideOutRight 0.3s ease";
    setTimeout(() => toast.remove(), 300);
  });
}

// Inject toast keyframes once
(function injectToastStyles() {
  if (!document.getElementById("toastStyles")) {
    const style = document.createElement("style");
    style.id = "toastStyles";
    style.textContent = `
      @keyframes slideInRight {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
      }
      @keyframes slideOutRight {
        from { transform: translateX(0); opacity: 1; }
        to { transform: translateX(100%); opacity: 0; }
      }
    `;
    document.head.appendChild(style);
  }
})();

// ---------- LocalStorage Helpers ----------
function getStorage(key, defaultValue = null) {
  try {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : defaultValue;
  } catch {
    return defaultValue;
  }
}

function setStorage(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch {
    return false;
  }
}

function removeStorage(key) {
  localStorage.removeItem(key);
}

// ---------- Currency Formatting ----------
function formatPrice(price) {
  if (typeof price === "string") {
    price = Number(price.replace(/[₹,]/g, ""));
  }
  return "₹" + price.toLocaleString("en-IN");
}

function parsePrice(price) {
  if (typeof price === "string") {
    return Number(price.replace(/[₹,]/g, ""));
  }
  return price;
}

// ---------- Auth Helpers ----------
function isLoggedIn() {
  return localStorage.getItem("loggedIn") === "true";
}

function getCurrentUser() {
  return getStorage("user");
}

// ---------- Cart Badge Update ----------
function updateCartBadge() {
  const items = getStorage("cartItems", []);
  let totalQty = 0;
  items.forEach((item) => {
    totalQty += item.quantity || 0;
  });
  const badge = document.getElementById("cartCount");
  if (badge) {
    badge.textContent = totalQty;
  }
}

// ---------- Navigation Bar Component ----------
function injectNavbar() {
  const header = document.createElement("header");
  const user = getCurrentUser();
  const loggedIn = isLoggedIn();

  // Detect if we're in pages/ subdirectory
  const isInPages = window.location.pathname.includes("/pages/");
  const p = isInPages ? "../" : "";

  header.innerHTML = `
    <h1>🎨 <a href="${p}index.html" style="text-decoration:none;color:inherit;">Artora</a></h1>
    <button class="hamburger" id="hamburgerBtn" aria-label="Toggle menu">
      <span></span><span></span><span></span>
    </button>
    <nav id="mainNav">
      <a href="${p}index.html">Home</a>
      <a href="${p}index.html#categories">Categories</a>
      <a href="${p}index.html#artists">Artists</a>
      <a href="${p}pages/cart.html" id="cartLink">
        🛒 Cart
        <span id="cartCount" class="cart-badge">0</span>
      </a>
      <a href="${p}pages/wishlist.html">❤️ Wishlist</a>
      <a href="${p}pages/orders.html">📦 My Orders</a>
      <a href="${p}pages/my-artworks.html">🎨 My Artworks</a>
      <button id="themeToggle" class="theme-toggle-btn" aria-label="Toggle dark mode">🌙</button>
      <span id="userSection">
        ${
          loggedIn && user
            ? `👋 ${user.name} <button id="logoutBtn" class="nav-logout-btn">Logout</button>`
            : `<a href="${p}pages/login.html">👤 Login</a>`
        }
      </span>
    </nav>
  `;

  header.style.cssText = `
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 20px 80px;
    background: var(--white);
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  `;

  // Insert at the very top of body
  document.body.insertBefore(header, document.body.firstChild);

  // Cart badge
  updateCartBadge();

  // Logout handler
  const logoutBtn = document.getElementById("logoutBtn");
  if (logoutBtn) {
    logoutBtn.addEventListener("click", function () {
      localStorage.removeItem("loggedIn");
      localStorage.removeItem("user");
      localStorage.removeItem("cartItems");
      localStorage.removeItem("wishlist");
      localStorage.removeItem("myOrders");
      localStorage.removeItem("checkoutSession");
      showToast("Logged out successfully");
      setTimeout(() => window.location.reload(), 500);
    });
  }

  // Hamburger menu toggle
  const hamburger = document.getElementById("hamburgerBtn");
  const nav = document.getElementById("mainNav");
  if (hamburger && nav) {
    hamburger.addEventListener("click", function () {
      nav.classList.toggle("nav-open");
      hamburger.classList.toggle("active");
    });
  }

  // Dark Mode Toggle
  const themeToggle = document.getElementById("themeToggle");
  if (themeToggle) {
    // Apply saved theme
    const savedTheme = localStorage.getItem("theme") || "light";
    if (savedTheme === "dark") {
      document.documentElement.setAttribute("data-theme", "dark");
      themeToggle.textContent = "☀️";
    }

    themeToggle.addEventListener("click", function () {
      const current = document.documentElement.getAttribute("data-theme");
      if (current === "dark") {
        document.documentElement.removeAttribute("data-theme");
        localStorage.setItem("theme", "light");
        themeToggle.textContent = "🌙";
      } else {
        document.documentElement.setAttribute("data-theme", "dark");
        localStorage.setItem("theme", "dark");
        themeToggle.textContent = "☀️";
      }
    });
  }
}

// ---------- Footer Component ----------
function injectFooter() {
  const footer = document.createElement("footer");
  footer.innerHTML = `
    <h3>Artora</h3>
    <p>Connecting Artists with Art Lovers.</p>
    <p>Email: support@artora.com</p>
    <p>Phone: +91 9876543210</p>
    <p>© ${new Date().getFullYear()} Artora. All Rights Reserved.</p>
  `;
  footer.style.cssText = `
    text-align: center;
    padding: 40px 20px;
    background: var(--white);
    color: var(--text-color);
    margin-top: 60px;
    border-top: 1px solid #eee;
    line-height: 2;
  `;
  document.body.appendChild(footer);
}

// ---------- Initialize (call on pages that need nav/footer) ----------
function initPage() {
  injectNavbar();
  injectFooter();
}

// Auto-init when script is loaded (but not on index.html which has its own header)
if (!window.location.pathname.endsWith("index.html") && !window.location.pathname.endsWith("/")) {
  initPage();
}
