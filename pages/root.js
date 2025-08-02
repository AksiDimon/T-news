// При старте приложения проверяем наличие токена в localStorage
// Если токен есть, перенаправляем на главную страницу
// Если токена нет, перенаправляем на страницу авторизации

(function () {
  // рандомный токен для демонстрации
  const token = localStorage.getItem('token');
  new Promise((resolve) => setTimeout(resolve, 1000))
    .then(() => {
      if (token) {
        window.location.href = '/mainAuth.html';
      } else {
        window.location.href = '/mainNoAuth.html';
      }
    })
    .catch((error) => {
      console.error('Error during redirect:', error);
      window.location.href = '/mainNoAuth.html';
    });
})();

// Этот код выполняется при загрузке страницы root.js
// У тебя вместо auth будет главная страница с хэдером где кнопки войти (это надо сверстать и подставить)
