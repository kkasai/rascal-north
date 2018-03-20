import Vue from 'vue'
import { mapGetters } from 'vuex'
import IterationController from '~/libs/controllers/IterationController'
import Iteration from '~/libs/models/Iteration'
import StoryController from '~/libs/controllers/StoryController'
import Story, {StoryUpdateRequest} from '~/libs/models/Story'
import TaskController from '~/libs/controllers/TaskController'
import Task, {TaskUpdateRequest} from '~/libs/models/Task'

const tasksState = {
  namespaced: true, // ネームスペースを使用する。
  name: 'tasksState',
  state: {
    currentIterationId: undefined,
    tasks: [],
    stories: [],
    error: '',
  },
  computed: {
    ...mapGetters([
      'currentIterationId',
      'error',
    ]),
    tasks: {
      get() {
        return this.$store.state.tasksState.tasks
      },
      set(val) {// setter for draggable
        this.$store.commit('tasksState/setTasks', val)
      }
    },
  },
  getters: {
    storyTasksByStatus(state) {
      return function(storyId, taskStatus){
        return state.tasks.filter(
          (task) => (task.storyId === storyId && task.status === taskStatus)
        )
      }
    }
  },
  mutations: {
    setTasks(state, payload) {
      console.log("taskState#setTasks")
      state.tasks = payload
      console.log(state)
    },
    init(state, payload) {
      console.log("tasksState#init")
      state.error = ''
      state.currentIterationId = undefined
      state.stories.splice(0, state.stories.length)
      state.tasks.splice(0, state.tasks.length)
      const currentProject = payload.currentProject
      if(!currentProject) {
        state.error = 'プロジェクトが選択されていません。バックログページでプロジェクトを選択してください'
        return
      }
      const iterations = IterationController.findByProjectId(currentProject.id)
      if(iterations.length === 0) {
        state.error = '選択中のプロジェクトにはイテレーションがありません。イテレーションはバックログページで追加できます'
        return
      }
      const now = new Date()
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
      //後方(新しい方)から期間が現在の日時と一致するイテレーションを選択すめE
      state.currentIterationId = iterations[iterations.length-1].id
      for(let i=iterations.length-1; i>=0; i--) {
        const iteration = iterations[i]
        const startOn = new Date(iteration.startOn)
        const endOn = new Date(iteration.endOn)
        if(startOn <= now && now <= endOn) {
          state.currentIterationId = iteration.id
          break
        }
        console.log(state)
      }
      const stories = StoryController.findByIterationId(state.currentIterationId)
      stories.forEach((story) => {
        const tasks = TaskController.findByStoryId(story.id)
        tasks.forEach((task) => {
          state.tasks.push(task)
        })
      })
      state.stories = stories
    },

    switchCurrentIterationId(state, payload) {
      console.log("tasksState#switchCurrentIterationId")
      console.log(payload)
      state.error = ''
      state.currentIterationId = undefined
      state.tasks.splice(0, state.tasks.length)
      const currentIteration = IterationController.findById(payload.currentIterationId)
      if(currentIteration) {
        state.currentIterationId = currentIteration.id
        const stories = StoryController.findByIterationId(state.currentIterationId)
        stories.forEach((story) => {
          const tasks = TaskController.findByStoryId(story.id)
          tasks.forEach((task) => {
            state.tasks.push(task)
          })
        })
        state.stories = stories
      }
      console.log(state)
    },

    changeTaskState(state, payload) {
      console.log("tasksState#changeTaskState")
      console.log(payload)
      const oldTasks = state.tasks.filter(
        (task)=>(task.storyId === payload.storyId && task.status === payload.task.status)
      )
      const newTasks = state.tasks.filter(
        (task)=>(task.storyId === payload.storyId && task.status === payload.status)
      )
      const others = state.tasks.filter(
        (task) => (task.storyId !== payload.storyId ||
          (task.status !== payload.task.status && task.status !== payload.status))
      )

      let message = "old=" + oldTasks.length + " -" + payload.oldIndex
      oldTasks.forEach(t => message += " " + t.subject)
      message += "\nnew=" + newTasks.length + " +" + payload.newIndex
      newTasks.forEach(t => message += " " + t.subject)
      message += "\notr=" + others.length
      others.forEach(t => message += " " + t.subject)
      console.log(message)

      oldTasks.splice(payload.oldIndex,1)
      newTasks.splice(payload.newIndex,0,payload.task)
      //新しいステータスに更新
      payload.task.status = payload.status

      message = "old=" + oldTasks.length + " -" + payload.oldIndex
      oldTasks.forEach(t => message += " " + t.subject)
      message += "\nnew=" + newTasks.length + " +" + payload.newIndex
      newTasks.forEach(t => message += " " + t.subject)
      message += "\notr=" + others.length
      others.forEach(t => message += " " + t.subject)
      console.log(message)

      //配列再構築
      state.tasks.splice(0, state.tasks.length)
      oldTasks.forEach((story)=>(state.tasks.push(story)))
      console.log("olds=" + oldTasks.length)
      newTasks.forEach((story)=>(state.tasks.push(story)))
      console.log("news=" + newTasks.length)
      others.forEach((story)=>(state.tasks.push(story)))
      console.log("othr=" + others.length)
      console.log(state)
    },

    changeTaskPosition(state, payload) {
      console.log("tasksState#changeTaskPosition")
      const tasks = state.tasks.filter(
        (task)=>(task.storyId === payload.storyId && task.status === payload.status)
      )
      const others = state.tasks.filter(
        (task) => (task.storyId !== payload.storyId || task.status !== payload.status)
      )

      let message = "tsk=" + tasks.length + " -" + payload.oldIndex + " +" + payload.newIndex
      tasks.forEach(t => message += " " + t.subject)
      message += "\notr=" + others.length
      others.forEach(t => message += " " + t.subject)
      console.log(message)

      const oldTask = tasks[payload.oldIndex]
      tasks.splice(payload.oldIndex,1)
      tasks.splice(payload.newIndex,0,oldTask)

      message = "tsk=" + tasks.length + " -" + payload.oldIndex + " +" + payload.newIndex
      tasks.forEach(t => message += " " + t.subject)
      message += "\notr=" + others.length
      others.forEach(t => message += " " + t.subject)
      console.log(message)

      //配列再構築
      state.tasks.splice(0, state.tasks.length)
      tasks.forEach((story)=>(state.tasks.push(story)))
      others.forEach((story)=>(state.tasks.push(story)))
      console.log(state)
    },

    moveTask(state, payload) {
      console.log("tasksState#moveTask")
      const old = state.tasks[payload.oldIndex]
      state.tasks[payload.oldIndex] = state.tasks[payload.newIndex]
      state.tasks.splice(payload.newIndex, 1, old)
      //state.tasks[payload.newIndex] = old
    },

    createTask(state, payload) {
      console.log("tasksState#createTask")
      try {
        TaskController.createTask(payload.request)
        const task= TaskController.findById(payload.request.id)
        if (task) {
          state.tasks.push(task)
        }
      } catch(err) {
        state.error = err.message
        console.log('ERROR: tasksState#createTask ' + state.error)
      }
      console.log(state)
    },

    editTask(state, payload) {
      console.log("tasksState#editTask")
      state.error = ''
      try {
        TaskController.updateTask(payload.request)
        TaskController.refreshTask(payload.task)
      } catch (err) {
        state.error = err.message
        console.log('ERROR: tasksState#editTask ' + state.error)
      }
      console.log(state)
    },

    deleteTask(state, payload) {
      console.log("tasksState#deleteTask")
      TaskController.deleteTask(payload.task)
      for(let i=state.tasks.length-1; i>=0; i--) {
        const task = state.tasks[i]
        if(payload.task.id === task.id) {
          state.tasks.splice(i, 1)
          break
        }
      }
      console.log(state)
    },

    moveToBacklog(state, payload) {
      console.log("tasksState#moveToBacklog")
      state.error = ''
      try {
        if(payload.iterationId !== state.currentIterationId) return
        for(let i=state.tasks.length-1; i>=0; i--) {
          const task = state.tasks[i]
          if(task.storyId === payload.story.id) {
            state.tasks.splice(i, 1)
          }
        }
        for(let i=0; i<state.stories.length; i++) {
          if(payload.story.id === state.stories[i].id) {
            state.stories.splice(i, 1)
          }
        }
      } catch (err) {
        state.error = err.message
        console.log('ERROR: tasksState#moveToBacklog ' + state.error)
      }
      console.log(state)
    },

    moveToIterationStory(state, payload) {
      console.log("tasksState#moveToIterationStory")
      state.error = ''
      try {
        if(payload.iterationId !== state.currentIterationId) return
        const newTasks = TaskController.findByStoryId(payload.story.id)
        newTasks.forEach(task => state.tasks.push(task))
        state.stories.push(payload.story)
      } catch (err) {
        state.error = err.message
        console.log('ERROR: tasksState#moveToIterationStory ' + state.error)
      }
      console.log(state)
    },

    deleteIteration(state, payload) {
      console.log("tasksState#deleteIteration")
      if(payload.iteration.id !== state.currentIterationId) return
      state.currentIterationId = undefined
      state.tasks.splice(0, state.tasks.length)
      state.stories.splice(0, state.stories.length)
      console.log(state)
    },

    reloadStory(state, payload) {
      console.log("tasksState#reloadStory")
      const find = StoryController.findById(payload.storyId)
      if(!find) return
      for(let i=0; i<state.stories.length; i++) {
        const story = state.stories[i]
        if(payload.storyId === story.id) {
          Story.copyProperties(find, story)
          console.log("reloaded")
          //state.tasks.splice(i, 1, find)
          break
        }
      }
      console.log(state)
    },

    deleteStory(state, payload) {
      console.log("tasksState#deleteStory")
      state.error = ''
      for(let i=state.tasks.length-1; i>=0; i--) {
        const task = state.tasks[i]
        if(task.storyId === payload.story.id) {
          state.tasks.splice(i, 1)
          break
        }
      }
      for(let i=0; i<state.stories.length; i++) {
        if(payload.story.id === state.stories[i].id) {
          state.stories.splice(i, 1)
        }
      }
    console.log(state)
    },
  }
}
export default tasksState
