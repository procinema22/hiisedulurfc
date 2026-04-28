// AUTH DUMMY UNTUK GITHUB PAGES
window.authGuard = function (requireLogin = false) {
    const loggedIn = localStorage.getItem("login") === "true";
  
    if (requireLogin && !loggedIn) {
      window.location.href = "index.html";
    }
  
    if (!requireLogin && loggedIn && location.pathname.includes("login")) {
      window.location.href = "home.html";
    }
  };
  
  window.login = function (user, pass) {
    if (user === "admin" && pass === "1234") {
      localStorage.setItem("login", "true");
      window.location.href = "home.html";
    } else {
      alert("Login gagal");
    }
  };
  
  window.logout = function () {
    localStorage.removeItem("login");
    window.location.href = "index.html";
  };
  