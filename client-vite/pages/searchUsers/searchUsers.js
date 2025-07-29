import { SERVER_URL } from "../../consts";
import { renderHeader } from "../../components/header.js";

function handleSearch(text) {
    console.log(text);
    const filtered = filterUsers(text);
    renderUserList(filtered);
}

renderHeader("#header", handleSearch);

const userContainer = document.getElementById('user-container');
const userTmpl = document.getElementById('user-template');

let allUsers = [];

function renderUser(user) {
  const frag = userTmpl.content.cloneNode(true);
  const userSlot = frag.querySelector('slot[name="username"]');
  userSlot.textContent = user.username;
  return frag;
}

function renderUserList(users) {
  userContainer.innerHTML = ""; // очистка
  users.forEach(user => {
    userContainer.appendChild(renderUser(user));
  });
}

async function loadUsers() {
  const usersReq = await fetch(`${SERVER_URL}/users`);
  allUsers = await usersReq.json(); // сохранить в локальное состояние
  // фильтрация по ?q если есть
  const urlParams = new URLSearchParams(window.location.search);
  const searchString = urlParams.get("q") || "";

  const filtered = filterUsers(searchString);
  renderUserList(filtered);
}

function filterUsers(search) {
  if (!search) return allUsers;
  return allUsers.filter(user =>
    user.username.toLowerCase().includes(search.toLowerCase())
  );
}

loadUsers();
