import { renderHeader } from '../../components/header.js';
import {SERVER_URL} from '../../consts.js' 
renderHeader();

const state = {
  comments: [],
}

const postContainerElement      = document.getElementById('post-preview');
const commentsContainerElement = document.getElementById('comments-container')

const postTmpl    = document.getElementById('post-template');
const commentTmpl    = document.getElementById('comment-template');




 console.log( window)
function renderPost(post) {
  // 1) Клонируем содержимое <template>
  const frag = postTmpl.content.cloneNode(true);

  //fetch(postId)

  // 2) Находим слоты и подставляем текст
  const titleSlot = frag.querySelector('slot[name="title"]');
  const bodySlot  = frag.querySelector('slot[name="body"]');
  titleSlot.textContent = post.userId;
  bodySlot .textContent = post.content;


    const btnLike = frag.querySelector('.btn-like');
    btnLike.addEventListener('click', handleLike)

      // Устанавливаем начальное количество комментариев
  const countSpan = frag.querySelector('.btn-comments__count');
  // Если у post есть массив комментариев
  const initialCount = Array.isArray(post.comments) ? post.comments.length : 0;
  countSpan.textContent = initialCount;

  console.log(btnLike, '❤️')

  // 4) Возвращаем документ-фрагмент
  return frag;
}
    function handleLike (e) {
      const btn = e.currentTarget;

      const countSpan = btn.querySelector('.count-like');

      let count = Number(countSpan.textContent.trim())
      


      const isLiked = btn.classList.contains('liked');
      isLiked
      if (!isLiked) {
        countSpan.textContent = ` ${count + 1}`
        btn.classList.add('liked'); 
      } else {
        countSpan.textContent = ` ${count - 1}`;
        btn.classList.remove('liked');
      }

      console.log(isLiked, '😂')
    }


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

    if(comment.userId !== 'User') {
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
const postId = urlParams.get("postId");

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

    const commentNode = renderPost(post);
    postContainerElement.appendChild(commentNode);

    
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
  // const form = querySelector("#form");
  // const formData = new FormData(form);
  // const data = Object.fromEntries(formData.entries());
  // console.log(data);// value from textarea;
  const textarea = document.getElementById('story');
  
  const text = textarea.value.trim();
  console.log(textarea, '💕', text)
  if(!text) return 

  const comment = {
   userId: 'User',
   content: text,
    avatar: "./svg",
  }

  const commentNode = renderComment(comment);
  commentsContainerElement.appendChild(commentNode);

    // **Обновляем счётчик комментариев**
  const countSpan = postContainerElement.querySelector('.btn-comments__count');
  const current = Number(countSpan.textContent.trim()) || 0;
  countSpan.textContent = current + 1;

  textarea.value = '';
}
const btnSendComment = document.getElementById("comment-form")
console.log(btnSendComment);
btnSendComment.addEventListener("submit", sendComment)






    // (function() {
    //   const form = document.getElementById('comment-form');
    //   const input = document.getElementById('comment-input');
    //   const commentsContainer = document.getElementById('comments-container');
    //   const tpl = document.getElementById('comment-template').content;

    //   form.addEventListener('submit', e => {
    //     e.preventDefault();
    //     const text = input.value.trim();
    //     if (!text) return;

    //     // клонируем ваш шаблон и вставляем текст
    //     const node = document.importNode(tpl, true);
    //     node.querySelector('slot[name="body"]').textContent = text;
    //     // можно проставить имя текущего пользователя:
    //     node.querySelector('slot[name="title"]').textContent = 'Вы';

    //     commentsContainer.appendChild(node);
    //     input.value = '';
    //     input.focus();
    //   });
    // })();