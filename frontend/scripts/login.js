document
  .getElementById("loginForm")
  .addEventListener("submit", function (event) {
    event.preventDefault();

    const email = document.getElementById("emailInput").value;
    const senha = document.getElementById("passwordInput").value;

    fetch("/api/usuarios/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, senha }),
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.token) {
          sessionStorage.setItem("authToken", data.token);
          window.location.href = "chat.html";
        } else if (data.error) {
          const errorDiv = document.createElement("div");
          errorDiv.style.cssText =
            "position:fixed;top:10px;left:50%;transform:translateX(-50%);background:#fde7e9;color:#d13438;padding:16px;border-radius:4px;z-index:9999;border-left:3px solid #d13438;";
          errorDiv.textContent = data.error;
          document.body.appendChild(errorDiv);
          setTimeout(() => errorDiv.remove(), 5000);
        }
      });
  });
