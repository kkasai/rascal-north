<template>
  <div class='story-board'>
    <!-- タスク追加アイコン -->
    <span class='add-task-button'>
      <el-button type='text' @click='onAddTaskStart'>
        <i class='el-icon-circle-plus' style='color:forestgreen'/>
      </el-button>
    </span>
    <!-- ストーリー編集・削除アイコン -->
    <span class='story-menus'>
      <el-button type='text' @click='onEditStoryStart'>
        <i class='el-icon-edit' style='color:royalblue'/>
      </el-button>
      <el-button type='text' @click='onDeleteStoryButton'>
        <i class='el-icon-delete' style='color:red'/>
      </el-button>
    </span>
    <br/>
    <!-- ストーリータイトル -->
    <div :class='"subject-text " + story.status'>{{story.subject}}</div>
    <br/>
    <!-- ストーリーポイント -->
    <div class='story-point'>
      <el-tag size='small' type='warning'>
        {{story.point}} Pt.
      </el-tag>
    </div>
    <br/>
    <!-- タスク追加ダイアログ -->
    <el-dialog
      title='タスクの追加'
      :visible='showAddTaskDialog'
      custom-class='task-edit-dialog'
      :show-close='false'
      :append-to-body='true'
      >
      <task-edit-cmp
        :story='story'
        :onOk='onAddTaskOk'
        :onCancel='onAddTaskCancel'
      />
    </el-dialog>
    <!-- ストーリー編集ダイアログ -->
    <el-dialog
      title='ストーリーの編集'
      :visible='showEditStoryDialog'
      custom-class='story-edit-dialog'
      :show-close='false'
      :append-to-body='true'
      >
      <story-edit-cmp
        :iterationId='iterationId'
        :story='story'
        :onOk='onEditStoryOk'
        :onCancel='onEditStoryCancel'
      />
    </el-dialog>
  </div>
</template>

<script>
import Vue from 'vue'
import StoryEditCmp from '~/components/story/StoryEditCmp'
import TaskEditCmp from '~/components/task/TaskEditCmp'
import StoryController from '~/libs/controllers/StoryController'
import Story, {StoryUpdateRequest} from '~/libs/models/Story'

Vue.component('story-edit-cmp', StoryEditCmp)
Vue.component('task-edit-cmp', TaskEditCmp)

export default {
  name: 'story-board',
  props: [
    'iterationId',
    'story',
  ],
  data() {
    return {
      showEditStoryDialog: false,
      showAddTaskDialog: false,
      error: '',
    }
  },
  methods: {
    onAddTaskStart() {
      console.log("onAddTaskStart")
      this.showAddTaskDialog = true
    },
    onAddTaskOk(request) {
      console.log("onAddTaskOk")
      this.$store.commit('tasksState/createTask', {
        request: request,
      })
      this.showAddTaskDialog = false
    },
    onAddTaskCancel() {
      console.log("onAddTaskCancel")
      this.showAddTaskDialog = false
    },
    onEditStoryStart() {
      console.log("onEditStoryStart")
      this.showEditStoryDialog = true
    },
    onEditStoryOk(story, request) {
      console.log("onEditStoryOk")
      this.$store.commit('backlogState/editStory', {
        story: story,
        request: request,
      })
      this.$store.commit('tasksState/reloadStory', {
        storyId: story.id,
      })
      this.showEditStoryDialog = false
    },
    onEditStoryCancel() {
      console.log("onEditStoryCancel")
      this.$store.commit('backlogState/editStoryCancel', {
          story: this.story,
      })
      this.showEditStoryDialog = false
    },
    onDeleteStoryButton() {
      console.log("onDeleteStoryButton")
      if(!confirm('本当に削除しますか？')) return
      this.$store.commit('backlogState/deleteStory', {
        story: this.story,
      })
      this.$store.commit('tasksState/deleteStory', {
        story: this.story,
      })
    },
  }
}
</script>

<style scoped lang='scss'>
.story-board {
  box-shadow: 0px 0px 5px silver;
  border: gold solid 1px;
  background-color: lightyellow;
  vertical-align: top;
  text-align: left;
  min-height: 150px;
	margin-top: 2px;
	margin-bottom: 2px;  
	margin-left: 2px;  
	margin-right: 2px;
  padding: 10px;
  word-break: break-all;
  position: relative;
}
.story-point {
  position: absolute;
  bottom: 4px;
  right: 4px;
}
.add-task-button {
  position: absolute;
  top: -4px;
  left: 4px;
}

.story-menus {
  position: absolute;
  top: -4px;
  right: 4px;
}

.subject-text {
  overflow: 'hidden';
  word-break: 'break-all';
  text-decoration: none;
  &.Done {
    text-decoration: line-through;
  }
}
</style>
