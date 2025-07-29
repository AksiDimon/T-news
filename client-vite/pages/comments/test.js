import { renderHeader } from '../../components/header.js';

// Инициализация приложения
document.addEventListener('DOMContentLoaded', initApp);

// Основные DOM элементы
const postContainerElement = document.getElementById('post-preview');
const commentsContainerElement = document.getElementById('comments-container');
const commentFormElement = document.getElementById('comment-form');

// Состояние приложения
const state = {
  post: null,
  comments: [],
  loading: false,
  error: null,
  tempCommentId: null
};

// Сервис для работы с API
const apiService = {
  async getPost(postId) {
    const res = await fetch(`https://jsonplaceholder.typicode.com/posts/${postId}`);
    if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
    return res.json();
  },

  async getComments(postId) {
    const res = await fetch(`https://jsonplaceholder.typicode.com/posts/${postId}/comments`);
    if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
    return res.json();
  },

  async addComment(postId, comment) {
    const res = await fetch(`https://jsonplaceholder.typicode.com/posts/${postId}/comments`, {
      method: 'POST',
      body: JSON.stringify(comment),
      headers: {
        'Content-type': 'application/json; charset=UTF-8',
      },
    });
    if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
    return res.json();
  }
};

// Сервис рендеринга
const renderService = {
  postTemplate: document.getElementById('post-template'),
  commentTemplate: document.getElementById('comment-template'),

  renderPost(post) {
    if (!post) return document.createDocumentFragment();
    
    const frag = this.postTemplate.content.cloneNode(true);
    frag.querySelector('slot[name="title"]').textContent = post.title;
    frag.querySelector('slot[name="body"]').textContent = post.body;
    return frag;
  },

  renderComment(comment) {
    const frag = this.commentTemplate.content.cloneNode(true);
    frag.querySelector('slot[name="title"]').textContent = comment.name;
    frag.querySelector('slot[name="body"]').textContent = comment.body;
    frag.querySelector('.comment').dataset.id = comment.id;
    return frag;
  },

  renderLoader() {
    const loader = document.createElement('div');
    loader.className = 'loader';
    loader.innerHTML = `
      <div class="spinner"></div>
      <p>Loading...</p>
    `;
    return loader;
  },

  renderError(message) {
    const errorEl = document.createElement('div');
    errorEl.className = 'error';
    errorEl.innerHTML = `
      <p>${message}</p>
      <button class="retry-btn">Try Again</button>
    `;
    return errorEl;
  }
};

// Обновление состояния и перерисовка
function updateState(newState) {
  Object.assign(state, newState);
  renderApp();
}

// Главная функция рендеринга
function renderApp() {
  // Очистка контейнеров
  postContainerElement.innerHTML = '';
  commentsContainerElement.innerHTML = '';

  // Показ состояния загрузки
  if (state.loading) {
    postContainerElement.appendChild(renderService.renderLoader());
    return;
  }

  // Показ ошибок
  if (state.error) {
    const errorEl = renderService.renderError(state.error);
    errorEl.querySelector('.retry-btn').addEventListener('click', initApp);
    postContainerElement.appendChild(errorEl);
    return;
  }

  // Рендеринг поста
  if (state.post) {
    postContainerElement.appendChild(renderService.renderPost(state.post));
  }

  // Рендеринг комментариев
  if (state.comments.length > 0) {
    const fragment = document.createDocumentFragment();
    state.comments.forEach(comment => {
      fragment.appendChild(renderService.renderComment(comment));
    });
    commentsContainerElement.appendChild(fragment);
  } else if (state.post) {
    commentsContainerElement.innerHTML = '<p class="no-comments">No comments yet. Be the first!</p>';
  }
}

// Загрузка данных
async function loadData(postId) {
  try {
    updateState({ loading: true, error: null });
    
    const [post, comments] = await Promise.all([
      apiService.getPost(postId),
      apiService.getComments(postId)
    ]);
    
    updateState({ 
      post, 
      comments,
      loading: false 
    });
    
  } catch (error) {
    console.error('Data loading failed:', error);
    updateState({ 
      error: 'Failed to load data. Please try again later.',
      loading: false 
    });
  }
}

// Отправка комментария
async function sendComment(e) {
  e.preventDefault();
  
  const formData = new FormData(e.target);
  const commentText = formData.get('comment').trim();
  
  if (!commentText) return;
  
  const urlParams = new URLSearchParams(window.location.search);
  const postId = urlParams.get("postId");
  
  if (!postId) {
    updateState({ error: 'Post ID is missing' });
    return;
  }
  
  try {
    // Создаем временный комментарий для оптимистичного UI
    const tempComment = {
      id: `temp-${Date.now()}`,
      name: "You",
      body: commentText,
      email: ""
    };
    
    updateState({
      comments: [tempComment, ...state.comments],
      tempCommentId: tempComment.id
    });
    
    // Отправка на сервер
    const newComment = {
      postId: parseInt(postId),
      name: "Current User",
      email: "user@example.com",
      body: commentText
    };
    
    const savedComment = await apiService.addComment(postId, newComment);
    
    // Заменяем временный комментарий на постоянный
    updateState({
      comments: state.comments.map(comment => 
        comment.id === state.tempCommentId ? savedComment : comment
      ),
      tempCommentId: null
    });
    
    // Сбрасываем форму
    e.target.reset();
    
  } catch (error) {
    console.error('Comment submission failed:', error);
    
    // Откатываем UI при ошибке
    updateState({
      comments: state.comments.filter(c => c.id !== state.tempCommentId),
      tempCommentId: null,
      error: 'Failed to post comment. Please try again.'
    });
  }
}

// Инициализация приложения
function initApp() {
  renderHeader();
  
  const urlParams = new URLSearchParams(window.location.search);
  const postId = urlParams.get("postId");
  
  if (!postId) {
    updateState({ error: "Post ID is missing in URL" });
    return;
  }
  
  // Настройка обработчиков
  commentFormElement.addEventListener('submit', sendComment);
  
  // Загрузка данных
  loadData(postId);
}