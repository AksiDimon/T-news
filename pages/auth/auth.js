import { renderHeader } from '../../components/header.js';
// Импортируем функцию для рендеринга header
renderHeader();

//после загрузки страницы, добавляем обработчик события на форму регистрации на странице registration.html
document.addEventListener('DOMContentLoaded', () => {
  const form = document.querySelector('#auth-form');
  if (!form) return;

  // Добавляем обработчик события на кнопку авторизации
  const registrationButton = form.querySelector('#user-reg');

  // Проверяем, что кнопка авторизации существует на странице
  if (registrationButton) {
    registrationButton.addEventListener('click', () => {
      window.location.href = '/registration.html';
    });
  }
  // Добавляем обработчик события на отправку формы
  form.addEventListener('submit', async (event) => {
    event.preventDefault();

    // Проверяем, что все поля заполнены
    const formData = new FormData(form);
    const data = Object.fromEntries(formData.entries());

    try {
      const response = {
        user: 'dimon777',
      };

      localStorage.setItem('token', '123');
      window.location.href = '/';

      // const result = await response.json();

      // console.log(result, '😂')
    } catch (error) {
      console.error('Error:', error);
      alert('Ошибка при регистрации. Попробуйте снова.');
    }
  });
});
