// import { SERVER_URL } from '../../consts';
// import { renderHeader } from '../../components/header.js';

// function handleSearch(text) {
//   const filtered = filterPosts(text);
//   renderPostList(filtered);
// }

// // Ждём, пока DOM прогрузится
// window.addEventListener('DOMContentLoaded', () => {
//   // 1) Рендерим шапку
//   renderHeader('#header', handleSearch);

//   // 2) Навигация «Пользователи / Посты»
//   const path     = window.location.pathname;
//   const btnUsers = document.getElementById('btn-toggle-users');
//   const btnPosts = document.getElementById('btn-toggle-posts');

//   // подсветка
//   if (path.endsWith('searchUsers.html')) {
//     btnUsers.classList.add('toggle-nav__btn--active');
//   } else {
//     btnPosts.classList.add('toggle-nav__btn--active');
//   }

//   function goTo(page) {
//     const params = new URLSearchParams(window.location.search);
//     const q = params.get('q');
//     window.location.href = `${page}${q ? `?q=${encodeURIComponent(q)}` : ''}`;
//   }

//   btnUsers.addEventListener('click', () => goTo('searchUsers.html'));
//   btnPosts.addEventListener('click', () => goTo('searchPosts.html'));

//   // 3) Контейнер и шаблон постов
//   const postContainer = document.getElementById('posts-container');
//   const postTmpl      = document.getElementById('comment-template');

//   let allPosts = [];

//   function renderPost(post) {
//     const frag = postTmpl.content.cloneNode(true);
//     const titleSlot = frag.querySelector('slot[name="title"]');
//   titleSlot.textContent = post.userName
//     frag.querySelector('slot[name="body"]').textContent = post.content;
//     return frag;
//   }

//   function renderPostList(posts) {
//     postContainer.innerHTML = '';
//     posts.forEach(p => postContainer.appendChild(renderPost(p)));
//   }

//   function filterPosts(search) {
//     if (!search) return allPosts;
//     const lower = search.toLowerCase();
//     return allPosts.filter(p => p.content.toLowerCase().includes(lower));
//   }

//   async function loadPosts() {
//     const res = await fetch(`${SERVER_URL}/posts`);
//     allPosts  = await res.json();
//     const q   = new URLSearchParams(window.location.search).get('q') || '';
//     renderPostList(filterPosts(q));
//   }

//   loadPosts();
// });


import { SERVER_URL } from '../../consts';
import { renderHeader } from '../../components/header.js';
import { insertPost } from '../../components/post.js';

// function handleSearch(text) {
//   const filtered = filterPosts(text);
//   renderPostList(filtered);
// }

window.addEventListener('DOMContentLoaded', () => {
  // 1) Рендерим шапку и подключаем «живой» поиск
//   renderHeader('#header', handleSearch);

  // 2) Логика переключения вкладок
  const path     = window.location.pathname;
  const btnUsers = document.getElementById('btn-toggle-users');
  const btnPosts = document.getElementById('btn-toggle-posts');

  // Подсвечиваем активный таб
  if (path.endsWith('searchUsers.html')) {
    btnUsers.classList.add('toggle-nav__btn--active');
  } else {
    btnPosts.classList.add('toggle-nav__btn--active');
  }

  //функция поиска введенных инпут по постам
//   function goTo(page) {
//     const params = new URLSearchParams(window.location.search);
//     const q = params.get('q');
//     window.location.href = `${page}${q ? `?q=${encodeURIComponent(q)}` : ''}`;
//   }
//   btnUsers.addEventListener('click', () => goTo('searchUsers.html'));
//   btnPosts.addEventListener('click', () => goTo('searchPosts.html'));
function goTo(page) {
    const inputEl = document.querySelector(
      '#header-search-form input[name="q"]'
    );
    if (inputEl) inputEl.value = '';             // очистили поле
    window.location.href = page;                 // перешли без параметров
  }
  btnUsers.addEventListener('click', () => goTo('searchUsers.html'));
  btnPosts.addEventListener('click', () => goTo('searchPosts.html'));
  // 3) Подготовка данных и контейнера
  const postContainerSelector = '#posts-container';
  let allPosts = [];

  // Отрисовка списка — через insertPost
  function renderPostList(posts) {
    // Очищаем
    const container = document.querySelector(postContainerSelector);
    container.innerHTML = '';
    // Вставляем каждый элемент через ваш компонент
    posts.forEach(post => {
      insertPost(post, postContainerSelector);
    });
  }

  // Фильтрация массива по content
  function filterPosts(search) {
    if (!search) return allPosts;
    const lower = search.toLowerCase();
    return allPosts.filter(post =>
      post.content.toLowerCase().includes(lower)
    );
  }
  function handleSearch(text) {
  const filtered = filterPosts(text);
  renderPostList(filtered);
}
  renderHeader('#header', handleSearch);

  // 4) Загрузка всех постов с сервера
  async function loadPosts() {
    try {
      const res = await fetch(`${SERVER_URL}/posts`);
      allPosts = await res.json();

      // Первичная отрисовка: если в URL есть ?q=…, фильтруем сразу
      const q = new URLSearchParams(window.location.search).get('q') || '';
      renderPostList(filterPosts(q));
    } catch (err) {
      console.error('Ошибка загрузки постов', err);
      document.querySelector(postContainerSelector).innerHTML =
        '<p class="error">Не удалось загрузить посты.</p>';
    }
  }

  loadPosts();
});
