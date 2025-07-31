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

  // 2. Находим блоки
  const guestBlock = container.querySelector('.guest-actions');
  const userBlock = container.querySelector('.user-actions');
  const buttonLogout = container.querySelector('.guest-actions__logout');
  const buttonAuth = container.querySelector('.guest-actions__auth');
  // const searchElement = document.getElementById("search-auth")

  // 3. Определяем, на какой мы странице
  const path = window.location.pathname;

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
