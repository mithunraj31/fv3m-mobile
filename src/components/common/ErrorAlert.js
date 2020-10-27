import {Alert} from 'react-native';
const ErrorAlert = ({message}) =>{
    return Alert.alert(
      "Error",
      message,
      [
        { text: "OK"}
      ],
      { cancelable: false }
    );
}

export {ErrorAlert};