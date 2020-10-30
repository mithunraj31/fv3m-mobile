import React, { Component } from 'react';
import { View, Text, Modal, FlatList, ActivityIndicator, TouchableOpacity,} from 'react-native';
import { ErrorAlert, convertImagesToStringArray, convertImagesToUriArray, Loading } from '../components/common'
import { Icon, Input, Card, Header } from 'react-native-elements'
import axios from 'axios';
import { API_URL } from "../../env";
import { FbGrid } from '../components/common/FBGrid'
var ImagePicker = require('react-native-image-picker');

import ImageViewer from 'react-native-image-zoom-viewer';
import { ScrollView } from 'react-native-gesture-handler';
class Maintenance extends Component {
    _isMounted = false;
    _uri = [];
    constructor(props) {
        super(props);
        this.state = {
            error: '',
            loading: false,
            maintenanceData: {},
            memoData: [],
            page: 1,
            noOfPages: 1,
            error: null,
            refreshing: false,
            addMemoVisible: false,
            title: 'Maintenance',
            imageSlider: false,
            imageSliderData: [],
            newMemo: { name: null, descError: '', description: null, images: { uri: [], data: [] } },
            test: '',
            lat: '',
            lng: '',
            editImageView: false,
            editModalVisible: false,
            editMemo: null,
            editImageData: []
        };

        this.addImagesToState = this.addImagesToState.bind(this);
    }

    componentDidMount() {

        this.getLocation();
        this._isMounted = true;
        this.getRemoteData();
        this.getMemeoData();

    }
    componentWillUnmount() {
        this._isMounted = false;
    }
    render() {
        const { error, loading } = this.state;
        const { container } = styles;
        const renderItem = ({ item }) => (
            <TouchableOpacity onLongPress={() => this.openEditModal(item)}>
                <Item
                    id={item.id}
                    title={item.description}
                    date={item.created_at}
                    user={item.user?item.user.name:''}
                    images={convertImagesToStringArray(item.images) || []}
                    onPress={() => this.openImageView(convertImagesToStringArray(item.images))}
                />
            </TouchableOpacity>
        );

        // console.log(this.props);
        return (
            <View>
                <FlatList
                    data={this.state.memoData}
                    renderItem={renderItem}
                    keyExtractor={item => item.id.toString()}
                    // onEndReached={this.handleLoadMore}
                    // ItemSeparatorComponent={this.renderSeparator}
                    ListHeaderComponent={this.renderHeader(this.state.maintenanceData)}
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
        this.setState({ editMemo: item });
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
        instance.get(`${API_URL}/api/v1/maintenances/${this.props.route.params.item.id}`).then(result => {
            console.log(result.data)
            this.setState({
                maintenanceData: result.data.data,
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
    getMemeoData = () => {
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
        instance.get(`${API_URL}/api/v1/maintenances/${this.props.route.params.item.id}/memos`).then(result => {
            console.log(result);
            this.setState({
                memoData: this.state.page === 1 ? result.data.data : [...this.state.memoData, ...result.data.data],
                noOfPages: result.data.meta.last_page,
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
    handleRefresh = () => {
        this.setState(
            {
                page: 1,
                noOfPages: 1,
                refreshing: true
            },
            () => {
                this.getRemoteData();
                this.getMemeoData();
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
                onPress={() => { this.removeImageFromMemo(currentIndex) }} />
        </View>
    }
    renderHeader = (maintenance) => {
        const EditModal = this.editModal;
        return <View>
            <View>
                <Header
                    leftComponent={{ icon: 'arrow-back', color: '#fff', onPress: () => this.props.navigation.goBack() }}
                    centerComponent={{ text: 'Maintenance', style: { color: '#fff' } }}
                    rightComponent={{ icon: 'add', color: '#fff', onPress: () => this.toggleAddMemo() }}
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
                <Card.Title>{maintenance.name}</Card.Title>
                <Text>{maintenance.description}</Text>
                <Card.Divider />
                <Text>User: {maintenance.user?maintenance.user.name:''}</Text>
                <Card.Divider />
                <Text>Device : {maintenance.device?maintenance.device.name:''}</Text>
                <Card.Divider />
                <Text>Created at : {maintenance.created_at}</Text>
                <FbGrid
                    style={{ height: 200 }}
                    images={convertImagesToStringArray(this.state.maintenanceData.images)}
                    onPress={() => { this.openImageView(convertImagesToStringArray(this.state.maintenanceData.images)) }}
                />
            </Card>
            {this.state.addMemoVisible &&

                <Card>
                    <Card.Title>Add Memo</Card.Title>
                    <Input
                        placeholder='Description'
                        errorStyle={{ color: 'red' }}
                        errorMessage={this.state.newMemo.descError}
                        ref={this.state.newMemo.description}
                        multiline={true}
                        onChangeText={value => this.setState((prv) => {
                            let newMemo = Object.assign({}, prv.newMemo);
                            newMemo.description = value;
                            return { newMemo };
                        })}
                    />
                    <Text>lat: {this.state.lat}</Text>
                    <Text>lng: {this.state.lng}</Text>
                    <FbGrid style={{ height: 200 }} images={this.state.newMemo.images.uri} onPress={() => { this.openImageView(this.state.newMemo.images.uri, true) }} />
                    {!this.state.loading ?
                        <View style={{ flexDirection: 'row-reverse' }}>

                            <Icon
                                raised
                                reverse
                                name='input'
                                color='#1565c0'
                                onPress={this.addMemo} />
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
    toggleAddMemo() {
        this.setState({
            addMemoVisible: !this.state.addMemoVisible
        });
    }
    removeImageFromMemo = (index) => {
        if(this.state.editModalVisible){
            this.state.editMemo.images.splice(index, 1);
        }else{
            this.state.newMemo.images.data.splice(index, 1);
            this.state.newMemo.images.uri.splice(index, 1);
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
        const uri = [...this.state.newMemo.images.uri, response.uri];
        const data = [...this.state.newMemo.images.data, `data:image/jpeg;base64,${response.data}`];
        this.setState((prv) => {
            let newMemo = Object.assign({}, prv.newMemo);
            newMemo.images.uri = uri;
            newMemo.images.data = data;
            return { newMemo };
        })
    }
    addImagesToEditState = async (response) => {
        const uri = [...this.state.editMemo.images, {full_url: response.uri, data:`data:image/jpeg;base64,${response.data}`}];
        this.setState((prv) => {
            let editMemo = Object.assign({}, prv.editMemo);
            editMemo.images= uri;
            return { editMemo };
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
    clearnewMemo = () => {
        this.setState({
            newMemo: {
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
            this.setState({
                lat: success.coords.latitude,
                lng: success.coords.longitude
            })
        });
    }
    addMemo = async () => {
        this.setState((prv) => {
            let loading = true;
            let refreshing = true;
            let newMemo = Object.assign({}, prv.newMemo);
            newMemo.descError = '';
            return { loading, refreshing, newMemo };
        });
        //Validating
        if (this.state.newMemo.name == '') {
            return this.setState((prv) => {
                let loading = false;
                let refreshing = false;
                let newMemo = Object.assign({}, prv.newMemo);
                newMemo.descError = 'Description cannot be empty';
                return { loading, refreshing, newMemo };
            });
        }
        let imageUrls = [];
        if (this.state.newMemo.images.uri.length > 0) {
            imageUrls = await this.uploadImages();
        }
        const data = {
            name: this.state.newMemo.name,
            description: this.state.newMemo.description,
            lat: this.state.lat,
            lng: this.state.lng,
            maintenance_id: this.props.route.params.item.id,
            imageUrls: imageUrls

        }
        const instance = axios.create({
            baseURL: `${API_URL}`
        });
        instance.defaults.headers.common['Authorization'] = `Bearer ${this.props.user.id_token}`;
        instance.defaults.headers.common['Accept'] = 'application/json';
        instance.defaults.headers.common['Content-Type'] = 'application/json';

        instance.post(`${API_URL}/api/v1/memos`, data).then(result => {
            this.setState({
                loading: false,
                refreshing: false,
                addMemoVisible: false
            });
            this.clearnewMemo();
            this.handleRefresh();
        }).catch(error => {
            console.log(error.response);
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
    uploadImages = (data) => {
        return new Promise((resolve, reject) => {

            const instance = axios.create({
                baseURL: `${API_URL}`
            });
            instance.defaults.headers.common['Authorization'] = `Bearer ${this.props.user.id_token}`;
            instance.defaults.headers.common['Accept'] = 'application/json';
            instance.defaults.headers.common['Content-Type'] = 'application/json';

            const promiseArray = [];
            let imageData = data?data:this.state.newMemo.images.data;
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
                    ErrorAlert({ message: error.message });
                    reject(error);
                })
            }
        });


    }
    editMemo = async (data) =>{
        this.setState((prv) => {
            let loading = true;
            let refreshing = true;
            return { loading, refreshing };
        });

        // process images
        const newImageData = [];
        const oldImageUrls = [];
        this.state.editMemo.images.forEach(imgObj=>{
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
        console.log(newdata);
        //end of image process
        // Update maintenance
        const instance = axios.create({
            baseURL: `${API_URL}`
        });
        instance.defaults.headers.common['Authorization'] = `Bearer ${this.props.user.id_token}`;
        instance.defaults.headers.common['Accept'] = 'application/json';
        instance.defaults.headers.common['Content-Type'] = 'application/json';

        instance.put(`${API_URL}/api/v1/memos/${data.id}`, newdata).then(result => {
            this.setState({
                loading: false,
                refreshing: false,
                editModalVisible: false
            });
            this.clearnewMemo();
            this.handleRefresh();
        }).catch(error => {
            if (error.response && error.response.status == 401) {
                ErrorAlert({ message: "Token Expired Please Login again!" });
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
        const item = this.state.editMemo;
        let data;
        let descError = '';
        const validate = () =>{
            if(data.name==''){
                descError ='Decription cannot be empty'
            }else {
                descError =''
                this.editMemo(data);
            }

        }
        if (item) {
            descError = '';
            data = {
                id: item.id,
                name: item.name,
                description: item.description,
                imageUrls: convertImagesToStringArray(item.images),
                lat: item.lat,
                lng: item.lng
            }
            return <Modal
                animationType="slide"
                visible={this.state.editModalVisible}
                transparent={false}
                presentationStyle='overFullScreen'

            ><Header
                    centerComponent={{ text: 'Edit Memo', style: { color: '#fff' } }}
                    rightComponent={{ icon: 'close', color: '#fff', onPress: () => this.setState({ editModalVisible: false }) }}
                />
                <ScrollView>
                <View >
                    <Card >
                        <Input
                            placeholder='Description'
                            errorStyle={{ color: 'red' }}
                            errorMessage={descError}
                            defaultValue={item.description}
                            multiline={true}
                            onChangeText={value => {
                                data.description = value;
                            }}
                        />
                        <Text>lat: {data.lat}</Text>
                        <Text>lng: {data.lng}</Text>
                        <FbGrid 
                        style={{ height: 200 }} 
                        images={convertImagesToStringArray(this.state.editMemo.images)} 
                        onPress={() => { this.openImageView(convertImagesToStringArray(this.state.editMemo.images), true) }} />
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


const Item = ({ title, user, date, id, images, onPress }) => (
    <Card>
        <Card.Title style={{ textAlign: "left" }}>{title}</Card.Title>
        <Text>User : {user}</Text>
        <Card.Divider />
        <Text>Created at : {date}</Text>
        <FbGrid style={{ height: 100 }} images={images} onPress={onPress} />
    </Card>
);



export { Maintenance };