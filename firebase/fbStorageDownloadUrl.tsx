import firebase from './firebase/fbConfig';

var storage = firebase.storage();
var storageRef = storage.ref(); 
var imageRef1 = storageRef.child('IMG_8852.MOV')

imageRef1.getDownloadURL().then(function(url) {
console.log(url); 
})