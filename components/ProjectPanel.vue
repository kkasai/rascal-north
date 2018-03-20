<template>
  <div id='project-list'>
    <project-list/>
  </div>
</template>

<script>
import Vue from 'vue'
import ProjectList from '~/components/project/ProjectList'

Vue.component('project-list', ProjectList)

export default {
  name: 'project-panel',
}
</script>
