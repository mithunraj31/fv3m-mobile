import React, { Component, Fragment } from 'react';
import { View, Text, Modal, FlatList, ActivityIndicator, ScrollView} from 'react-native';
import { ErrorAlert, convertImagesToStringArray, convertImagesToUriArray, Loading } from './../components/common/'
import { Icon, Input, Card, Header } from 'react-native-elements'
import axios from 'axios';
import { API_URL } from "./../../env";
import { FbGrid } from './../components/common/FBGrid'
var ImagePicker = require('react-native-image-picker');
const FormData = require('form-data')

import ImageViewer from 'react-native-image-zoom-viewer';
import { color } from 'react-native-reanimated';
import { TouchableOpacity } from 'react-native-gesture-handler';
class Device extends Component {
    _isMounted = false;
    _uri = [];
    constructor(props) {
        super(props);
        this.state = {
            error: '',
            loading: false,
            deviceData: {},
            maintenanceData: [],
            page: 1,
            noOfPages: 1,
            error: null,
            refreshing: false,
            addMaintananceVisible: false,
            title: 'Device',
            imageSlider: false,
            imageSliderData: [],
            newMaintenance: { name: null, nameError: '', description: null, images: { uri: [], data: [] } },
            test: '',
            lat: '',
            lng: '',
            editImageView: false,
            editModalVisible: false,
            editMaintenance: null,
            editImageData: [],
        };

        this.addImagesToState = this.addImagesToState.bind(this);
    }

    componentDidMount() {

        this.getLocation();
        this._isMounted = true;
        this.getRemoteData();
        this.getMaintenanceData();

    }
    componentWillUnmount() {
        this._isMounted = false;
    }
    render() {
        const { error, loading } = this.state;
        const { container } = styles;
        const renderItem = ({ item }) => (
            <TouchableOpacity
            onPress={() => { this.navigateToMaintenace(item)}}
            onLongPress={() => { this.openEditModal(item) }}
            ><View>
                    <Item
                        id={item.id}
                        title={item.name}
                        date={item.created_at}
                        subTitle={item.description}
                        images={convertImagesToStringArray(item.images) || []}
                        onPress={() => this.openImageView(convertImagesToStringArray(item.images)|| [])}
                    />
                </View>
            </TouchableOpacity>
        );

        // console.log(this.props);
        return (
            <View>
                <FlatList
                    data={this.state.maintenanceData}
                    renderItem={renderItem}
                    keyExtractor={item => item.id.toString()}
                    // onEndReached={this.handleLoadMore}
                    // ItemSeparatorComponent={this.renderSeparator}
                    ListHeaderComponent={this.renderHeader(this.state.deviceData)}
                    refreshing={this.state.refreshing}
                    onRefresh={this.handleRefresh}
                    // onEndReachedThreshold={0.5}
                    contentContainerStyle={{
                        flexGrow: 1,
                    }}
                    ListFooterComponent={this.renderFooter}
                />
            </View>

        );
    }
    navigateToMaintenace = (item) => {
        this.props.navigation.navigate('Maintenance', { item });
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
    openEditModal = (item) => {
        this.setState({ editMaintenance: item });
        this.setState({ editModalVisible: true });
    }
    getRemoteData = () => {
        const instance = axios.create({
            baseURL: `${API_URL}`
        });
        instance.defaults.headers.common['Authorization'] = `Bearer ${this.props.user.id_token}`;
        instance.defaults.headers.common['Accept'] = 'application/json';
        instance.defaults.headers.common['Content-Type'] = 'application/json';
        // Get Device Data
        this.setState({
            loading: true,
            refreshing: true
        })
        instance.get(`${API_URL}/api/v1/devices/${this.props.route.params.item.id}`).then(result => {
            this.setState({
                deviceData: result.data.data,
                loading: false,
                refreshing: false
            })
        }).catch(error => {
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
    getMaintenanceData = () => {
        const instance = axios.create({
            baseURL: `${API_URL}`
        });
        instance.defaults.headers.common['Authorization'] = `Bearer ${this.props.user.id_token}`;
        instance.defaults.headers.common['Accept'] = 'application/json';
        instance.defaults.headers.common['Content-Type'] = 'application/json';
        // Get Device Data
        this.setState({
            loading: true,
            refreshing: true
        })
        instance.get(`${API_URL}/api/v1/devices/${this.props.route.params.item.id}/maintenances`).then(result => {
            console.log(result);
            this.setState({
                maintenanceData: this.state.page === 1 ? result.data.data : [...this.state.maintenanceData, ...result.data.data],
                noOfPages: result.data.meta.last_page,
                loading: false,
                refreshing: false
            })
        }).catch(error => {
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
    handleRefresh = () => {
        this.setState(
            {
                page: 1,
                noOfPages: 1,
                refreshing: true
            },
            () => {
                this.getRemoteData();
                this.getMaintenanceData();
            }
        );
    };
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
    renderHeader = (device) => {
        const EditModal = this.editModal;
        return <View>
            <View>
                <Header
                    leftComponent={{ icon: 'arrow-back', color: '#fff', onPress: () => this.props.navigation.goBack() }}
                    centerComponent={{ text: this.props.route.params.item.name, style: { color: '#fff' } }}
                    rightComponent={{ icon: 'add', color: '#fff', onPress: () => this.toggleAddMaintenance() }}
                />


            </View>
            <EditModal />
            <Modal visible={this.state.imageSlider} transparent={true}>
                <ImageViewer
                    imageUrls={this.state.imageSliderData}
                    onCancel={() => this.setState({ imageSlider: false })}
                    enableSwipeDown={true}
                    renderFooter={this.state.editImageView ? (currentIndex) => this.renderImageEditFooter(currentIndex) : () => { }}
                />
            </Modal>
            <Card>
                <Card.Title>{device.name}</Card.Title>
                <Text>Serial No :{device.serial_number}</Text>
                <Card.Divider />

                <Text>{device.description}</Text>
                <Card.Divider />
                <Text>Company : {device.customer ? device.customer.name : ''}</Text>
                <Card.Divider />
                <FbGrid
                    style={{ height: 200 }}
                    images={convertImagesToStringArray(this.state.deviceData.images)}
                    onPress={() => { this.openImageView(convertImagesToStringArray(this.state.deviceData.images)) }}
                />
            </Card>
            {this.state.addMaintananceVisible &&

                <Card>
                    <Card.Title>Add Maintenance</Card.Title>
                    <Input
                        placeholder='New Maintenance Name..'
                        errorStyle={{ color: 'red' }}
                        errorMessage={this.state.newMaintenance.nameError}
                        multiline={true}
                        onChangeText={value => this.setState((prv) => {
                            let newMaintenance = Object.assign({}, prv.newMaintenance);
                            newMaintenance.name = value;
                            return { newMaintenance };
                        })}
                    />
                    <Input
                        placeholder='Description'
                        errorStyle={{ color: 'red' }}
                        errorMessage=''
                        multiline={true}
                        onChangeText={value => this.setState((prv) => {
                            let newMaintenance = Object.assign({}, prv.newMaintenance);
                            newMaintenance.description = value;
                            return { newMaintenance };
                        })}
                    />
                    <Text>lat: {this.state.lat}</Text>
                    <Text>lng: {this.state.lng}</Text>
                    <FbGrid style={{ height: 200 }} images={this.state.newMaintenance.images.uri} onPress={() => { this.openImageView(this.state.newMaintenance.images.uri, true) }} />
                    {!this.state.loading ?
                        <View style={{ flexDirection: 'row-reverse' }}>

                            <Icon
                                raised
                                reverse
                                name='input'
                                color='#1565c0'
                                onPress={this.addMaintenace} />
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
    toggleAddMaintenance() {
        this.setState({
            addMaintananceVisible: !this.state.addMaintananceVisible
        });
    }
    removeImageFromMaintenance = (index) => {
        if(this.state.editModalVisible){
            this.state.editMaintenance.images.splice(index, 1);
        }else{
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
        const uri = [...this.state.editMaintenance.images, {full_url: response.uri, data:`data:image/jpeg;base64,${response.data}`}];
        this.setState((prv) => {
            let editMaintenance = Object.assign({}, prv.editMaintenance);
            editMaintenance.images= uri;
            return { editMaintenance };
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
            let imageData = data?data:this.state.newMaintenance.images.data;
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
    editMaintenance = async (data) =>{
        this.setState((prv) => {
            let loading = true;
            let refreshing = true;
            return { loading, refreshing };
        });

        // process images
        const newImageData = [];
        const oldImageUrls = [];
        this.state.editMaintenance.images.forEach(imgObj=>{
            if(imgObj.data){
                newImageData.push(imgObj.data)
            }else {
                oldImageUrls.push(imgObj.url);
            }
        })
        const newImageUrls = newImageData.length>0?await this.uploadImages(newImageData):[];
        const allImageUrls = oldImageUrls.concat(newImageUrls);
        let newdata= data;
        newdata.imageUrls =allImageUrls;
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
        const validate = () =>{
            if(data.name==''){
                nameError ='Name cannot be empty'
            }else {
                nameError =''
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
                            onChangeText={value => {
                                data.name = value;
                            }}
                        />
                        <Input
                            placeholder='Description'
                            errorStyle={{ color: 'red' }}
                            errorMessage=''
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
    },
    buttonGroup: {
        flex: 1,
        flexDirection: 'row',
        justifyContent: 'space-between'
    }
};


const Item = ({ title, subTitle, date, id, images, onPress }) => (
    <Card>
        <Card.Title style={{ textAlign: "left" }}>{title}</Card.Title>
        <Text>{date}</Text>
        <Card.Divider />
        <Text>{subTitle}</Text>
        <FbGrid style={{ height: 100 }} images={images} onPress={onPress} />
    </Card>
);



export { Device };