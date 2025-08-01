// export async function renderHeader(selector = '#header') {
//   const container = document.querySelector(selector);
//   console.log(container, '😒')
//   if (!container) return;
//   const res = await fetch('/components/Header.html');
//   container.innerHTML = await res.text();
// }
const renderHeaderContent = (
  guestBlock,
  userBlock,
  isAuthPage,
  isMainNoAuth,
  isProfilePage
) => {
  if (isAuthPage) {
    guestBlock.remove();
    userBlock.remove();
  }

  if (isMainNoAuth) {
    userBlock.remove();
  }

  if (!isAuthPage && !isMainNoAuth) {
    guestBlock.remove();
  }
  // if(isProfilePage) {
  //   guestBlock.remove()
  // }
};

const addEventHeaderButtons = (buttonLogout, buttonAuth) => {
  buttonLogout.addEventListener('click', () => {
    localStorage.removeItem('token');
    window.location.href = '/auth.html';
  });
};

const addEventHeaderSearch = (inputEl, onSearchInput) => {
  inputEl.addEventListener('input', (e) => {
    const value = e.target.value.trim();
    const params = new URLSearchParams(window.location.search);
    console.log(params, '💕');
    if (value) {
      params.set('q', value);
    } else {
      params.delete('q');
    }

    const newUrl = `${window.location.pathname}?${params.toString()}`;
    history.replaceState(null, '', newUrl);
    onSearchInput?.(value);
  });
};

export async function renderHeader(
  selector = '#header',
  onSearchInput = () => null
) {
  const container = document.querySelector(selector);
  if (!container) return;

  // 1. Загружаем и вставляем HTML
  const res = await fetch('/components/Header.html');
  container.innerHTML = await res.text();

  // 2. Захватываем нужные элементы
  const form     = container.querySelector('#header-search-form');
  const inputEl  = form.querySelector('input[name="q"]');
  const btnUsers = container.querySelector('#btn-toggle-users');
  const btnPosts = container.querySelector('#btn-toggle-posts');
  const path     = window.location.pathname;

  // 3. Устанавливаем default-action на текущую страницу:
  //    — если мы на searchPosts.html, то ищем там,
  //    — иначе — всегда на searchUsers.html
  if (path.endsWith('searchPosts.html')) {
    form.action = 'searchPosts.html';
  } else {
    form.action = 'searchUsers.html';
  }

  // 4. Если передали колбэк поиска, то перехватываем сабмит и ввод «live»
  if (typeof onSearchInput === 'function') {
    addEventHeaderSearch(inputEl, onSearchInput);
  }

  // 5. Кнопки переключения «Пользователи / Посты»
  //    при клике меняют и страницу, и form.action
  btnUsers.addEventListener('click', () => {
    form.action = 'searchUsers.html';
    window.location.href = `searchUsers.html${location.search}`;
  });
  btnPosts.addEventListener('click', () => {
    form.action = 'searchPosts.html';
    window.location.href = `searchPosts.html${location.search}`;
  });

  // 6. Подсветка активного таба
  btnUsers.classList.toggle(
    'toggle-nav__btn--active',
    path.endsWith('searchUsers.html')
  );
  btnPosts.classList.toggle(
    'toggle-nav__btn--active',
    path.endsWith('searchPosts.html')
  );

  // 2. Находим блоки
  const guestBlock = container.querySelector('.guest-actions');
  const userBlock = container.querySelector('.user-actions');
  const buttonLogout = container.querySelector('.guest-actions__logout');
  const buttonAuth = container.querySelector('.guest-actions__auth');
  // const searchElement = document.getElementById("search-auth")



  const isAuthPage = path === '/auth.html' || path === '/registration.html';
  const isMainNoAuth = path === '/mainNoAuth.html'; // или просто !isAuthPage
  const isProfilePage = path === '/profile.html';
  // const isSearchUsers

  if (!guestBlock || !userBlock) {
    return;
  }

  addEventHeaderButtons(buttonLogout, buttonAuth);
  // addEventHeaderSearch(searchElement,onSearchInput);
  renderHeaderContent(
    guestBlock,
    userBlock,
    isAuthPage,
    isMainNoAuth,
    isProfilePage
  );

  // return searchElement;
}
