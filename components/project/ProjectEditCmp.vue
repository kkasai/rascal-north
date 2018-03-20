<template>
    <div>
      <el-container>
        <el-main>
          <span class='input-label'>名前：</span>
          <el-input class='input-text' type='text'
            placeholder='名前を入力してください'
            v-model='name'
            clearable>
          </el-input><br/>
          <span class='input-label'>説明：</span>
          <el-input class='input-text' type='text'
            placeholder='説明を入力してください'
            v-model='description' 
            clearable>
          </el-input><br/>
          <span class='input-label'>担当者：</span>
            <el-transfer
              filterable
              :filter-method='filterUser'
              filter-placeholder='名前またはアカウント'
              v-model='userIds'
              :titles="['ユーザー', '担当者']"
              :data='source'>
            </el-transfer><br/>
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
              :disabled='name === ""'
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
import ProjectController from '~/libs/controllers/ProjectController';
import UserController from '~/libs/controllers/UserController'
import {ProjectUpdateRequest} from '~/libs/models/Project'

export default {
  name: 'project-edit-cmp',
  props: [
    'project',
    'onOk',
    'onCancel',
  ],

  data() {
    return ({
      id: '',
      name: '',
      description: '',
      userIds: [],
      source: [],
      error: '',
    })
  },

  created() {
    const source = []
    const allUsers = UserController.findAll()
    allUsers.forEach((user) => (
      source.push({
        key: user.id, 
        label: user.name + '(' + user.account + ')'
      })
    ))
    const project = this.project
    this.id= (project) ? project.id : ProjectUpdateRequest.CREATE_REQUEST
    this.name= (project) ? project.name : ''
    this.description= (project) ? project.description : ''
    this.userIds= (project) ? project.userIds : []
    this.source= source
    this.error= ''
  },

  methods: {
    onButtonOk() {
      if(!this.name) return
      const request = new ProjectUpdateRequest({
        id: this.id,
        name: this.name,
        description: this.description, 
        userIds: this.userIds,
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
        this.onCancel(this.id)
        this.reset()
      } catch(err) {
        this.error = err.message
        return
      }
    },

    reset() {
      const source = []
      const allUsers = UserController.findAll()
      allUsers.forEach((user) => (
        source.push({
          key: user.id, 
          label: user.name + '(' + user.account + ')'
        })
      ))
      const project = (this.project) ? ProjectController.findById(this.project.id) : undefined
      this.id = (project) ? project.id : ProjectUpdateRequest.CREATE_REQUEST
      this.name = (project) ? project.name : ''
      this.description = (project) ? project.description : ''
      this.userIds = (project) ? project.userIds : []
        this.source= source
        this.error= ''
    },

    filterUser(query, item) {
      return (item.label.toLowerCase().indexOf(query.toLowerCase()) > -1)
    },
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
