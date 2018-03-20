import Vue from "vue"
import { mapGetters } from "vuex"
import ProjectController from "~/libs/controllers/ProjectController"
import Project from "~/libs/models/Project"

const projectsState = {
  namespaced: true, // ネームスペースを利用する
  name: "projectsState",
  state: {
    projects: [],
    error: '',
  },
  computed: {
    ...mapGetters(["projects"])
  },
  mutations: {
    init(state, payload) {
      state.projects = ProjectController.findAll()
    },

    create(state, payload) {
      const project= ProjectController.createProject(payload.request)
      if (project) {
        state.projects.push(project)
      }
    },

    edit(state, payload) {
      try {
        ProjectController.updateProject(payload.request)
        let index = -1
        for(let i=0; i<state.projects.length; i++) {
          if(payload.request.id === state.projects[i].id) {
            index = i
          }
        }
        if(index !== -1) {
          //プロジェクトの状態を更新
          state.projects.splice(index, 1, payload.request)
        }
      } catch (err) {
        state.error = err.message
        console.log("ERROR: projectsState#edit " + state.error)
      }
    },

    editCancel(state, payload) {
      try {
        ProjectController.refreshProject(payload.project)
      } catch (err) {
        state.error = err.message
        console.log("ERROR: projectsState#editCancel " + state.error)
      }
    },

    delete(state, payload) {
      try {
        const project= state.projects[payload.index]
        ProjectController.deleteProject(project)
        state.projects.splice(payload.index, 1)
      } catch (err) {
        state.error = err.message
        console.log("ERROR: projectsState#delete " + state.error)
      }
    }
  }
}
export default projectsState
