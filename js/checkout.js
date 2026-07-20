const items = JSON.parse(localStorage.getItem("cartItems")) || [];

const summary = document.getElementById("summaryItems");

let total = 0;

if (items.length > 0) {
  summary.innerHTML = "";

  items.forEach((item) => {
    const price = Number(item.price.replace(/[₹,]/g, ""));

    total += price * item.quantity;

    summary.innerHTML += `
            <p>
                ${item.title} × ${item.quantity}
                <br>
                ₹${(price * item.quantity).toLocaleString("en-IN")}
            </p>
            <br>
        `;
  });

  summary.innerHTML += `
        <h3>Total: ₹${total.toLocaleString("en-IN")}</h3>
    `;
} else {
  summary.innerHTML = "<p>No items in cart.</p>";
}

const form = document.getElementById("checkoutForm");

if (form) {
  form.addEventListener("submit", function (event) {
    event.preventDefault();

    const name = document.getElementById("checkoutName").value.trim();
    const phone = document.getElementById("checkoutPhone").value.trim();
    const address = document.getElementById("checkoutAddress").value.trim();
    const city = document.getElementById("checkoutCity").value.trim();
    const state = document.getElementById("checkoutState").value.trim();
    const pincode = document.getElementById("checkoutPincode").value.trim();
    const payment = document.getElementById("paymentMethod").value;

    if (items.length === 0) {
      showToast("Your cart is empty!", "error");
      return;
    }

    if (!name || !phone || !address || !city || !state || !pincode || !payment) {
      showToast("Please fill in all fields!", "error");
      return;
    }

    if (phone.length < 10) {
      showToast("Please enter a valid phone number!", "error");
      return;
    }

    let orders = JSON.parse(localStorage.getItem("myOrders")) || [];

    orders.push({
      orderId: "ORD-" + Date.now().toString(36).toUpperCase(),
      date: new Date().toLocaleString(),
      items: items,
      total: total,
      shipping: {
        name,
        phone,
        address,
        city,
        state,
        pincode,
      },
      payment: payment,
      status: "Processing",
    });

    localStorage.setItem("myOrders", JSON.stringify(orders));

    localStorage.removeItem("cartItems");

    showToast("Order placed successfully! 🎉");

    setTimeout(() => {
      window.location.href = "success.html";
    }, 500);
  });
}
