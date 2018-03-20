<template>
  <div id='main'>
    <div class="tabs is-fullwidth is-toggle">
      <ul>
        <!--icon-->
        <img class="logo-image" src="../assets/images/logo-moji.png" />

        <!--backlog-->
        <li @click="changeTab('backlog')" :class="{ 'is-active': activeTab.backlog }">
          <a>
            <span class="icon is-small"><i class="fas fa-tasks"></i></span>
            <span>Backlog</span>
          </a>
        </li>

        <!--taskboard-->
        <li @click="changeTab('task')" :class="{ 'is-active': activeTab.task }">
          <a>
            <span class="icon is-small"><i class="fas fa-th-list"></i></span>
            <span>Task Board</span>
          </a>
        </li>

        <!--user-->
        <li @click="changeTab('user')" v-if='admin === true' :class="{ 'is-active': activeTab.user }">
          <a>
            <span class="icon is-small"><i class="fas fa-users"></i></span>
            <span>User Management</span>
          </a>
        </li>
        <li class="tab-disabled" v-else>
          <a>
            <span class="icon is-small"><i class="fas fa-users"></i></span>
            <span></span>
          </a>
        </li>

        <!--project-->
        <li @click="changeTab('project')" v-if='admin === true' :class="{ 'is-active': activeTab.project }">
          <a>
            <span class="icon is-small"><i class="fas fa-flag"></i></span>
            <span>Project Management</span>
          </a>
        </li>
        <li class="tab-disabled" v-else>
          <a>
            <span class="icon is-small"><i class="fas fa-flag"></i></span>
            <span></span>
          </a>
        </li>

      </ul>
    </div>

    <div v-if="activeTab.backlog">
      <backlog-panel />
    </div>

    <div v-if="activeTab.task">
      <taskboard-panel/>
    </div>

    <div v-if="activeTab.user">
      <user-panel />
    </div>

    <div v-if="activeTab.project">
      <project-panel />
    </div>

  </div>
</template>

<script>
  import Vue from 'vue'
  import BacklogPanel from '~/components/BacklogPanel'
import TaskboardPanel from '~/components/TaskboardPanel'
  import UserPanel from '~/components/UserPanel'
  import ProjectPanel from '~/components/ProjectPanel'

Vue.component('backlog-panel', BacklogPanel)
Vue.component('taskboard-panel', TaskboardPanel)
Vue.component('user-panel', UserPanel)
Vue.component('project-panel', ProjectPanel)

  export default {
    name: 'main-page',
    data() {
    const loginState = this.$store.state.loginState
      return {
        loginState: loginState,
        admin: (loginState.loginUser) ? loginState.loginUser.admin : false,
        activeTab: {
          backlog: true,
          task: false,
          user: false,
          project: false,
        },
      };
    },
    methods: {
      changeTab(tabName) {
        Object.keys(this.activeTab).forEach(key => {
          this.activeTab[key] = false;
        });
        this.activeTab[tabName] = true;
      },
    },
  }
</script>

<style scoped lang="scss">
  .tab {
    height: 80%;
  }

  .logo-image {
    height: 30px;
    margin-left: 20px;
    margin-right: 20px;
  }

  .tabs.is-toggle li.is-active a {
    background-color: #00d1b2;
    border-color: #00d1b2;
  }

  .tabs li a {
    transition: background-color 250ms;
  }
</style>
