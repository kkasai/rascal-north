import User, { UserUpdateRequest } from '~/libs/models/User'
import {ProjectControllerCallback} from '~/libs/controllers/ProjectController'

let nextId=1
let userMap={}
let isInitialized = false
let callbacks = []
const storageName = 'violetmine-users'

class UserController {
  static initialize_() {
    if (isInitialized) return
    const json = (!process.server)
      ? localStorage.getItem(storageName)
      : undefined
    if (json) {
      const rawData = JSON.parse(json)
      rawData.forEach(rawData => {
        const user = new User(rawData)
        userMap[user.id] = user
        if (nextId <= user.id) {
          nextId = user.id + 1
        }
      })
    }
    if(!json || Object.keys(userMap).length === 0){
      console.log('WARNING: ユーザー情報を新規に作成します。')
      userMap = {}
      const admin = new User(new UserUpdateRequest({
        id: UserUpdateRequest.CREATE_REQUEST,
        account: 'admin',
        name: 'admin',
        password: 'admin',
      }))
      admin.id = 1
      admin.admin = true
      nextId = admin.id + 1
      userMap[admin.id] = admin
      UserController.save_()
    }
    isInitialized = true
  }

  static registerCallbacks(callbacks) {
    this.callbacks = callbacks
  }

  static findByIds(ids) {
    UserController.initialize_()
    const users = []
    ids.forEach((id) => {
      const find = userMap[id]
      if(find) users.push(find)
    })
    return users
  }

  static findById(id) {
    const users = UserController.findByIds([id])
    return (users.length !== 0) ? users[0] : undefined
  }

  static findByAccount(account) {
    UserController.initialize_()
    for(let key in userMap) {
      const user = userMap[key]
      if (user.account === account) {
        return user
      }
    }
    return undefined
  }

  static findAll() {
    UserController.initialize_()
    const users = []
    for (let key in userMap) {
      users.push(userMap[key])
    }
    return users
  }

  static login(account, password) {
    UserController.initialize_()
    const find = UserController.findByAccount(account)
    if (!find) return false
    return find.password === password
  }

  static createUsers(requests) {
    const users = []
    requests.forEach((request) => {
      if(!request.isCreateRequest) {
        throw new Error(
          "ユーザーIDを指定がされているため、新規作成できません。 ユーザーID:" +
            request.id
        )
      }
      if (UserController.findByAccount(request.account)) {
        throw new Error(
          "指定されたアカウントのユーザーは既に存在しています。 アカウント:" +
            request.account
        )
      }
    })
    UserController.initialize_()
    requests.forEach((request) => {
      const user = new User(request)
      user.id= nextId++
      request.id = user.id
      users.push(user)
    })
    UserController.executeCreateCallback_(users)
    users.forEach((user)=>(userMap[user.id] = user))
    UserController.save_()
    return users
  }

  static createUser(request) {
    const users = UserController.createUsers([request])
    return (users.length !== 0) ? users[0] : undefined
  }

  static updateUsers(rawObjects) {
    UserController.initialize_()
    const users = []
    rawObjects.forEach(rawObject => {
      const find = UserController.findById(rawObject.id)
      if (!find) {
        throw new Error(
          '存在しないユーザーを更新しようとしました。アカウント:' + rawObject.account
        )
      }
      users.push(new User(rawObject))
    })
    UserController.executeUpdateCallback_(users)
    users.forEach((user)=>(userMap[user.id] = user))
    UserController.save_()
  }

  static updateUser(rawObject) {
    UserController.updateUsers([rawObject])
  }

  static refreshUsers(rawObjects) {
    rawObjects.forEach(rawObject => {
      const find = UserController.findById(rawObject.id)
      if(find) {
        find.copyProperties(rawObject)
      }
    })
  }

  static refreshUser(rawObject) {
    UserController.refreshUsers([rawObject])
  }

  static deleteUsers(rawObjects) {
    UserController.initialize_()
    let result = true
    const finds = []
    rawObjects.forEach(rawObject => {
      const find = UserController.findById(rawObject.id)
      if (find) {
        delete userMap[find.id]
      } else {
        result = false
      }
      finds.push(find)
    })
    UserController.executeDeleteCallback_(finds)
    UserController.save_()
    return result
  }

  static deleteUser(rawObject) {
    UserController.deleteUsers([rawObject])
  }

  static executeCreateCallback_(users) {
    callbacks.forEach((callback) => callback.createCallback(users))
  }

  static executeUpdateCallback_(users) {
    callbacks.forEach((callback) => callback.updateCallback(users))
  }

  static executeDeleteCallback_(users) {
    callbacks.forEach((callback) => callback.deleteCallback(users))
  }

  static save_() {
    const users = []
    for (let key in userMap) {
      users.push(userMap[key])
    }
    const json = JSON.stringify(users)
    if (!process.server) {
      console.log('INFO: ユーザー情報をセーブしました。')
      localStorage.setItem(storageName, json)
    } else {
      console.log('WARNING: ユーザー情報はセーブされていません。')
    }
  }
}

//ユーザーの更新操作の際に呼ばれるコールバック
//たとえば、
//・ユーザー削除の際にプロジェクトにアサインされたユーザーIDを削除
//・ユーザー削除の際にタスクにアサインされたユーザーIDを削除
//など
export class UserControllerCallback {
  constructor(
    createCallback,
    updateCallback,
    deleteCallback,
  ) {
    this.createCallback_ = createCallback
    this.updateCallback_ = updateCallback
    this.deleteCallback_ = deleteCallback
  }

  get createCallback() {return (this.createCallback_) ? this.createCallback_ : ProjectControllerCallback.nullCallback}
  set createCallback(createCallback) {this.createCallback_ = createCallback}
  get updateCallback() {return (this.updateCallback_) ? this.updateCallback_ : ProjectControllerCallback.nullCallback}
  set updateCallback(updateCallback) {this.updateCallback_ = updateCallback}
  get deleteCallback() {return (this.deleteCallback_) ? this.deleteCallback_ : ProjectControllerCallback.nullCallback}
  set deleteCallback(deleteCallback) {this.deleteCallback_ = deleteCallback}

  static nullCallback() {
    //do nothing
  }
}

const createOrUpdateProjects=(projects)=> {
  const updateUsers = []
  projects.forEach((project) => {
    const users = UserController.findByIds(project.userIds)
    users.forEach((user) => {
      if( user.projectIds.indexOf(project) === -1 ) {
        user.projectIds.push(project.id)
        updateUsers.push(user)
      }
    })
  })
  if(updateUsers.length) {
    UserController.updateUsers(updateUsers)
  }
}

const deleteProjects=(projects)=>{
  const updateUsers = []
  projects.forEach((project) => {
    const users = UserController.findByIds(project.userIds)
    users.forEach((user) => {
      const length = user.projectIds.length
      const newIds = user.projectIds.filter((id) => (id !== project.id))
      if(length !== newIds.length) {
        user.projectIds = newIds
        updateUsers.push(user)
      }
    })
  })
  if(updateUsers.length) {
    UserController.updateUsers(updateUsers)
  }
}

export const UserProjectCallback = new ProjectControllerCallback(
  createOrUpdateProjects,
  createOrUpdateProjects,
  deleteProjects,
)

export default UserController