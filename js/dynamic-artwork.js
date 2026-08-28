const artwork = getStorage("selectedArtwork");

const details = document.getElementById("artworkDetails");

if (artwork) {
  const imgPath = normalizeImagePath(artwork.image);
  details.innerHTML = `
        <img src="${escapeHtml(imgPath)}" class="cart-image">

        <h1>${escapeHtml(artwork.title)}</h1>

        <h2>${escapeHtml(artwork.price)}</h2>

        <p>${escapeHtml(artwork.desc || artwork.description || "")}</p>

        <p><strong>Artist:</strong> ${escapeHtml(artwork.artist || "Unknown Artist")}</p>

        <p><strong>Category:</strong> ${escapeHtml(artwork.category || "Painting")}</p>

        <br>

        <button id="wishlistBtn">❤️ Add to Wishlist</button>

        <button id="addCartBtn">🛒 Add to Cart</button>

        <button id="buyNowBtn">⚡ Buy Now</button>
    `;

  // ---------- Wishlist ----------

  document.getElementById("wishlistBtn").addEventListener("click", function () {
    let wishlist = getStorage("wishlist", []);

    const exists = wishlist.find((item) => item.title === artwork.title);

    if (!exists) {
      wishlist.push(artwork);

      setStorage("wishlist", wishlist);
      saveUserData();

      showToast("Added to Wishlist ❤️");
    } else {
      showToast("Already in Wishlist ❤️", "warning");
    }
  });

  // ---------- Cart ----------

  document.getElementById("addCartBtn").addEventListener("click", function () {
    let cart = getStorage("cartItems", []);

    const existing = cart.find((item) => item.title === artwork.title);

    if (existing) {
      existing.quantity++;
    } else {
      cart.push({
        title: artwork.title,
        price: artwork.price,
        image: artwork.image,
        quantity: 1,
      });
    }

    setStorage("cartItems", cart);
    saveUserData();

    showToast("Added to Cart! 🛒");

    updateCartBadge();
  });

  // ---------- Buy Now ----------

  document.getElementById("buyNowBtn").addEventListener("click", function () {
    // Require login before Buy Now
    if (!isLoggedIn()) {
      showToast("Please login to purchase", "warning");
      setTimeout(() => {
        window.location.href = "login.html";
      }, 1000);
      return;
    }

    // Save the user's existing cart so it can be restored after checkout
    const currentCart = getStorage("cartItems", []);
    setStorage("checkoutSession", {
      originalCart: currentCart,
      buyNowItem: {
        title: artwork.title,
        price: artwork.price,
        image: artwork.image,
        quantity: 1,
      },
    });

    // Set cart to just the Buy Now item for checkout
    setStorage("cartItems", [
      {
        title: artwork.title,
        price: artwork.price,
        image: artwork.image,
        quantity: 1,
      },
    ]);

    window.location.href = "checkout.html";
  });
} else {
  details.innerHTML = `
<h2>Artwork Not Found</h2>

<a href="../index.html" class="buy-btn">
⬅ Back to Home
</a>
`;
}

// ---------- Reviews ----------

const reviewsList = document.getElementById("reviewsList");
const submitReview = document.getElementById("submitReview");

if (artwork && submitReview && reviewsList) {
  let reviews = getStorage("reviews", {});

  if (!reviews[artwork.title]) {
    reviews[artwork.title] = [];
  }

  function loadReviews() {
    reviewsList.innerHTML = "";

    reviews[artwork.title].forEach(function (review) {
      // Rating is clamped to a sane range so crafted/corrupt stored values cannot
      // throw from String.repeat() or cause a memory blowup; stars are generated
      // (never user text), and review text is rendered as literal text.
      const starCount = Math.max(0, Math.min(5, Math.round(Number(review.rating)) || 0));
      reviewsList.innerHTML += `
                <div class="art-card">

                    <h3>${"⭐".repeat(starCount)}</h3>

                    <p>${escapeHtml(review.text)}</p>

                </div>
            `;
    });
  }

  loadReviews();

  submitReview.addEventListener("click", function () {
    const text = document.getElementById("reviewText").value.trim();

    const rating = Number(document.getElementById("rating").value);

    if (text === "") {
      showToast("Please write a review first!", "warning");
      return;
    }

    reviews[artwork.title].push({
      rating: rating,

      text: text,
    });

    setStorage("reviews", reviews);

    document.getElementById("reviewText").value = "";

    loadReviews();

    showToast("Review Submitted Successfully ⭐");
  });
}
