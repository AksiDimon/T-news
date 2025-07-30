import { SERVER_URL } from '../consts.js' 

const path = window.location.pathname;
const isProfilePage = path === '/profile.html'

export async function loadCardTemplate() {
    const res = await fetch('components/post.html'); // путь к шаблону
    return await res.text();
  } 
  
  export async function insertPost(post, targetSelector) {
    const templateHTML = await loadCardTemplate();
  
    const parser = new DOMParser();
    const doc = parser.parseFromString(templateHTML, 'text/html');
    const template = doc.querySelector('#post-template');
  
    if (!template) {
      console.error('Шаблон #post-template не найден в post.html');
      return;
    } 
  
    const frag = template.content.cloneNode(true); 
    const btnLike = frag.querySelector('.btn-like');
    const likeCountElem = frag.querySelector('.count-like');
  
    let currentLikes = post.likes;
  
    btnLike.addEventListener('click', async () => {
      try {
        currentLikes += 1;
        likeCountElem.textContent = currentLikes;
  
        await updateLikes(post.id, currentLikes);
      } catch (err) {
        console.error(err); 
        currentLikes -= 1;
        likeCountElem.textContent = currentLikes;
      }
    });

    frag.querySelector(".btn-comments").addEventListener("click", ()=> {
        window.location.href = `/comments.html?postId=${post.id}`   })
 ;   
    if (isProfilePage) {
       frag.querySelector('.post__body img').style = "display:inline;";
    }

    frag.querySelector('.post__title-text').textContent = post.userId;
    frag.querySelector('.post__body-text').textContent = post.content;
  
    if (post.likes) {
      frag.querySelector('.count-like').textContent = post.likes;
    }
  
    if (post.comments && post.comments.length > 0) {
      frag.querySelector('.btn-posts__count').textContent = post.comments.length;
    }
  
    const target = document.querySelector(targetSelector);
    if (target) {
      target.appendChild(frag);
    }
  }
  
 
  export async function updateLikes(postId, newLikes) {
    const res = await fetch(`${SERVER_URL}/posts/${postId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ likes: newLikes }),
    });
  
    if (!res.ok) {
      throw new Error('Не удалось обновить лайки');
    }
  
    return await res.json(); 
  }