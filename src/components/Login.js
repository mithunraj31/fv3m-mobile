import React, { Component, Fragment } from 'react';
import { Text, View } from 'react-native';
import { Input, ErrorAlert, Loading, Button } from './common';
import axios from 'axios';
import deviceStorage from '../services/deviceStorage';
import {API_URL} from "./../../env";

class Login extends Component {
  constructor(props) {
    super(props);
    this.state = {
      email: '',
      password: '',
      error: '',
      loading: false
    };

    this.loginUser = this.loginUser.bind(this);
  }
  loginUser() {
    const { email, password, password_confirmation } = this.state;
    this.setState({ error: '', loading: true });

    const instance = axios.create({
      baseURL: `${API_URL}`
    });
    instance.defaults.headers.common['Accept'] = 'application/json';
    instance.defaults.headers.common['Content-Type'] = 'application/json';
    // NOTE Post to HTTPS only in production
    instance.post(`${API_URL}/api/v1/login`, {
      email: email,
      password: password
    })
      .then((response) => {
        if (response.data.access_token) {
          deviceStorage.saveItem("id_token", response.data.access_token);
          deviceStorage.saveItem("name", response.data.user.name);
          deviceStorage.saveItem("email", response.data.user.email);
          deviceStorage.saveItem("role", response.data.user.role);
          const user = {
            email : response.data.user.email,
            name: response.data.user.name,
            role: response.data.user.role,
            id_token: response.data.access_token
          }
          this.props.newJWT(response.data.access_token, user);

        }else {
          this.onLoginFail();
        }
      })
      .catch((error) => {
        ErrorAlert({ message: error.message });
        this.onLoginFail();
      });
  }
  onLoginFail() {
    this.setState({
      error: 'Invalid Credentials',
      loading: false
    });
  }

  render() {
    const { email, password, error, loading } = this.state;
    const { form, section, errorTextStyle } = styles;

    return (
      <Fragment>
        <View style={form}>
          <View style={section}>
            <Input
              placeholder="user@email.com"
              label="Email"
              value={email}
              onChangeText={email => this.setState({ email })}
            />
          </View>

          <View style={section}>
            <Input
              secureTextEntry
              placeholder="password"
              label="Password"
              value={password}
              onChangeText={password => this.setState({ password })}
            />
          </View>

          <Text style={errorTextStyle}>
            {error}
          </Text>

          {!loading ?
            <Button onPress={this.loginUser}>
              Login
            </Button>
            :
            <Loading size={'large'} />
          }

        </View>
        {/* <TextLink onPress={this.props.authSwitch}>
          Don't have an account? Register!
        </TextLink> */}

      </Fragment>
    );
  }
}

const styles = {
  form: {
    width: '100%',
    borderTopWidth: 1,
    borderColor: '#ddd',
  },
  section: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    backgroundColor: '#fff',
    borderColor: '#ddd',
  },
  errorTextStyle: {
    alignSelf: 'center',
    fontSize: 18,
    color: 'red'
  }
};

export { Login };