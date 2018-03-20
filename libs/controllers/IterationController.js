import Iteration, { IterationUpdateRequest } from '~/libs/models/Iteration'

let nextId=1
let iterationMap={}
let isInitialized = false
let callbacks = []
const storageName = 'violetmine-iterations'

class IterationController {
  static initialize_() {
    if (isInitialized) return
    const json = (!process.server)
      ? localStorage.getItem(storageName)
      : undefined
    if (json) {
      const rawData = JSON.parse(json)
      rawData.forEach(rawData => {
        const iteration = new Iteration(rawData)
        iterationMap[iteration.id] = iteration
        if (nextId <= iteration.id) {
          nextId = iteration.id + 1
        }
      })
    }
    if(!json || Object.keys(iterationMap).length === 0){
      console.log('WARNING: イテレーション情報を新規に作成します。')
      IterationController.save_()
    }
    isInitialized = true
  }

  static registerCallbacks(cbs) {
    callbacks = cbs
  }

  static findByIds(ids) {
    IterationController.initialize_()
    const iteration = []
    ids.forEach((id) => {
      const find = iterationMap[id]
      if(find) iteration.push(find)
    })
    return iteration
  }

  static findById(id) {
    const iteration = IterationController.findByIds([id])
    return (iteration.length !== 0) ? iteration[0] : undefined
  }

  static findAll() {
    IterationController.initialize_()
    const iteration = []
    for (let key in iterationMap) {
      iteration.push(iterationMap[key])
    }
    return iteration
  }

  static findByProjectId(projectId) {
    IterationController.initialize_()
    const iterations = []
    for (let key in iterationMap) {
      const iteration = iterationMap[key]
      if(iteration.projectId === projectId) {
        iterations.push(iteration)
      }
    }
    return iterations
  }

  static createIterations(requests) {
    const iterations = []
    requests.forEach((request) => {
      if(!request.isCreateRequest) {
        throw new Error(
          "イテレーションIDを指定がされているため、新規作成できません。 イテレーションID:" +
            request.id
        )
      }
    })
    IterationController.initialize_()
    requests.forEach((request) => {
      const iteration = new Iteration(request)
      iteration.id= nextId++
      request.id = iteration.id
      iterations.push(iteration)
    })
    IterationController.executeCreateCallback_(iterations)
    iterations.forEach((iteration)=>(iterationMap[iteration.id] = iteration))
    IterationController.save_()
    return iterations
  }

  static createIteration(request) {
    const iteration = IterationController.createIterations([request])
    return (iteration.length !== 0) ? iteration[0] : undefined
  }

  static updateIterations(rawObjects) {
    IterationController.initialize_()
    const iteration = []
    rawObjects.forEach(rawObject => {
      const find = IterationController.findById(rawObject.id)
      if (!find) {
        throw new Error(
          '存在しないイテレーションを更新しようとしました。イテレーション名:' + rawObject.subject
        )
      }
      iteration.push(new Iteration(rawObject))
    })
    IterationController.executeUpdateCallback_(iteration)
    iteration.forEach((iteration)=>{
      iterationMap[iteration.id] = iteration
    })
    IterationController.save_()
  }

  static updateIteration(rawObject) {
    IterationController.updateIterations([rawObject])
  }

  static refreshIterations(rawObjects) {
    rawObjects.forEach(rawObject => {
      const find = IterationController.findById(rawObject.id)
      if(find) {
        find.copyProperties(rawObject)
      }
    })
  }

  static refreshIteration(rawObject) {
    IterationController.refreshIterations([rawObject])
  }

  static deleteIterations(rawObjects) {
    IterationController.initialize_()
    let result = true
    const finds = []
    rawObjects.forEach(rawObject => {
      const find = IterationController.findById(rawObject.id)
      if (find) {
        delete iterationMap[find.id]
      } else {
        result = false
      }
      finds.push(find)
    })
    IterationController.executeDeleteCallback_(finds)
    IterationController.save_()
    return result
  }

  static deleteIteration(rawObject) {
    IterationController.deleteIterations([rawObject])
  }

  static executeCreateCallback_(iteration) {
    callbacks.forEach((callback) => callback.createCallback(iteration))
  }

  static executeUpdateCallback_(iteration) {
    callbacks.forEach((callback) => callback.updateCallback(iteration))
  }

  static executeDeleteCallback_(iteration) {
    callbacks.forEach((callback) => callback.deleteCallback(iteration))
  }

  static save_() {
    const iteration = []
    for (let key in iterationMap) {
      iteration.push(iterationMap[key])
    }
    const json = JSON.stringify(iteration)
    if (!process.server) {
      console.log('INFO: イテレーション情報をセーブしました。')
      localStorage.setItem(storageName, json)
    } else {
      console.log('WARNING: イテレーション情報はセーブされていません。')
    }
  }
}

//イテレーションの更新操作の際に呼ばれるコールバック
//たとえば、
//・イテレーション削除の際にイテレーションにアサインされたユーザーIDを削除
//・イテレーション削除の際に関連づくイテレーションの削除
//・イテレーション作成/更新の際に関連づくユーザーのイテレーションIDの付与
//など
export class IterationControllerCallback {
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

export default IterationController