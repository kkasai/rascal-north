class Task {
  static get NewStatus() {return 'New'}
  static get DoingStatus() {return 'Doing'}
  static get DoneStatus() {return 'Done'}

  constructor(request) {
    this.id = request.id
    this.subject = request.subject
    this.description = request.description
    this.estimatedHours = request.estimatedHours
    this.assignedUserIds = request.assignedUserIds
    this.status = request.status
    this.projectId = request.projectId
    this.storyId = request.storyId
  }

  copyProperties(target) {
    target.subject = this.subject
    target.description = this.description
    target.estimatedHours = this.estimatedHours
    target.assignedUserIds = this.assignedUserIds
    target.status = this.status
    target.projectId = this.projectId
    target.storyId = this.storyId
  }
}



export class TaskUpdateRequest {
  static get CREATE_REQUEST() {return undefined}

  constructor(payload) {
    this.id = payload.id
    this.subject = payload.subject
    this.description = payload.description
    this.estimatedHours = payload.estimatedHours
    this.status = payload.status
    this.assignedUserIds = payload.assignedUserIds
    this.projectId = payload.projectId
    this.storyId = payload.storyId  }

  isCreateRequest() { return (this.id === TaskUpdateRequest.CREATE_REQUEST)}
}

export default Task