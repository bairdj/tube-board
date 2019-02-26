import Vue from 'vue';
import App from './vue/App.vue';
import credentials from './credentials';

//Check credentials are defined before trying to do anything
if (!credentials.appId || !credentials.appKey) {
    document.getElementById('loadingError').innerText = 'You must define credentials.json. Please update settings then re-build';
} else {
    const app = Vue.extend(App);
    new app().$mount('#app');
}

