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
          localStorage.setItem("authToken", data.token);
          window.location.href = "/chat.html";
        } else if (data.error) {
          alert(data.error);
        }
      });
  });
