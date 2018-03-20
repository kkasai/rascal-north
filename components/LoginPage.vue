<template>
  <div id='login'>
    <div class="pageloader"><span class="title">Pageloader</span></div>
    <section class="hero is-light is-fullheight">
      <div class="hero-body container has-text-centered" @keydown.enter="onLogin">
        <div class="box column is-4 is-offset-4">

          <figure class="avatar">
            <img src="../assets/images/logo.png">
          </figure>

          <!--Account-->
          <div class="field">
            <div class="control">
              <input autofocus v-model="loginState.account" class="input" type="text"
                     placeholder="Please input your account name">
            </div>
          </div>
          <!--Password-->
          <div class="field">
            <div class="control">
              <input v-model="loginState.password" class="input" type="password"
                     placeholder="Please input your password">
            </div>
          </div>
          <!--Remember me-->
          <div class="field">
            <label class="checkbox">
              <input type="checkbox">
              Remember me
            </label>
          </div>

          <div class="field">
            <a class="button is-primary is-outlined" @click='onLogin' :disabled='loginState.account === ""'>LOG IN</a>
          </div>

          <span class="error-message">{{loginState.error}}</span>

        </div>
      </div>
    </section>
    <div class="copyright">Logo made with <a href="https://www.designevo.com/" title="Free Online Logo Maker">DesignEvo</a></div>
  </div>
</template>

<script>
export default {
  name: 'login-page',
  data() {
    return {
      loginState: this.$store.state.loginState,
    };
  },
  methods: {
    onLogin() {
        if (!this.loginState.account) {
          return
        }
      this.$store.commit('loginState/login', {
        account: this.loginState.account,
        password: this.loginState.password,
      })
      if (this.loginState.loginUser) {
        const query = this.$route.query
        let redirect = false
        if(query && query.redirect) {
          this.$router.push(query.redirect)
        } else {
          this.$router.push('/main')
        }
      }
    }
  }
}
</script>

<style scoped>
  .avatar {
    margin-top: -70px;
    padding-bottom: 20px;
  }

  .error-message {
    color: red;
  }

  /*ボタンのスタイル*/
  .button {
    transition: color 0.4s;
  }
</style>
