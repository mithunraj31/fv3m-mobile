import axios from 'axios';
import promise from 'promise';

const axiosInteceptor = {
    async loadInstence() {
        // Http inteceptor
        // Add a request interceptor 
        var axiosInstance = axios.create();
        console.log("hellow im axios");
        console.log(await AsyncStorage.getItem('id_token'));
        axiosInstance.interceptors.request.use(function (config) {
            // Do something before request is sent 
            //If the header does not contain the token and the url not public, redirect to login  
            var accessToken = this.state.jwt;

            //if token is found add it to the header
            if (accessToken) {
                if (config.method !== 'OPTIONS') {
                    config.headers.authorization = `Bearer ${accessToken}`;
                    console.log(`Bearer ${accessToken}`)
                    config.headers.accept = 'application/json';
                }
            }
            return config;
        }, function (error) {
            // Do something with request error 
            console.log(error);
            return promise.reject(error);
        });

        this.state.axiosInstance = axiosInstance;
    }
}

export default axiosInteceptor;