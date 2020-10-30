import React, { Component, } from 'react';
import { View, Text, FlatList, ActivityIndicator, Modal, TouchableOpacity, ScrollView } from 'react-native';
import { ErrorAlert, convertImagesToStringArray, convertImagesToUriArray } from './../components/common'
import { ListItem, SearchBar, Header, Avatar, Card, Input, Icon } from 'react-native-elements'
import axios from 'axios';
import { API_URL } from "./../../env";
import { FbGrid } from './../components/common/FBGrid';
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
            isSearchOn: false,
            imageSlider: false,
            imageSliderData: [],
            newMaintenance: { name: null, nameError: '', description: null, images: { uri: [], data: [] } },
            lat: '',
            lng: '',
            editImageView: false,
            addMaintananceVisible: false,
            editModalVisible: false,
            editMaintenance: null,
            editImageData: [],
            customers: [],
            statuses: []
        };
    }

    componentDidMount() {
        this.getRemoteData();
        this.getCustomers();
        this.getStatuses();
    }
    render() {
        const renderItem = ({ item }) => (
            <TouchableOpacity
                onPress={() => this.navigate(item)}
                onLongPress={() => this.openEditModal(item)}>
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
        let url = `${API_URL}/api/v1/devices?page=${this.state.page}&search=${this.state.search}`;
        // if (this.props.route.params&&this.props.route.params.item){
        //     url = `${API_URL}/api/v1/customers/${this.props.route.params.item.id}/devices?page=${this.state.page}`;
        // }
        instance.get(url).then(result => {
            console.log(result.data.data);
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
    getCustomers = () => {
        const instance = axios.create({
            baseURL: `${API_URL}`
        });
        instance.defaults.headers.common['Authorization'] = `Bearer ${this.props.user.id_token}`;
        instance.defaults.headers.common['Accept'] = 'application/json';
        instance.defaults.headers.common['Content-Type'] = 'application/json';
        let url = `${API_URL}/api/v1/customers?perPage=100`;
        instance.get(url).then(result => {
            console.log(result.data.data);
            this.setState({
                customers: result.data.data,
                loading: false,
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
    getStatuses = () => {
        const statuses = [{
            id: 5,
            name: "Available"
        },
        {
            id: 2,
            name: "In Maintanance"
        },
        {
            id: 3,
            name: "Broken"
        },
        {
            id: 1,
            name: "Pending"
        },
        {
            id: 4,
            name: "Unkown"
        },
    ] 
        this.setState({
            statuses: statuses,
            loading: false,
            refreshing: false
        })

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
        const EditModal = this.editModal;
        if (this.props.route.params && this.props.route.params.item) {
            headerText = 'Devices > ' + this.props.route.params.item.name;
        }
        return <View>
            <Header
                leftComponent={{ icon: 'menu', color: '#fff', onPress: () => this.props.navigation.toggleDrawer() }}
                centerComponent={{ text: headerText, style: { color: '#fff' } }}
                rightComponent={{ icon: 'search', color: '#fff', onPress: () => this.toggleSearch() }}
            /><EditModal />
            {
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

    navigate(item) {
        this.props.navigation.navigate('Device', { item });
    };
    openEditModal = (item) => {
        this.setState({ editMaintenance: item });
        this.setState({ editModalVisible: true });
    }
    renderImageEditFooter = (currentIndex) => {
        return <View>
            <Icon
                raised
                reverse
                name='delete'
                color='#f50'
                onPress={() => { this.removeImageFromMaintenance(currentIndex) }} />
        </View>
    }
    toggleAddMaintenance() {
        this.setState({
            addMaintananceVisible: !this.state.addMaintananceVisible
        });
    }
    removeImageFromMaintenance = (index) => {
        if (this.state.editModalVisible) {
            this.state.editMaintenance.images.splice(index, 1);
        } else {
            this.state.newMaintenance.images.data.splice(index, 1);
            this.state.newMaintenance.images.uri.splice(index, 1);
        }

        this.setState({ imageSlider: false });


    }
    openImageView = (images, isEdit) => {
        if (isEdit) {
            this.setState({
                editImageView: true
            });
        } else {
            this.setState({
                editImageView: false
            });
        }
        this.setState({
            imageSliderData: convertImagesToUriArray(images)
        });
        this.setState({ imageSlider: true });
    };
    addImagesToState = (response) => {
        const uri = [...this.state.newMaintenance.images.uri, response.uri];
        const data = [...this.state.newMaintenance.images.data, `data:image/jpeg;base64,${response.data}`];
        this.setState((prv) => {
            let newMaintenance = Object.assign({}, prv.newMaintenance);
            newMaintenance.images.uri = uri;
            newMaintenance.images.data = data;
            return { newMaintenance };
        })
    }
    addImagesToEditState = async (response) => {
        const uri = [...this.state.editMaintenance.images, { full_url: response.uri, data: `data:image/jpeg;base64,${response.data}` }];
        this.setState((prv) => {
            let editMaintenance = Object.assign({}, prv.editMaintenance);
            editMaintenance.images = uri;
            return { editMaintenance };
        })
    }
    openImagePicker = (onSuccess) => {
        // More info on all the options is below in the API Reference... just some common use cases shown here
        const options = {
            title: 'Select Images',
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
    clearNewMaintenance = () => {
        this.setState({
            newMaintenance: {
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
    addMaintenace = async () => {
        this.setState((prv) => {
            let loading = true;
            let refreshing = true;
            let newMaintenance = Object.assign({}, prv.newMaintenance);
            newMaintenance.nameError = '';
            return { loading, refreshing, newMaintenance };
        });
        //Validating
        if (this.state.newMaintenance.name == '') {
            return this.setState((prv) => {
                let loading = false;
                let refreshing = false;
                let newMaintenance = Object.assign({}, prv.newMaintenance);
                newMaintenance.nameError = 'Name cannot be empty';
                return { loading, refreshing, newMaintenance };
            });
        }
        let imageUrls = [];
        if (this.state.newMaintenance.images.uri.length > 0) {
            imageUrls = await this.uploadImages();
        }
        const data = {
            name: this.state.newMaintenance.name,
            description: this.state.newMaintenance.description,
            lat: this.state.lat,
            lng: this.state.lng,
            device_id: this.props.route.params.item.id,
            imageUrls: imageUrls

        }
        console.log(data);
        const instance = axios.create({
            baseURL: `${API_URL}`
        });
        instance.defaults.headers.common['Authorization'] = `Bearer ${this.props.user.id_token}`;
        instance.defaults.headers.common['Accept'] = 'application/json';
        instance.defaults.headers.common['Content-Type'] = 'application/json';

        instance.post(`${API_URL}/api/v1/maintenances`, data).then(result => {
            this.setState({
                loading: false,
                refreshing: false,
                addMaintananceVisible: false
            });
            this.clearNewMaintenance();
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
            let imageData = data ? data : this.state.newMaintenance.images.data;
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
    editMaintenance = async (data) => {
        this.setState((prv) => {
            let loading = true;
            let refreshing = true;
            return { loading, refreshing };
        });

        // process images
        const newImageData = [];
        const oldImageUrls = [];
        this.state.editMaintenance.images.forEach(imgObj => {
            if (imgObj.data) {
                newImageData.push(imgObj.data)
            } else {
                oldImageUrls.push(imgObj.url);
            }
        })
        const newImageUrls = newImageData.length > 0 ? await this.uploadImages(newImageData) : [];
        const allImageUrls = oldImageUrls.concat(newImageUrls);
        let newdata = data;
        newdata.imageUrls = allImageUrls;
        //end of image process
        // Update maintenance
        const instance = axios.create({
            baseURL: `${API_URL}`
        });
        instance.defaults.headers.common['Authorization'] = `Bearer ${this.props.user.id_token}`;
        instance.defaults.headers.common['Accept'] = 'application/json';
        instance.defaults.headers.common['Content-Type'] = 'application/json';

        instance.put(`${API_URL}/api/v1/maintenances/${data.id}`, newdata).then(result => {
            this.setState({
                loading: false,
                refreshing: false,
                editModalVisible: false
            });
            this.clearNewMaintenance();
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
                refreshing: false,
                editModalVisible: false
            })
        });

    }
    editModal = () => {
        const item = this.state.editMaintenance;
        let data;
        let nameError = '';
        const validate = () => {
            if (data.name == '') {
                nameError = 'Name cannot be empty'
            } else {
                nameError = ''
                this.editMaintenance(data);
            }

        }
        if (item) {
            nameError = '';
            data = {
                id: item.id,
                name: item.name,
                description: item.description,
                imageUrls: convertImagesToStringArray(item.images),
                lat: item.lat,
                lng: item.lng
            }
            // console.log(item);
            return <Modal
                animationType="slide"
                visible={this.state.editModalVisible}
                transparent={false}
                presentationStyle='overFullScreen'

            ><Header
                    centerComponent={{ text: 'Edit Maintenance', style: { color: '#fff' } }}
                    rightComponent={{ icon: 'close', color: '#fff', onPress: () => this.setState({ editModalVisible: false }) }}
                />
                <ScrollView>
                    <View >
                        <Card >
                            <Input
                                placeholder='New Maintenance Name..'
                                errorStyle={{ color: 'red' }}
                                errorMessage={nameError}
                                defaultValue={item.name}
                                multiline={true}
                                onChangeText={value => {
                                    data.name = value;
                                }}
                            />
                            <Input
                                placeholder='Description'
                                errorStyle={{ color: 'red' }}
                                errorMessage=''
                                multiline={true}
                                defaultValue={item.description}
                                onChangeText={value => {
                                    data.description = value;
                                }}
                            />
                            <Text>lat: {data.lat}</Text>
                            <Text>lng: {data.lng}</Text>
                            <FbGrid
                                style={{ height: 200 }}
                                images={convertImagesToStringArray(this.state.editMaintenance.images || [])}
                                onPress={() => { this.openImageView(convertImagesToStringArray(this.state.editMaintenance.images || []), true) }} />
                            {!this.state.loading ?
                                <View style={{ flexDirection: 'row-reverse' }}>

                                    <Icon
                                        raised
                                        reverse
                                        name='input'
                                        color='#1565c0'
                                        onPress={validate} />
                                    <Icon
                                        raised
                                        name='camera'
                                        type='font-awesome'
                                        color='#f50'
                                        onPress={() => this.openImagePicker(this.addImagesToEditState)} />

                                </View>
                                :
                                <Loading size={'large'} />
                            }
                        </Card></View></ScrollView>
            </Modal>
        } else return null;
    }
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