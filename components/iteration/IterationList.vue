<template>
  <div>
    <el-button
      type='primary'
      size='small'
      icon='el-icon-circle-plus'
      @click='onAddStart'
      :disabled='backlogState.currentProject === undefined'
      round>
      イテレーションの追加
    </el-button>
    <el-dialog
      title='イテレーションの追加'
      :visible='showAddDialog'
      custom-class='iteration-card-dialog'
      :show-close='false'
      :append-to-body='true'
      >
      <iteration-edit-cmp
          :project='project'
          :onOk='onAddOk'
          :onCancel='onAddCancel'
      />
    </el-dialog>
    
    <div
      v-for='iteration in backlogState.iterations'
      :key='iteration.id'>
      <iteration-card 
        :project='backlogState.currentProject'
        :iteration='iteration'
        :iterationStories='getIterationStories(iteration)'
        :onUpdate='onUpdate'
        :onDelete='onDelete'/>
    </div>
  </div>
</template>

<script>
import Vue from 'vue'
import IterationController from '~/libs/controllers/IterationController'
import IterationCard from '~/components/iteration/IterationCard'

Vue.component('iteration-card', IterationCard)

export default {
  name: 'iteration-list',
  prop: [
    'iteration',
  ],
  data() {
    return ({
      backlogState: this.$store.state.backlogState,
      showAddDialog: false,
      error:'',
    })
  },
  methods: {
    getIterationStories(iteration) {
      const iterationStories = this.backlogState.iterationStories.filter(
        (story) =>(story.iterationId === iteration.id)
      )
      return iterationStories
    },
    onAddStart() {
      this.showAddDialog = true
    },
    onAddOk(request) {
      this.$store.commit('backlogState/createIteration', {
          request: request,
      })
      this.showAddDialog = false
    },
    onAddCancel() {
      this.showAddDialog = false
    },
    onUpdate(request) {
      this.$store.commit('backlogState/editIteration', {
          request: request,
      })
    },
    onDelete(iteration) {
      if(!confirm('本当に削除しますか？')) return
      this.$store.commit('backlogState/deleteIteration', {
        iteration: iteration,
      })
      this.$store.commit('tasksState/deleteIteration', {
        iteration: iteration,
      })
    },
  }
}
</script>

<style scoped>

</style>
