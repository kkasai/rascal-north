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
          <span class='input-label'>ポイント：</span>
          <el-select 
            v-model='point'
            placeholder='ポイント'
          >
            <el-option
              v-for='point in points'
              :key='point.value'
              :label='point.value'
              :value='point.value'
            />
          </el-select>
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
              :disabled='dispStory.subject === ""'
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
import Story, {StoryUpdateRequest} from '~/libs/models/Story'
import StoryController from '~/libs/controllers/StoryController'

export default {
  name: 'story-edit-cmp',
  props: [
    'story',
    'iterationId',
    'onOk',
    'onCancel',
  ],
  data() {
    let story = this.story
    if(!story) {
      const project = this.$store.state.backlogState.currentProject
      const projectId = (project) ? project.id : undefined
      story = Story.createNewStory(projectId, this.iterationId)
    }
    return ({
      dispStory: story,
      error: '',
      points: [
        {value:0.5},
        {value:1},
        {value:2},
        {value:3},
        {value:5},
        {value:8},
        {value:13},
      ],
      statuses: [
        {label: '新規', value: Story.NewStatus},
        {label: '着手', value: Story.DoingStatus},
        {label: '完了', value: Story.DoneStatus},
      ],
    })
  },
  methods: {
    onButtonOk() {
      if(!this.dispStory.subject) return
      try{
        const project = this.$store.state.backlogState.currentProject
        const request = new StoryUpdateRequest(this.dispStory)
        this.onOk(this.dispStory, request)
        this.reset()
      } catch(err) {
        this.error = err.message
        return
      }
    },

    onButtonCancel() 
    {
      try{
        this.onCancel(this.dispStory)
        this.reset()
      } catch(err) {
        this.error = err.message
        return
      }
    },

    reset() {
      if(this.dispStory.id !== StoryUpdateRequest.CREATE_REQUEST) return
      //ダイアログは非表示になっているだけなので入力内容をクリアする。
      this.dispStory.subject = ''
      this.dispStory.description = ''
      this.dispStory.point = undefined
      this.dispStory.position = 0
      this.dispStory.status = Story.NewStatus
      this.dispStory.projectId = undefined
      this.dispStory.iterationId = undefined
      this.error = ''
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
