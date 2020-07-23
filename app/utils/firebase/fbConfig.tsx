import * as firebase from 'firebase'; 

// Set the configuration for your app
const firebaseConfig = {
    apiKey: "AIzaSyCaXNTEyRQIS9NJfV56PvPXU7rvm82OVFk",
    authDomain: "reeltalk-402aa.firebaseapp.com",
    databaseURL: "https://reeltalk-402aa.firebaseio.com",
    projectId: "reeltalk-402aa",
    storageBucket: "reeltalk-402aa.appspot.com",
    messagingSenderId: "602717352439",
    appId: "1:602717352439:web:04ddfb94ae69256918fef2",
    measurementId: "G-WCDWEF23HM"
  };
  
const firebaseApp = firebase.initializeApp(firebaseConfig);

export default firebaseApp; 