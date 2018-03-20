<template>
  <div>
    <el-dialog
      title='バックログの追加'
      :visible='showAddDialog'
      custom-class='backlog-cmp-dialog'
      :show-close='false'
      :append-to-body='true'
      >
      <story-edit-cmp
        :onOk='onAddBacklogOk'
        :onCancel='onAddBacklogCancel'
      />
    </el-dialog>
    <el-button
      type='primary'
      size='small'
      icon='el-icon-circle-plus'
      @click='onAddBacklogStart'
      :disabled='backlogState.currentProject === undefined'
      round>
      バックログの追加
    </el-button>
    <draggable
      class='drag-area'
      v-model='backlogState.backlogs'
      :options='{animation:200, group:"stories"}'
      @change='onChanged'>
      <div 
        v-for='story in backlogState.backlogs'
        :key='story.id'>
        <story-card
          :story='story'
          :onUpdate='onUpdate'
          :onDelete='onDelete'
        />
      </div>
    </draggable>
      <div v-show='backlogState.backlogs.length === 0' class='placeholder'>
          ここにストーリーをドロップします
      </div>
  </div>
</template>

<script>
import Vue from 'vue'
import VueDraggable from 'vuedraggable'
import Story, {StoryUpdateRequest} from '~/libs/models/Story'
import StoryController from '~/libs/controllers/StoryController'
import StoryCard from '~/components/story/StoryCard'

Vue.component('draggable', VueDraggable)
Vue.component('story-card', StoryCard)

export default {
  name: 'backlog-list',
  data() {
    return ({
      backlogState: this.$store.state.backlogState,
      showAddDialog: false,
      error:'',
    })
  },
  mounted() {

  },
  methods: {
    onAddBacklogStart() {
      console.log("BacklogList#onAddBacklogStart")
      this.showAddDialog = true
      console.log(this.state)
    },
    onAddBacklogOk(story, request) {
      console.log("BacklogList#onAddBacklogOk")
      this.$store.commit('backlogState/createStory', {
        story: story, 
        request: request,
      })
      //this.dispStories.push(StoryController.findById(request.id))
      this.showAddDialog = false
      console.log(this.state)
    },
    onAddBacklogCancel(story) {
      console.log("BacklogList#onAddBacklogCancel")
      this.showAddDialog = false
      console.log(this.state)
    },
    onUpdate(story, request) {
      console.log("BacklogList#onUpdate")
      this.$store.commit('backlogState/editStory', {
        story: story,
        request: request,
      })
      this.$store.commit('tasksState/reloadStory', {
        storyId: story.id,
      })
      console.log(this.state)
    },
    onDelete(story) {
      console.log("BacklogList#onDelete")
      if(!confirm('本当に削除しますか？')) return
      this.$store.commit('backlogState/deleteStory', {
        story: story,
      })
      this.$store.commit('tasksState/deleteStory', {
        story: story,
      })
      //dispStoriesは、Vuexで管理される配列とは同期できないため、ここで削除する。
      // for(let i=0; i<this.dispStories.length; i++) {
      //   if(story.id === this.dispStories[i].id) {
      //     this.dispStories.splice(i,1)
      //     break
      //   }
      // }
      console.log(this.state)
    },

    onChanged(event){
      console.log("BacklogList#onChanged")
      const added = event.added
      const removed = event.removed
      if(!added && !removed) return
      if(added) {
        const story = added.element
        const iterationId = story.iterationId
        this.$store.commit('backlogState/moveToBacklog', {
          story: story, iterationId: iterationId
        })
        this.$store.commit('tasksState/moveToBacklog', {
          story: story, iterationId: iterationId
        })
      } else if(removed) {
      }
      console.log(this.state)
    },
  }
}
</script>

<style scoped>
.story-point {
  float:right;
}
.float {
  float:right;
}
.drag-area {
  min-height: 60px;
  height: 100%;
}
.placeholder {
  opacity: 0.8;
  position: relative;
  max-width: 80%;
  text-align: center;
  left:5%;
  bottom: 50px;
  padding: 3px;
  border: 2px dashed silver;
  border-radius: 3px;
  box-shadow: 0px 0px 10px silver;
  background-color: violet;
}
</style>
