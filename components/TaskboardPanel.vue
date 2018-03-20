<template>
  <div>
    <el-container>
      <el-header>
        <h3><font color='royalblue'>タスクボード</font></h3>
        <span>イテレーション：</span>
        <el-select v-model='currentIterationId' 
                   @change='switchCurrentIterationId'>
          <el-option
            v-for='iteration in backlogState.iterations'
            :key='iteration.id'
            :label='iteration.subject'
            :value='iteration.id'>
          </el-option>
        </el-select>
      </el-header>
      <el-main>
        <div><font color=red>{{error}}</font></div><br/>
        <div class='shadow'>
        <table class='taskboard-table' border='0' cellspacing='0'>
          <thead>
            <th class='story-header'>
              <font color='royalblue'>ストーリー</font>
            </th>
            <th class='todo-header'>
              <font color='royalblue'>新規</font>
            </th>
            <th class='doing-header'>
              <h4><font color='royalblue'>対応中</font></h4>
            </th>
            <th class='done-header'>
              <h4><font color='royalblue'>完了</font></h4>
            </th>
          </thead>
          <tbody>
            <!-- <tr v-for='story in backlogState.iterationStoriesMap[tasksState.currentIterationId]' :key='story.id'> -->
            <tr v-for='story in tasksState.stories' :key='story.id'>
              <td class='taskboard-td'>
                <story-board
                  :project='backlogState.currentProject'
                  :iterationId='tasksState.currentIterationId'
                  :story='story'/>
              </td>
              <td class='taskboard-td'>
                <task-lane
                  :story='story'
                  :tasks='storyTasksByStatus(story.id, "New")'
                  taskStatus='New'
                />
              </td>
              <td class='taskboard-td'>
                <task-lane
                  :story='story'
                  :tasks='storyTasksByStatus(story.id, "Doing")'
                  taskStatus='Doing'
                />
              </td>
              <td class='taskboard-td'>
                <task-lane
                  :story='story'
                  :tasks='storyTasksByStatus(story.id, "Done")'
                  taskStatus='Done'
                />
              </td>
            </tr>
          </tbody>
        </table>
        </div>
      </el-main>
    </el-container>
  </div>
</template>

<script>
import Vue from 'vue'
import StoryBoard from '~/components/story/StoryBoard'
import TaskLane from '~/components/task/TaskLane'
import StoryController from '~/libs/controllers/StoryController'
Vue.component('story-board', StoryBoard)
Vue.component('task-lane', TaskLane)

export default {
  name: 'taskboard-panel',
  data() {
    return {
      backlogState: this.$store.state.backlogState,
      tasksState: this.$store.state.tasksState,
      currentIterationId: this.$store.state.tasksState.currentIterationId,
      error: '',
    }
  },
  mounted() {
    const currentProject = this.$store.state.backlogState.currentProject
    this.$store.commit('tasksState/init',{
      currentProject: currentProject
    })
    this.currentIterationId = this.tasksState.currentIterationId
  },
  methods: {
    switchCurrentIterationId() {
      this.$store.commit('tasksState/switchCurrentIterationId', {
        currentIterationId: this.currentIterationId
      })
      this.currentIterationId = this.tasksState.currentIterationId
    },
    storyTasksByStatus(storyId, taskStatus) {
      return this.tasksState.tasks.filter(
        task => (task.storyId === storyId && task.status === taskStatus)
      )
    },
  }

}
</script>

<style scoped>
.shadow {
  box-shadow:0px 0px 5px gray;
}

.taskboard-table {
  width: 100%;
  border: 1px;
  border-style: dashed;
  border-color: linen;
}

.taskboard-td {
  height: 100%;
  vertical-align: top;
  border: 1px;
  border-style: dashed;
  border-color: linen;
}

.story-header {
  border: gold solid 3px;
  background-color: lightyellow;
  vertical-align: top;
  text-align: center;
  width: 16%;
  height: 100%;
}

.todo-header {
  border: springgreen solid 3px;
  background-color: palegreen;
  vertical-align: top;
  text-align: center;
  width: 28%;
  height: 100%;
}

.doing-header {
  border: hotpink solid 3px;
  background-color: pink;
  vertical-align: top;
  text-align: center;
  width: 28%;
  height: 100%;
}

.done-header {
  border: cyan solid 3px;
  background-color: lightcyan;
  vertical-align: top;
  text-align: center;
  width: 28%;
  height: 100%;
}
</style>
