const express = require('express');
const fs = require('fs');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const { v4: uuidv4 } = require('uuid');

const app = express();
app.use(express.json());

const DATA_PATH = './db.json';
const JWT_SECRET = 'your_jwt_secret'; // Замените на свой секретный ключ
const PORT = 3000;

// Чтение и запись базы данных (JSON-файл)
function readData() {
  if (!fs.existsSync(DATA_PATH)) {
    fs.writeFileSync(DATA_PATH, JSON.stringify({ users: [], posts: [] }, null, 2));
  }
  return JSON.parse(fs.readFileSync(DATA_PATH));
}
function writeData(data) {
  fs.writeFileSync(DATA_PATH, JSON.stringify(data, null, 2));
}

// Генерация JWT
function generateToken(payload) {
  return jwt.sign(payload, JWT_SECRET);
}

// Middleware для проверки токена
function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) return res.sendStatus(401);
  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.sendStatus(403);
    req.user = user;
    next();
  });
}

// Регистрация нового пользователя
app.post('/api/users', (req, res) => {
  const { username, password } = req.body;
  const data = readData();
  if (data.users.find(u => u.username === username)) {
    return res.status(400).json({ error: 'Username уже занят' });
  }
  const newUser = {
    id: uuidv4(),
    username,
    password: bcrypt.hashSync(password, 10),
    avatar: '',
    bio: '',
    following: []
  };
  data.users.push(newUser);
  writeData(data);
  const { password: _, ...user } = newUser;
  res.status(201).json(user);
});

// Вход (логин)
app.post('/api/login', (req, res) => {
  const { username, password } = req.body;
  const data = readData();
  const user = data.users.find(u => u.username === username);
  if (!user || !bcrypt.compareSync(password, user.password)) {
    return res.status(401).json({ error: 'Неверные username или password' });
  }
  const token = generateToken({ id: user.id, username: user.username });
  res.json({ token });
});

// Получить всех пользователей
app.get('/api/users', (req, res) => {
  const data = readData();
  const users = data.users.map(u => {
    const { password, ...pub } = u;
    return pub;
  });
  res.json(users);
});

// Получить пользователя по ID
app.get('/api/users/:userId', (req, res) => {
  const data = readData();
  const user = data.users.find(u => u.id === req.params.userId);
  if (!user) return res.status(404).json({ error: 'User not found' });
  const { password, ...pub } = user;
  res.json(pub);
});

// Обновить профиль пользователя
app.patch('/api/users/:userId', authenticateToken, (req, res) => {
  const data = readData();
  const user = data.users.find(u => u.id === req.params.userId);
  if (!user) return res.status(404).json({ error: 'User not found' });
  if (req.user.id !== user.id) return res.sendStatus(403);
  const { username, bio, avatar } = req.body;
  if (username) user.username = username;
  if (bio) user.bio = bio;
  if (avatar) user.avatar = avatar;
  writeData(data);
  const { password, ...pub } = user;
  res.json(pub);
});

// Получить все посты пользователя
app.get('/api/users/:userId/posts', (req, res) => {
  const data = readData();
  const posts = data.posts.filter(p => p.userId === req.params.userId);
  res.json(posts);
});

// Создать новый пост
app.post('/api/users/:userId/posts', authenticateToken, (req, res) => {
  if (req.user.id !== req.params.userId) return res.sendStatus(403);
  const { content } = req.body;
  const data = readData();
  const newPost = {
    id: uuidv4(),
    userId: req.user.id,
    content,
    likes: 0,
    comments: [],
    likedBy: []
  };
  data.posts.push(newPost);
  writeData(data);
  res.status(201).json(newPost);
});

// Удалить пост
app.delete('/api/posts/:postId', authenticateToken, (req, res) => {
  const data = readData();
  const postIndex = data.posts.findIndex(p => p.id === req.params.postId);
  if (postIndex === -1) return res.status(404).json({ error: 'Post not found' });
  if (req.user.id !== data.posts[postIndex].userId) return res.sendStatus(403);
  data.posts.splice(postIndex, 1);
  writeData(data);
  res.sendStatus(204);
});

// Поставить лайк
app.post('/api/posts/:postId/likes', authenticateToken, (req, res) => {
  const data = readData();
  const post = data.posts.find(p => p.id === req.params.postId);
  if (!post) return res.status(404).json({ error: 'Post not found' });
  if (!post.likedBy.includes(req.user.id)) {
    post.likedBy.push(req.user.id);
    post.likes += 1;
  }
  writeData(data);
  res.status(201).json({ message: 'Post liked' });
});

// Убрать лайк
app.delete('/api/posts/:postId/likes', authenticateToken, (req, res) => {
  const data = readData();
  const post = data.posts.find(p => p.id === req.params.postId);
  if (!post) return res.status(404).json({ error: 'Post not found' });
  const idx = post.likedBy.indexOf(req.user.id);
  if (idx !== -1) {
    post.likedBy.splice(idx, 1);
    post.likes = Math.max(post.likes - 1, 0);
  }
  writeData(data);
  res.sendStatus(204);
});

// Получить все комментарии к посту
app.get('/api/posts/:postId/comments', (req, res) => {
  const data = readData();
  const post = data.posts.find(p => p.id === req.params.postId);
  if (!post) return res.status(404).json({ error: 'Post not found' });
  res.json(post.comments);
});

// Добавить комментарий
app.post('/api/posts/:postId/comments', authenticateToken, (req, res) => {
  const data = readData();
  const post = data.posts.find(p => p.id === req.params.postId);
  if (!post) return res.status(404).json({ error: 'Post not found' });
  const { content } = req.body;
  const newComment = { id: uuidv4(), userId: req.user.id, content };
  post.comments.push(newComment);
  writeData(data);
  res.status(201).json(newComment);
});

// Удалить комментарий
app.delete('/api/comments/:commentId', authenticateToken, (req, res) => {
  const data = readData();
  let found = false;
  for (const post of data.posts) {
    const idx = post.comments.findIndex(c => c.id === req.params.commentId);
    if (idx !== -1) {
      found = true;
      const comment = post.comments[idx];
      if (req.user.id !== comment.userId && req.user.id !== post.userId) return res.sendStatus(403);
      post.comments.splice(idx, 1);
      break;
    }
  }
  if (!found) return res.status(404).json({ error: 'Comment not found' });
  writeData(data);
  res.sendStatus(204);
});

// Подписаться на пользователя
app.post('/api/users/:userId/follow', authenticateToken, (req, res) => {
  const data = readData();
  const targetId = req.params.userId;
  if (targetId === req.user.id) return res.status(400).json({ error: 'Cannot follow yourself' });
  const currentUser = data.users.find(u => u.id === req.user.id);
  const targetUser = data.users.find(u => u.id === targetId);
  if (!targetUser) return res.status(404).json({ error: 'User to follow not found' });
  if (!currentUser.following.includes(targetId)) currentUser.following.push(targetId);
  writeData(data);
  res.status(201).json({ message: 'User followed' });
});

// Отписаться от пользователя
app.delete('/api/users/:userId/follow', authenticateToken, (req, res) => {
  const data = readData();
  const currentUser = data.users.find(u => u.id === req.user.id);
  const idx = currentUser.following.indexOf(req.params.userId);
  if (idx !== -1) currentUser.following.splice(idx, 1);
  writeData(data);
  res.sendStatus(204);
});

// Список пользователей, на кого подписан пользователь
app.get('/api/users/:userId/following', (req, res) => {
  const data = readData();
  const user = data.users.find(u => u.id === req.params.userId);
  if (!user) return res.status(404).json({ error: 'User not found' });
  const list = data.users
    .filter(u => user.following.includes(u.id))
    .map(({ password, ...pub }) => pub);
  res.json(list);
});

// Лента постов от подписанных пользователей
app.get('/api/feed', authenticateToken, (req, res) => {
  const data = readData();
  const currentUser = data.users.find(u => u.id === req.user.id);
  if (!currentUser) return res.status(401).json({ error: 'User not found' });
  const feed = data.posts.filter(p => currentUser.following.includes(p.userId));
  res.json(feed);
});


app.get('/api/search', (req, res) => {
  const { query, type } = req.query;
  if (!query || !type) return res.status(400).json({ error: 'query и type обязательны' });
  const q = query.toLowerCase();
  const data = readData();
  if (type === 'users') {
    const users = data.users.filter(u =>
      u.username.toLowerCase().includes(q) || (u.bio && u.bio.toLowerCase().includes(q))
    ).map(({ password, ...pub }) => pub);
    return res.json(users);
  }
  if (type === 'posts') {
    const posts = data.posts.filter(p => p.content.toLowerCase().includes(q));
    return res.json(posts);
  }
  res.status(400).json({ error: 'type должен быть users или posts' });
});

// Запуск сервера
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}/api`);
});
