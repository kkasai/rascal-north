<template>
  <div>
    <el-card>
      <span v-show='showStories === false'>
        <i class='el-icon-arrow-down' @click='toggleShowStories'/>
      </span>
      <span v-show='showStories === true'>
        <i class='el-icon-arrow-right' @click='toggleShowStories'/>
      </span>
      &nbsp;
      <span :style='subjectStyle(status)'>{{subject}}</span>
      <span class='float-right'>
        <el-tag size='mini' :type='statusType(status)' style='position:relative; bottom: 8px;'>
          {{statusString(status)}}
        </el-tag>
        &nbsp;
        <el-button
          type='text'
          @click='onEditIterationStart'>
          <i class='el-icon-edit' style='position:relative; bottom: 8px; color:royalblue'/>
          <el-dialog
            title='イテレーションの編集'
            :visible='showEditDialog'
            custom-class='iteration-edit-dialog'
            :show-close='false'
            :append-to-body='true'
            >
            <iteration-edit-cmp
              :iteration='iteration'
              :onOk='onEditIterationOk'
              :onCancel='onEditIterationCancel'
            />
          </el-dialog>
        </el-button>
        <el-button
          type='text'
          @click='onDeleteIteration'>
          <i class='el-icon-delete' style='position:relative; bottom: 8px; color:red'/>
        </el-button>
      </span>
      <span class='float-right'>{{points}}&nbsp;&nbsp;</span>
      <br>
      <span>{{startOn}} - {{endOn}}</span>
      <div v-show='showStories === true'>
        <draggable
          class='drag-area'
          v-model='iterationStories'
          :id='"iteration-" + iteration.id'
          :options='{animation:200, group:"stories", draggable:".story"}'
          @change='onChanged'>
          <div class='story'
            v-for='story in iterationStories'
            :key='story.id'>
            <story-card
              :project='project'
              :iterationId='(iteration)? iteration.id : undefined'
              :story='story'
              :onUpdate='onUpdateStory'
              :onDelete='onDeleteStory'
            />
          </div>
          <!-- class='draggable-card' -->
        </draggable>
        <div v-show='iterationStories.length === 0' class='placeholder'>
          ここにストーリーをドロップします
        </div>
      </div>
    </el-card>
  </div>
</template>

<script>
import Vue from 'vue'
import VueDraggable from 'vuedraggable'
import IterationEditCmp from '~/components/iteration/IterationEditCmp'
import Iteration from '~/libs/models/Iteration'
import Story, {StoryUpdateRequest} from '~/libs/models/Story'
import IterationController from '~/libs/controllers/IterationController'
import StoryController from '~/libs/controllers/StoryController'
import StoryCard from '~/components/story/StoryCard'

Vue.component('draggable', VueDraggable)
Vue.component('story-card', StoryCard)
Vue.component('iteration-edit-cmp', IterationEditCmp)

export default {
  props:[
    'project',
    'iteration',
    'iterationStories',
    'onUpdate',
    'onDelete',
  ],
  data() {
    const options = {year:'numeric', month:'2-digit', day:'2-digit'}
    const startDate = new Date(this.iteration.startOn)
    const endDate = new Date(this.iteration.endOn)
    const backlogState = this.$store.state.backlogState
    const now = new Date()
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    const showStories = (startDate <= today && today <= endDate)
    return {
      subject: this.iteration.subject,
      status: this.iteration.status,
      startOn: startDate.toLocaleDateString('ja-JP', options),
      endOn: endDate.toLocaleDateString('ja-JP', options),
      points: 0,
      backlogState: backlogState,
      showStories: showStories,
      showEditDialog: false,
      statuses: [
        {label: '新規', value: Iteration.NewStatus},
        {label: '着手', value: Iteration.DoingStatus},
        {label: '完了', value: Iteration.DoneStatus},
      ],
    }
  },
  created() {
    this.points = this.computePoints()
  },
  methods: {
    onEditIterationStart() {
      console.log("IterationCard#onEditIterationStart")
      this.showEditDialog = true
      console.log(this.state)
    },
    onEditIterationOk(request) {
      console.log("IterationCard#onEditIterationOk")
      this.onUpdate(request)
      const iteration = IterationController.findById(request.id)
      const startDate = new Date(iteration.startOn)
      const endDate = new Date(iteration.endOn)
      this.subject = iteration.subject
      this.description = iteration.description
      this.status = iteration.status
      const options = {year:'numeric', month:'2-digit', day:'2-digit'}
      this.startOn = startDate.toLocaleDateString('ja-JP', options)
      this.endOn = endDate.toLocaleDateString('ja-JP', options)
      this.showEditDialog = false
      console.log(this.state)
    },
    onEditIterationCancel() {
      console.log("IterationCard#onEditIterationCancel")
      this.showEditDialog = false
      console.log(this.state)
    },
    onDeleteIteration() {
      console.log("IterationCard#onDeleteIteration")
      this.onDelete(this.iteration)
      console.log(this.state)
    },
    onUpdateStory(story, request) {
      console.log("IterationCard#onUpdateStory")
      this.$store.commit('backlogState/editStory', {
        story: story,
        request: request,
      })
      this.$store.commit('tasksState/reloadStory', {
        storyId: story.id,
      })
      this.points = this.computePoints()
      console.log(this.state)
    },
    onDeleteStory(story) {
      console.log("IterationCard#onDeleteStory")
      if(!confirm('本当に削除しますか？')) return
      this.$store.commit('backlogState/deleteStory', {
        story: story,
      })
      this.$store.commit('tasksState/deleteStory', {
        story: story,
      })
      this.points = this.computePoints()
      console.log(this.state)
    },
    statusString(status) {
      switch(status) {
        case Iteration.NewStatus:
          return '新規'
        case Iteration.DoingStatus:
          return '着手'
        case Iteration.DoneStatus:
          return '完了'
        default:
          return ''
      }
    },
    statusType(status) {
      switch(status) {
        case Iteration.NewStatus:
          return 'success'
        case Iteration.DoingStatus:
          return 'danger'
        case Iteration.DoneStatus:
          return ''
        default:
          return ''
      }
    },
    subjectStyle(status) {
      switch(status) {
        case Iteration.DoneStatus:
          return {'text-decoration': 'line-through'}
        default:
          return {'text-decoration': 'none'}  
        }
    },
    computePoints() {
      let points = 0
      this.iterationStories.forEach((story) => {
        points += ((story.point) ? story.point : 0)
      })
      return points
    },
    toggleShowStories() {
      this.showStories = !this.showStories
    },
    onChanged(event) {
      console.log("IterationCard#onChanged")
      const added = event.added
      const removed = event.removed
      if(!added && !removed) return
      if(added) {
        const story = added.element
        this.$store.commit('backlogState/moveToIterationStory', {
          story: story,
          iterationId: this.iteration.id
        })
        this.$store.commit('tasksState/moveToIterationStory', {
          story: story,
          iterationId: this.iteration.id
        })
      } else if(removed) {
      }
      this.points = this.computePoints()
      console.log(this.state)
    },
  },
}
</script>

<style scoped>
.float-right {
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
