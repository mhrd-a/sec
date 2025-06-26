
(function () {
    const password = prompt("🔒 Enter the access password:");
    const correctPassword = "SEC2025"; // 🔑 Change this as needed

    if (password !== correctPassword) {
        document.write("<h1 style='text-align:center;margin-top:20%;color:red;'>🚫 Access Denied</h1>");
        throw new Error("Unauthorized access");
    }
})();
