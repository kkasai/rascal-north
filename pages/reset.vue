<template>
  <div>
    <h2><font color='red'>
      この画面では、すべてのエンティティを削除します。
      <li>開発中に不正なデータを作成した場合や大量にデータを作成した場合などに実行してください。</li>
      <li>削除されるデータは、プロジェクト、ユーザー、ストーリー、イテレーション、タスクです。</li>
    </font></h2>
    <div class='reset-button'>
      <el-button
        type='danger'
        icon='el-icon-warning'
        @click='onReset'
        round
      >
        リセットする。
      </el-button>
      <br/>
      <h2><font color='blue'>{{message}}</font></h2>
    </div>
  </div>
</template>

<script>
import ProjectController from '~/libs/controllers/ProjectController'
import UserController from '~/libs/controllers/UserController'
import IterationController from '~/libs/controllers/IterationController'
import StoryController from '~/libs/controllers/StoryController'
import TaskController from '~/libs/controllers/TaskController'

export default {
  data() {
    message: ''
  },
  methods: {
    onReset() {
      if(!confirm('本当に削除しますか？(OKを押すとすべて削除されます)')) return
      ProjectController.deleteProjects(ProjectController.findAll())
      UserController.deleteUsers(UserController.findAll())
      IterationController.deleteIterations(IterationController.findAll())
      StoryController.deleteStories(StoryController.findAll())
      TaskController.deleteTasks(TaskController.findAll())
      this.message = '削除しました。'
      this.$forceUpdate()
    }
  },
}
</script>

<style scoped>
.reset-button {
  text-align: center;
}
</style>

