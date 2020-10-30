import React, { Component, Fragment } from 'react';
import { View, Text, Modal, FlatList, ActivityIndicator, TouchableOpacity } from 'react-native';
import { ErrorAlert ,Loading} from '../components/common'
import { ListItem, SearchBar,Icon,Input,Card, Header, Avatar } from 'react-native-elements'
import ImageViewer from 'react-native-image-zoom-viewer';
import { FbGrid } from './../components/common/FBGrid';
import axios from 'axios';
import { API_URL } from "../../env";
var ImagePicker = require('react-native-image-picker')

class CustomerDevices extends Component {
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
            isSearchOn: false,
            newDevice: {
                 name: null, nameError: '', 
                 description: null, 
                 serial_number:null, 
                 images: { uri: [], data: [] },
                 },
            lat: '',
            lng: '',
            addMaintananceVisible: false,
            imageSlider: false,
            imageSliderData: [],
        };
    }

    componentDidMount() {
        this.getRemoteData();
        this.getLocation();
    }
    render() {
        const renderItem = ({ item }) => (
            <TouchableOpacity onPress={() => this.navigate(item)}>
                <Item
                    id={item.id.toString()}
                    title={item.name}
                    subTitle={item.serial_number}
                    subTitle2={item.description}
                    image={item.images && item.images.length > 0 ? item.images[0]['full_url'] : null}
                />
            </TouchableOpacity>
        );
        return (
            <View>

                <FlatList
                    data={this.state.data}
                    renderItem={renderItem}
                    keyExtractor={item => item.id.toString()}
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
    addImagesToState = (response) => {
        const uri = [...this.state.newDevice.images.uri, response.uri];
        const data = [...this.state.newDevice.images.data, `data:image/jpeg;base64,${response.data}`];
        this.setState((prv) => {
            let newDevice = Object.assign({}, prv.newDevice);
            newDevice.images.uri = uri;
            newDevice.images.data = data;
            return { newDevice };
        })
    }
    openImagePicker = (onSuccess) => {
        // More info on all the options is below in the API Reference... just some common use cases shown here
        const options = {
            title: 'Select Images',
            quality: 0.8,
            storageOptions: {
                skipBackup: true,
                path: 'images',
            },
            onSuccess: onSuccess
        };
        ImagePicker.default.showImagePicker(options, (response) => {
            this._isMounted = true;
            console.log('Response = ', response);
            if (response.didCancel) {
                console.log('User cancelled image picker');
            } else if (response.error) {
                console.log('ImagePicker Error: ', response.error);
            } else if (response.customButton) {
                console.log('User tapped custom button: ', response.customButton);
            } else if (response.uri) {
                //    onSuccess(response);
                return options.onSuccess(response);
            }
        }, 100);

    }
    clearnewDevice = () => {
        this.setState({
            newDevice: {
                name: null,
                description: null,
                images: {
                    uri: [],
                    data: []
                }
            }
        });
    }
    getLocation = () => {
        navigator.geolocation.getCurrentPosition((success) => {
            console.log(success);
            this.setState({
                lat: success.coords.latitude,
                lng: success.coords.longitude
            })
        });
    }
    addDevice = async () => {
        this.setState((prv) => {
            let loading = true;
            let refreshing = true;
            let newDevice = Object.assign({}, prv.newDevice);
            newDevice.nameError = '';
            return { loading, refreshing, newDevice };
        });
        //Validating
        if (this.state.newDevice.name == '') {
            return this.setState((prv) => {
                let loading = false;
                let refreshing = false;
                let newDevice = Object.assign({}, prv.newDevice);
                newDevice.nameError = 'Name cannot be empty';
                return { loading, refreshing, newDevice };
            });
        }
        let imageUrls = [];
        if (this.state.newDevice.images.uri.length > 0) {
            imageUrls = await this.uploadImages();
        }
        const data = {
            name: this.state.newDevice.name,
            description: this.state.newDevice.description,
            serial_number: this.state.newDevice.serial_number,
            lat: this.state.lat,
            lng: this.state.lng,
            customer_id: this.props.route.params.item.id,
            status_id: 5,
            imageUrls: imageUrls

        }
        console.log(data);
        const instance = axios.create({
            baseURL: `${API_URL}`
        });
        instance.defaults.headers.common['Authorization'] = `Bearer ${this.props.user.id_token}`;
        instance.defaults.headers.common['Accept'] = 'application/json';
        instance.defaults.headers.common['Content-Type'] = 'application/json';

        instance.post(`${API_URL}/api/v1/devices`, data).then(result => {
            this.setState({
                loading: false,
                refreshing: false,
                addMaintananceVisible: false
            });
            this.clearnewDevice();
            this.handleRefresh();
        }).catch(error => {
            console.log(error.response);
            if (error.response && error.response.status == 401) {
                ErrorAlert({ message: "Token Expired Please Login agian" });
                this.props.deleteJWT();
            } else {

                ErrorAlert({ message: error.message });
            }
            this.setState({
                loading: false,
                refreshing: false
            })
        });
    }
    uploadImages = (data) => {
        return new Promise((resolve, reject) => {

            const instance = axios.create({
                baseURL: `${API_URL}`
            });
            instance.defaults.headers.common['Authorization'] = `Bearer ${this.props.user.id_token}`;
            instance.defaults.headers.common['Accept'] = 'application/json';
            instance.defaults.headers.common['Content-Type'] = 'application/json';

            const promiseArray = [];
            let imageData = data ? data : this.state.newDevice.images.data;
            if (imageData.length > 0) {
                imageData.forEach(imageData => {
                    const promise = new Promise((resolve, reject) => {
                        instance.post(`${API_URL}/api/v1/images/base64`, { image: imageData }).then(result => {
                            return resolve(result.data.imageUrl);
                        }).catch(error => {
                            reject(error);

                        });
                    })
                    promiseArray.push(promise);
                });


                Promise.all(promiseArray).then((values) => {
                    resolve(values);

                }).catch((error) => {
                    console.log(error);
                    ErrorAlert({ message: error.message });
                    reject(error);
                })
            }
        });


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
        let url = `${API_URL}/api/v1/customers/${this.props.route.params.item.id}/devices?page=${this.state.page}`;
        instance.get(url).then(result => {
            this.setState({
                data: this.state.page === 1 ? result.data.data : [...this.state.data, ...result.data.data],
                loading: false,
                noOfPages: result.data.meta.last_page,
                refreshing: false
            })
        }).catch(error => {
            if (error.response && error.response.status == 401) {
                ErrorAlert({ message: "Token Expired Please Login again!" });
                this.props.deleteJWT();
            } else {

                ErrorAlert({ message: error.message });
            }
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
                refreshing: true,
                data: []
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
        var headerText = 'Devices';
        if (this.props.route.params && this.props.route.params.item) {
            headerText = 'Devices > ' + this.props.route.params.item.name;
        }
        return <View>
            <Header
                leftComponent={{ icon: 'arrow-back', color: '#fff', onPress: () => this.props.navigation.goBack() }}
                centerComponent={{ text: headerText, style: { color: '#fff' } }}
                rightComponent={{ icon: 'add', color: '#fff', onPress: () => this.toggleAddMaintenance() }}
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
            <Modal visible={this.state.imageSlider} transparent={true}>
                <ImageViewer
                    imageUrls={this.state.imageSliderData}
                    onCancel={() => this.setState({ imageSlider: false })}
                    enableSwipeDown={true}
                    renderFooter={this.state.editImageView ? (currentIndex) => this.renderImageEditFooter(currentIndex) : () => { }}
                />
            </Modal>
            {this.state.addMaintananceVisible &&

                <Card>
                    <Card.Title>Add Device</Card.Title>
                    <Input
                        placeholder='Device Name'
                        errorStyle={{ color: 'red' }}
                        errorMessage={this.state.newDevice.nameError}
                        onChangeText={value => this.setState((prv) => {
                            let newDevice = Object.assign({}, prv.newDevice);
                            newDevice.name = value;
                            return { newDevice };
                        })}
                    />
                    <Input
                        placeholder='Serial Number'
                        errorStyle={{ color: 'red' }}
                        errorMessage=''
                        onChangeText={value => this.setState((prv) => {
                            let newDevice = Object.assign({}, prv.newDevice);
                            newDevice.serial_number = value;
                            return { newDevice };
                        })}
                    />
                    <Input
                        placeholder='Description'
                        errorStyle={{ color: 'red' }}
                        errorMessage=''
                        multiline={true}
                        onChangeText={value => this.setState((prv) => {
                            let newDevice = Object.assign({}, prv.newDevice);
                            newDevice.description = value;
                            return { newDevice };
                        })}
                    />
                    <Text>lat: {this.state.lat}</Text>
                    <Text>lng: {this.state.lng}</Text>
                    <FbGrid style={{ height: 200 }} images={this.state.newDevice.images.uri} onPress={() => { this.openImageView(this.state.newDevice.images.uri, true) }} />
                    {!this.state.loading ?
                        <View style={{ flexDirection: 'row-reverse' }}>

                            <Icon
                                raised
                                reverse
                                name='input'
                                color='#1565c0'
                                onPress={this.addDevice} />
                            <Icon
                                raised
                                name='camera'
                                type='font-awesome'
                                color='#f50'
                                onPress={() => this.openImagePicker(this.addImagesToState)} />

                        </View>
                        :
                        <Loading size={'large'} />
                    }

                </Card>
            }

        </View>;
    };
    toggleSearch() {
        this.setState({
            isSearchOn: !this.state.isSearchOn
        });
    }
    toggleAddMaintenance() {
        this.setState({
            addMaintananceVisible: !this.state.addMaintananceVisible
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

    navigate(item) {
        this.props.navigation.navigate('Device', { item });
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

export { CustomerDevices };