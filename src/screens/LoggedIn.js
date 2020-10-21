import React, { Component } from 'react';
import { View } from 'react-native';
import { Button } from '../components/common/';
import { NavigationContainer } from '@react-navigation/native';
import { Customers } from './Customers';
import { Devices } from './Devices';
import { createStackNavigator } from '@react-navigation/stack';
import { createDrawerNavigator } from '@react-navigation/drawer';
import { Account } from './Account';

export default class LoggedIn extends Component {
    constructor(props) {
        super(props);
    }

    render() {
        const Stack = createStackNavigator();
        const Drawer = createDrawerNavigator();
        return (
            <NavigationContainer >
                <Drawer.Navigator initialRouteName="Customers">
                    <Stack.Screen name="Customers" options={{ title: 'Customers' }}>
                        {props => <Customers {...props} user={this.props.user} deleteJWT={this.props.deleteJWT} />}
                    </Stack.Screen>
                    <Stack.Screen name="Devices" options={{ title: 'Devices' }}>
                        {props => <Devices {...props} user={this.props.user} deleteJWT={this.props.deleteJWT} />}
                    </Stack.Screen>
                    <Stack.Screen name="Account" >
                        {props => <Account deleteJWT={this.props.deleteJWT} user={this.props.user} />}
                    </Stack.Screen>
                    <Stack.Screen name="Device" options={{ title: 'Device' }}>
                        {props => <Devices {...props} user={this.props.user} deleteJWT={this.props.deleteJWT} />}
                    </Stack.Screen>
                </Drawer.Navigator>
            </NavigationContainer>

        );
    }

}

const styles = {
    container: {
        flex: 1,
        justifyContent: 'center'
    },
    emailText: {
        alignSelf: 'center',
        color: 'black',
        fontSize: 20
    },
    errorText: {
        alignSelf: 'center',
        fontSize: 18,
        color: 'red'
    }
};