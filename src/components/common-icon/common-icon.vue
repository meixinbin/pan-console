<template>
  <component :is="iconType" :type="iconName" :color="iconColor" :size="iconSize"/>
</template>

<script>
import Icons from '_c/icons'
import FaIcons from '_c/fa-icons'
export default {
  name: 'CommonIcon',
  components: {Icons, FaIcons},
  props: {
    type: {
      type: String,
      required: true
    },
    color: String,
    size: Number
  },
  computed: {
    iconType () {
      if (this.isFa) {
        return 'FaIcons'
      }
      return this.type.indexOf('_') === 0 ? 'Icons' : 'Icon'
    },
    iconName () {
      if (this.isFa) {
        return this.type.substring(3)
      }
      return this.iconType === 'Icons' ? this.getCustomIconName(this.type) : this.type
    },
    iconSize () {
      return this.size || (this.iconType === 'Icons' ? 12 : undefined)
    },
    iconColor () {
      return this.color || ''
    },
    isFa () {
      return this.type.startsWith('fa-')
    }
  },
  methods: {
    getCustomIconName (iconName) {
      return iconName.slice(1)
    }
  }
}
</script>

<style>

</style>
