import Task, { TaskUpdateRequest } from '~/libs/models/Task'

let nextId=1
let taskMap={}
let isInitialized = false
let callbacks = []
const storageName = 'violetmine-tasks'

class TaskController {
  static initialize_() {
    if (isInitialized) return
    const json = (!process.server)
      ? localStorage.getItem(storageName)
      : undefined
    if (json) {
      const rawData = JSON.parse(json)
      rawData.forEach(rawData => {
        const task = new Task(rawData)
        taskMap[task.id] = task
        if (nextId <= task.id) {
          nextId = task.id + 1
        }
      })
    }
    if(!json || Object.keys(taskMap).length === 0){
      console.log('WARNING: タスク情報を新規に作成します。')
      TaskController.save_()
    }
    isInitialized = true
  }

  static registerCallbacks(cbs) {
    callbacks = cbs
  }

  static findByIds(ids) {
    TaskController.initialize_()
    const task = []
    ids.forEach((id) => {
      const find = taskMap[id]
      if(find) task.push(find)
    })
    return task
  }

  static findById(id) {
    const task = TaskController.findByIds([id])
    return (task.length !== 0) ? task[0] : undefined
  }

  static findAll() {
    TaskController.initialize_()
    const task = []
    for (let key in taskMap) {
      task.push(taskMap[key])
    }
    return task
  }

  static findByStoryId(storyId) {
    TaskController.initialize_()
    const tasks = []
    for (let key in taskMap) {
      const task = taskMap[key]
      if(task.storyId === storyId) {
        tasks.push(task)
      }
    }
    return tasks
  }

  static createTasks(requests) {
    const tasks = []
    requests.forEach((request) => {
      if(!request.isCreateRequest) {
        throw new Error(
          "タスクIDを指定がされていないため、新規作成できません。タスクID:" +
            request.id
        )
      }
    })
    TaskController.initialize_()
    requests.forEach((request) => {
      const task = new Task(request)
      task.id= nextId++
      request.id = task.id
      tasks.push(task)
    })
    TaskController.executeCreateCallback_(tasks)
    tasks.forEach((task)=>(taskMap[task.id] = task))
    TaskController.save_()
    return tasks
  }

  static createTask(request) {
    const task = TaskController.createTasks([request])
    return (task.length !== 0) ? task[0] : undefined
  }

  static updateTasks(rawObjects) {
    TaskController.initialize_()
    const task = []
    rawObjects.forEach(rawObject => {
      const find = TaskController.findById(rawObject.id)
      if (!find) {
        throw new Error(
          '存在しないタスクを更新しようとしました。タスク名' + rawObject.subject
        )
      }
      task.push(new Task(rawObject))
    })
    TaskController.executeUpdateCallback_(task)
    task.forEach((task)=>{
      taskMap[task.id] = task
    })
    TaskController.save_()
  }

  static updateTask(rawObject) {
    TaskController.updateTasks([rawObject])
  }

  static refreshTasks(rawObjects) {
    rawObjects.forEach(rawObject => {
      const find = TaskController.findById(rawObject.id)
      if(find) {
        find.copyProperties(rawObject)
      }
    })
  }

  static refreshTask(rawObject) {
    TaskController.refreshTasks([rawObject])
  }

  static deleteTasks(rawObjects) {
    TaskController.initialize_()
    let result = true
    const finds = []
    rawObjects.forEach(rawObject => {
      const find = TaskController.findById(rawObject.id)
      if (find) {
        delete taskMap[find.id]
      } else {
        result = false
      }
      finds.push(find)
    })
    TaskController.executeDeleteCallback_(finds)
    TaskController.save_()
    return result
  }

  static deleteTask(rawObject) {
    TaskController.deleteTasks([rawObject])
  }

  static executeCreateCallback_(task) {
    callbacks.forEach((callback) => callback.createCallback(task))
  }

  static executeUpdateCallback_(task) {
    callbacks.forEach((callback) => callback.updateCallback(task))
  }

  static executeDeleteCallback_(task) {
    callbacks.forEach((callback) => callback.deleteCallback(task))
  }

  static save_() {
    const task = []
    for (let key in taskMap) {
      task.push(taskMap[key])
    }
    const json = JSON.stringify(task)
    if (!process.server) {
      console.log('INFO: タスク情報をセーブしました。')
      localStorage.setItem(storageName, json)
    } else {
      console.log('WARNING: タスク情報はセーブされていません。')
    }
  }
}

//タスクの更新操作の際に呼ばれるコールバック
export class TaskControllerCallback {
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

export default TaskController