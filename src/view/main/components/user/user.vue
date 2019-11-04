<template>
  <div class="user-avator-dropdown">
    <Dropdown @on-click="handleClick">
      <Avatar :src="avatar"/>
      <Icon :size="18" type="md-arrow-dropdown"></Icon>
      <DropdownMenu slot="list">
        <DropdownItem>Signed in as <br> <b>{{nickname}}</b></DropdownItem>
        <DropdownItem name="logout" divided>退出登录</DropdownItem>
      </DropdownMenu>
    </Dropdown>
  </div>
</template>

<script>
import './user.less'
import { mapState, mapActions } from 'vuex'
export default {
  name: 'User',
  props: {

  },
  computed: {
    ...mapState({
      nickname: state => state.user.nickname,
      avatar: state => state.user.avatar
    })
  },
  methods: {
    ...mapActions([
      'handleLogOut'
    ]),
    handleClick (name) {
      switch (name) {
        case 'logout':
          this.handleLogOut().then(() => {
            // this.$router.push({
            //  name: 'login'
            // })
          })
          break
      }
    }
  }
}
</script>
