import React, { useState, useEffect } from 'react';
import { Text, View, TouchableOpacity } from 'react-native';
import { homeStyles } from '../../styles/homeStyles';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons'
import SingleVideo from './HomeVideo';

export default function HomeView(props) {

  const [videoData, setVideoData] = useState(null); // videoData passed down from props
  const [uploaded, setUploaded] = useState(false);

  const [muxPlaybackId, setMuxPlaybackId] = useState('');
  const [questionText, setQuestionText] = useState(''); 
  const [shouldPlay, setShouldPlay] = useState(true); 

  const [userCount, setUserCount] = useState(0); 
  const [currentUserVideoCount, setCurrentUserVideoCount] = useState(0); 
  const [userIndex, setUserIndex] = useState(0); 
  const [videoIndex, setVideoIndex] = useState(0);

  const [backArrowColor, setBackArrowColor] = useState('#303030');
  const [forwardArrowColor, setForwardArrowColor] = useState('white'); 
  const [heartIcon, setHeartIcon] = useState('md-heart-empty');

  let recentUpload = 0; 

  // rotate through a user's videos with every press
  const onPress = () => {
    setVideoIndex(videoIndex + 1 === currentUserVideoCount ? 0 : videoIndex + 1); 
  }

  const onPressHeart = () => {  
    setHeartIcon('md-heart')
  }

  // changes in tabs will affect shouldPlay 
  useEffect(() => {
    props.navigation.addListener('blur', () => {
      setShouldPlay(false);
    });

    props.navigation.addListener('focus', () => {
      setShouldPlay(true); 
    });  
  }, [props.navigation])

  // changes in routes
  useEffect(() => {
    let params = props.route.params;
    if (params != undefined){
      if(recentUpload != params.recentUpload){
        recentUpload = params.recentUpload; 
        setMuxPlaybackId(params.muxPlaybackId);
        setQuestionText(params.questionText);        
      }
    }
  }, [props.route])

  // set new muxPlaybackId and questionText with any update to videoIndex and userIndex
  useEffect(() => {
    if(uploaded){
        setMuxPlaybackId(videoData.users[userIndex].userVideos[videoIndex].muxPlaybackId);
        setQuestionText(videoData.users[userIndex].userVideos[videoIndex].videoQuestion.questionText);
      }
  }, [videoIndex, userIndex, uploaded])

  // loading videoData, userCount, currentUserVideoCount, muxPlaybackId, and questionText while mounting
  useEffect(() => {
    setVideoData(props.data);
    setUserCount(props.data.users.length); 
    setCurrentUserVideoCount(props.data.users[0].userVideos.length);
    setMuxPlaybackId(props.data.users[0].userVideos[0].muxPlaybackId);
    setQuestionText(props.data.users[0].userVideos[0].videoQuestion.questionText);
  }, []);

  // setUpload to true once videoData has been mounted
  useEffect(() => {
    setUploaded(true); 
  }, [videoData])

  // changing icons and arrows when moving from user to user
  useEffect(() => {
    setCurrentUserVideoCount(props.data.users[userIndex].userVideos.length);
    setHeartIcon('md-heart-empty');
    setBackArrowColor('white');
    setForwardArrowColor('white');
    if (userIndex === 0) {
      setBackArrowColor('#303030');
    } else if (userIndex === userCount - 1){
      setForwardArrowColor('#303030')
    }
  }, [userIndex])

  // tapping back arrow 
  const goBack = () => {
    if(userIndex !== 0){
      setUserIndex(userIndex - 1);
      setVideoIndex(0); 
    }
  }

  // tapping forward arrow
  const goForward = () => {
    if(userIndex !== userCount - 1){
      setUserIndex(userIndex + 1);
      setVideoIndex(0); 
    }
  }

  return (
    <View style={{ flex: 1}}>
     <TouchableOpacity onPress={onPress} style={{flex: 9}}>  
        <SingleVideo
           key={muxPlaybackId}
           muxPlaybackId={muxPlaybackId}
           shouldPlay={shouldPlay}
        >
        </SingleVideo>
        <BlurView tint="dark" intensity={20} style={homeStyles.questionContainer}>
          <Text style={{fontSize: 18,color: "#eee", padding: 15, textAlign: 'center'}}>{questionText}</Text>
        </BlurView>
      </TouchableOpacity>
      <View style={{flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-around', backgroundColor: '#0e1111'}}>
        <Ionicons name="ios-arrow-round-back" onPress={goBack} size={32} color={backArrowColor} padding={5} />
        <Ionicons name={heartIcon} onPress={onPressHeart} size={32} color="white" />
        <Ionicons name="ios-arrow-round-forward" onPress={goForward} size={32} color={forwardArrowColor} padding={5} />
      </View>
    </View>
  );
}