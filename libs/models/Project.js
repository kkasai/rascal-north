class Project {
  constructor(request) {
    this.id = request.id
    this.name = request.name
    this.description = request.description
    this.userIds = [].concat(request.userIds)
  }
  getUserIds() {return [].concat(this.userIds)}
  setUserIds(userIds) {this.userIds = [].concat(userIds)}
  addUser(user) {this.userIds.push(user.id)}
  removePUser(user) {
    this.userIds = this.userIds.filter((id) =>(id != user.id))
  }

  copyProperties(target) {
    target.name = this.name
    target.description = this.description
    target.userIds = [].concat(this.userIds)
  }
}

export class ProjectUpdateRequest {
         static get CREATE_REQUEST() {
           return undefined;
         }

         constructor(payload) {
           this.id = payload.id
           this.name = payload.name
           this.description = payload.description
           this.userIds = [].concat(payload.userIds)
         }

         isCreateRequest() {
           return this.id === ProjectUpdateRequest.CREATE_REQUEST;
         }
       }

export default Project