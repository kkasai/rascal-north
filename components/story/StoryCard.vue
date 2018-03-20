<template>
  <div>
    <ru-card body-style='padding:15px; background-color: lightcyan; word-break: break-all;'>
      <span :style='subjectStyle(story.status)'>{{story.subject}}</span>
      <span class='float-right'>
        <el-tag size='mini' :type='statusType(story.status)'>
          {{statusString(story.status)}}
        </el-tag>
        &nbsp;
        <el-button
          type='text'
          @click='onEditStart'>
          <i class='el-icon-edit' style='color:royalblue'/>
          <el-dialog
            title='ストーリーの編集'
            :visible='showEditDialog'
            custom-class='story-edit-dialog'
            :show-close='false'
            :append-to-body='true'
            >
            <story-edit-cmp
              :iterationId='iterationId'
              :story='story'
              :onOk='onEditOk'
              :onCancel='onEditCancel'
            />
          </el-dialog>
        </el-button>
        <el-button
          type='text'
          @click='onDeleteButton'>
          <i class='el-icon-delete' style='color:red'/>
        </el-button>
      </span>
      <span class='story-point'>{{story.point}}&nbsp;&nbsp;</span>
    </ru-card>
  </div>
</template>

<script>
import Vue from 'vue'
import Story, {StoryUpdateRequest} from '~/libs/models/Story'
import StoryController from '~/libs/controllers/StoryController'
import RuCard from '~/components/common/RuCard'

Vue.component('ru-card', RuCard);

export default {
  props: [
    'iterationId',
    'story',
    'onUpdate',
    'onDelete',
  ],
  data() {
    return {
      showEditDialog: false,
      error: '',
    }
  },
  methods: {
    statusString(status) {
      switch(status) {
        case Story.NewStatus:
          return '新規'
        case Story.DoingStatus:
          return '着手'
        case Story.DoneStatus:
          return '完了'
        default:
          return ''
        }
    },
    statusType(status) {
      switch(status) {
        case Story.NewStatus:
          return 'success'
        case Story.DoingStatus:
          return 'danger'
        case Story.DoneStatus:
          return ''
        default:
          return ''
        }
    },
    subjectStyle(status) {
      switch(status) {
        case Story.DoneStatus:
          return {'text-decoration': 'line-through'}
        default:
          return {'text-decoration': 'none'}
        }
    },
    onEditStart() {
      this.showEditDialog = true
    },
    onEditOk(story, request) {
      this.onUpdate(story, request)
      this.showEditDialog = false
    },
    onEditCancel() {
      this.$store.commit('backlogState/editStoryCancel', {
          story: this.story,
      })
      this.showEditDialog = false
    },
    onDeleteButton() {
      this.onDelete(this.story)
    },
  }
}
</script>

<style scoped>
.story-point {
  float:right;
}
.float-right {
  float:right;
}

</style>
