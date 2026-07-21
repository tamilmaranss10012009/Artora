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
      alert("Passwords do not match!");
      return;
    }

    if (password.length < 6) {
      alert("Password must be at least 6 characters long!");
      return;
    }

    // Check if email already exists
    const existingUsers = JSON.parse(localStorage.getItem("allUsers")) || [];
    const emailExists = existingUsers.some(u => u.email.toLowerCase() === email.toLowerCase());

    if (emailExists) {
      alert("Email already exists! Please use a different email or login.");
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

    alert("Signup Successful!");

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

      alert("Login Successful!");

      window.location.href = "../index.html";
    } else {
      alert("Invalid Email or Password");
    }
  });
}
