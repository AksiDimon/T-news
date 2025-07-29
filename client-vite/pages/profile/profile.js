import { renderHeader } from '/components/header.js';
renderHeader();

// Получаем узлы один раз
const commentTmpl = document.getElementById('comment-template');
const form = document.getElementById('comment-form');
const textarea = document.getElementById('story');
const commentsCont = document.getElementById('comments-container');

form.addEventListener('submit', sendComment);

function sendComment(e) {
  e.preventDefault();

  const text = textarea.value.trim();
  if (!text) return; // ничего не делаем, если пусто

  // здесь формируем «данные» комментария
  const commentData = {
    name: 'User', // у вас может быть своё имя
    body: text,
  };

  // рендерим новый комментарий и добавляем в контейнер
  const commentNode = renderComment(commentData);
  commentsCont.appendChild(commentNode);

  textarea.value = ''; // чистим поле
  textarea.focus();
}

function renderComment({ name, body }) {
  // клонируем содержимое <template>
  const clone = commentTmpl.content.cloneNode(true);

  // находим в клоне наши «слоты»
  const titleSlot = clone.querySelector('slot[name="title"]');
  const bodySlot = clone.querySelector('slot[name="body"]');

  // вставляем текст в нужные места
  titleSlot.textContent = name;
  bodySlot.textContent = body;

  const btnLike = clone.querySelector('.btn-like');
  btnLike.addEventListener('click', handleLike);

    const btnDelete = clone.querySelector('.btn-delete');
  btnDelete.addEventListener('click', deleteComment);
  // возвращаем полноценный DocumentFragment
  return clone;
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
