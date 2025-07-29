import { defineConfig } from 'vite';

export default defineConfig({
  root: '.',
  build: {
    rollupOptions: {
      input: {
        main: 'index.html',
        registration: 'registration.html',
        auth: 'auth.html',
        mainNoAuth: 'mainNoAuth.html',
        mainAuth: 'mainAuth.html',
        comments: 'comments.html',
        profile: 'profile.html',
        searchUsers: 'searchUsers.html',
        searchPosts: 'searchPosts.httml'
      },
    },
  },
});
