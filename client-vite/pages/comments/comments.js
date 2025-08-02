import { renderHeader } from '../../components/header.js';
import { insertPost } from '../../components/post.js';
import { SERVER_URL } from '../../consts.js';
renderHeader();

const state = {
  comments: [],
};

const postContainerElement = document.getElementById('post-preview');
const commentsContainerElement = document.getElementById('comments-container');

const commentTmpl = document.getElementById('comment-template');

function renderComment(comment) {
  // 1) Клонируем содержимое <template>
  const frag = commentTmpl.content.cloneNode(true);

  //fetch(postId)

  // 2) Находим слоты и подставляем текст
  const titleSlot = frag.querySelector('slot[name="title"]');
  const bodySlot = frag.querySelector('slot[name="body"]');
  const commentWrapper = frag.querySelector('.comment-remark');

  titleSlot.textContent = comment.userId;
  bodySlot.textContent = comment.content;
  console.log(commentWrapper);
  commentWrapper.dataset.id = comment.id;

  // Добавляю кнопку удаления комента только для залагиненых
  const btnDelete = frag.querySelector('.btn-delete');
  btnDelete.addEventListener('click', deleteComment);

  if (comment.userId !== 'User_0') {
    console.log('1+');
    btnDelete.remove();
  } else {
    btnDelete.addEventListener('click', deleteComment);
  }

  // 4) Возвращаем документ-фрагмент
  return frag;
}

// локальное удаление комента.
// function deleteComment(e) {
//   const commentEl = e.target.closest('.comment-remark');
//   if (commentEl) commentEl.remove();
// }

async function deleteComment(e) {
  const commentEl = e.target.closest('.comment-remark');
  if (!commentEl) return;

  // console.log('удаляемый элемент:', commentEl);
  // console.log('dataset:', commentEl.dataset);
  // console.log('commentId из dataset.id →', commentEl.dataset.id);

  const commentId = commentEl.dataset.id;
  const postId = new URLSearchParams(window.location.search).get('postId');

  try {
    // 1. Подтягиваем текущий пост (или берём из state.comments, если вы его заранее загрузили)
    const postRes = await fetch(`${SERVER_URL}/posts/${postId}`);
    if (!postRes.ok) throw new Error('Не удалось загрузить пост');
    const post = await postRes.json();

    // 2. Фильтруем комментарий по id
    const updatedComments = (post.comments || []).filter(c => c.id !== commentId);

    // 3. Отправляем на сервер обновлённый массив комментариев
    const patchRes = await fetch(`${SERVER_URL}/posts/${postId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ comments: updatedComments })
    });
    if (!patchRes.ok) throw new Error('Не удалось удалить комментарий на сервере');

    // 4. После успешного ответа — удаляем ноду и обновляем счётчик
    commentEl.remove();

    const countSpan = postContainerElement.querySelector('.btn-posts__count');
    countSpan.textContent = updatedComments.length;

  } catch (err) {
    console.error(err);
    alert('Ошибка при удалении комментария: ' + err.message);
  }
}


const urlParams = new URLSearchParams(window.location.search);

async function loadPost() {
  try {
    const urlParams = new URLSearchParams(window.location.search);
    const postId = urlParams.get('postId');
    const res = await fetch(`${SERVER_URL}/posts/${postId}`);
    const post = await res.json();
    console.log('POST', post);

    if (!post) {
      postContainerElement.innerHTML = '<p>Не удалось загрузить пост.</p>';
      return;
    }

    insertPost(
      post,
      '#post-preview',
      'pointer-events: none; border: 1px solid rgba(0, 16, 36, 0.12); background: none'
    );
  } catch (err) {
    console.error(err);
    postContainerElement.innerHTML = '<p class="error">NOT RESOLVE POSR.</p>';
  }
}

async function loadComments() {
  try {
    const urlParams = new URLSearchParams(window.location.search);
    const postId = urlParams.get('postId');
    const res = await fetch(`${SERVER_URL}/posts/${postId}`);
    const post = await res.json();
    const comments = await post.comments;

    state.comments = comments;

    console.log(comments, '😍');
    state.comments.forEach((comment) => {
      const commentNode = renderComment(comment);
      commentsContainerElement.appendChild(commentNode);
    });
  } catch (err) {
    console.error(err);
    container.innerHTML = '<p class="error">NOT RESOLVE POSR.</p>';
  }
}

loadComments();
loadPost();

async function sendComment(e) {
  e.preventDefault();

  const textarea = document.getElementById('story');
  const text = textarea.value.trim();
  if (!text) return;  // не отправляем пустые

  // 1. Подготовить объект комментария
  const newComment = {
    id: new Date().toString(),
    userId: 'User_0',
    content: text,
    avatar: './svg'
    // не кладём здесь `id` — пусть сервер сам его сгенерирует
  };

  // 2. Определить postId из URL
  const postId = new URLSearchParams(window.location.search).get('postId');

  try {
    // 3. Загрузить текущий пост, чтобы получить существующий массив comments
    const postRes = await fetch(`${SERVER_URL}/posts/${postId}`);
    if (!postRes.ok) throw new Error('Не удалось получить пост');
    const post = await postRes.json();

    // 4. Сформировать новый массив комментариев
    const updatedComments = [...(post.comments || []), newComment];

    // 5. Отправить PATCH на бекенд
    const patchRes = await fetch(`${SERVER_URL}/posts/${postId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ comments: updatedComments })
    });
    if (!patchRes.ok) throw new Error('Не удалось сохранить комментарий');

    // 6. Получить обновлённый пост из ответа
    const updatedPost = await patchRes.json();
    state.comments = updatedPost.comments;

    // 7. Найти только что добавленный комментарий (последний в массиве)
    const savedComment = state.comments[state.comments.length - 1];

    // 8. Отрисовать его и добавить в DOM
    const commentNode = renderComment(savedComment);
    commentsContainerElement.appendChild(commentNode);

    // 9. Обновить счётчик комментариев по длине массива
    const countSpan = postContainerElement.querySelector('.btn-posts__count');
    countSpan.textContent = state.comments.length;

    // 10. Очистить поле ввода
    textarea.value = '';

  } catch (err) {
    console.error(err);
    alert('Ошибка при отправке комментария: ' + err.message);
  }
}

const btnSendComment = document.getElementById('comment-form');
console.log(btnSendComment);
btnSendComment.addEventListener('submit', sendComment);
