// ---------- SIMPLE HASH FUNCTION ----------
function hashPassword(password) {
  let hash = 0;
  if (password.length === 0) return hash.toString();
  for (let i = 0; i < password.length; i++) {
    const char = password.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return 'h' + Math.abs(hash).toString(16);
}

// ---------- SIGNUP ----------

const signupForm = document.getElementById("signupForm");

if (signupForm) {
  signupForm.addEventListener("submit", function (event) {
    event.preventDefault();

    const name = document.getElementById("signupName").value.trim();
    const email = document.getElementById("signupEmail").value.trim();
    const password = document.getElementById("signupPassword").value.trim();
    const confirm = document.getElementById("signupConfirm")?.value.trim();

    if (confirm && password !== confirm) {
      showToast("Passwords do not match!", "error");
      return;
    }

    if (password.length < 6) {
      showToast("Password must be at least 6 characters long!", "error");
      return;
    }

    // Check if email already exists
    const existingUsers = JSON.parse(localStorage.getItem("allUsers")) || [];
    const emailExists = existingUsers.some(u => u.email.toLowerCase() === email.toLowerCase());

    if (emailExists) {
      showToast("Email already exists! Please use a different email or login.", "error");
      return;
    }

    const user = {
      name,
      email,
      password: hashPassword(password),
    };

    existingUsers.push(user);
    localStorage.setItem("allUsers", JSON.stringify(existingUsers));
    localStorage.setItem("user", JSON.stringify(user));
    localStorage.setItem("loggedIn", "true");

    // Initialize per-user storage with empty data to prevent stale session leaks
    const userKey = "userdata_" + email.toLowerCase();
    localStorage.setItem(userKey, JSON.stringify({
      cartItems: [],
      wishlist: [],
      myOrders: [],
      artistArtworks: []
    }));

    // Initialize active session keys with empty arrays
    localStorage.setItem("cartItems", JSON.stringify([]));
    localStorage.setItem("wishlist", JSON.stringify([]));
    localStorage.setItem("myOrders", JSON.stringify([]));
    localStorage.setItem("artistArtworks", JSON.stringify([]));

    showToast("Signup Successful!");

    window.location.href = "login.html";
  });
}

// ---------- LOGIN ----------

const loginForm = document.getElementById("loginForm");

if (loginForm) {
  loginForm.addEventListener("submit", function (event) {
    event.preventDefault();

    const email = document.getElementById("loginEmail").value;
    const password = document.getElementById("loginPassword").value;

    const allUsers = JSON.parse(localStorage.getItem("allUsers")) || [];
    const user = allUsers.find(u => u.email.toLowerCase() === email.toLowerCase());

    if (
      user &&
      hashPassword(password) === user.password
    ) {
      localStorage.setItem("user", JSON.stringify(user));
      localStorage.setItem("loggedIn", "true");

      // Restore user's saved data from per-user storage
      const userKey = "userdata_" + user.email.toLowerCase();
      const savedData = JSON.parse(localStorage.getItem(userKey)) || {};

      // Use empty-array fallbacks for missing/corrupted data
      localStorage.setItem("cartItems", JSON.stringify(savedData.cartItems || []));
      localStorage.setItem("wishlist", JSON.stringify(savedData.wishlist || []));
      localStorage.setItem("myOrders", JSON.stringify(savedData.myOrders || []));
      localStorage.setItem("artistArtworks", JSON.stringify(savedData.artistArtworks || []));

      // Auto-save user data on tab/browser close
      window.addEventListener("beforeunload", function () {
        saveUserData();
      });

      showToast("Login Successful!");

      window.location.href = "../index.html";
    } else {
      showToast("Invalid Email or Password", "error");
    }
  });
}
