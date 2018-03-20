<template>
  <div class="container">
    <!--タイトル部分-->
    <section class="hero">
      <div class="hero-body">
        <div class="container">
          <h1 class="title">
            <span class="icon is-small"><i class="fas fa-users"></i></span>
            User Management
          </h1>
          <h2 class="subtitle">
            ユーザーの追加と削除、および権限の管理を行います。
          </h2>
        </div>
      </div>
    </section>

    <!--エラー表示-->
    <span style="color: red; ">{{usersState.error}}</span><br />

    <div class="is-divider" data-content="RASCALOID"></div>

    <!--ユーザー追加-->
    <a @click='onAddStart' class="button is-primary is-outlined">ユーザーの追加</a>

    <div class="separater"></div>

    <user-edit-cmp
      :v-if='showAddDialog'
      :showAdmin='true'
      :onOk='onAddOk'
      :onCancel='onAddCancel'
      :showAddDialog='this.showAddDialog'
    />

    <div class="user-table">
      <!--ユーザー情報表示-->
      <table class="table is-striped">
        <!--テーブルヘッダ-->
        <thead>
        <tr>
          <th>
            操作
          </th>
          <th>
            アカウント名
          </th>
          <th>
            管理者権限
          </th>
        </tr>
        </thead>
        <!--テーブル内容（アカウントの表示）-->
        <tbody>
        <tr v-for='(user, index) in usersState.users' :key="user.id">
          <td>
            <!--未編集状態-->
            <i v-if="user.editingFlag === false" @click="onEditStart(index)" class="fas fa-edit"></i>
            <i v-if='user.account !== "admin" &&
                              user.editingFlag === false' @click='onDeleteOk(index)'
               class="fas fa-trash-alt is-negative"></i>

            <!--編集状態-->
            <i v-if='user.editingFlag === true' @click='onEditOk(index)' class="fas fa-check"></i>
            <i v-if='user.editingFlag === true' @click='onEditCancel(index)' class="fas fa-times is-negative"></i>
          </td>
          <!--アカウント名表示-->
          <td>
            {{user.account}}
          </td>
          <!--管理者権限切り替え-->
          <td>
            <input v-model='user.admin' :disabled='!user.editingFlag || user.account === "admin"' :id="user.id"
                   type="checkbox" class="switch">
            <label :for="user.id"></label>
          </td>
        </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script>
  import Vue from 'vue'
  import UserEditCmp from '~/components/user/UserEditCmp'
  import UserController from '~/libs/controllers/UserController'
  import { UserUpdateRequest } from '~/libs/models/User'

  Vue.component('user-edit-cmp', UserEditCmp)

  export default {
    name: "user-list",
    data() {
      return {
        usersState: this.$store.state.usersState,
        showAddDialog: false,
        showDeleteConfirm: false,
      }
    },
    mounted() {
      this.$store.commit('usersState/init', {})
      this.usersState.users.forEach((user) => {
        this.$set(user, 'editingFlag', false)
      })
    },
    methods: {
      onEditStart(index) {
        const user = this.usersState.users[index]
        this.$set(user, 'editingFlag', true)
      },
      onEditCancel(index) {
        const user = this.usersState.users[index]
        this.$set(user, 'editingFlag', false)
        this.$store.commit('usersState/editCancel', {
          index: index,
          user: user,
        })
      },
      onEditOk(index) {
        const user = this.usersState.users[index]
        const request = new UserUpdateRequest({
          id: user.id,
          account: user.account,
          name: user.name,
          password: user.password,
          admin: user.admin,
          projectIds: user.projectIds
        })
        this.$store.commit('usersState/edit', {
          request: request,
        })
        this.$set(user, 'editingFlag', false)
      },
      onDeleteStart(index) {
        this.showDeleteConfirm = true
      },
      onDeleteOk(index) {
        this.$store.commit('usersState/delete', {
          index: index,
        })
        this.showDeleteConfirm = false
      },
      onDeleteCancel(index) {
        this.showDeleteConfirm = false
      },
      onAddStart() {
        this.showAddDialog = true
      },
      onAddOk(request) {
        this.$store.commit('usersState/create', {
          request: request,
        })
        const user = this.usersState.users[this.usersState.users.length - 1]
        this.$set(user, 'editingFlag', false)
        this.showAddDialog = false
      },
      onAddCancel() {
        this.showAddDialog = false
      }
    }
  }
</script>

<style lang="scss" scoped>
  /*タイトル周りのスタイル*/
  .hero-body {
    padding-top: 5px;
    padding-bottom: 5px;
    background: rgba(255, 255, 255, 0.3);
    h1 {
      padding-bottom: 7px;
    }
    .title {
      color: #00d1b2;
      .icon {
        margin-right: 10px;
      }
    }
  }

  .is-divider {
    margin-top: 0;
    border-color: rgba(255, 255, 255, 0.3);
  }

  .is-divider::after {
    background: rgba(255, 255, 255, 0.3);
  }

  /*テーブルまわりのスタイル*/
  table {
    background: rgba(255, 255, 255, 0.3);
    width: 100%;
    height: 100%;
    table-layout: fixed;
    i {
      min-width: 20px;
      margin-right: 4px;
      cursor: pointer;
    }
    i:hover {
      color: #37c290;
      transition: color 0.2s;
      &.is-negative {
        color: red;
      }
    }
  }

  .user-table {
    overflow: auto;
    max-height: 60vh;
    position: relative;
  }

  /*ボタンのスタイル*/
  .button {
    transition: color 0.4s;
  }

  .separater {
    margin-top: 15px;
    margin-bottom: 15px;
  }
</style>
