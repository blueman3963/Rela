import { useRouter } from 'next/router'
import React from 'react'
import {entityDB, storyDB} from '../utils/firebase.js'

import NewEntity from '../components/createentity.js'
import Entity from '../components/entity.jsx'

import dynamic from 'next/dynamic'
const NewStory = dynamic(() => import('../components/newstory.jsx'), {
	ssr: false
});

import rd3 from 'react-d3-library'


class Index extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      addNew: false,
      showDetail: false,
      showing: {},
      entites: [],
      onboard:[],
      stories:[],
      //stories
      printed:[],
    }
    this.background = React.createRef()
    this.body = React.createRef()
    this.coord = [0,0]
    this.typing = false
    this.waitinglist = []
  }

  componentDidMount() {
    window.setInterval(() => {
      if(!this.typing && this.waitinglist.length > 0) {
        this.typing = true

        let copy = []

        this.waitinglist[0].data.story.forEach(i => {
          if(i.type === 'text') {
            for(let c = 0 ; c < i.content.length ; c++) {
              copy.push({type:'char', content:i.content.charAt(c)})
            }
          } else {
            copy.push({type:'tag', content:{id:i.content.id, name:i.content.name}})
          }
        })

        let count = 0
        let start = false
				let sty = document.createElement('span')
				sty.className = this.waitinglist[0].data.entities.join(' ')
				sty.style.display = 'block'
				this.body.current.appendChild(sty)
        const typeWriter = () => {
          if (count < copy.length) {
            if(copy[count].type === 'char') {
              if(!start) {
                if(copy[count].content !== ' ') {
                  start = true
                  sty.innerHTML += copy[count].content
                }
              } else {
                sty.innerHTML += copy[count].content
              }
            } else {
              if(!start) {
                start = true
              }

              let tag = document.createElement('span')
              tag.innerHTML = copy[count].content.name
              tag.style.padding = '5px 10px'
              tag.style.backgroundColor = '#ddf'
              this.state.onboard.forEach(e => {
                if(e.id === copy[count].content.id) {
                  tag.style.backgroundColor = `rgb(${e.color[0]},${e.color[1]},${e.color[2]})`
                }
              })
              tag.style.borderRadius = '5px'
              sty.appendChild(tag)
            }
            count++;
            setTimeout(typeWriter, 30);
          } else {
            this.typing = false
          }
        }
        typeWriter()

        this.waitinglist.shift()
      }
    },500)

    storyDB.get()
    .then(snap => {
      let stories = []
      snap.forEach(i => {
        let story = i.data()
        let id = i.id
        stories.push({id:id, data:story})
      })
      this.setState({stories})
    })

    //add popup
    this.background.current.addEventListener('click', e => {
      if(!this.state.addNew && !this.state.showDetail) {
        this.coord = [e.clientX, e.clientY]
      } else {
        this.setState({addNew:false,showDetail:false})
      }
    })

    //getData
    entityDB.get()
    .then(snap => {
      let entites = []
      snap.forEach(i => {
        let entity = i.data()
        entites.push(entity)
      })
      this.setState({entites})
    })
  }

  addNew(e) {
    let entity
    entityDB.add({
      name: e,
			connections: []
    }).then(ref => {
      console.log(ref)
      entity = {
        id: ref.id,
        data: {
          name:e,
					connections: []
        }
      }
      console.log(entity)
      this.onBoard(entity)
    })
  }

  onBoard(e) {
    //create dom
    let board = this.state.onboard
    let newE = e
    newE.color = [Math.floor(Math.random()*50+200),Math.floor(Math.random()*50+200),Math.floor(Math.random()*50+200)]
    board.push(newE)
    this.setState({onboard:board})
    this.setState({addNew:false,showDetail:false})

    let stories = this.state.stories
    let featuring = []
    let ids = board.map(i => {
      return i.id
    })
    stories.forEach(story => {

      let test = story.data.entities.filter((id) => !ids.includes(id));
      if(test.length === 0 && story.data.entities.includes(e.id)){
        this.waitinglist.push(story)
      }

    })
  }

	leaveBoard(e) {
		let board = this.state.onboard
		board.forEach((b,index) => {
			if(b.id === e.id) {
				board.splice(index,1)
			}
		})
		this.setState({onboard:board})

		if(this.waitinglist.length > 0) {
			let stories = this.state.waitinglist
			stories.forEach((s,index) => {
				if(s.entities.includes(e.id)) {
					stories.splice(index,1)
				}
			})
			this.waitinglist = stories
		}

		document.querySelectorAll('.'+e.id).forEach(i => {
			i.parentNode.removeChild(i)
		})
	}

  pushToNew(story) {
    this.waitinglist.push(story)
  }

  render() {

    return(
      <div>
      <style jsx>{`
        @import url('https://use.typekit.net/bvh8bzb.css');
        @import url('https://fonts.googleapis.com/css2?family=Just+Me+Again+Down+Here&display=swap');

        * {
          font-size: 16px;
          font-family: ff-meta-correspondence-web-p, sans-serif;
          font-weight: 400;
          font-style: normal;
          background-color: #fff;
        }

        .title {
          position: fixed;
          top: 40px;
          left: 40px;
        }

        .body {
          position: fixed;
          left: 50vw;
          bottom: 30vh;
          transform: translateX( -50% );
          width: 500px;
          line-height: 2em;
          font-size: 40px;
          font-family: 'Just Me Again Down Here', cursive;
        }

      `}
      </style>

      <div className='body' ref={this.body}></div>
      {
        this.state.onboard.length
        ? <NewStory entities={this.state.onboard} pushToNew={(e) => this.pushToNew(e)}/>
        : ''
      }


      <div className='title'>rel:



        {
          this.state.onboard.map(i => {
            return <Entity data={i} showing={this.state.showing} onBoard={e => this.onBoard(e)}show={this.state.showDetail} leaveBoard={e => this.leaveBoard(e)} toggleShow={(e) => this.setState({showDetail:true,showing:e})}/>
          })
        }

        <div className='right' style={{
          cursor: 'pointer',
          display: 'inline',
          marginLeft: '20px'
        }}>
          <div style={{
            padding: '10px',
            display: 'inline',
            border: '2px solid #00f'
          }} onClick={() => this.setState({addNew: true})}>+ New Entity</div>
        </div>

      </div>
      <div style={{
        position: 'fixed',
        left: 0,
        top: 0,
        zIndex: -1,
        width: '100vw',
        height: '100vh'
      }} ref={this.background} className='background'>
      </div>
        {
          this.state.addNew
          ?<NewEntity set={e => this.addNew(e)} onboard={e => this.onBoard(e)} board={this.state.onboard} close={() => this.setState({addNew:false})}/>
          :''
        }
      </div>
    )
  }
}

export default Index;
