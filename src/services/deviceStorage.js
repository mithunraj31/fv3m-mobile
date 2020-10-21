
import { AsyncStorage } from 'react-native';

const deviceStorage = {
    async saveItem(key, value) {

        try {
         await AsyncStorage.setItem(key, value);
        } catch (error) {
            console.log('AsyncStorage Error: ' + error.message);
        }
        return value;
    },
    async getItem(key) {
        let value;
        try {
            value = await AsyncStorage.getItem(key);
        } catch (error) {
            console.log('AsyncStorage Error: ' + error.message);
        }
        return value;
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
                        role:role,
                        id_token:value
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
            await AsyncStorage.removeItem('email');
            await AsyncStorage.removeItem('name');
            await AsyncStorage.removeItem('role');
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