<template>
  <div>
    <draggable
      class='drag-area'
      @end='onDropped'
      :v-model='tasks'
      :id='"tasks-" + taskStatus'
      :options='{animation:200, group: "storyTasks-" + story.id}'
      >
      <div v-for='task in tasks' :key='task.id'>
        <task-board
          :story='story' :task='task'/>
      </div>
    </draggable>
  </div>
</template>

<script>
import Vue from 'vue'
import VueDraggable from 'vuedraggable'
import Task, {TaskUpdateRequest} from '~/libs/models/Task'
import TaskController from '~/libs/controllers/TaskController'
import TaskBoard from '~/components/task/TaskBoard'

Vue.component('draggable', VueDraggable)
Vue.component('task-board', TaskBoard)

export default {
  components : {VueDraggable, TaskBoard},
  name: 'task-lane',
  props: [
    'story',
    'tasks',
    'taskStatus',
  ],
  data() {
    const tasksState = this.$store.state.tasksState
    const tasks = tasksState.tasks.filter(
      (task) => (task.storyId === this.story.id && task.status === this.taskStatus)
    )
    return {
      tasksState: this.$store.state.tasksState,
      //tasks: tasks,
      error: '',
    }
  },
  methods: {
    onDropped(event) {
      let newStatus
      const index = (event.to.id === 'tasks-' + this.taskStatus)
                    ? event.newIndex : event.oldIndex
      switch(event.to.id) {
      case 'tasks-' + Task.NewStatus:
        newStatus = Task.NewStatus
        break
      case 'tasks-' + Task.DoingStatus:
        newStatus = Task.DoingStatus
        break
      case 'tasks-' + Task.DoneStatus:
        newStatus = Task.DoneStatus
        break
      }
      if(event.to.id === event.from.id) {
        //順番の入れ替え
        const oldTask = this.tasks[event.oldIndex]
        const newTask = this.tasks[event.newIndex]
        this.$store.commit('tasksState/changeTaskPosition', {
          storyId: this.story.id,
          status: this.taskStatus,
          oldIndex: event.oldIndex,
          newIndex: event.newIndex,
        })
      } else {
        //ステータスの更新と順番の入れ替え
        const task = this.tasks[event.oldIndex]
        this.$store.commit('tasksState/changeTaskState', {
          storyId: this.story.id,
          task: this.tasks[event.oldIndex],
          status: newStatus,
          oldIndex: event.oldIndex,
          newIndex: event.newIndex,
        })
      }
    },
  },

}
</script>

<style scoped>
.drag-area {
  position: relative;
  min-height: 300px;
  height: 100%;
}
</style>
