import React, { Component } from 'react';
import { View } from 'react-native';
import { Button } from '../components/common/';

export function Customers (props) {
    const { container } = styles
    return (
            <View style={container}>
                <Button onPress={props.deleteJWT}>
                    Log Out
                </Button>
            </View>
    );
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