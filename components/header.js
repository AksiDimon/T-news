// Управление видимостью блоков в шапке
const renderHeaderContent = (guestBlock, userBlock) => {
  const path = window.location.pathname;
  // Гостевой блок только на auth, registration, mainNoAuth
  const isGuestPage = [
    '/auth.html',
    '/registration.html',
    '/mainNoAuth.html'
  ].includes(path);
  if (isGuestPage) {
    userBlock.remove();
  } else {
    guestBlock.remove();
  }
};

// Обработчики входа/выхода
const addEventHeaderButtons = (buttonLogout, buttonAuth) => {
  buttonLogout?.addEventListener('click', () => {
    localStorage.removeItem('token');
    window.location.href = '/auth.html';
  });
  buttonAuth?.addEventListener('click', () => {
    window.location.href = '/auth.html';
  });
};

// Поисковая логика: сабмит формы и ввод
const addEventHeaderSearch = (inputEl, onSearchInput) => {
  const form = inputEl.closest('form');
  if (!form) return;

  // при сабмите — переход на action с q
  form.addEventListener('submit', e => {
    e.preventDefault();
    const value = inputEl.value.trim();
    const params = new URLSearchParams();
    if (value) params.set('q', value);
    const target = form.getAttribute('action');
    window.location.href = `${target}?${params.toString()}`;
  });

  // при вводе — живой поиск (только на search-страницах)
  inputEl.addEventListener('input', e => {
    const value = e.target.value.trim();
    onSearchInput(value);
  });
};

// Главная функция рендера шапки
export async function renderHeader(
  selector = '#header',
  onSearchInput = null
) {
  const container = document.querySelector(selector);
  if (!container) return;

  // Загружаем разметку
  const res = await fetch('/components/Header.html');
  container.innerHTML = await res.text();

  // Блоки гостя и пользователя
  const guestBlock   = container.querySelector('.guest-actions');
  const userBlock    = container.querySelector('.user-actions');
  const buttonLogout = container.querySelector('.guest-actions__logout');
  const buttonAuth   = container.querySelector('.guest-actions__auth');

  // Показываем нужный блок в шапке
  renderHeaderContent(guestBlock, userBlock);

  // Навешиваем кнопки
  addEventHeaderButtons(buttonLogout, buttonAuth);

  // Поисковая форма
  const form    = container.querySelector('#header-search-form');
  const inputEl = form?.querySelector('input[name="q"]');
  const path    = window.location.pathname;

  // Устанавливаем default-action для формы
  form.action = path.endsWith('searchPosts.html')
    ? 'searchPosts.html'
    : 'searchUsers.html';

  // Если передан callback — делаем live search
  if (typeof onSearchInput === 'function' && inputEl) {
    addEventHeaderSearch(inputEl, onSearchInput);
  }
}
