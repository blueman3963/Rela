import React from 'react'
import {entityDB} from '../utils/firebase.js'

class Entity extends React.Component {
  constructor(props){
    super(props)
    this.state = {
      display: false,
      adding: false,
      entity: this.props.data,
      tags: this.props.data.data.tags,
      connections:[]
    }
    this.wrapper = React.createRef()
    this.newtag = ''
  }

  componentDidMount() {
    entityDB.get().then(snap => {
      let connections = []
      snap.forEach(i => {
        if(this.props.data.data.connections.includes(i.id)){
          connections.push({id:i.id, data:i.data()})
        }
      })
      this.setState({connections})
    })

  }


  componentDidUpdate(prevProps) {
    if((prevProps.show !== this.props.show && this.props.show === false) || (prevProps.showing !== this.props.showing && this.props.showing !== this.props.data.id)) {
      this.setState({display:false})
    }
  }

  showDetail() {
    this.setState({display: true})
    this.props.toggleShow(this.props.data.id)
  }

  addNew() {
    let tags = this.state.tags
    if(this.newtag !== ''){
      let exist = false
      let p
      if(tags) {
        tags.forEach((i,index) => {
          if(i.tag === this.newtag){
            exist = true
            p = index
          }
        })
      }

      let newtags = tags || []
      if(exist) {
        newtags[p].count ++
        entityDB.doc(this.props.data.id).update({tags:newtags})
      } else {
        let newtag = {tag:this.newtag,count:1}
        newtags.push(newtag)
        entityDB.doc(this.props.data.id).update({tags:newtags})
      }
      this.newtag = ''
      this.setState({adding: false, tags: newtags})
    }
  }

  render() {
    const entity = this.props.data
    return (
      <div style={{
          display:'inline',
          marginLeft: '20px',
      }}>
        <style jsx>{`
            input:focus {
              outline: none;
            }
            input {
              border: none;
              border-bottom: 1px solid #00f;
              margin-right: 10px;
            }
            .wrapper {
              background-color: #fff;
              z-index: 999;
              width: 400px;
              position: fixed;
              left: 50vw;
              top: 50vh;
              transform: translate(-50%, -50%);
              border: 2px solid #00f;

              table {
                width: 100%;
                table-layout: fixed;
                * {
                  vertical-align: top;
                }
              }
            }

            .tag {
              background-color:#00f;
              color: #fff;
              padding: 0 3px;
              cursor: pointer;
              margin-right: 3px;
              margin-bottom: 3px;
              display: inline-block;
            }

            .addNewTag {
              text-decoration: underline;
              cursor: pointer;
            }

            .tag-onboard {
              border: none !important;
              background-color: rgb(${entity.color[0]},${entity.color[1]},${entity.color[2]});
              padding: 10px;
              box-sizing: border-box;
            }

            .connection {
              background-color:#000;
              color: #fff;
              padding: 0 3px;
              cursor: pointer;
              margin-right: 3px;
              margin-bottom: 3px;
              display: inline-block;
            }

            .remove {
              font-size: 10px;
              display: inline-block;
              width: 10px;
              height: 10px;
              background-color: #000;
              color: #fff;
              padding: 2px;
              border-radius: 50%;
              line-height: 9px;
              margin-left: 8px;
              text-align: center;
            }

            .remove:hover {
              cursor: pointer
            }
        `}</style>
        <div ref={this.wrapper} className='tag-onboard' onClick={() => this.showDetail()} style={{display:'inline'}}>
          {entity.data.name}
          <div className='remove' onClick={() => this.props.leaveBoard(this.props.data)}>&#x2715;</div>
        </div>
        {
          this.state.display
          ?<div className='wrapper'>
            <table>
              <tbody>
              <tr>
                <td>name:</td>
                <td>{entity.data.name}</td>
              </tr>
              <tr>
                <td>tags:</td>
                <td>{
                  this.state.tags?
                  this.state.tags.map(tag => {
                    return <span className='tag' >{tag.tag}{tag.count > 1 ? '*' + tag.count : ''}</span>
                  })
                  :''
                }
                <div>
                  {
                    !this.state.adding
                    ?<span className='addNewTag' onClick={() => this.setState({adding: true})}>add new tag</span>
                    :<div><input onChange={(e) => this.newtag = e.target.value}/><span className='addNewTag' onClick={() => this.addNew()}>add</span></div>
                  }
                </div>
                </td>
              </tr>
              <tr>
                <td>connection:</td>
                <td>{

                  entity.data.connections.length
                  ? this.state.connections.map(c => {
                    return <span className='connection' onClick={() => this.props.onBoard(c)}>{c.data.name}</span>
                  })
                  : 'N/A'

                }</td>
              </tr>
              </tbody>
            </table>
          </div>
          :''
        }

      </div>
    )
  }
}

export default Entity
