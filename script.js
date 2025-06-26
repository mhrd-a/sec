// script.js
(function () {
    const correctPassword = "SEC2025"; // 🔑 Set your password here
    const password = prompt("🔒 Enter the access password:");

    if (password === null || password !== correctPassword) {
        document.documentElement.innerHTML = '';  // Clears entire page (including head & body)
        document.write("<h1 style='text-align:center;margin-top:20%;color:red;'>🚫 Access Denied</h1>");
        window.stop();  // Stops further loading
    }
})();
