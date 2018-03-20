import Story, { StoryUpdateRequest } from '~/libs/models/Story'

let nextId=1
let storyMap={}
let isInitialized = false
let callbacks = []
const storageName = 'violetmine-stories'

class StoryController {
  static initialize_() {
    if (isInitialized) return
    const json = (!process.server)
      ? localStorage.getItem(storageName)
      : undefined
    if (json) {
      const rawData = JSON.parse(json)
      rawData.forEach(rawData => {
        const story = new Story(rawData)
        storyMap[story.id] = story
        if (nextId <= story.id) {
          nextId = story.id + 1
        }
      })
    }
    if(!json || Object.keys(storyMap).length === 0){
      console.log('WARNING: ストーリー情報を新規に作成します。')
      StoryController.save_()
    }
    isInitialized = true
  }

  static registerCallbacks(cbs) {
    callbacks.concat(cbs)
  }

  static findByIds(ids) {
    StoryController.initialize_()
    const stories = []
    ids.forEach((id) => {
      const find = storyMap[id]
      const copy = new Story(find)
      if(find) stories.push(copy)
    })
    return stories
  }

  static findById(id) {
    const stories = StoryController.findByIds([id])
    return (stories.length !== 0) ? stories[0] : undefined
  }

  static findAll() {
    StoryController.initialize_()
    const stories = []
    for (let key in storyMap) {
      const copy = new Story(storyMap[key])
      stories.push(copy)
    }
    return stories
  }

  static findByProjectId(projectId) {
    StoryController.initialize_()
    const stories = []
    for (let key in storyMap) {
      const story = storyMap[key]
      if(story.projectId === projectId) {
        const copy = new Story(story)
        stories.push(copy)
        }
    }
    return stories
  }

  static findByIterationId(iterationId) {
    StoryController.initialize_()
    const stories = []
    for (let key in storyMap) {
      const story = storyMap[key]
      if(story.iterationId === iterationId) {
        const copy = new Story(story)
        stories.push(copy)
      }
    }
    return stories
  }

  static findBacklogsByProjectId(projectId) {
    StoryController.initialize_()
    const stories = []
    for (let key in storyMap) {
      const story = storyMap[key]
      if(story.projectId === projectId && !story.iterationId) {
        const copy = new Story(story)
        stories.push(copy)
      }
    }
    return stories
  }

  static createStories(requests) {
    const stories = []
    requests.forEach((request) => {
      if(!request.isCreateRequest) {
        throw new Error(
          "ストーリーIDを指定がされているため、新規作成できません。 ストーリーID:" +
            request.id
        )
      }
    })
    StoryController.initialize_()
    requests.forEach((request) => {
      const story = new Story(request)
      story.id= nextId++
      request.id = story.id
      stories.push(story)
    })
    StoryController.executeCreateCallback_(stories)
    stories.forEach((story)=>(storyMap[story.id] = story))
    StoryController.save_()
    return stories
  }

  static createStory(request) {
    const stories = StoryController.createStories([request])
    return (stories.length !== 0) ? stories[0] : undefined
  }

  static updateStories(rawObjects) {
    StoryController.initialize_()
    const stories = []
    rawObjects.forEach(rawObject => {
      const find = StoryController.findById(rawObject.id)
      if (!find) {
        throw new Error(
          '存在しないストーリーを更新しようとしました。ストーリー名:' + rawObject.name
        )
      }
      stories.push(new Story(rawObject))
    })
    StoryController.executeUpdateCallback_(stories)
    stories.forEach((story)=>{
      storyMap[story.id] = story
    })
    StoryController.save_()
  }

  static updateStory(rawObject) {
    StoryController.updateStories([rawObject])
  }

  static refreshStories(rawObjects) {
    rawObjects.forEach(rawObject => {
      const find = StoryController.findById(rawObject.id)
      if(find) {
        Story.copyProperties(find,rawObject)
      }
    })
  }

  static refreshStory(rawObject) {
    StoryController.refreshStories([rawObject])
  }

  static deleteStories(rawObjects) {
    StoryController.initialize_()
    let result = true
    const finds = []
    rawObjects.forEach(rawObject => {
      const find = StoryController.findById(rawObject.id)
      if (find) {
        delete storyMap[find.id]
      } else {
        result = false
      }
      finds.push(find)
    })
    StoryController.executeDeleteCallback_(finds)
    StoryController.save_()
    return result
  }

  static deleteStory(rawObject) {
    StoryController.deleteStories([rawObject])
  }

  static executeCreateCallback_(stories) {
    callbacks.forEach((callback) => callback.createCallback(stories))
  }

  static executeUpdateCallback_(stories) {
    callbacks.forEach((callback) => callback.updateCallback(stories))
  }

  static executeDeleteCallback_(stories) {
    callbacks.forEach((callback) => callback.deleteCallback(stories))
  }

  static save_() {
    const stories = []
    for (let key in storyMap) {
      stories.push(storyMap[key])
    }
    const json = JSON.stringify(stories)
    if (!process.server) {
      console.log('INFO: ストーリー情報をセーブしました。')
      localStorage.setItem(storageName, json)
    } else {
      console.log('WARNING: ストーリー情報はセーブされていません。')
    }
  }
}

//ストーリーの更新操作の際に呼ばれるコールバック
//たとえば、
//・ストーリー削除の際にストーリーにアサインされたユーザーIDを削除
//・ストーリー削除の際に関連づくイテレーションの削除
//・ストーリー作成/更新の際に関連づくユーザーのストーリーIDの付与
//など
export class StoryControllerCallback {
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

export default StoryController