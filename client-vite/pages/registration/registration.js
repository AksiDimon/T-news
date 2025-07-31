import { renderHeader } from '../../components/header.js';

renderHeader();

//после загрузки страницы, добавляем обработчик события на форму регистрации на странице registration.html
document.addEventListener('DOMContentLoaded', () => {
  // Проверяем, что форма регистрации существует на странице
  const form = document.querySelector('#registration-form');
  if (!form) return;

  // Добавляем обработчик события на кнопку авторизации
  const authButton = form.querySelector('#user-auth');

  // Проверяем, что кнопка авторизации существует на странице
  if (authButton) {
    console.log(authButton);
    authButton.addEventListener('click', () => {
      window.location.href = '/auth.html';
    });
  }

  // Добавляем обработчик события на отправку формы
  form.addEventListener('submit', async (event) => {
    event.preventDefault();

    // Проверяем, что все поля заполнены
    const formData = new FormData(form);
    const data = Object.fromEntries(formData.entries());

    if (data.password !== data.confirmPassword) {
      alert('Пароли не совпадают');
      return;
    }

    try {
      window.location.href = "/auth.html"

    } catch (error) {
      console.error('Error:', error);
      alert('Ошибка при регистрации. Попробуйте снова.');
    }
  });
});
