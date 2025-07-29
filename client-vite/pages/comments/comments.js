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


  console.log(btnLike, '❤️')
  // 3) Подставляем счётчики лайков/комментариев
  // const likeCountElem     = frag.querySelector('.count');
  // const commentsCountElem = frag.querySelector('.btn-comments__count');
  // likeCountElem.textContent     = post.likes;
  // commentsCountElem.textContent = post.commentsCount;

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

  titleSlot.textContent = comment.name;
  bodySlot .textContent = comment.body;
  console.log(commentWrapper)
  commentWrapper.dataset.id = comment.id;



  const btnDelete = frag.querySelector('.btn-delete');
  btnDelete.addEventListener('click', deleteComment);

 


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

// Запускаем
// [
//     {
//         "postId": 3,
//         "id": 11,
//         "name": "fugit labore quia mollitia quas deserunt nostrum sunt",
//         "email": "Veronica_Goodwin@timmothy.net",
//         "body": "ut dolorum nostrum id quia aut est\nfuga est inventore vel eligendi explicabo quis consectetur\naut occaecati repellat id natus quo est\nut blanditiis quia ut vel ut maiores ea"
//     },
//     {
//         "postId": 3,
//         "id": 12,
//         "name": "modi ut eos dolores illum nam dolor",
//         "email": "Oswald.Vandervort@leanne.org",
//         "body": "expedita maiores dignissimos facilis\nipsum est rem est fugit velit sequi\neum odio dolores dolor totam\noccaecati ratione eius rem velit"
//     },
//     {
//         "postId": 3,
//         "id": 13,
//         "name": "aut inventore non pariatur sit vitae voluptatem sapiente",
//         "email": "Kariane@jadyn.tv",
//         "body": "fuga eos qui dolor rerum\ninventore corporis exercitationem\ncorporis cupiditate et deserunt recusandae est sed quis culpa\neum maiores corporis et"
//     },
//     {
//         "postId": 3,
//         "id": 14,
//         "name": "et officiis id praesentium hic aut ipsa dolorem repudiandae",
//         "email": "Nathan@solon.io",
//         "body": "vel quae voluptas qui exercitationem\nvoluptatibus unde sed\nminima et qui ipsam aspernatur\nexpedita magnam laudantium et et quaerat ut qui dolorum"
//     },
//     {
//         "postId": 3,
//         "id": 15,
//         "name": "debitis magnam hic odit aut ullam nostrum tenetur",
//         "email": "Maynard.Hodkiewicz@roberta.com",
//         "body": "nihil ut voluptates blanditiis autem odio dicta rerum\nquisquam saepe et est\nsunt quasi nemo laudantium deserunt\nmolestias tempora quo quia"
//     }
// ]

async function loadComments() {
    try {
    const urlParams = new URLSearchParams(window.location.search);
    const postId = urlParams.get("postId");
    const res = await fetch(`https://jsonplaceholder.typicode.com/posts/${postId}/comments`);
    const comments = await res.json();
  
    state.comments = comments;

    console.log(comments, '😍')
    state.comments.forEach(comment => {
      const commentNode = renderComment(comment);
       commentsContainerElement.appendChild(commentNode);
    });
  

    // if (!post) {
    //   container.innerHTML = '<p>Не удалось загрузить пост.</p>';
    //   return;
    // }

    // const commentNode = renderComment(post);
    // container.appendChild(commentNode);

    
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
  console.log(textarea, '💕')
  const text = textarea.value.trim();
  if(!text) return 

  const comment = {
    name: 'User',
    body: text,
    avatar: "./svg",
  }

  const commentNode = renderComment(comment);
  commentsContainerElement.appendChild(commentNode);

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