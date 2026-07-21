const wishlist = JSON.parse(localStorage.getItem("wishlist")) || [];

const wishlistItems = document.getElementById("wishlistItems");

if (wishlist.length > 0) {
  wishlistItems.innerHTML = "";

  wishlist.forEach(function (item, index) {
    const imgPath = normalizeImagePath(item.image);
    wishlistItems.innerHTML += `
            <div class="cart-item">

                <img src="${imgPath}" class="cart-image">

                <h2>${item.title}</h2>

                <h3>${item.price}</h3>

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
  let wishlist = JSON.parse(localStorage.getItem("wishlist")) || [];

  wishlist.splice(index, 1);

  localStorage.setItem("wishlist", JSON.stringify(wishlist));

  location.reload();
}
function moveToCart(index) {
  let wishlist = JSON.parse(localStorage.getItem("wishlist")) || [];
  let cart = JSON.parse(localStorage.getItem("cartItems")) || [];

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

  localStorage.setItem("cartItems", JSON.stringify(cart));
  localStorage.setItem("wishlist", JSON.stringify(wishlist));

  location.reload();
}
