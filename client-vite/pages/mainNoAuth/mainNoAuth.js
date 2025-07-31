// pages/mainNoAuth/mainNoAuth.js
import { renderHeader } from '../../components/header.js';
import { insertPost } from '../../components/post.js';

import { SERVER_URL } from '../../consts.js';
renderHeader();

const container = document.getElementById('posts-container');

async function loadPosts() {
  try {
    const res = await fetch(`${SERVER_URL}/posts`);
    const posts = await res.json();
    console.log(posts, '💕');
    if (!posts.length) {
      container.innerHTML = '<p>Комментариев пока нет.</p>';
      return;
    }

    posts.forEach((post) => {
      insertPost(post, '#posts-container');
    });
  } catch (err) {
    console.error(err);
    container.innerHTML =
      '<p class="error">Не удалось загрузить комментарии.</p>';
  }
}

loadPosts();
