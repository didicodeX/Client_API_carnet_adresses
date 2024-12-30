// URL de base de ton API
const BASE_URL = "http://localhost:3000"; // Change ça si ton backend est hébergé ailleurs

// Récupérer les éléments du DOM
const registerForm = document.getElementById("register-form");
const loginForm = document.getElementById("login-form");
const tokenInfo = document.getElementById("token-info");

let accessToken = null;
let refreshToken = null;

// Gestion de l'inscription
registerForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  const name = document.getElementById("name").value;
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;
  console.log(name, email, password);
  try {
    const response = await fetch(`${BASE_URL}/api/users/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, password }),
    });
    const data = await response.json();
    console.log(data);

    if (response.ok) alert(data.message);
    else alert(`Erreur: ${data.message}`);
  } catch (err) {
    console.error("Erreur d'inscription :", err.message);
  }
});

// Gestion de la connexion
loginForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  const email = document.getElementById("login-email").value;
  const password = document.getElementById("login-password").value;

  try {
    const response = await fetch(`${BASE_URL}/api/users/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    const data = await response.json();
    console.log(data);
    if (response.ok) {
      accessToken = data.token;
      refreshToken = data.refreshToken;
      tokenInfo.textContent = `Access Token: ${accessToken}`;
      alert("Connexion réussie !");
    } else {
      alert(`Erreur: ${data.message}`);
    }
  } catch (err) {
    console.error("Erreur de connexion :", err.message);
  }
});

// Simuler une expiration du token (manuellement tester une requête protégée)
const testProtectedRoute = async () => {
  try {
    const response = await fetch(`${BASE_URL}/api/users/me`, {
      method: "GET",
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    const data = await response.json();

    if (response.ok) {
      console.log("Données protégées :", data);
    } else {
      console.error("Erreur :", data.message);
      alert(
        "Votre token est expiré. Veuillez rafraîchir votre token ou vous reconnecter."
      );
      refreshAccessToken(); // Rafraîchir automatiquement
    }
  } catch (err) {
    console.error("Erreur de la route protégée :", err.message);
  }
};

// Rafraîchir le token
const refreshAccessToken = async () => {
  try {
    const response = await fetch(`${BASE_URL}/api/users/refresh-token`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refreshToken }),
    });
    const data = await response.json();

    if (response.ok) {
      accessToken = data.newAccessToken;
      tokenInfo.textContent = `Access Token (rafraîchi): ${accessToken}`;
      alert("Token rafraîchi avec succès.");
    } else {
      alert(`Erreur de rafraîchissement: ${data.message}`);
    }
  } catch (err) {
    console.error("Erreur de rafraîchissement :", err.message);
  }
};

// Simuler une requête
setTimeout(() => {
  alert("Test de route protégée dans 5 secondes !");
  testProtectedRoute();
}, 5000);
