// const BASE_URL = "https://api.myaddressesbook.com" 
const BASE_URL = "http://localhost:3000"; // ceci est l'url de l'api ou server en developpement

const linkLogin = document.getElementById("link-login");
const linkRegister = document.getElementById("link-register");
const linkLogout = document.getElementById("link-logout");
const content = document.getElementById("content");
console.log(document.cookie);
let accessToken = null;
let refreshToken = null;

// Affiche ou cache les liens selon l'état d'authentification
const updateNavbar = async () => {
  try {
    const response = await fetch(`${BASE_URL}/users/me`, {
      method: "GET",
      credentials: "include",
    });

    if (response.ok) {
      const user = await response.json();
      // Utilisateur connecté, affiche la navbar correspondante
      showNavbarState(true, user);
    } else {
      // Non connecté (ex. token expiré), on bascule en mode déconnecté
      showNavbarState(false);
    }
  } catch (err) {
    console.error("Erreur lors de la récupération du profil utilisateur :", err.message);
    // En cas d'erreur réseau ou autre, on affiche la navbar déconnectée
    showNavbarState(false);
  }
};

// Fonction dédiée à la gestion de l'affichage
const showNavbarState = (isLoggedIn, user = null) => {
  if (isLoggedIn) {
    linkLogin.style.display = "none";
    linkRegister.style.display = "none";
    linkLogout.style.display = "block";
    displayUserProfile(user); // Affiche les infos utilisateur
    fetchContacts();
  } else {
    linkLogin.style.display = "block";
    linkRegister.style.display = "block";
    linkLogout.style.display = "none";
    content.innerHTML = "<h2>Veuillez vous connecter ou vous inscrire.</h2>";
  }
};


// Appelle la route `/me` pour récupérer le profil utilisateur
const fetchUserProfile = async () => {
  try {
    const response = await fetch(`${BASE_URL}/users/me`, {
      method: "GET",
      credentials: "include", // Indique d'inclure les cookies dans la requête
    });

    if (!response.ok) {
      await handleTokenExpiration(response); // Gère les erreurs
      return;
    }

    const data = await response.json();
    displayUserProfile(data);
  } catch (err) {
    console.error("Erreur de connexion au serveur :", err.message);
  }
};

// Appelle la route `/contacts` pour récupérer les contacts de l'utilisateur
const fetchContacts = async () => {
  try {
    const response = await fetch(`${BASE_URL}/contacts`, {
      method: "GET",
      credentials: "include",
    });

    const data = await response.json();
    if (response.ok) {
      console.log(data.message); // Message de succès
      displayContacts(data.data); // Accès direct à `data.data`
    } else {
      console.error("Erreur lors de la récupération des contacts :", data.message);
      alert(`Erreur : ${data.message}`);
      content.innerHTML = "<h2>Aucun contact trouvé.</h2>";
    }
  } catch (err) {
    console.error("Erreur de connexion au serveur :", err.message);
    content.innerHTML = "<h2>Erreur de connexion au serveur.</h2>";
  }
};

const displayContacts = (contacts) => {
  let contactList = "<h2>Vos contacts</h2>";
  contactList += "<ul>";
  contacts.forEach((contact) => {
    contactList += `<li>${contact.name} (${contact.phone})</li>`;
  });
  contactList += "</ul>";
  content.innerHTML += `<br><br> ${contactList}`; // Ajoute les contacts à la page
};


// Affiche le profil utilisateur dans le contenu principal
const displayUserProfile = (user) => {
  content.innerHTML = `
    <h2>Bienvenue, ${user.name} !</h2>
    <p>Email : ${user.email}</p>
    <p>ID : ${user._id}</p>
    <button id="contact-profile">Voir vos contacts</button>
  `;

  const contactButton = document.getElementById("contact-profile");
  contactButton.addEventListener("click", fetchContacts);
};

// Formulaire de connexion
const showLoginForm = () => {
  content.innerHTML = `
    <h2>Connexion</h2>
    <form id="login-form">
      <label>Email:</label><br>
      <input type="email" id="login-email" required><br>
      <label>Mot de passe:</label><br>
      <input type="password" id="login-password" required><br><br>
      <button type="submit">Se connecter</button>
    </form>
  `;

  const loginForm = document.getElementById("login-form");
  loginForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    const email = document.getElementById("login-email").value;
    const password = document.getElementById("login-password").value;

    try {
      const response = await fetch(`${BASE_URL}/users/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
        credentials: "include",
      });
      const data = await response.json();
      console.log(data);
      if (response.ok) {
        accessToken = data.accessToken;
        refreshToken = data.refreshToken;
        alert("Connexion réussie ");
        updateNavbar();
        fetchUserProfile();
        fetchContacts();
        console.log(document.cookie);
        content.innerHTML = "<h2>Bienvenue, vous êtes connecté !</h2>";
      } else {
        alert(`Erreur: ${data.message}`);
      }
    } catch (err) {
      console.error("Erreur de connexion :", err.message);
    }
  });
};

// Formulaire d'inscription
const showRegisterForm = () => {
  content.innerHTML = `
    <h2>Inscription</h2>
    <form id="register-form">
      <label>Nom:</label><br>
      <input type="text" id="name" required><br>
      <label>Email:</label><br>
      <input type="email" id="email" required><br>
      <label>Mot de passe:</label><br>
      <input type="password" id="password" required><br><br>
      <button type="submit">S'inscrire</button>
    </form>
  `;

  const registerForm = document.getElementById("register-form");
  registerForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    const name = document.getElementById("name").value;
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;

    try {
      const response = await fetch(`${BASE_URL}/users/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
        credentials: "include",
      });
      const data = await response.json();
      if (response.ok) {
        alert(data.message);
        showLoginForm(); // Redirige vers le formulaire de connexion
      } else {
        alert(`Erreur: ${data.message}`);
      }
    } catch (err) {
      console.error("Erreur d'inscription :", err.message);
    }
  });
};

// Gestion de la déconnexion
// Gestion de la déconnexion
linkLogout.addEventListener("click", async () => {
  try {
    const response = await fetch(`${BASE_URL}/users/logout`, {
      method: "POST",
      credentials: "include", // Inclus les cookies dans la requête
    });

    if (response.ok) {
      // Clear tokens on successful logout
      accessToken = null;
      refreshToken = null;
      alert("Déconnexion réussie !");
      showNavbarState(false); // Forcer l'état de déconnexion
      content.innerHTML = "<h2>Vous êtes déconnecté.</h2>";
    } else {
      const data = await response.json();
      console.error("Erreur lors de la déconnexion :", data.message);
      alert(`Erreur : ${data.message}`);
    }
  } catch (err) {
    console.error("Erreur de connexion au serveur :", err.message);
  }
});

// Afficher les formulaires en fonction des clics
linkLogin.addEventListener("click", (e) => {
  e.preventDefault();
  showLoginForm();
});

linkRegister.addEventListener("click", (e) => {
  e.preventDefault();
  showRegisterForm();
});

// Initialisation de la barre de navigation
updateNavbar();

// Gestion de l'expiration du token
const handleTokenExpiration = async (response) => {
  if (response.status === 401 || response.status === 403) {
    alert("Votre session a expiré. Veuillez vous reconnecter.");
    accessToken = null;
    refreshToken = null;
    updateNavbar(); // Met à jour la navigation
    showLoginForm(); // Affiche le formulaire de connexion
  }
};
