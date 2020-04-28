import * as firebase from 'firebase'; 

// Set the configuration for your app
var firebaseConfig = {
  apiKey: "AIzaSyCx3IxlGPS63egtQIxAiAP_NLsnwW_k02g",
  authDomain: "dating-app-53644.firebaseapp.com",
  databaseURL: "https://dating-app-53644.firebaseio.com",
  projectId: "dating-app-53644",
  storageBucket: "dating-app-53644.appspot.com",
  messagingSenderId: "275112512169",
  appId: "1:275112512169:web:ec263c8eb9bcf5c5a1f7b8",
  measurementId: "G-EGL5TDBNJB"
};
firebase.initializeApp(firebaseConfig);

export default firebase;