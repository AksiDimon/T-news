import { renderHeader } from '../../components/header.js';
import { insertPost } from '../../components/post.js';
import {SERVER_URL} from '../../consts.js' 
renderHeader();

const state = {
  comments: [],
}

const postContainerElement      = document.getElementById('post-preview');
const commentsContainerElement = document.getElementById('comments-container')


const commentTmpl    = document.getElementById('comment-template');



function renderComment(comment) {
  // 1) Клонируем содержимое <template>
  const frag = commentTmpl.content.cloneNode(true);

  //fetch(postId)

  // 2) Находим слоты и подставляем текст
  const titleSlot = frag.querySelector('slot[name="title"]');
  const bodySlot  = frag.querySelector('slot[name="body"]');
  const commentWrapper = frag.querySelector('.comment-remark');

  titleSlot.textContent = comment.userId;
  bodySlot .textContent = comment.content;
  console.log(commentWrapper)
  commentWrapper.dataset.id = comment.id;



// Добавляю кнопку удаления комента только для залагиненых
  const btnDelete = frag.querySelector('.btn-delete');
  btnDelete.addEventListener('click', deleteComment);

    if(comment.userId !== 'User_0') {
      console.log('1+')
      btnDelete.remove()
    } else {
      btnDelete.addEventListener('click', deleteComment)
    }


  // 4) Возвращаем документ-фрагмент
  return frag;
}

function deleteComment (e) {
    const commentEl = e.target.closest('.comment-remark');
  if (commentEl) commentEl.remove();
}

const urlParams = new URLSearchParams(window.location.search);


async function loadPost() {
  try {
    const urlParams = new URLSearchParams(window.location.search);
    const postId = urlParams.get("postId");
    const res = await fetch(`${SERVER_URL}/posts/${postId}`);
    const post = await res.json();
    console.log("POST",post);

    if (!post) {
      postContainerElement.innerHTML = '<p>Не удалось загрузить пост.</p>';
      return;
    }

    insertPost(post, '#post-preview', 'pointer-events: none; border: 1px solid rgba(0, 16, 36, 0.12); background: none')
    
  } catch (err) {
    console.error(err);
    postContainerElement.innerHTML = '<p class="error">NOT RESOLVE POSR.</p>';
  }
}


async function loadComments() {
    try {
    const urlParams = new URLSearchParams(window.location.search);
    const postId = urlParams.get("postId");
    const res = await fetch(`${SERVER_URL}/posts/${postId}`);
    const post = await res.json();
    const comments = await post.comments;
  
    state.comments = comments;

    console.log(comments, '😍')
    state.comments.forEach(comment => {
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

function sendComment(e) {
  e.preventDefault();

  const textarea = document.getElementById('story');
  const text = textarea.value.trim();

  if (!text) return;

  const comment = {
    userId: 'User_0',
    content: text,
    avatar: './svg',
  };

  const commentNode = renderComment(comment);
  commentsContainerElement.appendChild(commentNode);

  textarea.value = '';

  const countSpan = postContainerElement.querySelector('.btn-comments__count');
  const current = Number(countSpan.textContent.trim()) || 0;
  countSpan.textContent = current + 1;
}
const btnSendComment = document.getElementById("comment-form")
console.log(btnSendComment);
btnSendComment.addEventListener("submit", sendComment)



