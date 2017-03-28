import Vue from 'vue'
import VueResource from 'vue-resource'
import App from './App'
import VueLazyload from 'vue-lazyload'

Vue.use(VueResource);
Vue.use(VueLazyload, {
  error: '/static/images/750x420-min.jpg',
  loading: '/static/images/timg.gif',
  try: 3 // default 1
})
new Vue({
  el: '#app',
  template: '<App/>',
  components: { App }
})
