<template>
  <div id='user-list'>
    <user-list/>
  </div>
</template>

<script>
import Vue from 'vue'
import UserList from '~/components/user/UserList'

Vue.component('user-list', UserList)

export default {
  name: 'user-panel',
}
</script>
