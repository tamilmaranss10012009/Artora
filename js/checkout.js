// ==========================
// Order Summary
// ==========================

const items = JSON.parse(localStorage.getItem("cartItems")) || [];
const summary = document.getElementById("summaryItems");
let total = 0;

if (items.length > 0) {
  summary.innerHTML = "";
  items.forEach((item) => {
    const price = Number(item.price.replace(/[₹,]/g, ""));
    total += price * item.quantity;
    summary.innerHTML += `
      <div class="checkout-item">
        <span><strong>${item.title}</strong> × ${item.quantity}</span>
        <span>₹${(price * item.quantity).toLocaleString("en-IN")}</span>
      </div>
    `;
  });
  summary.innerHTML += `
    <hr>
    <div class="checkout-total">
      <span><strong>Total:</strong></span>
      <span><strong>₹${total.toLocaleString("en-IN")}</strong></span>
    </div>
  `;
} else {
  summary.innerHTML = "<p>No items in cart.</p>";
}

// ==========================
// Payment Method Toggle
// ==========================

const paymentSelect = document.getElementById("paymentMethod");
const upiSection = document.getElementById("upiSection");
const cardSection = document.getElementById("cardSection");

if (paymentSelect) {
  paymentSelect.addEventListener("change", function () {
    if (upiSection) upiSection.style.display = this.value === "UPI" ? "block" : "none";
    if (cardSection) cardSection.style.display = this.value === "Card" ? "block" : "none";
  });
}

// ==========================
// Field Validation Helpers
// ==========================

function showFieldError(id, message) {
  const el = document.getElementById(id);
  if (el) {
    el.textContent = message;
    el.style.display = message ? "block" : "none";
  }
}

function validateField(id, errorId, test, errorMsg) {
  const val = document.getElementById(id)?.value.trim() || "";
  const isValid = test(val);
  showFieldError(errorId, isValid ? "" : errorMsg);
  return isValid;
}

function validateCheckout() {
  let valid = true;

  // Full Name: min 3 chars, letters and spaces only
  valid = validateField("checkoutName", "nameError",
    v => v.length >= 3 && /^[a-zA-Z\s]+$/.test(v),
    "Full name must be at least 3 characters (letters only)") && valid;

  // Phone: exactly 10 digits
  valid = validateField("checkoutPhone", "phoneError",
    v => /^[0-9]{10}$/.test(v),
    "Phone must be exactly 10 digits") && valid;

  // Address: min 10 characters
  valid = validateField("checkoutAddress", "addressError",
    v => v.length >= 10,
    "Address must be at least 10 characters") && valid;

  // City: min 2 characters
  valid = validateField("checkoutCity", "cityError",
    v => v.length >= 2 && /^[a-zA-Z\s]+$/.test(v),
    "City must be at least 2 characters") && valid;

  // State: min 2 characters
  valid = validateField("checkoutState", "stateError",
    v => v.length >= 2 && /^[a-zA-Z\s]+$/.test(v),
    "State must be at least 2 characters") && valid;

  // Pincode: exactly 6 digits
  valid = validateField("checkoutPincode", "pincodeError",
    v => /^[0-9]{6}$/.test(v),
    "Pincode must be exactly 6 digits") && valid;

  // Payment method
  const payment = paymentSelect?.value;
  if (!payment) {
    showFieldError("pincodeError", ""); // clear last
    showToast("Please select a payment method", "error");
    valid = false;
  }

  // UPI validation
  if (payment === "UPI") {
    valid = validateField("upiId", "upiError",
      v => /^[\w.\-_]+@[\w]+$/.test(v),
      "Enter a valid UPI ID (e.g., name@upi)") && valid;
  }

  // Card validation
  if (payment === "Card") {
    valid = validateField("cardNumber", "cardNumberError",
      v => /^[0-9]{16}$/.test(v.replace(/\s/g, "")),
      "Card number must be 16 digits") && valid;

    valid = validateField("cardExpiry", "cardExpiryError",
      v => /^(0[1-9]|1[0-2])\/\d{2}$/.test(v),
      "Expiry must be MM/YY") && valid;

    valid = validateField("cardCvv", "cardCvvError",
      v => /^[0-9]{3}$/.test(v),
      "CVV must be 3 digits") && valid;
  }

  return valid;
}

// ==========================
// Real-time input formatting
// ==========================

const cardNumberInput = document.getElementById("cardNumber");
if (cardNumberInput) {
  cardNumberInput.addEventListener("input", function () {
    let val = this.value.replace(/\D/g, "").substring(0, 16);
    let formatted = val.replace(/(.{4})/g, "$1 ").trim();
    this.value = formatted;
  });
}

const cardExpiryInput = document.getElementById("cardExpiry");
if (cardExpiryInput) {
  cardExpiryInput.addEventListener("input", function () {
    let val = this.value.replace(/\D/g, "").substring(0, 4);
    if (val.length >= 3) {
      val = val.substring(0, 2) + "/" + val.substring(2);
    }
    this.value = val;
  });
}

const cardCvvInput = document.getElementById("cardCvv");
if (cardCvvInput) {
  cardCvvInput.addEventListener("input", function () {
    this.value = this.value.replace(/\D/g, "").substring(0, 3);
  });
}

const phoneInput = document.getElementById("checkoutPhone");
if (phoneInput) {
  phoneInput.addEventListener("input", function () {
    this.value = this.value.replace(/\D/g, "").substring(0, 10);
  });
}

const pincodeInput = document.getElementById("checkoutPincode");
if (pincodeInput) {
  pincodeInput.addEventListener("input", function () {
    this.value = this.value.replace(/\D/g, "").substring(0, 6);
  });
}

// ==========================
// Form Submit
// ==========================

const form = document.getElementById("checkoutForm");

if (form) {
  form.addEventListener("submit", function (event) {
    event.preventDefault();

    if (items.length === 0) {
      showToast("Your cart is empty!", "error");
      return;
    }

    if (!validateCheckout()) {
      showToast("Please fix the highlighted errors", "error");
      return;
    }

    const name = document.getElementById("checkoutName").value.trim();
    const phone = document.getElementById("checkoutPhone").value.trim();
    const address = document.getElementById("checkoutAddress").value.trim();
    const city = document.getElementById("checkoutCity").value.trim();
    const state = document.getElementById("checkoutState").value.trim();
    const pincode = document.getElementById("checkoutPincode").value.trim();
    const payment = paymentSelect.value;

    let orders = JSON.parse(localStorage.getItem("myOrders")) || [];

    orders.push({
      orderId: "ORD-" + Date.now().toString(36).toUpperCase(),
      date: new Date().toLocaleString(),
      items: JSON.parse(JSON.stringify(items)),
      total: total,
      shipping: { name, phone, address, city, state, pincode },
      payment: payment,
      status: "Processing",
    });

    localStorage.setItem("myOrders", JSON.stringify(orders));
    localStorage.removeItem("cartItems");

    showToast("Order placed successfully! 🎉");
    setTimeout(() => {
      window.location.href = "success.html";
    }, 800);
  });
}