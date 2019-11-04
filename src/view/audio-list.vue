<template>
  <Card>
    <Tabs value="name1">
      <TabPane label="文件管理" name="name1">
        <ButtonGroup>
          <Button type="primary" @click="modal9 = true" icon="md-cloud-upload">上传文件</Button>
          <Button type="primary" @click="modelDir = true" icon="ios-list-box-outline">新建目录</Button>
          <Button type="primary" icon="md-refresh" @click="refresh">刷新</Button>
        </ButtonGroup>
        <Dropdown style="margin-left: 20px" @on-click="batchDown">
          <Button type="primary">
            批量操作
            <Icon type="ios-arrow-down"></Icon>
          </Button>
          <DropdownMenu slot="list">
            <DropdownItem name="down" :disabled="selectedItems.length==0">批量下载</DropdownItem>
            <DropdownItem name="del" :disabled="selectedItems.length==0" >批量删除</DropdownItem>
          </DropdownMenu>
        </Dropdown>
        <ButtonGroup>
          <Button type="text" @click="loadMore" icon="fa fa-ls">加载更多</Button>
        </ButtonGroup>
        <Table id="filelist" ref="selection" :loading="loading" :columns="columns4" :data="datalist" max-height="500"
               style="margin-top: 10px;" @on-selection-change="select" :show-slot-bar="true">
          <template slot="bar"><i class="fa fa-list"></i><span class="ivu-icon ivu-icon-ios-return-left back"></span><span v-for="bread in breadData"><a v-if="bread.type=='a'" :href="bread.link" @click.prevent="listPath(bread.fullPath)">{{bread.path}}&nbsp;&nbsp;</a><span v-else>{{bread.path}}</span></span></template>
        </Table>
      </TabPane>
    </Tabs>
    <Drawer width="30" title="文件上传" :mask-closable='false' :scrollable='true' footer-hide v-model="modal9"
            class-name="uploadModel" id="uploadFile">
      <Upload
        ref="upload"
        :show-upload-list="false"
        :default-file-list="defaultList"
        :on-success="handleSuccess"
        :format="['jpg','jpeg','png']"
        :max-size="2048"
        :on-format-error="handleFormatError"
        :on-exceeded-size="handleMaxSize"
        :before-upload="handleBeforeUpload"
        multiple
        type="drag"
        :data="uploadParam"
        :showUploadList="showUploadList"
        action="http://localhost:9098/oss/ibs">
        <div style="padding: 20px 0">
          <Icon type="ios-cloud-upload" size="52" style="color: #3399ff"></Icon>
          <p>Click or drag files here to upload</p>
        </div>
      </Upload>
    </Drawer>
    <Drawer width="640" title="新建目录" :mask-closable='false' :scrollable='true' v-model="modelDir" id="createDir" :styles="styles">
      <Form ref="formValidate" :model="formValidate" :rules="ruleValidate" :label-width="80">
        <FormItem label="目录名" prop="pathName">
          <Input v-model="formValidate.pathName" placeholder=""></Input>
          <div>
            <div class="next-form-item-extra">
              <div class="oss-intl-lines">
                <p>目录命名规范：</p>
                <ol>
                  <li>不允许使用表情符，请使用符合要求的 UTF-8 字符</li>
                  <li>/ 用于分割路径，可快速创建子目录，但，不要以 / 打头，不要出现连续的 /</li>
                  <li>不允许出现名为 .. 的子目录</li>
                  <li>总长度控制在 1-254 个字符</li>
                </ol>
              </div>
            </div>
          </div>
        </FormItem>
      </Form>
      <div class="demo-drawer-footer">
        <Button type="primary" style="margin-right: 8px" @click="handleSubmit('formValidate')">确定</Button>
        <Button style="margin-right: 8px">取消</Button>
      </div>
    </Drawer>
    <a style="display: none" id="download" target="_blank"></a>
  </Card>
</template>
<script>
import {generateUploadData, getAudioList, deleteObj, download, createDir, deleteDir} from '@/api/data'
import store from '@/store'
import qs from 'qs'

export default {
  name: 'join_page',
  props: {

  },
  components: {},
  data () {
    return {
      loading: true,
      defaultList: [],
      imgName: '',
      visible: false,
      modal9: false,
      modelDir: false,
      dirname: '',
      selectedItems: [],
      breadData: [],
      busy: false,
      nextMarker: '',
      columns4: [
        {
          type: 'selection',
          width: 60,
          align: 'center',
          fixed: 'left'
        },
        {
          title: '文件名',
          align: 'left',
          key: 'name',
          sortable: true,
          render: (h, params) => {
            let item = this.datalist[params.index]
            return h('div', [
              h('span', {
                'class': {
                  'oss-rc-icon-file': item.fileType != 'back',
                  'file-folder': item.dir && item.fileType != 'back',
                  'file-mp3': item.fileType == 'mp3',
                  'ivu-icon ivu-icon-ios-return-left back': item.fileType == 'back'
                }
              }),
              item.dir ? h('a', {
                class: {
                  'filename': true
                },
                attrs: {
                  href: '/audio/list?path=' + item.path
                },
                on: {
                  click: (event) => {
                    event.preventDefault()
                    this.listPath(item.path)
                  }
                }
              }, item.name) : h('span', {
                class: {
                  'filename': true
                },
                on: {
                  click: (event) => {
                    event.preventDefault()
                    // this.listPath(item.path)
                  }
                }
              }, item.name)
            ])
          }
        },
        {
          title: '文件大小',
          align: 'center',
          width: 200,
          key: 'size',
          sortable: true,
          render: (h, params) => {
            var item = this.datalist[params.index]
            let size = item.size
            if (size == 0) {
              size = ''
            } else if (size >= 1024 * 1024) {
              size = (size / (1024 * 1024)).toFixed(2) + 'mb'
            } else {
              size = (size / (1024)).toFixed(2) + 'kb'
            }
            return h('span', size)
          }
        },
        {
          title: '更新时间',
          align: 'center',
          width: 200,
          key: 'updateTime',
          sortable: true
        },
        {
          title: '操作',
          align: 'right',
          width: 150,
          key: 'opt',
          fixed: 'right',
          render: (h, params) => {
            let item = this.datalist[params.index]
            return h('div', [
              h('Button', {
                props: {
                  type: 'error',
                  size: 'small'
                },
                on: {
                  click: () => {
                    const msg = this.$Message.loading({
                      content: '删除中...',
                      duration: 0
                    })
                    let arr = []
                    arr.push(item.path)
                    let isdir = item.dir && item.fileType != 'back'
                    if (isdir) {
                      deleteDir('ibs', arr).then((res) => {
                        this.remove(params.index)
                      })
                    } else {
                      deleteObj('ibs', arr).then((res) => {
                        this.remove(params.index)
                        msg()
                        this.$Message.info('删除成功')
                      })
                    }
                  }
                }
              }, 'Delete')
            ])
          }
        }
      ],
      datalist: [],
      uploadList: [],
      accessKey: '---',
      uploadParam: {},
      showUploadList: true,
      currentPath: '',
      formValidate: {
        pathName: ''
      },
      ruleValidate: {
        pathName: [
          { required: true, message: '目录名称不能为空', trigger: 'blur' },
          { required: true, type: 'string', min: 1, max: 254, message: '目录字符长度必须在1~254之间', trigger: 'blur' },
          { required: true, pattern: /^(?!.*\/\/).*$/, message: '目录名称不能含有//', trigger: 'blur' },
          { required: true, pattern: /^(?!.*\.\.).*$/, message: '目录名称不能含有..', trigger: 'blur' },
          { required: true, pattern: /^(?!\/).*$/, message: '目录名称不能以 / 打头', trigger: 'blur' }
        ]
      },
      styles: {
        height: 'calc(100% - 105px)',
        overflow: 'auto',
        paddingBottom: '53px'
      }
    }
  },
  methods: {
    handleView (name) {
      this.imgName = name
      this.visible = true
    },
    handleRemove (file) {
      const fileList = this.$refs.upload.fileList
      this.$refs.upload.fileList.splice(fileList.indexOf(file), 1)
    },
    handleSuccess (res, file) {
      file.name = file.name
      this.refresh()
    },
    handleFormatError (file) {
      this.$Notice.warning({
        title: 'The file format is incorrect',
        desc: 'File format of ' + file.name + ' is incorrect, please select jpg or png.'
      })
    },
    handleMaxSize (file) {
      this.$Notice.warning({
        title: 'Exceeding file size limit',
        desc: 'File  ' + file.name + ' is too large, no more than 2M.'
      })
    },
    handleBeforeUpload (file) {
      file.showProgress = true
      const check = this.uploadList.length < 5
      if (!check) {
        this.$Notice.warning({
          title: 'Up to five pictures can be uploaded.'
        })
      }
      return generateUploadData().then((res) => {
        console.log(res)
        var param = res.data
        param.key = file.name
        param.prefix = this.currentPath
        this.uploadParam = param
      })
      // let promise = new Promise((resolve) => {
      //   this.$nextTick(function () {
      //     resolve(true);
      //   });
      // });
      // return promise;
    },
    remove (index) {
      this.datalist.splice(index, 1)
    },
    /* loadMore () {
        console.log("======================================================")
        this.busy = true // 将无限滚动给禁用
        if(this.nextMarker){
          setTimeout(() => {
            this.loading=true
            getAudioList(this.currentPath,this.nextMarker).then((res) => {
              // console.log(res.data)
              this.nextMarker = res.data.nextMarker
              this.loading = false
              if(this.nextMarker==null){
                this.busy = true
              }else {
                this.busy = false
                for(let i=0;i<res.data.objectList.length;i++){
                  this.datalist.push(res.data.objectList[i])
                }
                res.data.objectList.forEach(function (e, i, a) {
                  if(e.dir){
                    e._disabled = true
                  }
                })
              }
            }).catch(function (error) {
              // this.loading = false
            })
          }, 500)
        }
      }, */
    loadMore () {
      if (this.nextMarker) {
        this.loading = true
        getAudioList(this.currentPath, this.nextMarker).then((res) => {
          this.loading = false
          this.nextMarker = res.data.nextMarker
          for (let i = 0; i < res.data.objectList.length; i++) {
            this.datalist.push(res.data.objectList[i])
          }
          res.data.objectList.forEach(function (e, i, a) {
            if (e.dir) {
              e._disabled = true
            }
          })
        }).catch(function (error) {
          // this.loading = false
        })
      } else {
        this.$Message.info('已加载完毕')
      }
    },
    listPath (dir) {
      this.busy = false
      let obj = new Object()
      obj.size = 0
      obj.path = dir
      obj._disabled = true
      this.currentPath = obj.path
      this.loading = true
      var path = obj.path.substring(0, obj.path.length - 1)
      // console.log(path)
      path = path.substring(0, path.lastIndexOf('/') == -1 ? 0 : path.lastIndexOf('/'))
      obj.name = '/' + path + '/'
      obj.name = obj.name.replace(/\/\//g, '/')
      // console.log(obj.path)
      if (obj.path == '/') {
        obj.path = ''
      }
      getAudioList(obj.path).then((res) => {
        this.loading = false
        obj.path = path + '/'
        // res.data.objectList.splice(0, 0, obj);
        this.datalist = res.data.objectList
        this.nextMarker = res.data.nextMarker
        this.datalist.forEach(function (e, i, a) {
          if (e.dir) {
            e._disabled = true
          }
        })
        var paths = this.currentPath.split('/')
        var arr = []
        // 如果最后一个是空，则删除
        if (paths[paths.length - 1] == '') {
          paths.splice(paths.length - 1, 1)
        }
        // 向数组前面添加一个空值
        if (paths[0] != '') {
          paths.splice(0, 0, '')
        }
        for (let i = 0; i < paths.length; i++) {
          let path = paths[i] == '' ? '/' : paths[i] + '/'
          // 如果是最后一个，则使用span标签
          var p = new Object()
          p.path = path
          if (i == paths.length - 1) {
            p.type = 'span'
          } else {
            p.type = 'a'
            p.link = '/audio/list?path=' + paths.slice(0, i + 1).join('/').substring(1)
            p.fullPath = paths.slice(0, i + 1).join('/').substring(1)
          }
          arr.push(p)
        }
        console.log(arr)
        this.breadData = arr
      }).catch(function (error) {
        // this.loading = false
      })
    },
    handleSubmit (name) {
      this.$refs[name].validate((valid) => {
        if (valid) {
          console.log(this.formValidate.pathName)
          createDir('ibs', this.formValidate.pathName).then((res) => {
            this.refresh()
          })
          this.$Message.success('Success!')
        } else {
          this.$Message.error('Fail!')
        }
      })
    },
    refresh () {
      this.listPath(this.currentPath)
    },
    batchDown (name) {
      if (this.selectedItems.length == 0) {
        this.$Notice.warning({
          title: '至少要选择一项'
        })
        return
      }
      if (name == 'del') {
        console.log(this.selectedItems)
        deleteObj('ibs', this.selectedItems).then((res) => {
          this.$Message.info('删除成功')
          this.refresh()
        })
      }
      if (name == 'down') {
        let param = new Object()
        param.bucket = 'ibs'
        param.keys = this.selectedItems
        param.access_token = store.state.user.access_token
        let d = document.getElementById('download')
        d.href = 'http://localhost:10009/download?' + qs.stringify(param, {arrayFormat: 'repeat'})
        d.click()
        // download('ibs',this.selectedItems).then((res)=>{
        //   let blob = new Blob([res.data],{type:'application/zip'})
        //   let objUrl = URL.createObjectURL(blob)
        //   window.location.href = objUrl
        // })
      }
    },
    select (selection, row) {
      var arr = []
      selection.forEach(function (item) {
        console.log(item)
        arr.push(item.path)
      })
      this.selectedItems = arr
      console.log(this.selectedItems)
    },
    cancelSelect (selection, row) {
      var arr = []
      selection.forEach(function (item) {
        arr.push(item.path)
      })
      this.selectedItems = arr
      console.log(this.selectedItems)
    }
  },
  mounted () {
    this.uploadList = this.$refs.upload.fileList
    getAudioList('').then((res) => {
      this.loading = false
      this.datalist = res.data.objectList
      this.nextMarker = res.data.nextMarker
      this.datalist.forEach(function (e, i, a) {
        if (e.dir) {
          e._disabled = true
        }
      })
      let obj = new Object()
      obj.size = 0
      obj.path = '/'
      obj.type = 'span'
      this.breadData.push(obj)
    }).catch(function (error) {
      // this.loading = false
      console.log(error)
    })
  }
}
</script>
<style>
  #uploadFile .ivu-drawer,#createDir .ivu-drawer {
    margin-top: 50px;
  }

  /*#uploadFile .ivu-modal-content{
    height: 100%;
    border-bottom-right-radius: 0;
    border-top-right-radius: 0;
  }
  #filelist .ivu-table-cell i{
    margin-right: 10px;
    display: inline;
  }*/
  .demo-upload-list {
    display: inline-block;
    width: 60px;
    height: 60px;
    text-align: center;
    line-height: 60px;
    border: 1px solid transparent;
    border-radius: 4px;
    overflow: hidden;
    background: #fff;
    position: relative;
    box-shadow: 0 1px 1px rgba(0, 0, 0, .2);
    margin-right: 4px;
  }

  .demo-upload-list img {
    width: 100%;
    height: 100%;
  }

  .demo-upload-list-cover {
    display: none;
    position: absolute;
    top: 0;
    bottom: 0;
    left: 0;
    right: 0;
    background: rgba(0, 0, 0, .6);
  }

  .demo-upload-list:hover .demo-upload-list-cover {
    display: block;
  }

  .demo-upload-list-cover i {
    color: #fff;
    font-size: 20px;
    cursor: pointer;
    margin: 0 2px;
  }

  .oss-rc-icon-file {
    background-image: url(../assets/images/filetypeicon-150-150.png);
    background-repeat: no-repeat;
    display: inline-block;
    vertical-align: middle;
    overflow: hidden;
    width: 24px;
    height: 24px;
    background-position: -30px 0
  }

  @media (-webkit-min-device-pixel-ratio: 1.5),(min-resolution: 144dpi) {
    .oss-rc-icon-file {
      background-image: url(../assets/images/filetype-icon-300-300.png);
      background-size: 150px 150px
    }
  }

  .oss-rc-icon-file.file-folder {
    background-position: 0 0
  }

  .oss-rc-icon-file.file-bmp, .oss-rc-icon-file.file-gif, .oss-rc-icon-file.file-jpeg, .oss-rc-icon-file.file-jpg, .oss-rc-icon-file.file-png, .oss-rc-icon-file.file-webp {
    background-position: -60px 0
  }

  .oss-rc-icon-file.file-3gp, .oss-rc-icon-file.file-avi, .oss-rc-icon-file.file-mkv, .oss-rc-icon-file.file-mov, .oss-rc-icon-file.file-mp4, .oss-rc-icon-file.file-rm, .oss-rc-icon-file.file-rmvb, .oss-rc-icon-file.file-vod, .oss-rc-icon-file.file-wmv {
    background-position: -90px 0
  }

  .oss-rc-icon-file.file-mp3 {
    background-position: -120px 0
  }

  .oss-rc-icon-file.file-pdf {
    background-position: 0 -30px
  }

  .oss-rc-icon-file.file-doc, .oss-rc-icon-file.file-docx, .oss-rc-icon-file.file-pages {
    background-position: -30px -30px
  }

  .oss-rc-icon-file.file-key, .oss-rc-icon-file.file-ppt, .oss-rc-icon-file.file-pptx {
    background-position: -60px -30px
  }

  .oss-rc-icon-file.file-numbers, .oss-rc-icon-file.file-xls, .oss-rc-icon-file.file-xlsx {
    background-position: -90px -30px
  }

  .oss-rc-icon-file.file-ini, .oss-rc-icon-file.file-log, .oss-rc-icon-file.file-txt {
    background-position: -120px -30px
  }

  .oss-rc-icon-file.file-asp, .oss-rc-icon-file.file-c, .oss-rc-icon-file.file-cpp, .oss-rc-icon-file.file-css, .oss-rc-icon-file.file-go, .oss-rc-icon-file.file-groovy, .oss-rc-icon-file.file-h, .oss-rc-icon-file.file-htm, .oss-rc-icon-file.file-html, .oss-rc-icon-file.file-java, .oss-rc-icon-file.file-js, .oss-rc-icon-file.file-json, .oss-rc-icon-file.file-jsp, .oss-rc-icon-file.file-jsx, .oss-rc-icon-file.file-less, .oss-rc-icon-file.file-lua, .oss-rc-icon-file.file-php, .oss-rc-icon-file.file-py, .oss-rc-icon-file.file-sass, .oss-rc-icon-file.file-scss, .oss-rc-icon-file.file-ts, .oss-rc-icon-file.file-tsx, .oss-rc-icon-file.file-xml {
    background-position: 0 -60px
  }

  .oss-rc-icon-file.file-7z, .oss-rc-icon-file.file-gz, .oss-rc-icon-file.file-jar, .oss-rc-icon-file.file-rar, .oss-rc-icon-file.file-tar, .oss-rc-icon-file.file-war, .oss-rc-icon-file.file-zip {
    background-position: -30px -60px
  }

  .oss-rc-glyph::before {
    content: '';
    line-height: 1;
    font-family: oss-console-icf !important;
    font-size: inherit;
    font-weight: 200;
    font-style: normal;
    text-rendering: auto;
    -webkit-font-smoothing: antialiased;
    -webkit-text-stroke-width: 0.2px;
    -moz-osx-font-smoothing: grayscale;
    display: inline-block;
    transition: all 200ms ease;
    vertical-align: middle;
  }

  .oss-rc-glyph.glyph-back:before {
    content: '\e600';
  }

  .filename {
    margin-left: 15px;
  }

  .back {
    font-size: 24px;
  }

  .next-form-item-extra {
    margin-top: 8px;
    color: #9b9ea0;
    font-size: 12px;
    line-height: 1.5;
  }
  .oss-intl-lines {
    line-height: 1.6;
  }
  .oss-intl-lines p, .oss-intl-lines ul, .oss-intl-lines ol {
    margin-top: 8px;
    margin-bottom: 8px;
    line-height: inherit !important;
  }
  .oss-intl-lines p:last-child, .oss-intl-lines ul:last-child, .oss-intl-lines ol:last-child {
    margin-bottom: 0;
  }
  .oss-intl-lines ol {
    list-style: decimal outside;
  }
  .oss-intl-lines ul, .oss-intl-lines ol {
    margin-left: 2em;
  }
  .oss-intl-lines p, .oss-intl-lines ul, .oss-intl-lines ol {
    margin-top: 8px;
    margin-bottom: 8px;
    line-height: inherit !important;
  }
  ol, ul {
    list-style: none;
    margin: 0;
    padding: 0;
  }
  .oss-intl-lines ul li:first-child, .oss-intl-lines ol li:first-child {
    margin-top: 0;
  }
  .demo-drawer-footer {
    width: 100%;
    position: absolute;
    bottom: 0;
    left: 0;
    border-top: 1px solid #e8e8e8;
    padding: 10px 16px;
    text-align: right;
    background: #fff;
  }
  .ivu-table-bar{
    padding: 10px 20px;
    border-bottom: 1px solid #e8e8e8;
    min-height: 45px;
  }
  .ivu-table-bar i{
    margin-right: 30px;
    margin-left: 3px;
  }
</style>
