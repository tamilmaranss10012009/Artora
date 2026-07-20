// ---------- SIGNUP ----------

const signupForm = document.getElementById("signupForm");

if (signupForm) {
  signupForm.addEventListener("submit", function (event) {
    event.preventDefault();

    const name = document.getElementById("signupName").value.trim();
    const email = document.getElementById("signupEmail").value.trim();
    const password = document.getElementById("signupPassword").value.trim();

    const user = {
      name,
      email,
      password,
    };

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

    const user = JSON.parse(localStorage.getItem("user"));

    if (
      user &&
      email.toLowerCase() === user.email.toLowerCase() &&
      password === user.password
    ) {
      localStorage.setItem("loggedIn", "true");

      alert("Login Successful!");

      window.location.href = "../index.html";
    } else {
      alert("Invalid Email or Password");
    }
  });
}
