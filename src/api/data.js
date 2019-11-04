import axios from '@/libs/api.request'
import store from '@/store'

export const getTableData = () => {
  return axios.request({
    url: 'get_table_data',
    method: 'get'
  })
}

export const getDragList = () => {
  return axios.request({
    url: 'get_drag_list',
    method: 'get'
  })
}

export const getDeviceList = (groupId) => {
  return axios.request({
    url: 'http://localhost:10009/device/rest/list/' + groupId,
    method: 'get'
  })
}
export const getAudioList = (prefix, marker) => {
  return axios.request({
    url: 'http://localhost:10009/ajax/bucket/file/list_objects?bucket=ibs&maxKeys=15',
    method: 'get',
    params: {
      prefix: prefix,
      marker: marker
    }/*,
    headers:{
      'Authorization': 'Bearer' + store.state.user.access_token
    } */

  })
}
export const getDeviceGroupTree = (userId) => {
  return axios.request({
    url: 'http://localhost:10009/device/group/rest/tree/' + userId,
    method: 'get'
  })
}

export const generateUploadData = () => {
  return axios.request({
    url: 'http://localhost:10009/object/ajax/generate_upload_data',
    method: 'get'/*,
    headers:{
      'Authorization': 'Bearer' + store.state.user.access_token
    } */
  })
}

export const deleteObj = (bucket, keys) => {
  return axios.request({
    url: 'http://localhost:10009/ajax/object/delete',
    method: 'delete',
    params: {
      bucket: bucket,
      keys: keys
    }
  })
}
export const deleteDir = (bucket, prefix) => {
  return axios.request({
    url: 'http://localhost:10009/ajax/object/delete',
    method: 'delete',
    params: {
      bucket: bucket,
      prefix: prefix
    }
  })
}
export const download = (bucket, keys) => {
  return axios.request({
    url: 'http://localhost:10009/download',
    method: 'get',
    params: {
      bucket: bucket,
      keys: keys
    },
    responseType: 'arrayBuffer'
  })
}

export const createDir = (bucket, dir) => {
  return axios.request({
    url: 'http://localhost:10009/create_dir',
    method: 'post',
    data: {
      bucket: bucket,
      dir: dir
    }
  })
}
