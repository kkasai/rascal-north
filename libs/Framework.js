import UserController, { UserProjectCallback } from '~/libs/controllers/UserController'
import ProjectController from '~/libs/controllers/ProjectController'

class Framework {
  //各Contorllerの初期化および、コールバックの設定を行う。
  static initialize() {
    console.log("INFO: set controllers' callbacks")
    ProjectController.registerCallbacks([UserProjectCallback])
  }
}

export default Framework