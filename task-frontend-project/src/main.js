import Vue from 'vue'
import App from './App.vue'
import router from './router';
import useVuelidate from '@vuelidate/core'; 
import axios from 'axios';
import VueSweetalert2 from 'vue-sweetalert2';
import { BootstrapVue, IconsPlugin } from 'bootstrap-vue';
import '@fortawesome/fontawesome-free/css/all.css';
// import draggable from 'vuedraggable';



// Import Bootstrap and BootstrapVue CSS files
import 'bootstrap/dist/css/bootstrap.css';
import 'bootstrap-vue/dist/bootstrap-vue.css';


// Tell Vue to use Vuelidate (this step is optional if using Vuelidate locally in components)
Vue.use(useVuelidate);
Vue.use(VueSweetalert2);
// Vue.use(draggable);


// Make BootstrapVue available throughout your project
Vue.use(BootstrapVue);
// Optionally install the BootstrapVue icon components plugin
Vue.use(IconsPlugin);


Vue.config.productionTip = false

//axios globally declare for live url or localhost
// axios.defaults.baseURL = 'http://localhost:8088';
window.axios = axios;

new Vue({
  render: h => h(App),
  router, 
}).$mount('#app')
