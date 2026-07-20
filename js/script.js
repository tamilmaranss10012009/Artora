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
// Search (Dynamic)
// ==========================
const searchBtn = document.getElementById("searchBtn");
const searchInput = document.getElementById("searchInput");

if (searchBtn && searchInput) {
  searchBtn.addEventListener("click", function () {
    const text = searchInput.value.toLowerCase().trim();
    if (!text) {
      showToast("Please enter a search term", "warning");
      return;
    }

    // Search default artworks
    for (const id in artworks) {
      const art = artworks[id];
      if (
        art.title.toLowerCase().includes(text) ||
        art.artist.toLowerCase().includes(text) ||
        art.category.toLowerCase().includes(text)
      ) {
        openDefaultArtwork(id);
        return;
      }
    }

    // Search uploaded artworks
    const uploaded = JSON.parse(localStorage.getItem("artistArtworks")) || [];
    for (let i = 0; i < uploaded.length; i++) {
      const art = uploaded[i];
      if (
        (art.title && art.title.toLowerCase().includes(text)) ||
        (art.artist && art.artist.toLowerCase().includes(text)) ||
        (art.category && art.category.toLowerCase().includes(text))
      ) {
        openDynamicArtwork(i);
        return;
      }
    }

    showToast("Artwork not found!", "error");
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
// Login Section
// ==========================

const user = JSON.parse(localStorage.getItem("user"));
const loggedIn = localStorage.getItem("loggedIn");

const userSection = document.getElementById("userSection");

if (userSection && loggedIn === "true" && user) {
  userSection.innerHTML = `
        👋 ${user.name}
        <button id="logoutBtn">Logout</button>
    `;

  document.getElementById("logoutBtn").addEventListener("click", function () {
    localStorage.removeItem("loggedIn");

    window.location.reload();
  });
}

// ==========================
// Default Artworks
// ==========================

const artworks = {
  1: {
    title: "Sunset Painting",
    price: "₹2,499",
    image: "../images/sunset.jpg",
    description: "Beautiful Sunset Painting",
    artist: "Artora",
    category: "Painting",
  },

  2: {
    title: "Bear Painting",
    price: "₹2,500",
    image: "../images/bear.jpg",
    description: "Beautiful Bear Painting",
    artist: "Artora",
    category: "Painting",
  },

  3: {
    title: "Bull Painting",
    price: "₹1,200",
    image: "../images/bull.jpg",
    description: "Beautiful Bull Painting",
    artist: "Artora",
    category: "Painting",
  },

  4: {
    title: "Tiger Painting",
    price: "₹3,000",
    image: "../images/tiger.jpg",
    description: "Beautiful Tiger Painting",
    artist: "Artora",
    category: "Painting",
  },
};
// ==========================
// Default Wishlist
// ==========================
const wishlistButtons = document.querySelectorAll(".wishlistBtn");

wishlistButtons.forEach((button) => {
  button.addEventListener("click", function (event) {
    event.preventDefault();

    const id = this.dataset.id;
    let wishlist = JSON.parse(localStorage.getItem("wishlist")) || [];

    const exists = wishlist.find((item) => item.title === artworks[id].title);

    if (!exists) {
      wishlist.push(artworks[id]);
      localStorage.setItem("wishlist", JSON.stringify(wishlist));
      alert("Added to Wishlist ❤️");
    } else {
      alert("Already in Wishlist ❤️");
    }
  });
});

// ===== END OF PART 1 =====
// ==========================
// Artist Uploaded Artworks
// ==========================

const artistArtworks = JSON.parse(localStorage.getItem("artistArtworks")) || [];
const artGrid = document.getElementById("artGrid");

if (artGrid) {
  artistArtworks.forEach(function (art, index) {
    artGrid.innerHTML += `

        <div class="art-card">

            <img src="${art.image}" alt="${art.title}">

            <h3>${art.title}</h3>
  <p>${art.price}</p>

            <button onclick="addDynamicWishlist(${index})">
                ❤️ Wishlist
            </button>

            <button onclick="openDynamicArtwork(${index})">
                View Details
            </button>

        </div>

        `;
  });
}

// ==========================
// Dynamic Artwork Details
// ==========================

function openDynamicArtwork(index) {
  const artistArtworks =
    JSON.parse(localStorage.getItem("artistArtworks")) || [];

  if (!artistArtworks[index]) return;

  localStorage.setItem(
    "selectedArtwork",
    JSON.stringify(artistArtworks[index]),
  );
  window.location.href = "pages/dynamic-artwork.html";
}

// ==========================
// Dynamic Wishlist
// ==========================

function addDynamicWishlist(index) {
  const artistArtworks =
    JSON.parse(localStorage.getItem("artistArtworks")) || [];

  const artwork = artistArtworks[index];
  if (!artwork) return;

  let wishlist = JSON.parse(localStorage.getItem("wishlist")) || [];

  const exists = wishlist.find((item) => item.title === artwork.title);

  if (exists) {
    alert("Already in Wishlist ❤️");
    return;
  }

  wishlist.push(artwork);

  localStorage.setItem("wishlist", JSON.stringify(wishlist));

  alert("Added to Wishlist ❤️");
}

// ==========================
// Default Artwork Details
// ==========================

function openDefaultArtwork(id) {
  if (!artworks[id]) return;

  localStorage.setItem("selectedArtwork", JSON.stringify(artworks[id]));

  window.location.href = "pages/dynamic-artwork.html";
}

// ===== END OF PART 2 =====
function testWishlist(button) {
  const id = button.dataset.id;

  let wishlist = JSON.parse(localStorage.getItem("wishlist")) || [];

  const exists = wishlist.find((item) => item.title === artworks[id].title);

  if (!exists) {
    wishlist.push(artworks[id]);

    localStorage.setItem("wishlist", JSON.stringify(wishlist));

    alert("Added ❤️");
  } else {
    alert("Already ❤️");
  }
}
