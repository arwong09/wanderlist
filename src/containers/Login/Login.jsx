import style from './login.scss'
import React, { Component } from 'react'
import store from 'redux/store'
import { setCurrentUser } from 'redux/actions'
import request from 'superagent'
import { browserHistory } from 'react-router'
const img = 'dist/' + require('./flamingoes.jpg');


export default class Login extends Component {
  constructor(props) {
    super(props)
    this.handleClick = this.handleClick.bind(this)
    this.handleInput = this.handleInput.bind(this)
    this.handleKeyPress = this.handleKeyPress.bind(this)
    this.state = { input: "", loading: false, error: false }
  }

  componentDidMount() {
    const currentUser = store.getState().currentUser
    if(currentUser && currentUser.id && currentUser.token) {
      browserHistory.push('/travelers/' + currentUser.id)
    }
  }

  handleClick() {
    this.setState({ loading: true, error: false })
    request
      .post('https://young-beyond-8772.herokuapp.com/auth')
      .set('Content-Type', 'application/json')
      .send(JSON.stringify({ name: this.state.input }))
      .end((err, res) => {
        if(err) {
          this.setState({ loading: false, error: true })
          throw(err)
        }
        const data = JSON.parse(res.text)
        store.dispatch(setCurrentUser(data))
        try {
          const serializedState = JSON.stringify(data)
          localStorage.setItem('currentUser', serializedState)
        } catch(err) {
          console.error(err)
        }

        browserHistory.push('/travelers/' + store.getState().currentUser.id)
      })
  }

  handleKeyPress(e) {
    if(e.key === 'Enter') {
      this.handleClick()
    }
  }

  handleInput(e) {
    this.setState({ input: e.target.value })
  }

  render() {
    return (
      <div className="login" style={{backgroundImage: 'url(' + img + ')'}}>
        <div className="login__container">
          <div>
            <h1 className="login__h1">Wanderlist</h1>
            <h2 className="login__h2">a friendly way to share travel destinations</h2>
          </div>
          <div>
            <input className={this.state.error ? 'shake login__input' : 'login__input'}
              onChange={this.handleInput}
              onKeyPress={this.handleKeyPress}
              value={this.state.input}
              placeholder="enter your name to continue" />
            <div className="button--login" onClick={this.handleClick}>
              {this.state.loading ? (
                <i className="fa fa-spinner fa-pulse fa-1x fa-fw Demo__spinner" />
              ) : (
                'Login'
              )}
            </div>
          </div>
        </div>
      </div>
    )
  }
}
