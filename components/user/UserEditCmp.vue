<template>
  <div>
    <div class="modal" :class="{ 'is-active': this.showAddDialog }">
      <div class="modal-background"></div>
      <div class="modal-card">

        <!--ヘッダ-->
        <header class="modal-card-head">
          <p class="modal-card-title">ユーザーの追加</p>
          <button @click='onCancel' class="delete" aria-label="close"></button>
        </header>

        <section class="modal-card-body">
          <!--名前入力-->
          <div class="field">
            <input v-model='name' class="input" type="text" placeholder="名前を入力して下さい">
          </div>

          <!--アカウント名入力-->
          <div class="field">
            <input v-model='account' :readonly='id !== undefined' class="input" type="text"
                   placeholder="アカウント名を入力して下さい">
          </div>

          <!--パスワード入力-->
          <div class="field">
            <input v-model='password' class="input" type="password" placeholder="パスワードを入力して下さい">
          </div>

          <!--管理者権限入力-->
          <div v-if="showAdmin" class="field">
            <input v-model='admin' id="adminSwitch" type="checkbox" class="switch" checked="checked">
            <label for="adminSwitch">管理者権限</label>
          </div>

          <!--エラーメッセージ-->
          <span style="color: red; ">{{error}}</span>
        </section>

        <!--フッタ-->
        <footer class="modal-card-foot">
          <button @click="onButtonOk" :disabled='account === "" || name === ""' class="button is-success">保存</button>
          <button @click="onCancel" class="button">キャンセル</button>
        </footer>

      </div>
    </div>
  </div>
</template>

<script>
  import UserController from '~/libs/controllers/UserController'
  import { UserUpdateRequest } from '~/libs/models/User'

  export default {
    name: 'user-cmp',
    props: [
      'user',
      'showAdmin',
      'onOk',
      'onCancel',
      'showAddDialog',
    ],
    data() {
      let user = this.user
      return ({
        id: (user) ? user.id : UserUpdateRequest.CREATE_REQUEST,
        account: (user) ? user.account : '',
        name: (user) ? user.name : '',
        password: (user) ? user.password : '',
        admin: (user) ? user.admin : false,
        projectIds: (user) ? user.projectIds : [],
        error: '',
      })
    },
    methods: {
      onButtonOk() {
        if (!this.account) {
          return;
        }
        const request = new UserUpdateRequest({
          id: this.id,
          account: this.account,
          name: this.name,
          password: this.password,
          admin: this.admin,
          projectIds: this.projectIds,
        })
        try {
          this.onOk(request)
          this.reset()
        } catch (err) {
          this.error = err.message
          return
        }
      },

      onButtonCancel() {
        try {
          this.onCancel()
          this.reset()
        } catch (err) {
          this.error = err.message
          return
        }
      },

    reset() {
      //ダイアログは非表示になっているだけなので入力内容をクリアする。
      const user = UserController.findById(this.id)
      this.id = (user) ? user.id : UserUpdateRequest.CREATE_REQUEST
      this.account = (user) ? user.account : ''
      this.name = (user) ? user.name : ''
      this.password = (user) ? user.password : ''
      this.admin = (user) ? user.admin : false
      this.projectIds = (user) ? user.projectIds : []
        this.error = ''
      },
    }
  };
</script>

<style scoped lang="scss">
  .modal-background {
    background: rgba(0, 0, 0, 0.2);
  }

  .modal-card {
    background: rgba(255, 255, 255, 0.3);
  }

  .input-label {
    display: inline-block;
    width: 150px;
  }

  .input-text {
    display: inline-block;
    width: 400px;
  }

  .el-header,
  .el-main {
    text-align: left;
  }

  .el-footer {
    text-align: center;
  }

  .float-buttons {
    float: right;
  }
</style>
