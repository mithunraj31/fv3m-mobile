
import { AsyncStorage } from 'react-native';

const deviceStorage = {
    async saveItem(key, value) {
        try {
            await AsyncStorage.setItem(key, value);
        } catch (error) {
            console.log('AsyncStorage Error: ' + error.message);
        }
    },
    async loadJWT() {
        try {
            const value = await AsyncStorage.getItem('id_token');
            const email = await AsyncStorage.getItem('email');
            const name = await AsyncStorage.getItem('name');
            const role = await AsyncStorage.getItem('role');
            if (value) {
                this.setState({
                    jwt: value,
                    user: {
                        name:name,
                        email:email,
                        role:role
                    },
                    loading: false
                });
            } else {
                this.setState({
                    loading: false
                });
            }
        } catch (error) {
            console.log('AsyncStorage Error: ' + error.message);
        }
    },
    async deleteJWT() {
        try {
            await AsyncStorage.removeItem('id_token')
                .then(
                    () => {
                        this.setState({
                            jwt: ''
                        })
                    }
                );
        } catch (error) {
            console.log('AsyncStorage Error: ' + error.message);
        }
    }
};


export default deviceStorage;