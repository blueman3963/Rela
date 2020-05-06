import React from 'react'
import {entityDB} from '../utils/firebase.js'

class NewEntity extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      step: 0,
      result: []
    }
    this.name = ''
    this.submit = React.createRef()
    this.input = React.createRef()
  }

  componentDidMount() {
    this.input.current.addEventListener("keyup", e => {
      if (e.keyCode === 13) {
        // Cancel the default action, if needed
        e.preventDefault();
        // Trigger the button element with a click
        this.submit.current.click();
      }
    });
  }

  set() {

    entityDB.where('name', '==', this.name).get()
    .then(snap => {
      let result = []
      snap.forEach(i => {
        let entity = {
            id:i.id,
            data:i.data()
          }
          result.push(entity)
      })
      return result
    })
    .then(res => {
      if(res.length) {
        this.setState({result:res},() => this.setState({step:1}))
      } else {
        this.props.set(this.name)
        this.props.close()
      }
    })
  }

  stillSet() {
    if(this.name !== '') {
      this.props.set(this.name)
    }
  }

  render() {
    return(
      <div style={{position: 'fixed', zIndex: '999'}}>
        <style jsx>{`
          .wrapper {
            background-color: #fff;
            width: ${this.state.step === 0?'400px':'400px'};
            height: ${this.state.step === 0?'40px':'auto'};
            border: ${this.state.step === 0?'2px solid #00f':'none'};
            position: fixed;
            left: 50vw;
            top: 50vh;
            transform: translate(-50%, -50%);
            z-index: 999;

            .relative {
              position: relative;
            }

            input {
              width: calc(100% - 80px);
              border: none;
              position: absolute;
              height: 40px;
              background: transparent;
              top: 0;
              left: 0;
              padding: 0 0 0 10px;

              &:focus {
                outline: none;
              }

            }

            .set {
              position: absolute;
              right: 0;
              top: 0;
              height: 40px;
              padding: 0 10px;
              display: flex;
              align-items: center;
              justify-content: center;
            }

            .step1 {
              * {
                margin: -1px;
              }
              .title {
                padding: 10px;
              }
              .card {
                border: 2px solid #00f;
                padding: 10px;
                cursor: pointer;
                .tag {
                  background-color: #00f;
                  color: #fff;
                  padding: 0 3px;
                  margin-right: 3px;
                }
                &:hover {
                  background-color: #00f;
                  color: #fff;
                  .tag {
                    background-color: #fff;
                    color: #00f;
                  }
                }
              }
              .btn {
                border: 2px solid #00f;
                display: inline-block;
                padding: 10px;
                cursor: pointer;
                &:hover {
                  background-color: #00f;
                  color: #fff;
                }
              }
            }

          }
        `}</style>
        <div className='wrapper'>
          {
            this.state.step === 0
            ?<div className='relative'>
              <input autofocus onChange={e => this.name=e.target.value} ref={this.input}/><div className='set' onClick={() => this.set()} ref={this.submit}>submit</div>
            </div>
            :<div className='step1'>
              <div className='title'>are you looking for..</div>
              {
                this.state.result.map((i,index) => {
                  return <div key={index} className='card' onClick={() => this.props.onboard(i)}>{i.data.name}
                    {
                      i.data.tags
                      ? <div>
                        {
                          i.data.tags.map(tag => {
                            return <span className='tag'>{tag.tag}{tag.count > 1 ? '*'+tag.count:''}</span>
                          })
                        }
                      </div>
                      : ''
                    }
                  </div>
                })
              }
              <div className='btn' onClick={() => this.stillSet()}>No, still add new</div>
            </div>
          }

        </div>
      </div>
    )
  }
}

export default NewEntity
