import React, { Component, Fragment } from 'react';
import { View, Text, SafeAreaView, FlatList, ActivityIndicator,TouchableOpacity} from 'react-native';
import { Button } from './../components/common'
import { ListItem, SearchBar, Header, Avatar } from 'react-native-elements'
import deviceStorage from '../services/deviceStorage';
import axios from 'axios';
import { API_URL } from "./../../env";
class Devices extends Component {
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
            search: '',
            isSearchOn: false
        };
    }

    componentDidMount() {
        this.getRemoteData();
    }
    render() {
        const { error, loading } = this.state;
        const { container } = styles;
        const renderItem = ({ item }) => (
            <TouchableOpacity onPress={()=>this.navigate(item)}>
            <Item
                id={item.id.toString()}
                title={item.name}
                subTitle={item.serial_number}
                subTitle2={item.description}
                image={item.images ? item.images[0].full_url : null}
            />
            </TouchableOpacity>
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
                    this.getRemoteData();
                }
            );
        }
    }

    getRemoteData = () => {
        const instance = axios.create({
            baseURL: `${API_URL}`
        });
        instance.defaults.headers.common['Authorization'] = `Bearer ${this.props.user.id_token}`;
        instance.defaults.headers.common['Accept'] = 'application/json';
        instance.defaults.headers.common['Content-Type'] = 'application/json';
        instance.get(`${API_URL}/api/v1/devices?page=${this.state.page}&search=${this.state.search}`).then(result => {
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
                this.getRemoteData();
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
        return <View>
            <Header
                leftComponent={{ icon: 'menu', color: '#fff', onPress: () => this.props.navigation.toggleDrawer() }}
                centerComponent={{ text: 'Devices', style: { color: '#fff' } }}
                rightComponent={{ icon: 'search', color: '#fff', onPress: () => this.toggleSearch() }}
            />{
                this.state.isSearchOn ?
                    <SearchBar
                        placeholder="Type Here..."
                        lightTheme round
                        onChangeText={(text) => this.updateSearch(text)}
                        onClear={(text) => this.updateSearch('')}
                        value={this.state.search}
                    /> : void 0
            }


        </View>;
    };
    toggleSearch() {
        this.setState({
            isSearchOn: !this.state.isSearchOn
        });
    }

    updateSearch = (text) => {
        this.setState(
            {
                page: 1,
                noOfPages: 1,
                data: [],
                search: text
            },
            () => {
                this.getRemoteData();
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

    navigate=({id})=>{
        console.log(this.props.navigation.navigate);
        this.props.navigation.navigate('Device');
    };
}

const styles = {
    container: {
        flex: 1,
        // marginTop: StatusBar.currentHeight || 0,
    }
};


const Item = ({ title, subTitle, subTitle2, id, image, onPress }) => (
    <View>
    <ListItem key={id} bottomDivider button
    >
        <Avatar title={title} source={image && { uri: image }} />
        <ListItem.Content>
            <ListItem.Title>{title}</ListItem.Title>
            <ListItem.Subtitle>{subTitle}</ListItem.Subtitle>
            <ListItem.Subtitle>{subTitle2}</ListItem.Subtitle>
        </ListItem.Content>
        <ListItem.Chevron />
    </ListItem>
    </View>
);

export { Devices };