// script.js
(function () {
    const correctPassword = "SEC2025"; // 🔑 your password
    const password = prompt("🔒 Enter the access password:");

    if (password === null || password !== correctPassword) {
        document.body.innerHTML = "";  // clear page content
        document.write("<h1 style='text-align:center;margin-top:20%;color:red;'>🚫 Access Denied</h1>");
        throw new Error("Unauthorized or canceled access");
    }
})();
