// Protected page: require login
if (!requireAuth()) {
  throw new Error("Not authenticated");
}

const wishlist = getStorage("wishlist", []);

const wishlistItems = document.getElementById("wishlistItems");

if (wishlist.length > 0) {
  wishlistItems.innerHTML = "";

  wishlist.forEach(function (item, index) {
    const imgPath = normalizeImagePath(item.image);
    wishlistItems.innerHTML += `
            <div class="cart-item">

                <img src="${escapeHtml(imgPath)}" class="cart-image">

                <h2>${escapeHtml(item.title)}</h2>

                <h3>${escapeHtml(item.price)}</h3>

    <button onclick="moveToCart(${index})">
        Move to Cart
    </button>

    <button onclick="removeWishlist(${index})">
        Remove
    </button>

</div>

            <hr><br>

            </div>
        `;
  });
} else {
  wishlistItems.innerHTML = "<h2>Your Wishlist is Empty ❤️</h2>";
}

function removeWishlist(index) {
  let wishlist = getStorage("wishlist", []);

  wishlist.splice(index, 1);

  setStorage("wishlist", wishlist);
  saveUserData();

  location.reload();
}
function moveToCart(index) {
  let wishlist = getStorage("wishlist", []);
  let cart = getStorage("cartItems", []);

  const item = wishlist[index];

  const existing = cart.find((cartItem) => cartItem.title === item.title);

  if (existing) {
    existing.quantity += 1;
  } else {
    cart.push({
      ...item,
      quantity: 1,
    });
  }

  wishlist.splice(index, 1);

  setStorage("cartItems", cart);
  setStorage("wishlist", wishlist);
  saveUserData();

  location.reload();
}
