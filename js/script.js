// ==========================
// Dark Mode Toggle
// ==========================

(function initTheme() {
  const savedTheme = localStorage.getItem("theme") || "light";
  document.documentElement.setAttribute("data-theme", savedTheme);

  const themeBtn = document.getElementById("themeToggle");
  if (themeBtn) {
    themeBtn.textContent = savedTheme === "dark" ? "☀️" : "🌙";

    themeBtn.addEventListener("click", function () {
      const current = document.documentElement.getAttribute("data-theme");
      const next = current === "dark" ? "light" : "dark";
      document.documentElement.setAttribute("data-theme", next);
      localStorage.setItem("theme", next);
      this.textContent = next === "dark" ? "☀️" : "🌙";
    });
  }
})();

// ==========================
// Explore Button
// ==========================

const exploreBtn = document.getElementById("exploreBtn");
const featuredSection = document.getElementById("featured");

if (exploreBtn && featuredSection) {
  exploreBtn.addEventListener("click", function () {
    featuredSection.scrollIntoView({
      behavior: "smooth",
    });
  });
}

// ==========================
// Cart Badge
// ==========================

function updateCartCount() {
  const items = JSON.parse(localStorage.getItem("cartItems")) || [];
  let totalQty = 0;
  items.forEach((item) => {
    totalQty += item.quantity || 0;
  });
  const cartCount = document.getElementById("cartCount");
  if (cartCount) {
    cartCount.innerText = totalQty;
  }
}

updateCartCount();

// ==========================
// Default Artworks Data
// ==========================

const artworks = {
  1: {
    title: "Sunset Painting",
    price: "₹2,499",
    image: "images/sunset.jpg",
    description: "Beautiful Sunset Painting",
    artist: "Artora",
    category: "Painting",
  },
  2: {
    title: "Bear Painting",
    price: "₹2,500",
    image: "images/bear.jpg",
    description: "Beautiful Bear Painting",
    artist: "Artora",
    category: "Painting",
  },
  3: {
    title: "Bull Painting",
    price: "₹1,200",
    image: "images/bull.jpg",
    description: "Beautiful Bull Painting",
    artist: "Artora",
    category: "Painting",
  },
  4: {
    title: "Tiger Painting",
    price: "₹3,000",
    image: "images/tiger.jpg",
    description: "Beautiful Tiger Painting",
    artist: "Artora",
    category: "Painting",
  },
};

// ==========================
// Rating HTML Helper
// ==========================

function getArtworkRatingHtml(title) {
  const reviews = JSON.parse(localStorage.getItem("reviews")) || {};
  if (reviews[title] && reviews[title].length > 0) {
    const ratings = reviews[title];
    const avg = ratings.reduce((sum, r) => sum + r.rating, 0) / ratings.length;
    const fullStars = Math.round(avg);
    const starsStr = "★".repeat(fullStars) + "☆".repeat(5 - fullStars);
    return `<div class="art-rating"><span class="stars-display">${starsStr}</span> <span class="rating-score">(${ratings.length})</span></div>`;
  }
  return `<div class="art-rating"><span class="stars-display">★★★★★</span> <span class="rating-score">(0)</span></div>`;
}

// ==========================
// Render All Artworks (with optional filter)
// ==========================

function renderAllArtworks(filterText = "") {
  const artGrid = document.getElementById("artGrid");
  if (!artGrid) return;

  let html = "";

  // Add default artworks
  for (const id in artworks) {
    const art = artworks[id];
    const match =
      !filterText ||
      art.title.toLowerCase().includes(filterText) ||
      art.artist.toLowerCase().includes(filterText) ||
      art.category.toLowerCase().includes(filterText);

    if (!match) continue;

    const ratingHtml = getArtworkRatingHtml(art.title);
    html += `
      <div class="art-card">
        <img src="${art.image}" alt="${art.title}" />
        <h3>${art.title}</h3>
        ${ratingHtml}
        <p>${art.price}</p>
        <button class="wishlistBtn" data-id="${id}">🤍 Wishlist</button>
        <button onclick="openDefaultArtwork(${id})">View Details</button>
      </div>
    `;
  }

  // Add uploaded artworks
  const uploaded = JSON.parse(localStorage.getItem("artistArtworks")) || [];
  uploaded.forEach(function (art, index) {
    const match =
      !filterText ||
      (art.title && art.title.toLowerCase().includes(filterText)) ||
      (art.artist && art.artist.toLowerCase().includes(filterText)) ||
      (art.category && art.category.toLowerCase().includes(filterText));

    if (!match) return;

    const ratingHtml = getArtworkRatingHtml(art.title);
    html += `
      <div class="art-card">
        <img src="${art.image}" alt="${art.title}">
        <h3>${art.title}</h3>
        ${ratingHtml}
        <p>${art.price}</p>
        <button onclick="addDynamicWishlist(${index})">❤️ Wishlist</button>
        <button onclick="openDynamicArtwork(${index})">View Details</button>
      </div>
    `;
  });

  if (html === "") {
    html = `<p style="grid-column:1/-1;text-align:center;padding:40px;font-size:18px;color:var(--text-color);">No artworks found${filterText ? ' matching "' + filterText + '"' : ''}.</p>`;
  }

  artGrid.innerHTML = html;

  // Re-attach wishlist event listeners for default artworks
  document.querySelectorAll(".wishlistBtn").forEach((button) => {
    button.addEventListener("click", function (event) {
      event.preventDefault();
      const id = this.dataset.id;
      let wishlist = JSON.parse(localStorage.getItem("wishlist")) || [];
      const exists = wishlist.find((item) => item.title === artworks[id].title);
      if (!exists) {
        wishlist.push(artworks[id]);
        localStorage.setItem("wishlist", JSON.stringify(wishlist));
        showToast("Added to Wishlist ❤️");
      } else {
        showToast("Already in Wishlist ❤️", "warning");
      }
    });
  });
}

// ==========================
// Search - Navigate directly to matching artwork
// ==========================

const searchBtn = document.getElementById("searchBtn");
const searchInput = document.getElementById("searchInput");

// Build a lookup map: lowercase title -> { id, type }
function getArtworkLookup() {
  const map = {};
  for (const id in artworks) {
    map[artworks[id].title.toLowerCase()] = { id: id, type: "default" };
  }
  const uploaded = JSON.parse(localStorage.getItem("artistArtworks")) || [];
  uploaded.forEach((art, index) => {
    if (art.title) {
      map[art.title.toLowerCase()] = { index: index, type: "uploaded" };
    }
  });
  return map;
}

if (searchBtn && searchInput) {
  searchBtn.addEventListener("click", function () {
    const rawText = searchInput.value.trim();
    const text = rawText.toLowerCase().trim();
    if (!text) {
      showToast("Please enter a search term", "warning");
      renderAllArtworks("");
      return;
    }

    const lookup = getArtworkLookup();

    // Check for exact match first
    if (lookup[text]) {
      const match = lookup[text];
      if (match.type === "default") {
        openDefaultArtwork(match.id);
      } else {
        openDynamicArtwork(match.index);
      }
      searchInput.value = "";
      return;
    }

    // Check if any artwork title starts with the search text
    for (const title in lookup) {
      if (title.startsWith(text)) {
        const match = lookup[title];
        if (match.type === "default") {
          openDefaultArtwork(match.id);
        } else {
          openDynamicArtwork(match.index);
        }
        searchInput.value = "";
        return;
      }
    }

    // Fall back to filtered grid view
    renderAllArtworks(text);
    showToast(`Showing results for "${text}"`, "info");
  });

  searchInput.addEventListener("keyup", function (e) {
    if (e.key === "Enter") {
      searchBtn.click();
    }
  });
}

// ==========================
// Login Section (index.html)
// ==========================

function renderUserSection() {
  const userSection = document.getElementById("userSection");
  const currentUser = JSON.parse(localStorage.getItem("user"));
  const isLoggedIn = localStorage.getItem("loggedIn") === "true";

  if (!userSection) return;

  if (isLoggedIn && currentUser) {
    userSection.innerHTML = `
      👋 ${currentUser.name}
      <button id="logoutBtn">Logout</button>
    `;

    document.getElementById("logoutBtn").addEventListener("click", function () {
      logoutUser();
    });
  } else {
    userSection.innerHTML = `<a href="pages/login.html" id="loginLink">👤 Login</a>`;
  }
}

// Conditionally show/hide protected nav links on index.html
function updateProtectedNavLinks() {
  const isLoggedIn = localStorage.getItem("loggedIn") === "true";
  const nav = document.querySelector("header nav");
  if (!nav) return;

  // Remove existing protected links if any (from previous renders)
  const existingLinks = nav.querySelectorAll(".protected-nav-link");
  existingLinks.forEach(el => el.remove());

  if (isLoggedIn) {
    // Add cart, wishlist, orders, my-artworks after the Artists link
    const artistsLink = nav.querySelector('a[href="#artists"]');
    if (artistsLink) {
      const linksHtml = `
        <a href="pages/cart.html" id="cartLink" class="protected-nav-link">
          🛒 Cart
          <span id="cartCount" class="cart-badge">0</span>
        </a>
        <a href="pages/wishlist.html" class="protected-nav-link">❤️ Wishlist</a>
        <a href="pages/orders.html" class="protected-nav-link">📦 My Orders</a>
        <a href="pages/my-artworks.html" class="protected-nav-link">🎨 My Artworks</a>
      `;
      artistsLink.insertAdjacentHTML("afterend", linksHtml);
    }
  }

  updateCartCount();
}

renderUserSection();
updateProtectedNavLinks();


// ==========================
// Category Filter (shows matching cards in grid)
// ==========================

function filterByCategory(category) {
  renderAllArtworks(category.toLowerCase());

  // Scroll to artworks section
  const section = document.getElementById("artists");
  if (section) {
    section.scrollIntoView({ behavior: "smooth" });
  }

  showToast(`Showing ${category} artworks`, "info");
}

// ==========================
// Utility Functions
// ==========================

function openDefaultArtwork(id) {
  if (!artworks[id]) return;
  localStorage.setItem("selectedArtwork", JSON.stringify(artworks[id]));
  window.location.href = "pages/dynamic-artwork.html";
}

function openDynamicArtwork(index) {
  const artistArtworks = JSON.parse(localStorage.getItem("artistArtworks")) || [];
  if (!artistArtworks[index]) return;
  localStorage.setItem("selectedArtwork", JSON.stringify(artistArtworks[index]));
  window.location.href = "pages/dynamic-artwork.html";
}

function addDynamicWishlist(index) {
  const artistArtworks = JSON.parse(localStorage.getItem("artistArtworks")) || [];
  const artwork = artistArtworks[index];
  if (!artwork) return;

  let wishlist = JSON.parse(localStorage.getItem("wishlist")) || [];
  const exists = wishlist.find((item) => item.title === artwork.title);

  if (exists) {
    showToast("Already in Wishlist ❤️", "warning");
    return;
  }

  wishlist.push(artwork);
  localStorage.setItem("wishlist", JSON.stringify(wishlist));
  showToast("Added to Wishlist ❤️");
}

// ==========================
// Initial Render - Show all artworks on page load
// ==========================

renderAllArtworks("");