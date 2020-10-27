import React, { Component } from 'react';
import { View } from 'react-native';
import { Button } from '../components/common/';
import { NavigationContainer } from '@react-navigation/native';
import { Customers } from './Customers';
import { Devices } from './Devices';
import { Device } from './Device';
import { createStackNavigator } from '@react-navigation/stack';
import { createDrawerNavigator } from '@react-navigation/drawer';
import { Account } from './Account';
import { CustomerDevices } from './CustomerDevices';
navigator.geolocation = require('@react-native-community/geolocation');
export default class LoggedIn extends Component {
    constructor(props) {
        super(props);
    }

    render() {
        const Stack = createStackNavigator();
        const Drawer = createDrawerNavigator();
        const DrawerNavigation = () => {
            return(<Drawer.Navigator initialRouteName="Customers">
                <Drawer.Screen name="Customers" options={{ title: 'Customers' }}>
                    {props => <Customers {...props} user={this.props.user} deleteJWT={this.props.deleteJWT} />}
                </Drawer.Screen>
                <Drawer.Screen name="Devices" options={{ title: 'Devices' }} initialParams={{ item: null }}>
                    {props => <Devices {...props} user={this.props.user} deleteJWT={this.props.deleteJWT} />}
                </Drawer.Screen>
                <Drawer.Screen name="Account" >
                    {props => <Account deleteJWT={this.props.deleteJWT} user={this.props.user} />}
                </Drawer.Screen>

            </Drawer.Navigator>
            )};
        return (
            <NavigationContainer >
                <Stack.Navigator screenOptions={{
    headerShown: false
  }}>

                    <Stack.Screen
                        name="drawer"
                        component={DrawerNavigation}
                        headerShown={false}
                        options={{ headerMode: 'none', headerShown: false }}
                    />
                    <Stack.Screen name="Device" options={{ title: 'Device' }}>
                        {props => <Device {...props} user={this.props.user} deleteJWT={this.props.deleteJWT} />}
                    </Stack.Screen>
                    <Stack.Screen name="CustomerDevices" >
                        {props => <CustomerDevices {...props} user={this.props.user} deleteJWT={this.props.deleteJWT} />}
                    </Stack.Screen>
                </Stack.Navigator>
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