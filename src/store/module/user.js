import {login, logout, getUserInfo, ticketValidate} from '@/api/user'

export default {
  state: {
    username: '',
    nickname: '',
    userId: '',
    avatar: '',
    access_token: '',
    refresh_token: '',
    token_type: '',
    roles: ''
  },
  mutations: {
    setAvatar (state, avatar) {
      state.avatar = avatar
    },
    setUserId (state, id) {
      state.userId = id
    },
    setUsername (state, username) {
      state.username = username
    },
    setNickname (state, nickname) {
      state.nickname = nickname
    },
    setRoles (state, roles) {
      state.roles = roles
    },
    setToken (state, token) {
      state.token = token
    },
    setAccess_token (state, access_token) {
      state.access_token = access_token
    },
    setRefresh_token (state, refresh_token) {
      state.refresh_token = refresh_token
    },
    setToken_type (state, token_type) {
      state.token_type = token_type
    }

  },
  actions: {
    // 登录
    handleLogin ({commit}, {userName, password}) {
      userName = userName.trim()
      return new Promise((resolve, reject) => {
        login({
          userName,
          password
        }).then(res => {
          const data = res.data
          commit('setToken', data.token)
          resolve()
        }).catch(err => {
          reject(err)
        })
      })
    },
    // 退出登录
    handleLogOut ({state, commit}) {
      commit('setUsername', '')
      commit('setNickname', '')
      commit('setUserId', '')
      commit('setAccess_token', '')
      commit('setRefresh_token', '')
      commit('setToken_type', '')
      window.location.href = 'http://localhost:10099/logout?redirectUrl=' + window.location.href
    },

    ticketValidate ({state, commit}, ticket) {
      return new Promise((resolve, reject) => {
        ticketValidate(ticket).then(res => {
          const data = res.data
          commit('setAvatar', data.attributes.avatar)
          commit('setUsername', data.user)
          commit('setNickname', data.attributes.nickname)
          commit('setUserId', data.attributes.username)
          var roles = []
          data.attributes.roles.forEach(function (role) {
            roles.push(role.code)
          })
          commit('setRoles', JSON.stringify(roles))
          commit('setAccess_token', data.oAuth2AccessToken.access_token)
          commit('setRefresh_token', data.oAuth2AccessToken.refresh_token)
          commit('setToken_type', data.oAuth2AccessToken.token_type)
          resolve(data)
        }).catch(err => {
          reject(err)
        })
      })
    }
  }
}
