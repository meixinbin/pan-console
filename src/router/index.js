import Vue from 'vue'
import Router from 'vue-router'
import routes from './routers'
import store from '@/store'
import iView from 'iview'
import { getAccessToken, accessDecide, getParams, delParam } from '@/libs/util'
import { getAuthToken, getUserProfile } from '@/api/user'
import Cookies from 'js-cookie'
// import {TOKEN_KEY} from "../libs/util";

Vue.use(Router)
const router = new Router({
  routes,
  mode: 'history'
})
const LOGIN_PAGE_NAME = 'http://10.0.11.42:10099/login'

router.beforeEach((to, from, next) => {
  iView.LoadingBar.start()
  // 使用ticket获取token
  var params = getParams(window.location.href)
  if (store.state.user.access_token) {
    if (accessDecide(to.name, store.state.roles, routes)) {
      next()
    } else {
      next({ replace: true, name: 'error_401' })
    }
  } else if (params.ticket) {
    console.log(params.ticket)
    store.dispatch('ticketValidate', params.ticket).then(profile => {
      console.log(profile)
      var url = delParam('ticket')
      var url1 = url.substring(url.indexOf('//') + 2)
      next(url1.substring(url1.indexOf('/')))
    })
  } else {
    sessionStorage.setItem('service', location.href)
    window.location.href = LOGIN_PAGE_NAME + '?service=' + location.href
  }
})

router.afterEach(to => {
  iView.LoadingBar.finish()
  window.scrollTo(0, 0)
})

export default router
