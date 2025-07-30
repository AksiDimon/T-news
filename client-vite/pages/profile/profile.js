import { renderHeader } from '../../components/header.js';
import { insertPost } from '../../components/post.js';

renderHeader();
// Получаем узлы один раз
const commentTmpl = document.getElementById('comment-template');
const form = document.getElementById('comment-form');
const textarea = document.getElementById('story');
const commentsCont = document.getElementById('comments-container');

//логика с редак фото
const editPhotoBtn = document.querySelector('.profile__edit-photo');
const avatarInput   = document.getElementById('avatar-input');
const avatarImg     = document.querySelector('.profile__avatar img');

editPhotoBtn.addEventListener('click', () => avatarInput.click());


avatarInput.addEventListener('change', async (e) => {
  const file = e.target.files[0];
  if (!file) return;

  // 2.1. Превью в профиле
  const reader = new FileReader();
  reader.onload = () => {
    avatarImg.src = reader.result;
  };
  reader.readAsDataURL(file);

  // 2.2. Патчим пользователя в mock-сервере
  // Замените user_1 на текущий id из вашего состояния
  const userId = 'user_1';
  try {
    const res = await fetch(`http://localhost:3000/users/${userId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ avatar: reader.result })
    });
    if (!res.ok) throw new Error(res.statusText);
    console.log('Аватар сохранён в db.json');
  } catch (err) {
    console.error('Ошибка при сохранении аватара:', err);
    alert('Не удалось сохранить фото');
  }
});


//Редактирование имени и описания профеля --------
// в profile.js, после renderHeader() и кода комментариев
const EDITABLE_SELECTOR = '.profile__edit-icon';
const userId  = 'user_1';  // или ваше текущее user.id
const apiBase = 'http://localhost:3000/users';

document.querySelectorAll(EDITABLE_SELECTOR).forEach(icon => {
  icon.addEventListener('click', () => {
    const field = icon.dataset.field;              // "username" или "bio"
    // находим элемент с текстом рядом
    const textEl = icon.previousElementSibling || 
                   document.querySelector(`.profile__${field}${field==='bio' ? '-text' : ''}`);
    if (!textEl) return;

    // включаем редактирование
    textEl.contentEditable = 'true';
    textEl.focus();
    textEl.classList.add('editing'); // можно в CSS добавить подсветку

    // сохраняем по потере фокуса
    const save = async () => {
      textEl.contentEditable = 'false';
      textEl.classList.remove('editing');
      textEl.removeEventListener('blur', save);

      const newValue = textEl.textContent.trim();
      if (!newValue) return;

      try {
        const res = await fetch(`${apiBase}/${userId}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ [field]: newValue })
        });
        if (!res.ok) throw new Error(res.statusText);
        console.log(`Поле ${field} обновлено в mock-server`);
      } catch (err) {
        console.error(err);
        alert(`Не удалось сохранить ${field}`);
      }
    };

    // отслеживаем blur (и Enter, если нужно)
    textEl.addEventListener('blur', save);
    textEl.addEventListener('keydown', e => {
      if (e.key === 'Enter') {
        e.preventDefault();
        textEl.blur();
      }
    });
  });
});



//Логика отправки коментов --------------
form.addEventListener('submit', sendComment);

async function sendComment(e) {
  e.preventDefault();

  const text = textarea.value.trim();
  if (!text) return; // ничего не делаем, если пусто

  // здесь формируем «данные» комментария
  const commentData = {
    userId: 'User', // у вас может быть своё имя
    content: text,
  };

  // рендерим новый комментарий и добавляем в контейнер
  await insertPost(commentData, "#posts-container");

  textarea.value = ''; // чистим поле
  textarea.focus();
}

function handleLike(e) {
  const btn = e.currentTarget;

  const countSpan = btn.querySelector('.count-like');

  let count = Number(countSpan.textContent.trim());

  const isLiked = btn.classList.contains('liked');
  isLiked;
  if (!isLiked) {
    countSpan.textContent = ` ${count + 1}`;
    btn.classList.add('liked');
  } else {
    countSpan.textContent = ` ${count - 1}`;
    btn.classList.remove('liked');
  }

  console.log(isLiked, '😂');
}

function deleteComment (e) {
    const commentEl = e.target.closest('.comment');
  if (commentEl) commentEl.remove();
}



  const subscribeBtn =  document.querySelector('.profile__subscribe');

subscribeBtn.addEventListener('click', () => {
  if (subscribeBtn.textContent.trim() === 'Подписаться') {
    subscribeBtn.textContent = 'Отписаться';
  } else {
    subscribeBtn.textContent = 'Подписаться';
  }
})
