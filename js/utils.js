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

// ---------- Image Path Normalization ----------
// Normalize image path for pages/ subdirectory: prepend ../ if path doesn't already start with ../
function normalizeImagePath(path) {
  if (!path) return "";
  if (path.startsWith("../") || path.startsWith("http://") || path.startsWith("https://") || path.startsWith("blob:")) {
    return path;
  }
  return "../" + path;
}

// ---------- HTML Escaping ----------
// Render user-controlled values as text and prevent attribute breakouts. Used at every
// DOM sink where user-authored data is interpolated into template HTML (AUD-004).
function escapeHtml(value) {
  return String(value == null ? "" : value).replace(/[&<>"']/g, function (c) {
    return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
  });
}

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
// Phase B: authentication is backend-authoritative. The server session (HttpOnly
// cookie) is the ONLY proof of login. localStorage.user / loggedIn are retained
// ONLY as a non-authoritative UI cache so the legacy demo still renders when the
// backend is offline. They may NEVER grant access by themselves — verifyAuth()
// reconciles the cache against the server and clears it on any server failure.
const _auth = { verified: false, user: null, checked: false };

function isLoggedIn() {
  // Cache is only trusted if this session has been verified against the backend.
  // Unverified cache (e.g. server unreachable) => unauthenticated (fail closed).
  if (!_auth.checked) return getStorage("loggedIn", "") === "true" || false;
  return _auth.verified && !!_auth.user;
}

function getCurrentUser() {
  if (_auth.verified) return _auth.user;
  return getStorage("user");
}

// Get the per-user storage key
function getUserDataKey() {
  const user = getCurrentUser();
  if (!user || !user.email) return null;
  return "userdata_" + user.email.toLowerCase();
}

// Reconcile the localStorage UI cache with the backend session.
// Fail-closed: any server error/401/network failure => unauthenticated cache.
// Called once per page load (bootstrapAuth) and after every auth-affecting
// action (login/logout).
function verifyAuthState(user) {
  _auth.checked = true;
  _auth.verified = !!user;
  _auth.user = user || null;
  if (!user) {
    // Backend says not authenticated — clear the legacy cache so it can never
    // grant access on its own.
    localStorage.removeItem("loggedIn");
    localStorage.removeItem("user");
  } else {
    // Mirror a safe UI-only cache (NOT an authority).
    localStorage.setItem("user", JSON.stringify(user));
    localStorage.setItem("loggedIn", "true");
  }
  return !!user;
}

// Ask the backend whether a session is active. Returns null on any failure
// (401 / 403 / 5xx / network error) so callers fail closed.
async function checkAuthSession() {
  try {
    const res = await apiFetch("/me");
    if (res.ok && res.body && res.body.user) return res.body.user;
  } catch (e) { /* noop — fail closed */ }
  return null;
}

// Phase B bootstrap: reconcile identity with the backend before any auth-
// dependent code runs. Must be awaited by pages that gate on login.
async function bootstrapAuth() {
  if (_auth.checked) return _auth.user;
  const user = await checkAuthSession();
  verifyAuthState(user);
  return user;
}

// ---------- Buy Now checkout-session safety (AUD-001) ----------
// While a temporary Buy Now checkout is active, the session "cartItems" holds ONLY the
// Buy Now item and "checkoutSession.originalCart" holds the user's real cart. The
// temporary cart must never overwrite the user's last-good persisted cart, and an
// abandoned checkout must restore that cart instead of leaking a stale session.
function isBuyNowCheckoutActive() {
  try {
    return !!localStorage.getItem("checkoutSession");
  } catch (e) {
    return false;
  }
}

// ---------- Save current user data to per-user storage ----------
function saveUserData() {
  const key = getUserDataKey();
  if (!key) return;

  // AUD-001: while a temporary Buy Now checkout is active, the session "cartItems"
  // contains only the Buy Now item, so carry the last-good persisted cart forward
  // untouched instead of overwriting it. Wishlist/orders/artworks save as usual.
  const buyNowActive = isBuyNowCheckoutActive();
  const previous = buyNowActive ? getStorage(key, {}) : null;
  const previousCart = (previous && previous.cartItems !== undefined) ? previous.cartItems : [];

  const userData = {
    cartItems: buyNowActive ? previousCart : getStorage("cartItems", []),
    wishlist: getStorage("wishlist", []),
    myOrders: getStorage("myOrders", []),
    artistArtworks: getStorage("artistArtworks", []),
  };

  localStorage.setItem(key, JSON.stringify(userData));
}

// ---------- Abandoned Buy Now checkout restore (AUD-001) ----------
// If a Buy Now checkout was left without placing the order, "checkoutSession" lingers in
// localStorage while the session "cartItems" still holds only the Buy Now item. On any
// later page (any page EXCEPT checkout.html itself — refreshing there must keep the Buy
// Now checkout intact) restore the original cart, drop the abandoned session, persist.
function restoreAbandonedBuyNow() {
  if (!isBuyNowCheckoutActive()) return false;
  if (window.location.pathname.indexOf("checkout.html") !== -1) return false;

  const session = getStorage("checkoutSession", null);
  if (!session || !Array.isArray(session.originalCart)) {
    // Malformed leftover session — nothing restorable; just clean it up.
    localStorage.removeItem("checkoutSession");
    return true;
  }

  setStorage("cartItems", session.originalCart);
  localStorage.removeItem("checkoutSession");
  saveUserData(); // session is gone now, so this persists the restored original cart
  updateCartBadge();
  return true;
}

// ---------- Logout: invalidate server session + clear local state ----------
async function logoutUser() {
  try { await apiFetch("/logout", { method: "POST" }); } catch (e) { /* noop */ }
  // Save user data before clearing the active session
  saveUserData();
  // Invalidate the authoritative cache AND clear the legacy UI cache
  verifyAuthState(null);
  localStorage.removeItem("cartItems");
  localStorage.removeItem("wishlist");
  localStorage.removeItem("myOrders");
  localStorage.removeItem("artistArtworks");
  localStorage.removeItem("checkoutSession");
  localStorage.removeItem("selectedArtwork");
  localStorage.removeItem("editIndex");

  showToast("Logged out successfully");
  setTimeout(() => window.location.reload(), 500);
}

// ---------- Require Auth (protected page guard) ----------
// Phase B: fail-closed. Uses the backend-verified cache. If the cache has not
// yet been verified at startup, it falls back to a one-shot verification
// against GET /api/auth/me before deciding. Async so it can fail-closed on a
// pending server call without ever trusting an unverified localStorage value.
async function requireAuth() {
  if (typeof _auth !== "undefined" && _auth.checked) {
    if (!_auth.verified) { redirectToLogin(); return false; }
    return true;
  }
  const user = await checkAuthSession();
  if (verifyAuthState(user)) return true;
  redirectToLogin();
  return false;
}

function redirectToLogin() {
  showToast("Please login to access this page", "warning");
  setTimeout(() => {
    const isInPages = window.location.pathname.includes("/pages/");
    window.location.href = isInPages ? "login.html" : "pages/login.html";
  }, 1000);
}

// ---------- Initialize protected page: guard + restore user data ----------
function initProtectedPage() {
  if (!requireAuth()) return;

  // Restore user data from per-user storage into active session keys
  const key = getUserDataKey();
  if (key) {
    const savedData = getStorage(key, {});
    if (Array.isArray(savedData.cartItems)) {
      setStorage("cartItems", savedData.cartItems);
    }
    if (Array.isArray(savedData.wishlist)) {
      setStorage("wishlist", savedData.wishlist);
    }
    if (Array.isArray(savedData.myOrders)) {
      setStorage("myOrders", savedData.myOrders);
    }
    if (Array.isArray(savedData.artistArtworks)) {
      setStorage("artistArtworks", savedData.artistArtworks);
    }
  }

  // Auto-save user data on tab/browser close
  window.addEventListener("beforeunload", function () {
    saveUserData();
  });
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
  // From pages/, links to index need ../ prefix; links within pages/ need no prefix
  const toRoot = isInPages ? "../" : "";
  const toPages = isInPages ? "" : "pages/";

  // Conditionally show protected links only when logged in
  const protectedLinks = loggedIn ? `
    <a href="${toPages}cart.html" id="cartLink">
      🛒 Cart
      <span id="cartCount" class="cart-badge">0</span>
    </a>
    <a href="${toPages}wishlist.html">❤️ Wishlist</a>
    <a href="${toPages}orders.html">📦 My Orders</a>
    <a href="${toPages}my-artworks.html">🎨 My Artworks</a>
  ` : '';

  header.innerHTML = `
    <h1>🎨 <a href="${toRoot}index.html" style="text-decoration:none;color:inherit;">Artora</a></h1>
    <button class="hamburger" id="hamburgerBtn" aria-label="Toggle menu">
      <span></span><span></span><span></span>
    </button>
    <nav id="mainNav">
      <a href="${toRoot}index.html">Home</a>
      <a href="${toRoot}index.html#categories">Categories</a>
      <a href="${toRoot}index.html#artists">Artists</a>
      ${protectedLinks}
      <button id="themeToggle" class="theme-toggle-btn" aria-label="Toggle dark mode">🌙</button>
      <span id="userSection">
        ${
          loggedIn && user
            ? `👋 ${escapeHtml(user.name)} <button id="logoutBtn" class="nav-logout-btn">Logout</button>`
            : `<a href="${toPages}login.html">👤 Login</a>`
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

  // Logout handler — uses centralized logoutUser
  const logoutBtn = document.getElementById("logoutBtn");
  if (logoutBtn) {
    logoutBtn.addEventListener("click", function () {
      logoutUser();
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

  // Auto-save user data on tab/browser close (for logged-in users)
  if (isLoggedIn()) {
    window.addEventListener("beforeunload", function () {
      saveUserData();
    });
  }
}

// AUD-001: before any page script renders, restore an abandoned Buy Now checkout state
// on every page EXCEPT the checkout page itself (a refresh there must keep the Buy Now
// checkout intact and leave "checkoutSession" in place until the order is placed).
restoreAbandonedBuyNow();
// bfcache Back/Forward restores do not re-run page scripts; this listener covers them
// (e.g., pressing Back from an abandoned Buy Now checkout to a cached artwork page).
window.addEventListener("pageshow", function () {
  restoreAbandonedBuyNow();
});

// Auto-init when script is loaded (but not on index.html which has its own header)
if (!window.location.pathname.endsWith("index.html") && !window.location.pathname.endsWith("/")) {
  initPage();
}
