<template>
  <div class="oss-app">
    <div class="oss-app-container">
      <div class="oss-app-menu">
        <Tree :data="data3" :load-data="loadData" show-checkbox></Tree>

        <v-jstree :data="data"
                  :item-events="itemEvents"
                  allow-batch
                  whole-row
                  @item-click="itemClick"
                  @item-drag-start="itemDragStart"
                  @item-drag-end="itemDragEnd"
                  @item-drop-before = "itemDropBefore"
                  @item-drop="itemDrop"
                  ref="tree"></v-jstree>
      </div>
      <div id="app-content" class="oss-app-main">
        <!--<Card style="margin: 0 0 15px 15px;">
          <Form :model="formItem" :label-width="60">
            <Row>
              <Col span="8">
                <FormItem label="设备ID">
                  <Input v-model="formItem.input" placeholder="Enter something..."></Input>
                </FormItem>
              </Col>
              <Col span="8">
                <FormItem label="状态">
                  <Input v-model="formItem.input" placeholder="Enter something..."></Input>
                </FormItem>
              </Col>
              <Col span="2">
              </Col>
              <Col span="6">
                <Button>查询</Button>
              </Col>
            </Row>
          </Form>
        </Card>-->
        <Table id="filelist" ref="selection" :columns="columns4" :data="data1" style="margin-left: 15px;"></Table>
      </div>
    </div>
  </div>
</template>
<script>
import VJstree from 'vue-jstree'
import { getDeviceList, getDeviceGroupTree } from '@/api/data'

export default {
  name: 'devicels',
  components: {
    VJstree
  },
  data () {
    return {
      formItem: {
        input: '',
        select: '',
        radio: 'male',
        checkbox: [],
        switch: true,
        date: '',
        time: '',
        slider: [20, 50],
        textarea: ''
      },
      value3: false,
      data3: [
        {
          title: 'parent',
          loading: false,
          children: []
        }
      ],
      styles: {
        height: 'calc(100% - 55px)',
        overflow: 'auto',
        paddingBottom: '53px',
        position: 'static'
      },
      formData: {
        name: '',
        url: '',
        owner: '',
        type: '',
        approver: '',
        date: '',
        desc: ''
      },
      itemEvents: {
        mouseover: function () {
          console.log('mouseover')
        },
        contextmenu: function () {
          console.log(arguments[2])
          arguments[2].preventDefault()
          console.log('contextmenu')
        }
      },
      data: [
        {
          'text': '/',
          'opened': true,
          'children': [
            {
              id: '1',
              'text': 'initially selected',
              'selected': true
            },
            {
              'text': 'custom icon',
              'icon': 'fa fa-warning icon-state-danger'
            },
            {
              'text': 'initially open',
              'icon': 'fa fa-folder icon-state-default',
              'opened': true,
              'children': [
                {
                  'text': 'Another node'
                }
              ]
            },
            {
              'text': 'custom icon',
              'icon': 'fa fa-warning icon-state-warning'
            },
            {
              'text': 'disabled node',
              'icon': 'fa fa-check icon-state-success',
              'disabled': true
            },
            {
              'text': 'Same but with checkboxes',
              'opened': true,
              'children': [
                {
                  'text': 'initially selected',
                  'selected': true
                },
                {
                  'text': 'custom icon',
                  'icon': 'fa fa-warning icon-state-danger'
                },
                {
                  'text': 'initially open',
                  'icon': 'fa fa-folder icon-state-default',
                  'opened': true,
                  'children': [
                    {
                      'text': 'Another node'
                    }
                  ]
                },
                {
                  'text': 'custom icon',
                  'icon': 'fa fa-warning icon-state-warning'
                },
                {
                  'text': 'disabled node',
                  'icon': 'fa fa-check icon-state-success',
                  'disabled': true
                }
              ]
            },
            {
              'text': 'And wholerow selection'
            },
            {
              'text': 'drag disabled',
              'icon': 'fa fa-warning icon-state-danger',
              'dragDisabled': true
            },
            {
              'text': 'drop disabled',
              'icon': 'fa fa-warning icon-state-danger',
              'dropDisabled': true
            }
          ]
        }
      ],
      columns4: [
        {
          title: '设备ID',
          align: 'left',
          key: 'deviceId'
        },
        {
          title: '设备状态',
          align: 'center',
          width: 100,
          key: 'filesize'
        },
        {
          title: '所属组',
          align: 'center',
          width: 200,
          key: 'groupName'
        },
        {
          title: '操作',
          align: 'right',
          width: 150,
          key: 'opt',
          render: (h, params) => {
            return h('div', [
              h('Button', {
                props: {
                  type: 'error',
                  size: 'small'
                },
                on: {
                  click: () => {
                    this.remove(params.index)
                  }
                }
              }, 'Delete')
            ])
          }
        }
      ],
      data1: [
        {
          deviceId: 'John Brown',
          filesize: 18,
          address: 'New York No. 1 Lake Park',
          updateTime: '2016-10-03',
          filetype: 'folder',
          icon: 'folder'
        },
        {
          filename: 'John Brown',
          filesize: 18,
          address: 'New York No. 1 Lake Park',
          updateTime: '2016-10-03',
          filetype: 'mp3'
        },
        {
          name: 'Joe Black',
          age: 30,
          address: 'Sydney No. 1 Lake Park',
          date: '2016-10-02'
        },
        {
          name: 'Jon Snow',
          age: 26,
          address: 'Ottawa No. 2 Lake Park',
          date: '2016-10-04'
        }
      ]
    }
  },
  methods: {
    itemClick (node) {
      this.editingNode = node
      this.editingItem = node.model
      console.log(node.model.text + ' clicked !')
      getDeviceList(this.editingItem.id).then(res => {
        this.data1 = res.data
      })
    },
    itemDragStart (node) {
      console.log(node.model.text + ' drag start !')
    },
    itemDragEnd (node) {
      console.log(node.model.text + ' drag end !')
    },
    itemDropBefore (node, item, draggedItem, e) {
      if (!draggedItem) {
        item.addChild({
          text: 'newNode',
          value: 'newNode'
        })
      }
    },
    itemDrop (node, item, draggedItem, e) {
      var sortBy = function (attr, rev) {
        if (rev == undefined) {
          rev = 1
        } else {
          rev = (rev) ? 1 : -1
        }
        return function (a, b) {
          a = a[attr]
          b = b[attr]
          if (a < b) {
            return rev * -1
          }
          if (a > b) {
            return rev * 1
          }
          return 0
        }
      }
      item.children.sort(sortBy('text', true))
      this.$refs.tree.handleRecursionNodeChildren(draggedItem, function (childrenItem) {
        childrenItem.selected = item.selected
      })
      console.log(node.model.text + ' drop !')
    },
    inputKeyUp: function () {
      var text = this.searchText
      const patt = new RegExp(text)
      this.$refs.tree.handleRecursionNodeChilds(this.$refs.tree, function (node) {
        if (text !== '' && node.model !== undefined) {
          const str = node.model.text
          if (patt.test(str)) {
            node.$el.querySelector('.tree-anchor').style.color = 'red'
          } else {
            node.$el.querySelector('.tree-anchor').style.color = '#000'
          } // or other operations
        } else {
          node.$el.querySelector('.tree-anchor').style.color = '#000'
        }
      })
    },
    addChildNode: function () {
      if (this.editingItem.id !== undefined) {
        this.editingItem.addChild({
          text: 'newNode',
          value: 'newNode'
        })
      }
    },
    removeNode: function () {
      if (this.editingItem.id !== undefined) {
        var index = this.editingNode.parentItem.indexOf(this.editingItem)
        this.editingNode.parentItem.splice(index, 1)
      }
    },
    addBeforeNode: function () {
      if (this.editingItem.id !== undefined) {
        this.editingItem.addBefore({
          text: 'newNode',
          value: 'newNode'
        }, this.editingNode)
      }
    },
    addAfterNode: function () {
      if (this.editingItem.id !== undefined) {
        this.editingItem.addAfter({
          text: 'newNode',
          value: 'newNode'
        }, this.editingNode)
      }
    },
    openChildren: function () {
      if (this.editingItem.id !== undefined) {
        this.editingItem.openChildren()
      }
    },
    closeChildren: function () {
      if (this.editingItem.id !== undefined) {
        this.editingItem.closeChildren()
      }
    },
    refreshNode: function () {
      this.asyncData = [
        this.$refs.tree2.initializeLoading()
      ]
      this.$refs.tree2.handleAsyncLoad(this.asyncData, this.$refs.tree2)
    },
    customItemClick: function (node, item, e) {
      e.stopPropagation()
      var index = node.parentItem.indexOf(item)
      node.parentItem.splice(index, 1)
    },
    customItemClickWithCtrl: function () {
      console.log('click + ctrl')
    },
    loadData (item, callback) {
      setTimeout(() => {
        const data = [
          {
            title: 'children',
            loading: false,
            children: []
          },
          {
            title: 'children',
            loading: false,
            children: []
          }
        ]
        callback(data)
      }, 1000)
    }
  },
  mounted () {
    getDeviceGroupTree(1).then(res => {
      this.data = res.data
    })
  }
}
</script>
<style>
.demo-drawer-footer{
  width: 100%;
  position: absolute;
  bottom: 0;
  left: 0;
  border-top: 1px solid #e8e8e8;
  padding: 10px 16px;
  text-align: right;
  background: #fff;
}
.hasTopbar .oss-app {
  margin-top: -50px;
  padding-top: 50px;
}
.oss-app {
  height: 100vh;
  overflow: hidden;
}
.oss-app .oss-app-container {
  height: 100%;
  position: relative;
  padding-left: 180px;
}
.oss-app-menu {
  display: -webkit-box;
  display: -moz-box;
  display: -ms-flexbox;
  display: flex;
  -webkit-box-orient: vertical;
  -webkit-box-direction: normal;
  -moz-box-orient: vertical;
  -moz-box-direction: normal;
  -ms-flex-direction: column;
  flex-direction: column;
  color: #373d41;
  position: absolute;
  width: 180px;
  background-color: #ebecec;
  height: 100%;
  left: 0;
  top: 0;
  bottom: 0;
  overflow: scroll;
}
.oss-app .oss-app-container .oss-app-main {
  position: relative;
  height: 100%;
  overflow: auto;
}
</style>
