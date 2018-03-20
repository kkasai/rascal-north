import Vue from 'vue'
import { mapGetters } from 'vuex'
import IterationController from '~/libs/controllers/IterationController'
import ProjectController from '~/libs/controllers/ProjectController'
import StoryController from '~/libs/controllers/StoryController'
import Iteration from '~/libs/models/Iteration'
import Project from '~/libs/models/Project'
import Story, {StoryUpdateRequest} from '~/libs/models/Story'

const backlogState = {
  namespaced: true, // ネームスペースを利用する
  name: 'backlogState',
  state: {
    currentProject: undefined,
    userProjects: [],
    iterations: [],
    backlogs: [],
    iterationStories: [],
    error: '',
  },
  computed: {
    ...mapGetters([
      'currentProject',
      'userProjects',
      'iterations',
      'backlogs',
      'error',
    ]),
    tasks: {
      get() {
        return this.$store.state.backlogState.backlogs
      },
      set(val) {// setter for draggable
        this.$store.commit('backlogState/setBacklogs', val)
      }
    },
  },
  mutations: {
    setTasks(state, payload) {
      console.log("backlogState#setBacklogs")
      state.backlogs = payload
      console.log(state)
    },

    init(state, payload) {
      console.log("backlogState#init")
      state.error = ''
      const loginUser = payload.loginUser
      if(!loginUser)
        return
      state.userProjects = ProjectController.findByIds(loginUser.projectIds)
      if(state.userProjects.length > 0) {
        const currentProject = state.userProjects[0]
        state.currentProject = currentProject
        state.iterations = IterationController.findByProjectId(currentProject.id)
        state.iterations.forEach((iteration) => {
          state.iterationStories = state.iterationStories.concat(StoryController.findByIterationId(iteration.id))
        })
        state.backlogs = StoryController.findBacklogsByProjectId(currentProject.id)
      } else {
        state.error = 'アサインされているプロジェクトがありません。'
      }
      console.log(state)
    },

    switchCurrentProject(state, payload) {
      console.log("backlogState#switchCurrentProject")
      state.error = ''
      state.iterations.splice(0, state.iterations.length)
      state.iterationStories.splice(0, state.iterationStories.length)
      state.backlogs.splice(0, state.backlogs.length)
      const currentProject = ProjectController.findById(payload.currentProjectId)
      state.currentProject = currentProject
      if(!currentProject) return;
      const iterations = IterationController.findByProjectId(currentProject.id)
      iterations.forEach(iteration => state.iterations.push(iteration))
      iterations.forEach((iteration) => {
        state.iterationStories = state.iterationStories.concat(StoryController.findByIterationId(iteration.id))
      })
      state.backlogs = StoryController.findBacklogsByProjectId(currentProject.id)
      console.log(state)
    },

    createIteration(state, payload) {
      console.log("backlogState#createIteration")
      state.error = ''
      const iteration= IterationController.createIteration(payload.request)
      if (iteration) {
        state.iterations.push(iteration)
        state.iterationStories = state.iterationStories.concat(StoryController.findByIterationId(iteration.id))
      }
      console.log(state)
    },

    createStory(state, payload) {
      console.log("backlogState#createStory")
      state.error = ''
      StoryController.createStory(payload.request)
      const story= StoryController.findById(payload.request.id)
      if (!story) return
      const iterationId = payload.iterationId
      if(payload.iterationId) {
        state.iterationStories.push(story)
      } else {
        state.backlogs.push(story)
      }
      console.log(state)
    },

    editIteration(state, payload) {
      console.log("backlogState#editIteration")
      state.error = ''
      try {
        IterationController.updateIteration(payload.request)
      } catch (err) {
        state.error = err.message
        console.log('ERROR: backlogState#editIteration ' + state.error)
      }
      console.log(state)
    },

    editIterationCancel(state, payload) {
      console.log("backlogState#editIterationCancel")
      state.error = ''
      try {
        IterationController.refreshIteration(payload.iteration)
      } catch (err) {
        state.error = err.message
        console.log('ERROR: backlogState#editIterationCancel ' + state.error)
      }
      console.log(state)
    },

    deleteIteration(state, payload) {
      console.log("backlogState#deleteIteration")
      state.error = ''
      try {
        const iteration= payload.iteration
        IterationController.deleteIteration(iteration)
        for(let i=0; i<state.iterations.length; i++){
          if(iteration.id === state.iterations[i].id) {
            state.iterations.splice(i, 1)
            state.iterationStories = state.iterationStories.filter(
              (story) => (iteration.id !== story.iterationId)
            )
            break
          }
        }
      } catch (err) {
        state.error = err.message
        console.log('ERROR: backlogState#deleteIteration ' + state.error)
      }
      console.log(state)
    },

    editStory(state, payload) {
      console.log("backlogState#editStory")
      state.error = ''
      try {
        StoryController.updateStory(payload.request)
        const story = StoryController.findById(payload.request.id)
        const iterationId = payload.request.iterationId
        for(let i=0; i<state.iterationStories.length; i++) {
          if(story.id === state.iterationStories[i].id){
            console.log(" replace story + " + story.subject)
            state.iterationStories.splice(i,1,story)
            break
          }
        }
      } catch (err) {
        state.error = err.message
        console.log('ERROR: backlogState#editStory ' + state.error)
      }
      console.log(state)
    },

    editStoryCancel(state, payload) {
      console.log("backlogState#editStoryCancel")
      state.error = ''
      try {
        if(payload.story) {//新規作成時はundefined
          const find = StoryController.findById(payload.story.id)
          if(find) {
            //画面のモデルをオリジナルの値で更新する
        StoryController.refreshStory(payload.story)
          }
          }
      } catch (err) {
        state.error = err.message
        console.log('ERROR: backlogState#editStoryCancel ' + state.error)
      }
      console.log(state)
    },

    moveToBacklog(state, payload) {
      console.log("backlogState#moveToBacklog")
      state.error = ''
      try {
        console.log(payload)
        for(let i=0; i<state.iterationStories.length; i++) {
          if(payload.story.id === state.iterationStories[i].id) {
            state.iterationStories.splice(i,1)
            break
          }
        }
        payload.story.iterationId = undefined
        const request = new StoryUpdateRequest(payload.story)
        StoryController.updateStory(request)
        //state.backlogs.push(payload.story)
      } catch (err) {
        state.error = err.message
        console.log('ERROR: backlogState#moveToBacklog ' + state.error)
      }
      console.log(state)
    },

    moveToIterationStory(state, payload) {
      console.log("backlogState#moveToIterationStory")
      state.error = ''
      try {
        for(let i=0; i<state.backlogs.length; i++) {
          if(payload.story.id === state.backlogs[i].id) {
            state.backlogs.splice(i, 1)
            break
          }
        }
        payload.story.iterationId = payload.iterationId
        const request = new StoryUpdateRequest(payload.story)
        StoryController.updateStory(request)
        //state.iterationStories.push(payload.story)
      } catch (err) {
        state.error = err.message
        console.log('ERROR: backlogState#moveToIterationStory ' + state.error)
      }
      console.log(state)
    },

    deleteBacklog(state, payload) {
      console.log("backlogState#deleteBacklog")
      state.error = ''
      try {
        const story= state.backlogs[payload.index]
        StoryController.deleteStory(story)
        state.backlogs.splice(payload.index, 1)
      } catch (err) {
        state.error = err.message
        console.log('ERROR: backlogState#deleteBacklog ' + state.error)
      }
      console.log(state)
    },

    deleteStory(state, payload) {
      console.log("backlogState#deleteStory")
      state.error = ''
      try {
        console.log(payload)
        StoryController.deleteStory(payload.story)
        let stories
        const iterationId = payload.story.iterationId
        if(iterationId) {
          stories = state.iterationStories
        } else {
          stories = state.backlogs
        }
        for(let i=0; i<stories.length; i++) {
          if(stories[i].id === payload.story.id) {
            stories.splice(i, 1)
            break
          }
        }
      } catch (err) {
        state.error = err.message
        console.log('ERROR: backlogState#deleteStory ' + state.error)
      }
      console.log(state)
    },

    updateStoryPosition(state, payload) {
      console.log("backlogState#updateStoryPosition")
      state.error = ''
      const story= StoryController.createStory(payload.request)
      if(!story.iterationId) {
        User.sortByPosition(state.backlogs)
      }
      console.log(state)
    },
  }
}
export default backlogState
