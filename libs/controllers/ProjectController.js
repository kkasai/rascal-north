import Project, { ProjectUpdateRequest } from '~/libs/models/Project'
import axios from '~/plugins/axios'

let nextId=1
let projectMap={}
let isInitialized = false
let callbacks = []
const storageName = 'violetmine-projects'

class ProjectController {
  static initialize_() {
    if (isInitialized) return
    const json = (!process.server)
      ? localStorage.getItem(storageName)
      : undefined
    if (json) {
      const rawData = JSON.parse(json)
      rawData.forEach(rawData => {
        const project = new Project(rawData)
        projectMap[project.id] = project
        if (nextId <= project.id) {
          nextId = project.id + 1
        }
      })
    }
    if(!json || Object.keys(projectMap).length === 0){
      console.log('WARNING: プロジェクト情報を新規に作成します。')
      ProjectController.save_()
    }
    isInitialized = true
  }

  static registerCallbacks(cbs) {
    callbacks = cbs
  }

  static findByIds(ids) {
    ProjectController.initialize_()
    const projects = []
    ids.forEach((id) => {
      const find = projectMap[id]
      if(find) projects.push(find)
    })
    return projects
  }

  static findById(id) {
    const projects = ProjectController.findByIds([id])
    return (projects.length !== 0) ? projects[0] : undefined
  }

  static findByName(name) {
    ProjectController.initialize_()
    for(let key in projectMap) {
      const project = projectMap[key]
      if (project.name === name) {
        return project
      }
    }
    return undefined
  }

  static findAll() {
    ProjectController.initialize_()
    return axios.get('/projects')
  }

  static createProjects(requests) {
    const projects = []
    requests.forEach((request) => {
      if(!request.isCreateRequest) {
        throw new Error(
          "プロジェクトIDを指定がされているため、新規作成できません。 プロジェクトID:" +
            request.id
        )
      }
      if (ProjectController.findByName(request.name)) {
        throw new Error(
          "指定された名前のプロジェクトは既に存在しています。 名前:" +
            request.name
        )
      }
    })
    ProjectController.initialize_()
    requests.forEach((request) => {
      const project = new Project(request)
      project.id= nextId++
      request.id = project.id
      projects.push(project)
    })
    ProjectController.executeCreateCallback_(projects)
    projects.forEach((project)=>(projectMap[project.id] = project))
    ProjectController.save_()
    return projects
  }

  static createProject(request) {
    return axios.post('/projects', ProjectController.convertRequest(request))
  }

  static updateProjects(rawObjects) {
    ProjectController.initialize_()
    const projects = []
    rawObjects.forEach(rawObject => {
      const find = ProjectController.findById(rawObject.id)
      if (!find) {
        throw new Error("存在しないプロジェクトを更新しようとしました。プロジェクト名:" + rawObject.name)
      }
      projects.push(new Project(rawObject))
    })
    ProjectController.executeUpdateCallback_(projects)
    projects.forEach((project)=>{
      projectMap[project.id] = project
    })
    ProjectController.save_()
  }

  static updateProject(rawObject) {
    ProjectController.updateProjects([rawObject])
  }

  static refreshProjects(rawObjects) {
    rawObjects.forEach(rawObject => {
      const find = ProjectController.findById(rawObject.id)
      if(find) {
        find.copyProperties(rawObject)
      }
    })
  }

  static refreshProject(rawObject) {
    ProjectController.refreshProjects([rawObject])
  }

  static deleteProjects(rawObjects) {
    ProjectController.initialize_()
    let result = true
    const finds = []
    rawObjects.forEach(rawObject => {
      const find = ProjectController.findById(rawObject.id)
      if (find) {
        delete projectMap[find.id]
      } else {
        result = false
      }
      finds.push(find)
    })
    ProjectController.executeDeleteCallback_(finds)
    ProjectController.save_()
    return result
  }

  static deleteProject(rawObject) {
    ProjectController.deleteProjects([rawObject])
  }

  static executeCreateCallback_(projects) {
    callbacks.forEach((callback) => callback.createCallback(projects))
  }

  static executeUpdateCallback_(projects) {
    callbacks.forEach((callback) => callback.updateCallback(projects))
  }

  static executeDeleteCallback_(projects) {
    callbacks.forEach((callback) => callback.deleteCallback(projects))
  }

  static save_() {
    const projects = []
    for (let key in projectMap) {
      projects.push(projectMap[key])
    }
    const json = JSON.stringify(projects)
    if (!process.server) {
      console.log('INFO: プロジェクト情報をセーブしました。')
      localStorage.setItem(storageName, json)
    } else {
      console.log('WARNING: プロジェクト情報はセーブされていません。')
    }
  }

  static convertProjects(objects) {
    const result = []
    objects.forEach((object) => {
      result.push(new Project(object))
    })
    return result
  }

  static convertProject(object) {
    return new Project(object)
  }

  static convertRequest(request) {
    return {
      name: request.name,
      description: request.description,
    }
  }
}

//プロジェクトの更新操作の際に呼ばれるコールバック
//たとえば、
//・プロジェクト削除の際にプロジェクトにアサインされたユーザーIDを削除
//・プロジェクト削除の際に関連づくイテレーションの削除
//・プロジェクト作成/更新の際に関連づくユーザーのプロジェクトIDの付与
//など
export class ProjectControllerCallback {
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

export default ProjectController
