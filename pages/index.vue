<template>
  <div>
    <login-page />
  </div>
</template>

<script>
  import Vue from 'vue'
  import ElementUI from 'element-ui'
  import 'element-ui/lib/theme-chalk/index.css'
  import locale from 'element-ui/lib/locale/lang/ja'
  import LoginPage from '~/components/LoginPage'

  Vue.use(ElementUI, { locale });
  Vue.use(ElementUI);

  export default {
    components: {
      LoginPage,
    }
  }
</script>

<style lang="sass">

</style>

