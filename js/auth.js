// ---------- SIGNUP ----------
// Phase B: POST /api/auth/register (backend is authoritative).
const signupForm = document.getElementById("signupForm");

if (signupForm) {
  signupForm.addEventListener("submit", async function (event) {
    event.preventDefault();

    const name = document.getElementById("signupName").value.trim();
    const email = document.getElementById("signupEmail").value.trim();
    const password = document.getElementById("signupPassword").value;
    const confirm = document.getElementById("signupConfirm")?.value;

    if (confirm && password !== confirm) {
      showToast("Passwords do not match!", "error");
      return;
    }

    if (password.length < 6) {
      showToast("Password must be at least 6 characters long!", "error");
      return;
    }

    try {
      const res = await apiFetch("/register", {
        method: "POST",
        body: JSON.stringify({ name: name, email: email, password: password }),
      });

      if (res.ok) {
        showToast("Signup Successful!");
        window.location.href = "login.html";
      } else if (res.status === 409) {
        showToast("Email already exists! Please use a different email or login.", "error");
      } else if (res.status === 400) {
        showToast("Please fill in all fields with valid values.", "error");
      } else {
        showToast(res.body && res.body.error ? res.body.error : "Signup failed. Please try again.", "error");
      }
    } catch {
      showToast("Signup failed. Please try again.", "error");
    }
  });
}

// ---------- LOGIN ----------
// Phase B: POST /api/auth/login (Argon2id verified server-side; HttpOnly cookie set).
const loginForm = document.getElementById("loginForm");

if (loginForm) {
  loginForm.addEventListener("submit", async function (event) {
    event.preventDefault();

    const email = document.getElementById("loginEmail").value;
    const password = document.getElementById("loginPassword").value;

    try {
      const res = await apiFetch("/login", {
        method: "POST",
        body: JSON.stringify({ email: email, password: password }),
      });

      if (res.ok && res.body && res.body.user) {
        const user = res.body.user;
        // The server session is authoritative; this only updates compatibility data.
        verifyAuthState(user);

        // Restore user's saved data from per-user storage (legacy demo behavior)
        const userKey = "userdata_" + user.email.toLowerCase();
        const savedData = getStorage(userKey, {});
        localStorage.setItem("cartItems", JSON.stringify(savedData.cartItems || []));
        localStorage.setItem("wishlist", JSON.stringify(savedData.wishlist || []));
        localStorage.setItem("myOrders", JSON.stringify(savedData.myOrders || []));
        localStorage.setItem("artistArtworks", JSON.stringify(savedData.artistArtworks || []));

        showToast("Login Successful!");
        window.location.href = "../index.html";
      } else if (res.status === 401) {
        showToast("Invalid Email or Password", "error");
      } else if (res.status === 400) {
        showToast("Please enter a valid email and password.", "error");
      } else {
        showToast(res.body && res.body.error ? res.body.error : "Login failed. Please try again.", "error");
      }
    } catch {
      showToast("Login failed. Please try again.", "error");
    }
  });
}
