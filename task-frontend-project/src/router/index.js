import Vue from 'vue';
import Router from 'vue-router';

// Import your components
// import Home from './components/Home.vue';
import LoginPage from '../components/LoginPage.vue';
import UserPage from '../components/UserPage.vue';

// Tell Vue to use Vue Router
Vue.use(Router);

// Define your routes
const routes = [
//   { path: '/', component: Home },
//   { path: '/about', component: About },
  {
    path: "/",
    name: "login",
    component: LoginPage,
  },

  {
    path: "/user/:userId",
    name: "user",
    component: UserPage,
  },
];

// Create and export the router instance
const router = new Router({
  mode: 'history', // Use HTML5 History API for cleaner URLs
  routes,
});

export default router;
