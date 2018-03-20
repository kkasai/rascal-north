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
          <span class='input-label'>開始日：</span>
          <el-date-picker type='date' id='startOn'
            placeholder='開始日を選んでください'
            v-model='startOn'
            />
          <br/>
          <span class='input-label'>終了日：</span>
          <el-date-picker type='date' id='endOn'
            placeholder='終了日を選んでください'
            v-model='endOn'
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
          <span class='float-buttons'>
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
              :disabled='!subject || startOn === undefined || endOn === undefined'
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
import Iteration, {IterationUpdateRequest} from '~/libs/models/Iteration'
import IterationController from '~/libs/controllers/IterationController'

export default {
  name: 'iteration-edit-cmp',
  props: [
    'iteration',
    'onOk',
    'onCancel',
  ],
  data() {
    if(!this.project){
      throw new Error("iteration-edit-cmpには、projectの指定が必須です。<iteration-edit-cmp :project=値>")
    }
    const project = this.project
    const iteration = this.iteration
    return ({
      id: (iteration) ? iteration.id : IterationUpdateRequest.CREATE_REQUEST,
      subject: (iteration) ? iteration.subject : '',
      description: (iteration) ? iteration.description : '',
      startOn: (iteration) ? iteration.startOn : undefined,
      endOn: (iteration) ? iteration.endOn : undefined,
      status: (iteration) ? iteration.status : Iteration.NewStatus,
      error: '',
      statuses: [
        {label: '新規', value: Iteration.NewStatus},
        {label: '着手', value: Iteration.DoingStatus},
        {label: '完了', value: Iteration.DoneStatus},
      ],
    })
  },
  methods: {
    onButtonOk() {
      if(!this.subject) return
      if(this.startOn === undefined||this.endOn === undefined) return
      if(this.startOn > this.endOn) {
        this.error = '終了日は、開始日より先の日付を選んでください'
        return
      }
      const project = this.$store.state.backlogState.currentProject
      const request = new IterationUpdateRequest({
        id: this.id,
        subject: this.subject,
        description: this.description,
        startOn: this.startOn, 
        endOn: this.endOn,
        status: this.status,
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
      const iteration = IterationController.findById(this.id)
      this.subject = (iteration) ? iteration.subject : ''
      this.description = (iteration) ? iteration.description : ''
      this.startOn = (iteration) ? iteration.startOn : undefined
      this.endOn = (iteration) ? iteration.endOn : undefined
      this.status = (iteration) ? iteration.status : Iteration.NewStatus
    }
  }
};
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
