<template>
  <transition name="task-board">
  <div :class='"task-board " + task.status + hasAssignedUser(task)' >
    <span class='float-right'>
      <el-button type='text' @click='onEditStart'>
        <i class='el-icon-edit' style='color:royalblue'/>
      </el-button>
      <el-button type='text' @click='onDelete'>
        <i class='el-icon-delete' style='color:red'/>
      </el-button>
    </span>
    <br/>
    <div :class='"subject-text " + task.status'>{{task.subject}}</div>
    <span class='estimated-hours'>
      <el-tag size='small'>
        <font color='forestgreen'>{{estimatedHourText()}} H</font>
      </el-tag>
    </span>
    <el-dialog
      title='タスクの編集'
      :visible='showEditDialog'
      custom-class='story-edit-dialog'
      :show-close='false'
      :append-to-body='true'
      >
      <task-edit-cmp
        :story='story'
        :task='task'
        :onOk='onEditOk'
        :onCancel='onEditCancel'
      />
    </el-dialog>
  </div>
  </transition>
</template>

<script>
import Vue from 'vue'
import TaskEditCmp from '~/components/task/TaskEditCmp'
import Task from '~/libs/models/Task'

Vue.component('task-edit-cmp', TaskEditCmp)

export default {
  name: 'task-board',
  props: [
    'story',
    'task',
  ],
  data() {
    return {
      tasksState: this.$store.state.tasksState,
      showEditDialog: false,
    }
  },
  methods: {
    hasAssignedUser(task) {
      return (task.status === Task.NewStatus &&
              task.assignedUserIds &&
              task.assignedUserIds.length > 0)
              ? ' hasAssignedUser' : ''
    },
    estimatedHourText() {
      return (this.task.esitmatedHours) ? this.task.esitmatedHours : 0.0
    },
    onEditStart() {
      this.showEditDialog = true
    },
    onEditOk(request) {
      this.$store.commit('tasksState/editTask', {
        request: request,
        task: this.task,
      })
      this.showEditDialog = false
    },
    onEditCancel() {
      this.showEditDialog = false
    },
    onDelete() {
      if(!confirm('本当に削除しますか？')) return
      this.$store.commit('tasksState/deleteTask', {
        task: this.task,
      })
    },
  }
}
</script>

<style scoped lang="scss">
.task-board {
  box-shadow: 0px 0px 5px silver;
  border: 1px solid gray;
  background-color: snow;
  vertical-align: top;
  text-align: left;
  float:left;
  width: 50%;
  max-width: 150px;
  height: 150px;
  margin-top: 2px;
  margin-bottom: 2px;
  margin-left: 2px;
  margin-right: 2px;
  padding: 10px;
  overflow: hidden;
  word-break: break-all;
  position: relative;
}
.estimated-hours {
  position: absolute;
  bottom: 4px;
  right: 4px;
}
.float-right {
  position: absolute;
  top: -4px;
  right: 4px;
}

.subject-text {
  &.Done {
    text-decoration: line-through;
  }
}

.task-board{
  &.New {
    background-color: rgba(152,251,152 ,0.5);//palegreen
    border: 1px solid springgreen;
    
  }
  &.Doing {
    background-color: rgba(255,192,203,0.5);//pink
    border: 1px solid hotpink;
  }
  &.Done {
    background-color: rgba(224,255,255,0.5);//lightcyan
    border: 1px solid cyan;
  }
}

</style>
