import React from 'react'
import Tags from "@yaireo/tagify/dist/react.tagify"
import {entityDB, storyDB} from '../utils/firebase.js'

class NewStory extends React.Component {
  constructor(props) {
    super(props)
    this.story = React.createRef()
    this.input = ''

    this.state = {
      error: false,
      settings: {
        mode: "mix",
        pattern: /@/,
        enforceWhitelist: true,
        mixTagsInterpolator: ['[[', ']]'],
        duplicates: true,
        placeholder: 'write new story...',
        dropdown: {
          enabled: 1,
          position: "text"
        },
        whitelist: [
          {
            id:this.props.entities[0].id,
            value:this.props.entities[0].data.name,
            connections: this.props.entities[0].data.connections
          }
        ]
      }
    }
  }


  componentDidUpdate(prevProps) {

    if(this.props !== prevProps) {

      let settings = this.state.settings
      let whitelist = []
      this.props.entities.forEach(i => {
        whitelist.push({id:i.id, value:i.data.name, connections: i.data.connections})
      })
      settings.whitelist = whitelist
      this.setState({settings},() => console.log(this.state.settings))

    }
  }

  newStory() {

    let text = this.input.replace(/\[\[{/g,'~(').replace(/}]]/g,')~').split('~')
    let exist = 0
    let entities = []
    let conTest = []
    let story = text.map(i => {
      if(i.charAt(0) === '(' && i.charAt(i.length-1) === ')') {
        exist = 1
        let ct = i.replace(/[()"]/g,'').replace(/:/g,',').split(',')
        entities.push(ct[1])
        conTest.push({id:ct[1],connections:ct[5].replace('[','').replace(']','').split(',')})
        return { type: 'entity', content: {id:ct[1], name:ct[3]}}
      } else {
        return {type: 'text', content: i}
      }
    })

    conTest.forEach(e => {
      let newE = conTest.filter(i => !e.connections.includes(i.id))

      if(newE.length){
        entityDB.doc(e.id).get().then(res => {
          return res.data()
        }).then(data => {
          let connections = data.connections || []
          newE.forEach(n => {
            connections.push(n.id)
          })
          entityDB.doc(e.id).update({connections:connections})
        })
      }
    })


    if(exist !== 0) {
      storyDB.add({
        story: story,
        entities: entities
      }).then(ref => {
        this.story.current.tagify.removeAllTags()
      }).catch(err => {
        console.log(err)
      })
    } else {
      this.setState({error: true})
    }

    this.props.pushToNew({id:'new',data:{
      story: story,
      entities: entities
    }})

  }

  render() {
    return (
      <div>
        <style>{`


          .txtInput {
            transform: translateX(-50%);
            position: absolute;
            bottom: 0;
            left: 0;
            text-align: left;
            width: 500px;
            display: block;
            padding: 10px;
            border: 2px solid #00f;
            background-color: transparent;
          }

          .txtInput:focus {
            outline:none;
          }

          .sendbtn {
            position: fixed;
            bottom: 20px;
            left: calc(50vw + 260px);
            padding: 13px;
            border: 2px solid #00f;
            cursor: pointer;
          }

          .sendbtn:hover {
            background-color: #00f;
            color: #fff;
          }

          .newstory {
            position: fixed;
            z-index: 0;
            left: 50vw;
            bottom: 20px;
          }

          .tagify__tag__removeBtn {
            display: none;
          }

          .error {
            position: absolute;
            top: -10px;
            left: 0;
            transform: translateY(-100%);
            color: ${this.state.error?'#fff':'#333'};
            font-size: 14px;
            background-color: ${this.state.error?'#f00':'#fff'};
          }

        `}</style>
        <div className='newstory'>
          <div className='txtInput'>
            <div className='error'>*Insert entity start with @, each stroy need to have at least on entity</div>
            <Tags
              mode="textarea"
              settings={this.state.settings}
              className="myTags"
              ref={this.story}
              onChange={e => (e.persist(), this.setState({error: false}), this.input=e.target.value)}
            >
              {`

            `}
            </Tags>
          </div>
          <div className='sendbtn' onClick={() => this.newStory()}>send</div>
        </div>
      </div>
    )
  }
}

export default NewStory
