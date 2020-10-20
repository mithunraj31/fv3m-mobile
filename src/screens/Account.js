import React, { Component, Fragment } from 'react';
import { View, Text } from 'react-native';
import {Button} from './../components/common'

class Account extends Component {
    constructor(props) {
        super(props);
        this.state = {
            error: '',
            loading: false
        };
    }

    render() {
        const { error, loading } = this.state;
        const { container} = styles;
        console.log(this.props);
        return (
            <View style={container}>
                <Button onPress={this.props.deleteJWT}>
                    Log Out Account
                </Button>
            </View>

        );
    }
}

const styles = {
    container: {
        flex: 1,
        justifyContent: 'center'
    },
};

export { Account };