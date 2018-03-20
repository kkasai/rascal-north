<template>
    <div>
      <el-container>
        <el-main>
          <span class='input-label'>名前：</span>
          <el-input class='input-text' type='text'
            placeholder='名前を入力してください'
            v-model='subject'
            clearable
            />
          <br/>
          <span class='input-label'>説明：</span>
          <el-input class='input-text' type='textarea'
            placeholder='説明を入力してください'
            v-model='description' 
            clearable
            />
          <br/>
          <span class='input-label'>時間：</span>
          <el-input-number
            v-model='estimatedHours'
            :min=0
            :step=1
            controls-position='right'
          />
          <br/>
          <span class='input-label'>ステータス：</span>
          <el-select 
            v-model='status'
            placeholder='ステータス'
          >
            <el-option
              v-for='option in statuses'
              :key='option.value'
              :label='option.label'
              :value='option.value'
            />
          </el-select>
          <br/>
          <font color='red'>{{error}}</font>
        </el-main>
        <el-footer>
          <span >
            <el-button 
              type='danger'
              size='small'
              class='float-buttons'
              icon='el-icon-close'
              @click='onButtonCancel'
              round
            >
              キャンセル
            </el-button>
            <el-button 
              type='success'
              size='small'
              class='float-buttons'
              icon='el-icon-check'
              :disabled='subject === ""'
              @click='onButtonOk'
              round
            >
              保存
            </el-button>
          </span>
        </el-footer>
      </el-container>
    </div>
</template>

<script>
import Task, {TaskUpdateRequest} from '~/libs/models/Task'
import TaskController from '~/libs/controllers/TaskController'

export default {
  name: 'task-edit-cmp',
  props: [
    'story',
    'task',
    'onOk',
    'onCancel',
  ],
  data() {
    const task = this.task
    const story = this.story
    return ({
      id: (task) ? task.id : TaskUpdateRequest.CREATE_REQUEST,
      subject: (task) ? task.subject : '',
      description: (task) ? task.description : '',
      estimatedHours: (task) ? task.estimatedHours : undefined,
      position: (task) ? task.position : undefined,
      status: (task) ? task.status : Task.NewStatus,
      storyId: (task) ? task.storyId : (story) ? story.id : undefined,
      error: '',
      statuses: [
        {label: '新規', value: Task.NewStatus},
        {label: '着手', value: Task.DoingStatus},
        {label: '完了', value: Task.DoneStatus},
      ],
    })
  },
  methods: {
    onButtonOk() {
      if(!this.subject) return
      const project = this.$store.state.backlogState.currentProject
      const request = new TaskUpdateRequest({
        id: this.id,
        subject: this.subject,
        description: this.description,
        estimatedHours: this.estimatedHours,
        position: this.position,
        status: this.status,
        storyId: this.storyId,
        projectId: (project) ? project.id : undefined,
      })
      try{
        this.onOk(request)
        this.reset()
      } catch(err) {
        this.error = err.message
        return
      }
    },

    onButtonCancel() 
    {
      try{
        this.onCancel()
        this.reset()
      } catch(err) {
        this.error = err.message
        return
      }
    },

    reset() {
      //ダイアログは非表示になっているだけなので入力内容を初期化する。
      const task = TaskController.findById(this.id)
      const project = this.project
      this.id = (task) ? task.id : TaskUpdateRequest.CREATE_REQUEST
      this.subject = (task) ? task.subject : ''
      this.description = (task) ? task.description : ''
      this.estimatedHours = (task) ? task.estimatedHours : undefined
      this.position = (task) ? task.position : undefined
      this.status = (task) ? task.status : Task.NewStatus
      this.error = ''
    }
  }
}
</script>

<style scoped>
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
