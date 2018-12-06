import Vue from 'vue'
import Router from 'vue-router'
import MainPage from '@/components/MainPage'
import olmap from '../openlayersplugin/olplugin.js'
import 'ol/ol.css'

Vue.use(Router)
Vue.use(olmap)

export default new Router({
  mode: 'history',
  routes: [
    {
      path: '/:text?',
      name: 'MainPage',
      component: MainPage
    }
  ]
})
