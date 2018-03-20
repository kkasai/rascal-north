class Iteration {
  static get NewStatus() {return 'New'}
  static get DoingStatus() {return 'Doing'}
  static get DoneStatus() {return 'Done'}

  constructor(request) {
    this.id = request.id
    this.subject = request.subject
    this.description = request.description
    this.startOn = request.startOn
    this.endOn = request.endOn
    this.status = request.status
    this.projectId = request.projectId
  }

  copyProperties(target) {
    target.subject = this.subject
    target.description = this.description
    target.startOn = this.startOn
    target.endOn = this.endOn
    target.status = this.status
    target.projectId = this.projectId
  }
}

export class IterationUpdateRequest {
  static get CREATE_REQUEST() {return undefined}

  constructor(payload) {
    this.id = payload.id
    this.subject = payload.subject
    this.description = payload.description
    this.startOn = payload.startOn
    this.endOn = payload.endOn
    this.status = payload.status
    this.projectId = payload.projectId
  }

  isCreateRequest() { return (this.id === IterationUpdateRequest.CREATE_REQUEST)}
}

export default Iteration