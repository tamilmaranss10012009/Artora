const items = JSON.parse(localStorage.getItem("cartItems")) || [];

const cartItems = document.getElementById("cartItems");

if (items.length > 0) {
  let grandTotal = 0;
  cartItems.innerHTML = "";

  items.forEach(function (item, index) {
    const itemPrice = Number(String(item.price).replace(/[₹,]/g, ""));
    const imgPath = normalizeImagePath(item.image);

    grandTotal += itemPrice * item.quantity;
    cartItems.innerHTML += `
        <div class="cart-item">

            <img src="${imgPath}" class="cart-image">

            <h2>${item.title}</h2>

<h3>${item.price}</h3>

<div class="quantity-box">
    <button onclick="changeQuantity(${index}, -1)">−</button>

    <span>${item.quantity}</span>

    <button onclick="changeQuantity(${index}, 1)">+</button>
</div>

<p><strong>Total:</strong> ₹${(
      Number(String(item.price).replace(/[₹,]/g, "")) * item.quantity
    ).toLocaleString("en-IN")}
</p>

<button onclick="removeItem(${index})">Remove</button>

            <hr><br>

        </div>
    `;
  });
  document.getElementById("grandTotal").innerText =
    "Grand Total: ₹" + grandTotal.toLocaleString("en-IN");
} else {
  cartItems.innerHTML = "<p>Your cart is empty.</p>";
  document.getElementById("grandTotal").innerText = "Grand Total: ₹0";
}
function removeItem(index) {
  let items = JSON.parse(localStorage.getItem("cartItems")) || [];

  items.splice(index, 1);

  localStorage.setItem("cartItems", JSON.stringify(items));

  location.reload();
}
function changeQuantity(index, change) {
  let items = JSON.parse(localStorage.getItem("cartItems")) || [];

  items[index].quantity += change;

  if (items[index].quantity < 1) {
    items[index].quantity = 1;
  }

  localStorage.setItem("cartItems", JSON.stringify(items));

  location.reload();
}
