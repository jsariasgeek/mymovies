import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import MovieView from '../views/MovieView.vue'
import MovieCreation from '../views/MovieCreation.vue'
import AdminView from '../views/AdminView.vue'
const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView,
    },
    {
      path: '/admin',
      name: 'admin',
      component: AdminView,
    },
    {
      path: '/movie/:id',
      name: 'movie',
      component: MovieView,
    },
    {
      path: '/movie/create',
      name: 'movie-create',
      component: MovieCreation,
    },
  ],
})

export default router
