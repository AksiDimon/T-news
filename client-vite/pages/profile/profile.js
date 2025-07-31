// Рендерим header, если нужно
import { renderHeader } from '../../components/header.js';
import {insertPost} from "../../components/post";
import {SERVER_URL} from "../../consts";

renderHeader();

// Основные элементы
const usernameEl = document.querySelector('.profile__username');
const bioEl      = document.querySelector('.profile__bio-text');
const form = document.getElementById('comment-form');
const textarea = document.getElementById('story');
const postsContainer = document.querySelector('#posts-container');
const avatarInput = document.getElementById('avatar-input');
const avatarImg = document.querySelector('.profile__avatar img');
const editPhotoBtn = document.querySelector('.profile__edit-photo');
const subscribeBtn = document.querySelector('.profile__subscribe');
const userId = 'user_0';
const apiBase = 'http://localhost:3000/users';

// Подписка
subscribeBtn?.addEventListener('click', () => {
  subscribeBtn.textContent = subscribeBtn.textContent.trim() === 'Подписаться'
    ? 'Отписаться'
    : 'Подписаться';
});

// --- Загрузка bio and name профиля ---
async function loadProfile() {
  try {
    const res  = await fetch(`${apiBase}/${userId}`);
    if (!res.ok) throw new Error(res.statusText);
    const user = await res.json();

    // Подставляем в DOM
    usernameEl.textContent = user.username;
    bioEl.textContent      = user.bio;
    // avatarImg.src          = user.avatar || '/components/icons/default-avatar.svg';
  } catch (err) {
    console.error('Не удалось загрузить профиль:', err);
  }
}


// Редактирование аватара
editPhotoBtn?.addEventListener('click', () => avatarInput.click());

avatarInput?.addEventListener('change', async (e) => {
  const file = e.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = async () => {
    avatarImg.src = reader.result;

    try {
      const res = await fetch(`${apiBase}/${userId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ avatar: reader.result })
      });
      if (!res.ok) throw new Error(res.statusText);
      console.log('Аватар обновлён');
    } catch (err) {
      console.error('Ошибка загрузки аватара:', err);
      alert('Не удалось сохранить фото');
    }
  };

  []

  reader.readAsDataURL(file);
});

// Редактирование имени/описания
document.querySelectorAll('.profile__edit-icon')?.forEach(icon => {
  icon.addEventListener('click', () => enableInlineEdit(icon));
});

function enableInlineEdit(icon) {
  const field = icon.dataset.field;
  const textEl = icon.previousElementSibling || document.querySelector(`.profile__${field}`);
  if (!textEl) return;

  textEl.contentEditable = 'true';
  textEl.focus();
  textEl.classList.add('editing');

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
      console.log(`${field} обновлено`);
    } catch (err) {
      console.error(`Ошибка обновления ${field}:`, err);
      alert(`Не удалось сохранить ${field}`);
    }
  };

  textEl.addEventListener('blur', save);
  textEl.addEventListener('keydown', e => {
    if (e.key === 'Enter') {
      e.preventDefault();
      textEl.blur();
    }
  });
}

form?.addEventListener('submit', async (e) => {
  e.preventDefault();
  const text = textarea.value.trim();
  if (!text) return;

  const post = {
    userId: userId,
    content: text,
    likes: 0,
    comments: [],
  };


  textarea.value = '';
  textarea.focus();

  const newPost = await createPost(post);

  await insertPost(newPost, '#posts-container');
});

export async function createPost(post) {
  const res = await fetch(`${SERVER_URL}/posts`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(post),
  });

  if (!res.ok) {
    throw new Error('Не удалось обновить лайки');
  }

  return await res.json();
}

async function loadPosts() {
  try {
    const res = await fetch(`${SERVER_URL}/posts`);
    const posts = await res.json();
    const userPost = posts.filter((post)=> post.userId === userId);

    if (!posts.length) {
      postsContainer.innerHTML = '<p>Комментариев пока нет.</p>';
      return;
    }

    userPost.forEach((post) => {
      insertPost(post, "#posts-container")
    });
  } catch (err) {
    console.error(err);
    postsContainer.innerHTML =
      '<p class="error">Не удалось загрузить комментарии.</p>';
  }
}

loadProfile()
loadPosts();