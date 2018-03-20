<template>
  <div id='backlog-list'>
      <el-container>
        <el-header>
          <h3><font color='royalblue'>バックログ</font></h3>
          <span>プロジェクト：</span>
          <el-select v-model='currentProjectId' @change='switchCurrentProject'>
            <el-option
              v-for='project in backlogState.userProjects'
              :key='project.id'
              :label='project.name'
              :value='project.id'>
            </el-option>
          </el-select>
        </el-header>
        <el-main>
          <font color='red'>{{backlogState.error}}</font><br/>
          <div class='backlog-header'>
            <div class='backlog-header-block'>
              <font color='royalblue'>イテレーション</font>
            </div>
            <div class='backlog-header-block'>
              <font color='royalblue'>バックログ</font>
            </div>
          </div>
          <div class='backlog-body'>
            <div class='backlog-body-block'>
              <iteration-list/>
            </div>
            <div class='backlog-body-block'>
              <backlog-list/>
            </div>
          </div>
        </el-main>
      </el-container>
  </div>
</template>

<script>
import Vue from 'vue'
import IterationList from '~/components/iteration/IterationList'
import IterationEditCmp from '~/components/iteration/IterationEditCmp'
import BacklogList from '~/components/story/BacklogList'
import StoryEditCmp from '~/components/story/StoryEditCmp'
import IterationController from '~/libs/controllers/IterationController'
import StoryController from '~/libs/controllers/StoryController'
import Story from '~/libs/models/Story'

Vue.component('iteration-list', IterationList)
Vue.component('iteration-edit-cmp', IterationEditCmp)
Vue.component('backlog-list', BacklogList)
Vue.component('story-edit-cmp', StoryEditCmp)

export default {
  name: 'backlog-panel',
  data() {
    return {
      loginState: this.$store.state.loginState,
      backlogState: this.$store.state.backlogState,
      currentProjectId: undefined,
    }
  },
  created() {
    const loginUser = this.loginState.loginUser
    this.$store.commit('backlogState/init',{loginUser: loginUser})
    if(this.backlogState.currentProject) {
      this.currentProjectId = this.backlogState.currentProject.id
    }
  },

  methods: {
    switchCurrentProject() {
      this.$store.commit('backlogState/switchCurrentProject', {
        currentProjectId: this.currentProjectId
      })
      const currentProject = this.backlogState.currentProject
      if(!currentProject) return
      this.$store.commit('tasksState/init',{
        currentProject: currentProject
      })
    }
  }
}
</script>

<style scoped>
.backlog-header {
  vertical-align: top;
  width:100%;
}
.backlog-header-block {
  vertical-align: top;
  display:inline-block;
  width:50%;
}
.backlog-body {
  vertical-align: top;
  width:100%;
  height: 100%;
}
.backlog-body-block {
  vertical-align: top;
  display:inline-block;
  width:50%;
  height: 100%;
}

</style>
