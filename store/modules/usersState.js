import Vue from 'vue'
import { mapGetters } from 'vuex'
import UserController from '~/libs/controllers/UserController'
import User from '~/libs/models/User'

const usersState = {
  namespaced: true, // ネームスペースを利用する
  name: 'usersState',
  state: {
    users: [],
    error: '',
  },
  computed: {
    ...mapGetters([
      'users',
      'error',
    ])
  },
  mutations: {
    init(state, payload) {
      state.users = UserController.findAll()
    },

    create(state, payload) {
      state.error = ''
      const user = UserController.createUser(payload.request)
      if(user){
        state.users.push(user)
      }
    },

    edit(state, payload) {
      try{
        state.error = ''
        UserController.updateUser(payload.request)
      } catch(err) {
        state.error = err.message
        console.log('ERROR: usersState#edit ' + state.error)
      }
    },

    editCancel(state, payload) {
      try{
        state.error = ''
        UserController.refreshUser(payload.user)
        state.users.splice(payload.index, 1, payload.user)
      } catch(err) {
        state.error = err.message
        console.log('ERROR: usersState#editCancel ' + state.error)
      }
    },

    delete(state, payload) {
      try{
        state.error = ''
        const user = state.users[payload.index]
        UserController.deleteUser(user)
        state.users.splice(payload.index, 1)
      } catch(err) {
        state.error = err.message
        console.log('ERROR: usersState#delete ' + state.error)
      }
    },
  },
}
export default usersState