document.addEventListener("DOMContentLoaded", () => {
  const validPasswords = ["adminpassword", "clientpassword"];
  const savedPassword = getCookie("userpass");

  console.log("DOMContentLoaded fired");
  console.log("Saved password cookie:", savedPassword);

  const content = document.getElementById("main-content");
  if (content) content.style.display = "none";

  if (!validPasswords.includes(savedPassword)) {
    console.log("No valid cookie, showing prompt");
    showPasswordPrompt();
  } else {
    console.log("Valid cookie, showing content");
    if (content) content.style.display = "block";
  }
});

function setCookie(name, value) {
  const expires = new Date();
  expires.setFullYear(expires.getFullYear() + 10);
  document.cookie = `${name}=${value}; expires=${expires.toUTCString()}; path=/`;
}

function getCookie(name) {
  const cookies = document.cookie.split(';');
  for (let cookie of cookies) {
    const [key, val] = cookie.trim().split('=');
    if (key === name) return val;
  }
  return null;
}

function showPasswordPrompt() {
  console.log("showPasswordPrompt called");

  if (document.getElementById("password-modal")) return;

  const modal = document.createElement("div");
  modal.id = "password-modal";
  Object.assign(modal.style, {
    position: "fixed",
    top: "0",
    left: "0",
    width: "100vw",
    height: "100vh",
    backgroundColor: "rgba(0,0,0,0.6)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: "10000",
  });

  const box = document.createElement("div");
  Object.assign(box.style, {
    backgroundColor: "#ffffff",
    padding: "30px",
    borderRadius: "10px",
    boxShadow: "0 10px 25px rgba(0, 0, 0, 0.3)",
    maxWidth: "90%",
    width: "350px",
    textAlign: "center",
    fontFamily: "Arial, sans-serif",
  });

  box.innerHTML = `
    <h2 style="margin-bottom: 20px; color: #222;">Enter Password</h2>
    <input type="password" id="modal-password" placeholder="Password" style="
      width: 100%;
      padding: 12px;
      font-size: 16px;
      border: 1px solid #ccc;
      border-radius: 6px;
      box-sizing: border-box;
    " />
    <button id="submit-password" style="
      margin-top: 20px;
      width: 100%;
      padding: 12px;
      font-size: 16px;
      background-color: #4CAF50;
      color: white;
      border: none;
      border-radius: 6px;
      cursor: pointer;
      transition: background-color 0.3s;
    ">Submit</button>
  `;

  modal.appendChild(box);
  document.body.appendChild(modal);

  document.getElementById("submit-password").addEventListener("click", () => {
    const input = document.getElementById("modal-password").value;
    console.log("Password entered:", input);

    if (["adminpassword", "clientpassword"].includes(input)) {
      console.log("Correct password");
      setCookie("userpass", input);
      modal.remove();
      const content = document.getElementById("main-content");
      if (content) content.style.display = "block";
    } else {
      console.log("Incorrect password");
      alert("Incorrect password.");
    }
  });
}
