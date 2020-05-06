import Link from 'next/link';
import React, { Component } from 'react';
import Router from 'next/router'

import client from '../utils/contentful'

const linkStyle = {
  marginRight: 15
};

class Nav extends Component {
  constructor(props) {
    super(props)
    this.state = {
      items:[],
    }
  }

  componentWillMount() {
    this.getItems()
  }

  async getItems() {
    const data = await client.getEntries()
    this.setState({items:data.items})
  }

  render() {
    return (
      <div>
      <style jsx>{`
      li {
        a {
          color: red;
        }
      }
    `}</style>
        <Link href='/'>
          <div style={linkStyle}>logo</div>
        </Link>
        <Link href='/nav'>
          <div style={linkStyle}>nav</div>
        </Link>
        <a href='mailto:'>
          <div style={linkStyle}>contact</div>
        </a>

        <div>
        {
            this.state.items.map(i => {
              return(
                <li key={i.sys.ud} onClick={() => Router.push('/p/[id]',`/p/${i.sys.id}`)}>
                    <a>{i.fields.title}</a>
                </li>
              )
            })
        }
        </div>
      </div>
    )
  }
};

export default Nav;
