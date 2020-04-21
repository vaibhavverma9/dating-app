import React, { useState } from 'react';
import { Image, Platform, StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import { Video } from 'expo-av';   
import firebase from './config/fbConfig';

export default function App() {
  var playbackObject; 

  const videos = ['https://stream.mux.com/mi00csRmf5dlTPZXB3102RNd5LWl4twN3sBfQMQpe4vUk.m3u8',
                  'https://stream.mux.com/sAGaxbuUsS8o5oQt6A9CAGnVsN026B011EjZ02GeZnVqLU.m3u8',
                  'https://stream.mux.com/8hfLK3MkXGDa380002B6ZyOVOVttBRAEL1l015eG7FjUrI.m3u8']

  const [videoIndex, setVideoIndex] = useState(0);

  var storage = firebase.storage();
  var storageRef = storage.ref(); 
  // var imageRef1 = storageRef.child('IMG_8852.MOV')
  // var imageRef2 = storageRef.child('IMG_8853.MOV')
  // var imageRef3 = storageRef.child('IMG_8865.MOV')

  _handleVideoRef = component => {
    this.playbackObject = component;
  };

  // imageRef1.getDownloadURL().then(function(url) {
  //   console.log(url); 
  // })
  // imageRef2.getDownloadURL().then(function(url) {
  //   console.log(url); 
  // })
  // imageRef3.getDownloadURL().then(function(url) {
  //   console.log(url); 
  // })


  const onPress = () => {
    console.log("onPress");
    setVideoIndex(videoIndex + 1 === videos.length ? 0 : videoIndex + 1)
    console.log(videoIndex);
    this.playbackObject.replayAsync()
  }

  return (
    <View>
      <TouchableOpacity onPress={onPress}>
        <Video
            source={{ uri: videos[videoIndex]}}
            ref={this._handleVideoRef}
            rate={1.0}
            volume={1.0}
            isMuted={false}
            resizeMode="cover"
            usePoster={true}
            shouldPlay
            isLooping
            style={{ width: '100%', height: '90%'}}
          />

      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  logo: {
    width: 305,
    height: 159,
    marginBottom: 10,
  },
  instructions: {
    color: '#888',
    fontSize: 18,
    marginHorizontal: 15,
  }, 
  button: {
    backgroundColor: "blue",
    padding: 20,
    borderRadius: 5,
  },
  buttonText: {
    fontSize: 20,
    color: '#fff',
  }, 
  thumbnail: {
    width: 300,
    height: 300,
    resizeMode: "contain"
  },
});
