import React, { Component, Fragment } from 'react';
import { View, Text, SafeAreaView, FlatList } from 'react-native';
import { Button } from './../components/common'
import { ListItem, SearchBar } from 'react-native-elements'
import deviceStorage from '../services/deviceStorage';
import axios from 'axios';
import { API_URL } from "./../../env";
class Customers extends Component {
    constructor(props) {
        super(props);
        this.state = {
            error: '',
            loading: false,
            data: [],
            page: 1,
            seed: 1,
            error: null,
            refreshing: false
        };
    }

    componentDidMount() {
        this.getCustomers();
    }
    render() {
        const { error, loading } = this.state;
        const { container } = styles;
        const renderItem = ({ item }) => (
            <Item2 title={item.name} subTitle={item.description} id={item.id.toString()} />
        );
        return (
            <SafeAreaView style={styles.container}>
                <FlatList
                    data={this.state.data}
                    renderItem={renderItem}
                    keyExtractor={item => item.id}
                    onEndReached={this.handleLoadMore}
                    ItemSeparatorComponent={this.renderSeparator}
                    ListHeaderComponent={this.renderHeader}
                    refreshing={this.state.refreshing}
                    onRefresh={this.handleRefresh}
                />
            </SafeAreaView>

        );
    }

    handleLoadMore = () => {
        console.log("bottom reached");
    }

    getCustomers = () => {
        const instance = axios.create({
            baseURL: `${API_URL}`
        });
        instance.defaults.headers.common['Authorization'] = `Bearer ${this.props.user.id_token}`;
        instance.defaults.headers.common['Accept'] = 'application/json';
        instance.defaults.headers.common['Content-Type'] = 'application/json';
        console.log(this.props);
        instance.get(`${API_URL}/api/v1/customers`).then(result => {
            this.setState({
                data: result.data.data,
                loading: false,
                refreshing: false
            })
        }).catch(error => {
            console.log(error.response);
            this.setState({
                loading: false,
                refreshing: false
            })
        });
    }
    handleRefresh = () => {
        this.setState(
            {
                refreshing: true
            },
            () => {
                this.getCustomers();
            }
        );
    };

    renderSeparator = () => {
        return (
            <View
                style={{
                    height: 1,
                    width: "86%",
                    backgroundColor: "#CED0CE",
                    marginLeft: "14%"
                }}
            />
        );
    };
    renderHeader = () => {
        return <SearchBar placeholder="Type Here..." lightTheme round />;
    };
}

const styles = {
    container: {
        flex: 1,
        // marginTop: StatusBar.currentHeight || 0,
    }
};


const Item2 = ({ title, subTitle, id }) => (
    <ListItem key={id} bottomDivider>
        <ListItem.Content>
            <ListItem.Title>{title}</ListItem.Title>
            <ListItem.Subtitle>{subTitle}</ListItem.Subtitle>
        </ListItem.Content>
        <ListItem.Chevron />
    </ListItem>
);

export { Customers };