import React, { useState, useEffect, useContext, useRef } from 'react';
import { Text, View } from 'react-native';
import { homeStyles } from '../../styles/homeStyles';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons'
import { useMutation } from '@apollo/client';
import { INSERT_LIKE, GET_LIKE, client, GET_VIDEOS, INSERT_USER, UPDATE_LIKE, GET_NUMBER_VIDEOS } from '../../utils/graphql/GraphqlClient';
import OptionsModal from './OptionsModal'; 
import { UserIdContext } from '../../utils/context/UserIdContext'
import * as Segment from 'expo-analytics-segment';
import { _retrieveUserId, _storeUserId, _retrieveDoormanUid, _storeDoormanUid, _retrieveLatitude, _retrieveLongitude } from '../../utils/asyncStorage'; 
import { useDoormanUser } from 'react-native-doorman'
import AddVideoPopup from '../modals/AddVideoPopup'; 
import { PanResponder } from 'react-native'; 
import AnimatedBar from "react-native-animated-bar";
import MultipleVideos from '../videosPage/MultipleVideos'; 
import { LocationContext } from '../../utils/context/LocationContext';

export default function HomeView(props) {

  const [videoData, setVideoData] = useState(null); // videoData passed down from props

  const [muxPlaybackId, setMuxPlaybackId] = useState('');
  const [questionText, setQuestionText] = useState(''); 
  const [shouldPlay, setShouldPlay] = useState(true); 

  const [userCount, setUserCount] = useState(0); 
  const [currentUserVideoCount, setCurrentUserVideoCount] = useState(0); 
  const [userIndex, setUserIndex] = useState(0); 
  const [videoIndex, setVideoIndex] = useState(0);
  const [flags, setFlags] = useState(0); 
  const [videoId, setVideoId] = useState(0); 

  const [profileVideoCount, setProfileVideoCount] = useState(null); 
  const [addPopupVisible, setAddPopupVisible] = useState(false); 
  const [addPopupShown, setAddPopupShown] = useState(false); 

  const [heartColor, setHeartColor] = useState('white');
  const [likedIndexes, setLikedIndexes] = useState([]); 


  const [insertLike, { insertLikeData }] = useMutation(INSERT_LIKE);
  const [insertUser, { insertUserData }] = useMutation(INSERT_USER); 
  const [updateLike, { updateLikeData }] = useMutation(UPDATE_LIKE); 
  const [currentUserId, setCurrentUserId] = useState(0); 
  const [userId, setUserId] = useContext(UserIdContext);
  const [location, setLocation] = useContext(LocationContext); 

  const [optionsModalVisible, setOptionsModalVisible] = useState(false); 
  const { uid, phoneNumber } = useDoormanUser();

  let playbackObject = useRef(null); 

  const _panResponder = PanResponder.create({
    onStartShouldSetPanResponder: (evt, gestureState) => true,
    onStartShouldSetPanResponderCapture: (evt, gestureState) => true,
    onMoveShouldSetPanResponder: (evt, gestureState) => {},
    onMoveShouldSetPanResponderCapture: (evt, gestureState) => {},

    onPanResponderGrant: (evt, gestureState) => {},
    onPanResponderMove: (evt, gestureState) => {},
    onPanResponderTerminationRequest: (evt, gestureState) => true,
    onPanResponderRelease: (evt, gestureState) => {
      
        if(gestureState.dx > 20){
          lastUser();
        } else if(gestureState.dx < -20){
          nextUser(); 
        } else {
          if(evt.nativeEvent.locationX < 50){
            lastVideo(); 
          } else {
            nextVideo(); 
          }
        }
    },
    onPanResponderTerminate: (evt, gestureState) => {},
    onShouldBlockNativeResponder: (evt, gestureState) => true
  });

  useEffect(() => {
    Segment.screen('Home'); 
    queryVideos(userId); 
    // queryVideosNearby(userId); 
    countProfileVideos(userId); 
  }, []);

  function countProfileVideos(userId){
    client.query({ query: GET_NUMBER_VIDEOS, variables: { userId }})
    .then(response => {
      const profileVideoCount = response.data.videos_aggregate.aggregate.count; 
      setProfileVideoCount(profileVideoCount); 
    })
  }

  function queryVideos(userId){
    console.log("queryVideos")
    client.query({ query: GET_VIDEOS, variables: { userId: userId } })
    .then((response) => {
      setVideoData(response.data);
      if(response.data.users.length > 0){
        setCurrentUserId(response.data.users[0].id); 
        setUserCount(response.data.users.length); 
        setCurrentUserVideoCount(response.data.users[0].userVideos.length);
        setMuxPlaybackId(response.data.users[0].userVideos[0].muxPlaybackId);
        setQuestionText(response.data.users[0].userVideos[0].videoQuestion.questionText);  
      } 
    })
    .catch((error) => {
      console.log(error);
      return 0; 
    });
  }

  // async function queryVideosNearby(userId){
  //   console.log("queryVideosNearby"); 
  //   console.log(location); 
  //   const point = {
  //       "type" : "Point", 
  //       "coordinates": [location[0], location[1]]
  //   }; 

  //   client.query({ query: GET_VIDEOS_NEARBY, variables: { userId, point }})
  //   .then(response => {
  //     if(response.data.users.length > 0){
  //       setVideoData(response.data); 
  //       setCurrentUserId(response.data.users[0].id); 
  //       setUserCount(response.data.users.length); 
  //       setCurrentUserVideoCount(response.data.users[0].userVideos.length);
  //       setMuxPlaybackId(response.data.users[0].userVideos[0].muxPlaybackId);
  //       setQuestionText(response.data.users[0].userVideos[0].videoQuestion.questionText);  
  //     } 
  //   })
  //   .catch((error) => {
  //     console.log("error"); 
  //     console.log(error);
  //   });
  // }

  // changes in tabs will affect shouldPlay 
  useEffect(() => {
    props.navigation.addListener('blur', () => {
      setShouldPlay(false);
    });

    props.navigation.addListener('focus', () => {
      setShouldPlay(true); 
    });  
  }, [props.navigation])
  
  const onPressHeart = async () => { 
      setHeartColor("#734f96"); 
      setLikedIndexes([...likedIndexes, userIndex]); 
      
      if(profileVideoCount == 0 && addPopupShown == false){
        setAddPopupVisible(true); 
        setAddPopupShown(true); 
      }

      if(userId != currentUserId){
        client.query({ query: GET_LIKE, variables: { likerId: currentUserId, likedId: userId}})
        .then(response => {
          if(response.data.likes.length == 0){
            insertLike({ variables: { likedId: currentUserId, likerId: userId, matched: false }});
          } else {
            // current video user has already liked device user
  
            // check if device user has already liked current video user
            client.query({ query: GET_LIKE, variables: { likerId: userId, likedId: currentUserId}})
            .then(response => {
              if(response.data.likes.length == 0){
                updateLike({ variables: { likedId: userId, likerId: currentUserId, matched: true}})
                insertLike({ variables: { likedId: currentUserId, likerId: userId, matched: true }});    
              } else{
                console.log("user has already liked this person!"); 
              }
            })
  
          }
        })
        .catch(error => console.log(error));
      }

    Segment.track("Like User"); 

  }

  // set new muxPlaybackId and questionText with any update to videoIndex, userIndex or videoData
  useEffect(() => {
    if(videoData && videoData.users.length > 0){
      setCurrentUserId(videoData.users[userIndex].id); 
      setUserCount(videoData.users.length); 
      setCurrentUserVideoCount(videoData.users[userIndex].userVideos.length);
      setMuxPlaybackId(videoData.users[userIndex].userVideos[videoIndex].muxPlaybackId);
      setQuestionText(videoData.users[userIndex].userVideos[videoIndex].videoQuestion.questionText);
      setFlags(videoData.users[userIndex].userVideos[videoIndex].flags); 
      setVideoId(videoData.users[userIndex].userVideos[videoIndex].id); 
    }
  }, [videoIndex, userIndex, videoData])

  // changing icons and arrows when moving from user to user
  useEffect(() => {
    console.log(userIndex, likedIndexes); 
    if(likedIndexes.includes(userIndex)){
      setHeartColor("#734f96"); 
    } else {
      setHeartColor('#eee'); 
    }
  }, [userIndex])

  // tapping back arrow 
  const lastUser = () => {
    setCurrentProgress(0); 
    if(userIndex !== 0){
      setUserIndex(userIndex - 1);
      setVideoIndex(0); 
    }
    Segment.track('Home - Last User');
  }

  // tapping forward arrow
  const nextUser = () => {
    setCurrentProgress(0); 
    if(userIndex !== userCount - 1){
      setUserIndex(userIndex + 1);
      setVideoIndex(0); 
    }
    Segment.track('Home - Next User'); 
  }

  // rotate through a user's videos with every press
  const nextVideo = () => {
    setCurrentProgress(0); 
    if(videoIndex + 1 !== currentUserVideoCount){
      setVideoIndex(videoIndex + 1); 
    }else {
      nextUser(); 
    }
    Segment.track("Home - Next Video"); 
  }

  const lastVideo = () => {
    setCurrentProgress(0); 
    if(videoIndex == 0){
      lastUser(); 
    } else {
      setVideoIndex(videoIndex - 1); 
    }
    Segment.track("Home - Last Video"); 
  }
  

  const moreOptions = () => {
    setOptionsModalVisible(true); 
  }

  function goToAddVideo(){
    setAddPopupVisible(false); 
    props.navigation.navigate('Add');
  }

  const [currentProgress, setCurrentProgress] = useState(0); 

  const progressBarWidth = () => {
    switch(currentUserVideoCount) {
      case 1: return '100%';
      case 2: return '50%'; 
      case 3: return '33.3%';
      case 4: return '25%'; 
    }
  }

  function ProgressBarsContainer () {

    const width = progressBarWidth(); 
    return (
        <View style={homeStyles.progressBarContainer}>
          {initAnimatedBars(width)}
        </View>
    )
  }

  function initAnimatedBars(width) {
    const animatedBars = []; 

    for (let i = 0; i < currentUserVideoCount; i++){
      if(i < videoIndex){
        animatedBars.push(
          <AnimatedBar 
            key={i}
            style={{ width }}
            progress={1}
            fillColor="#E6E6FA"
            barColor="#734f96"
            height={5}
            duration={50}
          />  
        )
      } else if (i == videoIndex) {
        animatedBars.push(
          <AnimatedBar 
            key={i}
            style={{ width }}
            progress={currentProgress}
            fillColor="#E6E6FA"
            barColor="#734f96"
            height={5}
            duration={50}
          />  
        )
      } else {
        animatedBars.push(
          <AnimatedBar 
            key={i}
            style={{ width }}
            progress={0}
            fillColor="#E6E6FA"
            barColor="#734f96"
            height={5}
            duration={50}
          />  
        )
      }
    }
    return animatedBars;
  }
  
  const _onPlaybackStatusUpdate = playbackStatus => {
    const progress = playbackStatus.positionMillis / playbackStatus.durationMillis; 
    setCurrentProgress(progress); 
  };

  return (
    <View style={{ flex: 1}}>
      <View style={{ flex: 9 }} >
        <MultipleVideos 
          key={Math.floor(userIndex / 3)} 
          source={'https://stream.mux.com/' + muxPlaybackId + '.m3u8'}
          shouldPlay={shouldPlay}
          playbackObject={playbackObject}
          _onPlaybackStatusUpdate={_onPlaybackStatusUpdate}
          videoData={videoData}
          userIndex={userIndex}
          videoIndex={videoIndex}
          currentUserVideoCount={currentUserVideoCount}
        >
        </MultipleVideos>

        {/* <SingleVideo
              key={muxPlaybackId}
              source={'https://stream.mux.com/' + muxPlaybackId + '.m3u8'}
              shouldPlay={shouldPlay}
              playbackObject={playbackObject}
              _onPlaybackStatusUpdate={_onPlaybackStatusUpdate}
        >
        </SingleVideo>           */}
        <ProgressBarsContainer />
        <BlurView tint="dark" intensity={20} style={homeStyles.questionContainer}>
          <Text style={{fontSize: 18,color: "#eee", padding: 15, textAlign: 'center'}}>{questionText}</Text>
        </BlurView>
        <View style={{ position: 'absolute', height: '90%', left: 0, right: 0, top:0}} {..._panResponder.panHandlers}>
        </View>
        <View style={{ position: 'absolute', left: 0, right: 0, bottom: 0, alignItems: 'center', padding: 20, flexDirection: 'row', justifyContent: 'space-evenly'}}>
            <Ionicons name='ios-more' onPress={moreOptions} size={30} color="#eee" />        
            <Ionicons name='md-heart' onPress={onPressHeart} size={45} color={heartColor} />        
        </View>
     </View>
      <OptionsModal 
        visible={optionsModalVisible} 
        setVisible={setOptionsModalVisible} 
        videoId={videoId} 
        flags={flags}
        userId={userId}
        currentUserId={currentUserId}
        videoData={videoData}
        setVideoData={setVideoData}
      />
      <AddVideoPopup
        visible={addPopupVisible}
        setVisible={setAddPopupVisible}
        goToAddVideo={goToAddVideo}
      />
    </View>
  );
}