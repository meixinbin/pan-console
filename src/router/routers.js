import Main from '@/view/main'
import parentView from '@/components/parent-view'

/**
 * iui-admin中meta除了原生参数外可配置的参数:
 * meta: {
 *  hideInMenu: (false) 设为true后在左侧菜单不会显示该页面选项
 *  notCache: (false) 设为true后页面不会缓存
 *  access: (null) 可访问该页面的权限数组，当前路由设置的权限会影响子路由
 *  icon: (-) 该页面在左侧菜单、面包屑和标签导航处显示的图标，如果是自定义图标，需要在图标名称前加下划线'_'
 * }
 */

export default [
  {
    path: '/login',
    name: 'login',
    meta: {
      title: 'Login - 登录',
      hideInMenu: true,
      href: 'http://localhost:10099/login'
    }
  },
  {
    path: '/',
    name: '_home',
    redirect: '/',
    component: Main,
    meta: {
      hideInMenu: true,
      notCache: true
    },
    children: [
      {
        path: '/',
        name: '/',
        meta: {
          hideInMenu: true,
          title: '首页',
          notCache: true
        },
        component: () => import('@/view/single-page/home')
      }
    ]
  },
  {
    path: '/device',
    name: '设备管理',
    meta: {
    },
    component: Main,
    children: [
      {
        path: 'list',
        name: '设备列表',
        meta: {
          icon: 'fa-volume-up',
          title: '设备列表'
        },
        component: () => import('@/view/device-list.vue')
      }
    ]
  },
  {
    path: '/audio',
    name: '音频管理',
    component: Main,
    children: [
      {
        path: 'list',
        name: 'audio_list',
        meta: {
          icon: 'fa-file-audio-o',
          title: '音频列表'
        },
        component: () => import('@/view/audio-list.vue')
      }
    ]
  },
  {
    path: '/401',
    name: 'error_401',
    meta: {
      hideInMenu: true
    },
    component: () => import('@/view/error-page/401.vue')
  },
  {
    path: '/500',
    name: 'error_500',
    meta: {
      hideInMenu: true
    },
    component: () => import('@/view/error-page/500.vue')
  },
  {
    path: '*',
    name: 'error_404',
    meta: {
      hideInMenu: true
    },
    component: () => import('@/view/error-page/404.vue')
  }
]
