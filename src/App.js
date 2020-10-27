import React, { Component } from 'react';
import { Loading } from './components/common/';
import Auth from './screens/Auth';
import LoggedIn from './screens/LoggedIn';
import deviceStorage from './services/deviceStorage.js';
// import axiosInterceptor from './services/axiosInterceptor';


export default class App extends Component {
  constructor() {
    super();
    this.state = {
      jwt: '',
      loading: true,
      user: {},
      axiosInstance : {}
    }
    this.newJWT = this.newJWT.bind(this);
    this.deleteJWT = deviceStorage.deleteJWT.bind(this);
    this.loadJWT = deviceStorage.loadJWT.bind(this);
    // this.loadAxios = axiosInterceptor.loadInstence.bind(this);
    this.loadJWT();
    // this.loadAxios();

  }
  newJWT(jwt, user) {
    this.setState({
      jwt: jwt,
      user: user
    });
  }

  render() {
    if (this.state.loading) {
      return (
        <Loading size={'large'} />
      );
    } else if (!this.state.jwt) {
      return (
        <Auth newJWT={this.newJWT} />
      );
    } else if (this.state.jwt) {
      return (
        <LoggedIn deleteJWT={this.deleteJWT} user={this.state.user}/>
      );
    }

    //testing
      //     return (
      //   <LoggedIn deleteJWT={this.deleteJWT} user={this.state.user}/>
      // );
  }

  
}