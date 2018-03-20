<template>
  <div>
    <main-page/>
  </div>
</template>

<script>
import Vue from 'vue'
import ElementUI from 'element-ui'
import 'element-ui/lib/theme-chalk/index.css'
import locale from 'element-ui/lib/locale/lang/ja'

import MainPage from '~/components/MainPage'

Vue.use(ElementUI, {locale})

export default {
  components: {
    MainPage,
  }
}
</script>

<style>

</style>

