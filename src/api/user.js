import axios from '@/libs/api.request'

export const login = ({ userName, password }) => {
  const data = {
    userName,
    password
  }
  return axios.request({
    url: 'login',
    data,
    method: 'post'
  })
}

export const getUserInfo = (token) => {
  return axios.request({
    url: 'get_info',
    params: {
      token
    },
    method: 'get'
  })
}

export const logout = (token) => {
  return axios.request({
    url: 'logout',
    method: 'post'
  })
}

export const ticketValidate = (ticket) => {
  return axios.request({
    url: 'http://10.0.11.42:10099/serviceValidate',
    params: {
      ticket: ticket,
      service: sessionStorage.getItem('service')
    },
    method: 'get'
  })
}
