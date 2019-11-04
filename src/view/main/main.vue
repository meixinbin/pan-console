<template>
  <Layout style="height: 100%" class="main">
    <Header class="header-con" style="background-color: #001529">
      <h1 style="float: left;display: inline-block;line-height: 50px;margin-left: -5px;margin-right: 20px "><common-icon :type="'fa-home'" :size="24" :color="'#fff'"/></h1><a style="display: inline-block;float: left"> 后台管理系统</a>
      <header-bar :collapsed="collapsed">
        <user :user-avator="userAvator"/>
        <language @on-lang-change="setLocal" style="margin-right: 10px;" :lang="local"/>
        <fullscreen v-model="isFullscreen" style="margin-right: 10px;"/>
      </header-bar>
    </Header>
    <layout>
      <Sider hide-trigger collapsible :width="230" :collapsed-width="50" v-model="collapsed" class="left-sider" :style="{overflow: 'hidden'}">
        <side-menu  @on-coll-change="handleCollapsedChange" accordion ref="sideMenu" :active-name="$route.name" :collapsed="collapsed" @on-select="turnToPage" :menu-list="menuList">
        </side-menu>
      </Sider>
      <Content class="main-content-con">
        <Content class="content-wrapper">
          <custom-bread-crumb show-icon :list="breadCrumbList"></custom-bread-crumb>
          <keep-alive :include="cacheList">
            <router-view/>
          </keep-alive>
        </Content>
      </Content>
    </Layout>
  </Layout>
</template>
<script>
import SideMenu from './components/side-menu'
import HeaderBar from './components/header-bar'
import TagsNav from './components/tags-nav'
import User from './components/user'
import Fullscreen from './components/fullscreen'
import Language from './components/language'
import {mapMutations, mapActions} from 'vuex'
import {getNewTagList, getNextRoute, routeEqual} from '@/libs/util'
import minLogo from '@/assets/images/logo-min.jpg'
import maxLogo from '@/assets/images/logo.jpg'
import './main.less'
import Layout from 'iview/src/components/layout/layout'
import customBreadCrumb from './components/header-bar/custom-bread-crumb'
import CommonIcon from '../../components/common-icon/common-icon'

export default {
  name: 'Main',
  components: {
    CommonIcon,
    Layout,
    SideMenu,
    HeaderBar,
    Language,
    TagsNav,
    Fullscreen,
    User,
    customBreadCrumb
  },
  data () {
    return {
      collapsed: true,
      minLogo,
      maxLogo,
      isFullscreen: false
    }
  },
  computed: {
    tagNavList () {
      return this.$store.state.app.tagNavList
    },
    tagRouter () {
      return this.$store.state.app.tagRouter
    },
    userAvator () {
      return this.$store.state.user.avatorImgPath
    },
    cacheList () {
      return this.tagNavList.length ? this.tagNavList.filter(item => !(item.meta && item.meta.notCache)).map(item => item.name) : []
    },
    menuList () {
      return this.$store.getters.menuList
    },
    breadCrumbList () {
      return this.$store.state.app.breadCrumbList
    },
    local () {
      return this.$store.state.app.local
    }
  },
  methods: {
    ...mapMutations([
      'setBreadCrumb',
      'setTagNavList',
      'addTag',
      'setLocal'
    ]),
    ...mapActions([
      'handleLogin'
    ]),
    turnToPage (route) {
      let {name, params, query} = {}
      if (typeof route === 'string') name = route
      else {
        name = route.name
        params = route.params
        query = route.query
      }
      if (name.indexOf('isTurnByHref_') > -1) {
        window.open(name.split('_')[1])
        return
      }
      this.$router.push({
        name,
        params,
        query
      })
    },
    handleCloseTag (res, type, route) {
      let openName = ''
      if (type === 'all') {
        this.turnToPage('home')
        openName = 'home'
      } else if (routeEqual(this.$route, route)) {
        if (type === 'others') {
          openName = route.name
        } else {
          const nextRoute = getNextRoute(this.tagNavList, route)
          this.$router.push(nextRoute)
          openName = nextRoute.name
        }
      }
      this.setTagNavList(res)
      this.$refs.sideMenu.updateOpenName(openName)
    },
    handleCollapsedChange (state) {
      this.collapsed = state
    },
    handleClick (item) {
      this.turnToPage(item)
    }
  },
  watch: {
    '$route' (newRoute) {
      this.setBreadCrumb(newRoute.matched)
      this.setTagNavList(getNewTagList(this.tagNavList, newRoute))
    }
  },
  mounted () {
    /**
       * @description 初始化设置面包屑导航和标签导航
       */
    this.setTagNavList()
    this.addTag({
      route: this.$store.state.app.homeRoute
    })
    this.setBreadCrumb(this.$route.matched)
    // 设置初始语言
    this.setLocal(this.$i18n.locale)
    // 文档提示
    // this.$Notice.info({
    //   title: '想快速上手，去看文档吧',
    //   duration: 0,
    //   render: (h) => {
    //     return h('p', {
    //       style: {
    //         fontSize: '13px'
    //       }
    //     }, [
    //       '点击',
    //       h('a', {
    //         attrs: {
    //           href: 'https://lison16.github.io/iview-admin-doc/#/',
    //           target: '_blank'
    //         }
    //       }, 'iview-admin2.0文档'),
    //       '快速查看'
    //     ])
    //   }
    // })
  }
}
</script>
