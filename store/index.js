import Vue from 'vue'
import Vuex from 'vuex'

Vue.use(Vuex)

import loginState from '~/store/modules/loginState'
import backlogState from '~/store/modules/backlogState'
import tasksState from '~/store/modules/tasksState'
import usersState from '~/store/modules/usersState'
import projectsState from "~/store/modules/projectsState";
import Framework from '~/libs/Framework'

Framework.initialize()

const store = () => {
  return new Vuex.Store({
    modules: {
      loginState,
      backlogState,
      tasksState,
      usersState,
      projectsState,
    }
  })
} 

export default store