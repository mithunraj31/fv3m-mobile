import React, { Component, Fragment } from 'react';
import { View, Text, SafeAreaView, FlatList, ActivityIndicator } from 'react-native';
import { Button } from './../components/common'
import { ListItem, SearchBar, List } from 'react-native-elements'
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
            noOfPages: 1,
            error: null,
            refreshing: false,
            search : ''
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
            <View>
 
                    <FlatList
                        data={this.state.data}
                        renderItem={renderItem}
                        keyExtractor={item => item.id}
                        onEndReached={this.handleLoadMore}
                        ItemSeparatorComponent={this.renderSeparator}
                        ListHeaderComponent={this.renderHeader}
                        refreshing={this.state.refreshing}
                        onRefresh={this.handleRefresh}
                        onEndReachedThreshold={0.5}
                        ListFooterComponent={this.renderFooter}
                    />
            </View>

        );
    }

    handleLoadMore = () => {
        if (this.state.page < this.state.noOfPages) {
            this.setState(
                {
                    page: this.state.page + 1
                },
                () => {
                    this.getCustomers();
                }
            );
        }
    }

    getCustomers = () => {
        const instance = axios.create({
            baseURL: `${API_URL}`
        });
        instance.defaults.headers.common['Authorization'] = `Bearer ${this.props.user.id_token}`;
        instance.defaults.headers.common['Accept'] = 'application/json';
        instance.defaults.headers.common['Content-Type'] = 'application/json';
        instance.get(`${API_URL}/api/v1/customers?page=${this.state.page}&search=${this.state.search}`).then(result => {
            console.log(result);
            this.setState({
                data: this.state.page === 1 ? result.data.data : [...this.state.data, ...result.data.data],
                loading: false,
                noOfPages: result.data.meta.last_page,
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
                page: 1,
                noOfPages: 1,
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
        return <SearchBar 
        placeholder="Type Here..." 
        lightTheme round 
        onChangeText={(text)=>this.updateSearch(text)}
        onClear= {(text)=>this.updateSearch('')}
        value={this.state.search}
        />;
    };

    updateSearch= (text) => {
        this.setState(
            {
                page: 1,
                noOfPages: 1,
                data: [],
                search:text
            },
            () => {
                this.getCustomers();
            }
        );
    };

    renderFooter = () => {
        if (!this.state.loading) return null;

        return (
            <View
                style={{
                    paddingVertical: 20,
                    borderTopWidth: 1,
                    borderColor: "#CED0CE"
                }}
            >
                <ActivityIndicator animating size="large" />
            </View>
        );
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