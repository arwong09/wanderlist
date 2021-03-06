import style from './dashboard.scss'
import React, { Component } from 'react'
import store from 'redux/store'
import { setCurrentUser, setUsers, logout } from 'redux/actions'
import request from 'superagent'
import Destinations from 'presenters/Destinations/Destinations.jsx'
import FriendDestinations from 'presenters/Destinations/FriendDestinations.jsx'
import { Link, browserHistory } from 'react-router'
import DestinationSearch from 'containers/DestinationSearch/DestinationSearch.jsx'
import { indexOfObj } from 'helpers'

export default class Dashboard extends Component {
  constructor(props) {
    super(props)
    this.toggleMenu = this.toggleMenu.bind(this)
    this.toggleVisited = this.toggleVisited.bind(this)
    this.deleteDestination = this.deleteDestination.bind(this)
    this.closeMenu = this.closeMenu.bind(this)
    this.state = { users: [], sideMenuToggled: false, loading: true }
  }

  componentDidMount() {
    this.unsubscribe = store.subscribe(() => {
      if(!store.getState().currentUser.token) {
        return browserHistory.push('/')
      }

      this.setState({ users: store.getState().users, loading: false })
    })

    request.get('https://young-beyond-8772.herokuapp.com/travelers')
      .set('Authorization', 'Token token=' + store.getState().currentUser.token)
      .end((err, res) => {
        if(err) {
          throw(err)
          return browserHistory.push('/')
        }
        const users = JSON.parse(res.text)
        store.dispatch(setUsers(users))
      })
  }

  componentWillUnmount() {
    this.unsubscribe()
  }

  currentDestinations() {
    if(!this.state.users.length) { return [] }

    return this.state.users
      .filter((user) => user.id === parseInt(this.props.params.id))[0]
      .destinations
  }

  isOwner() {
    return parseInt(this.props.params.id) === store.getState().currentUser.id
  }

  getActiveUser() {
    return this.state.users.filter((user) => user.id === parseInt(this.props.params.id))
  }

  toggleMenu() {
    if(window.innerWidth < 768) {
      this.setState({ sideMenuToggled: !this.state.sideMenuToggled })
    }
  }

  closeMenu() {
    this.setState({ sideMenuToggled: false })
  }

  deleteDestination(name) {
    if(!this.isOwner()) { return }

    let newUsers = [].concat(this.state.users)
    const userIndex = indexOfObj(newUsers, (user) => user.id === parseInt(this.props.params.id))
    const destinationIndex = indexOfObj(newUsers[userIndex].destinations, (destination) => destination.name === name)
    newUsers[userIndex].destinations.splice(destinationIndex, 1)
    this.setState({ users: newUsers })
  }

  toggleVisited(name) {
    if(!this.isOwner()) { return }

    let newUsers = [].concat(this.state.users)
    const userIndex = indexOfObj(newUsers, (user) => user.id === parseInt(this.props.params.id))
    const destinationIndex = indexOfObj(newUsers[userIndex].destinations, (destination) => destination.name === name)
    newUsers[userIndex].destinations[destinationIndex].visited = !newUsers[userIndex].destinations[destinationIndex].visited
    this.setState({ users: newUsers })
  }

  logout() {
    try {
      localStorage.removeItem('currentUser')
    } catch(err) {
      console.error(err)
    }

    store.dispatch(logout())
  }

  render() {
    return (
      <div className="dashboard">
        <div className="dashboard__menu">
          <div className="dashboard__back-button">
            {this.isOwner() ? '' : (
              <Link className="dashboard__back-button" to={'/travelers/' + store.getState().currentUser.id}><span className="fa fa-chevron-left"></span> <span className="emoji--large">🏠</span></Link>
            )}
          </div>
          {this.state.loading ? (
            <div className="dashboard__menu-title">Welcome!</div>
          ) : (
            <div className="dashboard__menu-title">{this.isOwner() ? <div><span className="emoji--large">🏠</span> My Destinations</div> : '👦 ' + this.state.users.filter((user) => user.id === parseInt(this.props.params.id))[0].name + "'s Destinations"}</div>
          )}
          <div className="dashboard__button" onClick={this.toggleMenu}>
            <div className="fa fa-bars hover-red"></div>
          </div>
        </div>
        {this.state.loading ? (
          <div className="dashboard__loading">
            <div>
              <i className="fa fa-spinner fa-pulse fa-2x fa-fw Demo__spinner" />
            </div>
          </div>
        ) : (
          <div className="dashboard__content" onClick={this.closeMenu}>
            <DestinationSearch />

            <div className={this.state.sideMenuToggled ? 'dashboard__content toggled-open' : 'dashboard__content'}>
              {this.isOwner() ? (
                <Destinations handleDelete={this.deleteDestination} handleClick={this.toggleVisited} destinations={this.currentDestinations()} />
              ) : (
                <FriendDestinations destinations={this.currentDestinations()} />
              )}
            </div>
          </div>
        )}


        <div className="dashboard__side-menu" style={this.state.sideMenuToggled ? { transform: 'translateX(-150px)' } : null}>
          <div>
            <div className="dashboard__side-menu__title">Fellow Travelers</div>
            {this.state.users.filter((user) => user.id !== store.getState().currentUser.id).map((friend) => (
              <Link onClick={this.toggleMenu} className="link--friend" to={'/travelers/' + friend.id} key={friend.id}><span>👦</span> {friend.name}</Link>
            ))}
          </div>
          <div onClick={this.logout} className="button--logout"><span className="fa fa-sign-out"></span> Logout</div>
        </div>
      </div>
    )
  }
}
