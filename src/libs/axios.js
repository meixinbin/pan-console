import Vue from 'vue'
import axios from 'axios'
import qs from 'qs'
import 'vue2-toast/lib/toast.css'
import Toast from 'vue2-toast'
import store from '@/store'

// import { Spin } from 'iview'
Vue.use(Toast)
class HttpRequest {
  constructor (baseUrl = baseURL) {
    this.baseUrl = baseUrl
    this.queue = {}
  }
  getInsideConfig () {
    const config = {
      baseURL: this.baseUrl,
      transformRequest: [function (data) {
        // 对 data 进行任意转换处理
        return qs.stringify(data)
      }],
      headers: {
        // 'Content-Type':'application/x-www-form-urlencoded'
      },
      paramsSerializer: function (params) {
        return qs.stringify(params, {arrayFormat: 'repeat'})
      }
    }
    return config
  }
  distroy (url) {
    delete this.queue[url]
    if (!Object.keys(this.queue).length) {
      // Spin.hide()
    }
  }
  interceptors (instance, url) {
    // 请求拦截
    instance.interceptors.request.use(config => {
      // 添加全局的loading...
      if (!Object.keys(this.queue).length) {
        // Spin.show() // 不建议开启，因为界面不友好
      }
      config.headers['X-Requested-With'] = 'XMLHttpRequest'
      if (store.state.user.access_token) {
        config.headers['Authorization'] = 'Bearer' + store.state.user.access_token
      }
      this.queue[url] = true
      return config
    }, error => {
      return Promise.reject(error)
    })
    // 响应拦截
    instance.interceptors.response.use(res => {
      this.distroy(url)
      if (res.status === 200) {
        return Promise.resolve(res)
      } else {
        return Promise.reject(res)
      }
    }, error => {
      this.distroy(url)
      console.log(error)
      if (error && error.response) {
        switch (error.response.status) {
          case 400:
            error.message = '请求错误'
            break
          case 401:
            error.message = '未授权，请重新登录'
            location.href = ''
            break
          default:
            Vue.prototype.$toast.center(error.response.data.message || '未知错误')
        }
      } else {
        Vue.prototype.$toast.center('未知错误')
      }
      return Promise.resolve(error.response)
    })
  }
  request (options) {
    const instance = axios.create()
    options = Object.assign(this.getInsideConfig(), options)
    this.interceptors(instance, options.url)
    return instance(options)
  }
}
export default HttpRequest
