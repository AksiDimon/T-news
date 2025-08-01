import { SERVER_URL } from '../../consts';
import { renderHeader } from '../../components/header.js';

window.addEventListener('DOMContentLoaded', () => {
  // 1) Обработчик ввода в поле поиска
  function handleSearch(text) {
    console.log('Search:', text);
    const filtered = filterUsers(text);
    renderUserList(filtered);
  }

  // 2) Рендер шапки с переданным колбэком поиска
  renderHeader('#header', handleSearch);

  // 3) Навигация «Пользователи / Посты»
  const path = window.location.pathname;
  const btnUsers = document.getElementById('btn-toggle-users');
  const btnPosts = document.getElementById('btn-toggle-posts');

  if (btnUsers && btnPosts) {
    // Подсветка активной
    if (path.endsWith('searchUsers.html')) {
      btnUsers.classList.add('toggle-nav__btn--active');
    } else if (path.endsWith('searchPosts.html')) {
      btnPosts.classList.add('toggle-nav__btn--active');
    }

    // Функция перехода, сохраняющая q
    function goTo(page) {
      const params = new URLSearchParams(window.location.search);
      const q = params.get('q');
      window.location.href = `${page}${q ? `?q=${encodeURIComponent(q)}` : ''}`;
    }

    btnUsers.addEventListener('click', () => goTo('searchUsers.html'));
    btnPosts.addEventListener('click', () => goTo('searchPosts.html'));
  }

  // 4) Работа со списком пользователей
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
    userContainer.innerHTML = '';
    users.forEach(user =>{
      userContainer.appendChild(renderUser(user));
    });
  }

  function filterUsers(search) {
    if (!search) return allUsers;
    const lower = search.toLowerCase();
    return allUsers.filter(user =>
      user.username.toLowerCase().includes(lower)
    );
  }

  async function loadUsers() {
    try {
      const usersReq = await fetch(`${SERVER_URL}/users`);
      allUsers = await usersReq.json();

      const urlParams = new URLSearchParams(window.location.search);
      const searchString = urlParams.get('q') || '';
      const filtered = filterUsers(searchString);
      renderUserList(filtered);
    } catch (err) {
      console.error('Ошибка загрузки пользователей', err);
      userContainer.innerHTML = '<p class="error">Не удалось загрузить пользователей.</p>';
    }
  }

  loadUsers();
});

