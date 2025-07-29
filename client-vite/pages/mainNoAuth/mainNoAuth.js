// pages/mainNoAuth/mainNoAuth.js
import { renderHeader } from '../../components/header.js';
import {SERVER_URL} from '../../consts.js' 
renderHeader();

const container = document.getElementById('posts-container');
const commentTmpl = document.getElementById('comment-template');

function renderComment(post) {
  // 1) Клонируем содержимое <template>
  const frag = commentTmpl.content.cloneNode(true);

  // 2) Находим слоты и подставляем текст
  const titleSlot = frag.querySelector('slot[name="title"]');
  const bodySlot = frag.querySelector('slot[name="body"]');
  const likesSlot = frag.querySelector('slot[name="likes"]');
  const commentsCountSlot = frag.querySelector('slot[name="commentsCount"]');
  const btn = frag.querySelector('.btn-comments');
  btn.addEventListener('click', () => {
      window.location.href = `/comments.html?postId=${post.id}`
  })

  titleSlot.textContent = post.userId;
  bodySlot.textContent = post.content;
  likesSlot.textContent= post.likes;
  commentsCountSlot.textContent = post.comments.length

  // 3) Подставляем счётчики лайков/комментариев
  // const likeCountElem     = frag.querySelector('.count');
  // const commentsCountElem = frag.querySelector('.btn-comments__count');
  // likeCountElem.textContent     = post.likes;
  // commentsCountElem.textContent = post.commentsCount;

  // 4) Возвращаем документ-фрагмент

  const btnLike = frag.querySelector('.btn-like');
  btnLike.addEventListener('click', handleLike);

  return frag;
}

function handleLike(e) {
  const btn = e.currentTarget;

  const countSpan = btn.querySelector('.count-like');
  console.log(countSpan, '😍');
  let count = Number(countSpan.textContent.trim());

  const isLiked = btn.classList.contains('liked');
  isLiked;
  if (!isLiked) {
    countSpan.innerHTML = `${count + 1}`;
    btn.classList.add('liked');
  } else {
    countSpan.innerHTML = `${count - 1}`;
    btn.classList.remove('liked');
  }

  console.log(isLiked, '😂');
}

function addCommentsEvent () {
    const commentButton = commentTmpl.querySelector('.btn-comments');
    console.log(commentButton)
    commentButton.addEventListener('click', (e) => {
      // console.log(e)
    })

}

document.addEventListener('DOMContentLoaded', addCommentsEvent) 



async function loadComments() {
  try {
    const res = await fetch(`${SERVER_URL}/posts`);
    const posts = await res.json();
    console.log(posts, '💕')
    if (!posts.length) {
      container.innerHTML = '<p>Комментариев пока нет.</p>';
      return;
    }

    posts.forEach((post) => {
      const commentNode = renderComment(post);
      container.appendChild(commentNode);
    });
  } catch (err) {
    console.error(err);
    container.innerHTML =
      '<p class="error">Не удалось загрузить комментарии.</p>';
    // container.innerHTML = '<p class="success">Не удалось загрузить комментарии.</p>';
  }
}

// Запускаем
loadComments();

