import React, { useState, useEffect, useContext, useRef } from 'react';
import { Text, View, ActivityIndicator } from 'react-native';
import { homeStyles } from '../../styles/homeStyles';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons'
import { useMutation } from '@apollo/client';
import { INSERT_LIKE, GET_LIKE, client, GET_VIDEOS, INSERT_USER, UPDATE_LIKE, GET_NUMBER_VIDEOS, UPDATE_PUSH_TOKEN, GET_USER_INFO, UPDATE_VIDEO_LIKES, UPDATE_VIDEO_VIEWS, GET_GENDER_INTEREST, GET_VIDEOS_WOMAN, GET_VIDEOS_MAN, GET_VIDEOS_NEARBY } from '../../utils/graphql/GraphqlClient';
import OptionsModal from './OptionsModal'; 
import { UserIdContext } from '../../utils/context/UserIdContext'
import * as Segment from 'expo-analytics-segment';
import { _retrieveUserId, _storeUserId, _retrieveDoormanUid, _storeDoormanUid, _retrieveLatitude, _retrieveLongitude, _retrieveName, _retrievePushShown, _storePushShown, _storeName, _storeBio, _retrieveBio, _retrieveGenderInterest, _storeGenderInterest, _storeLastWatchedUpper, _storeLastWatchedLower, _retrieveLastWatchedUpper, _retrieveLastWatchedLower } from '../../utils/asyncStorage'; 
import AddVideoPopup from '../modals/AddVideoPopup'; 
import PushPopup from '../modals/PushPopup'; 
import { PanResponder } from 'react-native'; 
import AnimatedBar from "react-native-animated-bar";
import MultipleVideos from '../videosPage/MultipleVideos'; 
import { LocationContext } from '../../utils/context/LocationContext';
import { useDoormanUser } from 'react-native-doorman'
import { Notifications } from 'expo';
import Constants from 'expo-constants';
import * as Permissions from 'expo-permissions';
import axios from 'axios';
import * as Network from 'expo-network';
import { TouchableOpacity } from 'react-native-gesture-handler';
import SingleVideo from '../videosPage/SingleVideo';

export default function HomeContents(props) {

  const { uid, phoneNumber } = useDoormanUser();
  const [videoData, setVideoData] = useState(null); 
  const limit = 4;
  const [questionText, setQuestionText] = useState(''); 
  const [shouldPlay, setShouldPlay] = useState(true); 

  const [userCount, setUserCount] = useState(0); 
  const [currentUserVideoCount, setCurrentUserVideoCount] = useState(0); 
  const [currentUserId, setCurrentUserId] = useState(0); 

  const [currentName, setCurrentName] = useState('');
  const [currentCity, setCurrentCity] = useState('');
  const [currentRegion, setCurrentRegion] = useState('');
  
  const [userId, setUserId] = useContext(UserIdContext);
  const [name, setName] = useState(''); 
  const [userIndex, setUserIndex] = useState(0); 
  const [videoIndex, setVideoIndex] = useState(0);
  const [flags, setFlags] = useState(0); 
  const [videoId, setVideoId] = useState(0); 
  const [lastUploaded, setLastUploaded] = useState(null); 
  const [querying, setQuerying] = useState(false); 
  const [initialized, setInitialized] = useState(false); 
  const [nearbyResults, setNearbyResults] = useState(true); 
  const [muxPlaybackId, setMuxPlaybackId] = useState(''); 

  const [profileVideoCount, setProfileVideoCount] = useState(null); 
  const [addPopupVisible, setAddPopupVisible] = useState(false); 

  const [expoPushToken, setExpoPushToken] = useState(''); 
  const [pushPopupShown, setPushPopupShown] = useState(false); 
  const [pushPopupVisible, setPushPopupVisible] = useState(false);

  const [heartColor, setHeartColor] = useState('white');
  const [likedIndexes, setLikedIndexes] = useState([]); 

  const [insertLike, { insertLikeData }] = useMutation(INSERT_LIKE);
  const [insertUser, { insertUserData }] = useMutation(INSERT_USER); 
  const [updateLike, { updateLikeData }] = useMutation(UPDATE_LIKE); 
  const [updatePushToken, { updatePushTokenData }] = useMutation(UPDATE_PUSH_TOKEN); 
  const [updateVideoLikes, { updateVideoLikesData }] = useMutation(UPDATE_VIDEO_LIKES); 
  const [updateVideoViews, { updateVideoViewsData }] = useMutation(UPDATE_VIDEO_VIEWS); 

  const [optionsModalVisible, setOptionsModalVisible] = useState(false); 

  const [genderInterest, setGenderInterest] = useState(null);
  const [lastWatchedUpper, setLastWatchedUpper] = useState(null); 
  const [lastWatchedLower, setLastWatchedLower] = useState(null); 

  let playbackObject = useRef(null); 

  const [connectedInternet, setConnectedInternet] = useState(true); 

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
          if(evt.nativeEvent.pageX < 50){
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
    queryVideosGenderInterest();
    initSegment(); 
    countProfileVideos(userId); 
    networkConnected(); 
  }, []);

  async function networkConnected(){
    const networkInfo = await Network.getNetworkStateAsync(); 
    setConnectedInternet(networkInfo.isConnected); 
  }

  function reload(){
    setConnectedInternet(true); 
    queryVideosGenderInterest();
    initSegment(); 
    networkConnected(); 
  }

  async function queryVideosGenderInterest(){
    let genderInterest = await _retrieveGenderInterest(); 
    if(genderInterest == ''){
      client.query({ query: GET_GENDER_INTEREST, variables: { userId }})
      .then(response => {
        genderInterest = response.data.users[0].genderInterest; 
        _storeGenderInterest(genderInterest); 
      })
    } else {
      setGenderInterest(genderInterest); 
    }

    // let lastWatchedUpper = await _retrieveLastWatchedUpper(); 
    // let lastWatchedLower = await _retrieveLastWatchedLower(); 

    queryVideos(userId, limit, lastUploaded, genderInterest, nearbyResults);
  }

  async function initSegment() {
    let name = await _retrieveName(); 
    let bio = await _retrieveBio(); 
    if(name == '' || bio == ''){
      client.query({ query: GET_USER_INFO, variables: { userId }})
      .then(response => {


        if(response.data.users[0].firstName && name == ''){
          name = response.data.users[0].firstName; 
          setName(name); 
          _storeName(name); 
        };

        if(response.data.users[0].bio && bio == ''){
          bio = response.data.users[0].bio; 
          _storeBio(bio); 
        }

        Segment.identifyWithTraits(userId.toString(), {'name' : name, 'phoneNumber' : phoneNumber});
        Segment.screen('Home');   
      })
    } else {
      setName(name); 
      Segment.identifyWithTraits(userId.toString(), {'name' : name, 'phoneNumber' : phoneNumber});
      Segment.screen('Home'); 
    }
  }

  function countProfileVideos(userId){
    client.query({ query: GET_NUMBER_VIDEOS, variables: { userId }})
    .then(response => {
      const profileVideoCount = response.data.videos_aggregate.aggregate.count; 
      setProfileVideoCount(profileVideoCount); 
    })
  }

  async function queryVideos(userId, limit, lastUploaded, genderInterest, nearbyResults){

    const latitude = await _retrieveLatitude();
    const longitude = await _retrieveLongitude();  

    const point = {
        "type" : "Point", 
        "coordinates": [latitude, longitude]
    }; 

    let notIntoGender = ''; 
    if(genderInterest == "Women"){
      notIntoGender = 'Man'; 
    } else if(genderInterest == 'Men'){
      notIntoGender = 'Woman'; 
    }

    if(nearbyResults){
      client.query({ query: GET_VIDEOS_NEARBY, variables: { userId, limit, lastUploaded, notIntoGender, point } })
      .then((response) => {

        if(!initialized){
          if(response.data.users.length > 0){
            setInitialized(true); 
            setVideoData(response.data);
            setCurrentUserId(response.data.users[0].id); 
            setCurrentName(response.data.users[0].firstName);
            setCurrentCity(response.data.users[0].city);
            setCurrentRegion(response.data.users[0].region);
  
            setMuxPlaybackId(response.data.users[0].userVideos[0].muxPlaybackId); 
            setUserCount(response.data.users.length); 
            setLastUploaded(response.data.users[response.data.users.length - 1].lastUploaded)
            setCurrentUserVideoCount(response.data.users[0].userVideos.length);
            setQuestionText(response.data.users[0].userVideos[0].videoQuestion.questionText);  
          } else {
            setNearbyResults(false); 
            queryVideos(userId, limit, lastUploaded, genderInterest, false); 
          }   
        } else {
          const tempVideoData = { users: [...videoData.users, ...response.data.users] }
          setVideoData(tempVideoData);
          setUserCount(userCount + response.data.users.length); 
  
          if(response.data.users.length == 0){
            setQuerying(true); 
          } else {
            setLastUploaded(response.data.users[response.data.users.length - 1].lastUploaded);
            setQuerying(false);   
          }
        }
      })
      .catch((error) => {
        return 0; 
      });
    } else {
      client.query({ query: GET_VIDEOS, variables: { userId, limit, lastUploaded, notIntoGender } })
      .then((response) => {  
        if(!initialized){
          if(response.data.users.length > 0){
            setInitialized(true); 
            setVideoData(response.data);
            setCurrentUserId(response.data.users[0].id); 
            setCurrentName(response.data.users[0].firstName);
            setCurrentCity(response.data.users[0].city);
            setCurrentRegion(response.data.users[0].region);

            setMuxPlaybackId(response.data.users[0].userVideos[0].muxPlaybackId); 
            setUserCount(response.data.users.length); 
            setLastUploaded(response.data.users[response.data.users.length - 1].lastUploaded)
            setCurrentUserVideoCount(response.data.users[0].userVideos.length);
            setQuestionText(response.data.users[0].userVideos[0].videoQuestion.questionText);  
          } 
        } else {
          const tempVideoData = { users: [...videoData.users, ...response.data.users] }
          setVideoData(tempVideoData);
          setUserCount(userCount + response.data.users.length); 
  
          if(response.data.users.length == 0){
            setQuerying(true); 
          } else {
            setLastUploaded(response.data.users[response.data.users.length - 1].lastUploaded);
            setQuerying(false);   
          }
        }
      })
      .catch((error) => {
        return 0; 
      });
    }
  }


  function processVideosNearby(data){
    if(!initialized){

      if(data.users.length == 0){
        queryVideos(userId, limit, null, null, genderInterest, false, latitude, longitude); 
        setNearbyResults(false); 
        setLastWatchedLower(null); 
      }

      if(data.users.length > 0){
        setInitialized(true); 
        setVideoData(data);
        setCurrentUserId(data.users[0].id); 
        setCurrentName(data.users[0].firstName);
        setCurrentCollege(data.users[0].college); 

        let currentLocation = data.users[0].location;
        if(currentLocation){
          const distance = getDistance(
            { latitude: latitude, longitude: longitude }, 
            { latitude: currentLocation.coordinates[1], longitude: currentLocation.coordinates[0] }
          ); 
          const distanceMiles = Math.round(distance / 1609); 
          setCurrentDistance(distanceMiles); 
        } else {
          setCurrentDistance(null);
        }
        
        setMuxPlaybackId(data.users[0].userVideos[0].muxPlaybackId); 
        setUserCount(data.users.length); 
        setLastWatchedLower(data.users[data.users.length - 1].lastUploaded)
        setCurrentUserVideoCount(data.users[0].userVideos.length);
        setQuestionText(data.users[0].userVideos[0].videoQuestion.questionText);  
      }
      
      if(data.users.length < limit){
        console.log("data users length is less than limit", data.users.length, limit); 
        setNearbyResults(false); 
        setLastWatchedLower(null); 
      }

    } else {
      const tempVideoData = { users: [...videoData.users, ...data.users] }
      setVideoData(tempVideoData);
      setUserCount(userCount + data.users.length); 

      if(data.users.length == 0){
        setQuerying(true); 
        if(nearbyResults == true){
          setNearbyResults(false);
          setQuerying(false); 
          setLastWatchedLower(null); 
        }
      } else {
        setLastWatchedLower(data.users[data.users.length - 1].lastUploaded);
        setQuerying(false);   
      }
    }
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


  async function checkGenderPreferences(){
    const genderInterestLocal = await _retrieveGenderInterest(); 
    if(genderInterestLocal !== genderInterest && genderInterest != ''){
      setGenderInterest(genderInterestLocal); 

      setInitialized(false); 
      setVideoData(null);
      setCurrentUserId(0); 
      setCurrentName('');
      setCurrentDistance(null); 
      setCurrentCollege(''); 
      setUserIndex(0);
      setVideoIndex(0);
      setNearbyResults(true);
      setMuxPlaybackId(''); 
      setUserCount(0); 
      setLastWatchedLower(null); 
      setCurrentUserVideoCount(0);
      setQuestionText('');  
    }
  }

  const registerForPushNotificationsAsync = async () => {
    if (Constants.isDevice) {
      const { status: existingStatus } = await Permissions.getAsync(Permissions.NOTIFICATIONS);
      let finalStatus = existingStatus;
      if (existingStatus !== 'granted') {
        const { status } = await Permissions.askAsync(Permissions.NOTIFICATIONS);
        finalStatus = status;
      }
      const token = await Notifications.getExpoPushTokenAsync();
      updatePushToken({ variables: { userId, expoPushToken: token } })
      setExpoPushToken(token); 
    } else {
      alert('Must use physical device for Push Notifications');
    }

    if ('android' in Constants.platform) {
      Notifications.createChannelAndroidAsync('default', {
        name: 'default',
        sound: true,
        priority: 'max',
        vibrate: [0, 250, 250, 250],
      });
    }
  };

  async function sendLike() {
    let res = await axios({
      method: 'post', 
      url: 'https://gentle-brook-91508.herokuapp.com/push',
      data: { "likerId" : userId, "likedId" : currentUserId, "likerName" : name }
    }); 
  }

  const onPressHeart = async () => { 
    setHeartColor("#734f96"); 

    sendLike();
    
    if(profileVideoCount == 0 && likedIndexes.length % 4 == 3){
      setAddPopupVisible(true); 
    }

    if(pushPopupShown == false && likedIndexes.length == 1){
      const pushShown = await _retrievePushShown(); 
      if(!pushShown){
        setPushPopupVisible(true); 
        _storePushShown(true); 
      }
      setPushPopupShown(true); 
    }

    if(userId != currentUserId && !likedIndexes.includes(userIndex)){
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
            } 
          })

        }
      })
      .catch(error => {});
    } 

    updateVideoLikes({ variables: { id : videoId, likes: videoData.users[userIndex].userVideos[videoIndex].likes + 1 }});
    setLikedIndexes([...likedIndexes, userIndex]); 

    Segment.track("Like User"); 

  }

  // set new muxPlaybackId and questionText with any update to videoIndex, userIndex or videoData
  useEffect(() => {
    if(videoData && videoData.users.length > 0){
      setCurrentUserId(videoData.users[userIndex].id); 
      setCurrentName(videoData.users[userIndex].firstName);
      setCurrentCity(videoData.users[userIndex].city);
      setCurrentRegion(videoData.users[userIndex].region);
      setMuxPlaybackId(videoData.users[userIndex].userVideos[videoIndex].muxPlaybackId); 

      setUserCount(videoData.users.length); 
      setCurrentUserVideoCount(videoData.users[userIndex].userVideos.length);
      setQuestionText(videoData.users[userIndex].userVideos[videoIndex].videoQuestion.questionText);
      setFlags(videoData.users[userIndex].userVideos[videoIndex].flags); 
      setVideoId(videoData.users[userIndex].userVideos[videoIndex].id); 
    }

    if(videoData && userIndex + limit > videoData.users.length && !querying){
      setQuerying(true); 
      queryVideos(userId, limit, lastUploaded, genderInterest, nearbyResults);
    }

  }, [videoIndex, userIndex, videoData])

  // changing icons and arrows when moving from user to user
  useEffect(() => {
    if(likedIndexes.includes(userIndex)){
      setHeartColor("#734f96"); 
    } else {
      setHeartColor('#eee'); 
    }
  }, [userIndex])

  // tapping back arrow 
  const lastUser = () => {
    setCurrentProgress(0); 
    setVideoIndex(0); 
    if(userIndex !== 0){
      setUserIndex(userIndex - 1);
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
    updateVideoViews({ variables: { id : videoId, views: videoData.users[userIndex].userVideos[videoIndex].views + 1 }});
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
    updateVideoViews({ variables: { id : videoId, views: videoData.users[userIndex].userVideos[videoIndex].views + 1 }});
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

  function UserInfo(){
    if(currentName){
      if(currentCity && currentRegion){
        return (
          <View style={homeStyles.userInfoContainer}>
            <Text style={{ color: '#eee', paddingRight: 5}}>{currentName}</Text>
            <Text style={{ color: '#eee', fontSize: 5}}>{'\u2B24'}</Text>
            <Text style={{ color: '#eee', paddingLeft: 5}}>{currentCity},{currentRegion}</Text>        
          </View>
        )    
      } else {
        return (
          <View style={homeStyles.userInfoContainer}>
            <Text style={{ color: '#eee'}}>{currentName}</Text>        
          </View>
        )    
      }
    } else {
      return null; 
    }
  }

  if(initialized){
    if('ios' in Constants.platform){
      return (
        <View style={{ flex: 1, backgroundColor: '#eee'}}>
          <View style={{ flex: 9, backgroundColor: '#000' }} {..._panResponder.panHandlers}>
            <MultipleVideos 
              key={Math.round(userIndex / limit)} 
              limit={limit}
              first={true}
              shouldPlay={shouldPlay}
              playbackObject={playbackObject}
              _onPlaybackStatusUpdate={_onPlaybackStatusUpdate}
              videoData={videoData}
              userIndex={userIndex}
              videoIndex={videoIndex}
              currentUserVideoCount={currentUserVideoCount}
            >
            </MultipleVideos>
            <MultipleVideos 
              key={Math.floor(userIndex / limit) + 1000}
              limit={limit}
              first={false}
              shouldPlay={shouldPlay}
              playbackObject={playbackObject}
              _onPlaybackStatusUpdate={_onPlaybackStatusUpdate}
              videoData={videoData}
              userIndex={userIndex}
              videoIndex={videoIndex}
              currentUserVideoCount={currentUserVideoCount}
            />
            <ProgressBarsContainer />
            <BlurView tint="dark" intensity={20} style={homeStyles.questionContainer}>
              <Text style={{fontSize: 18,color: "#eee", padding: 15, paddingTop: 20, textAlign: 'center'}}>{questionText}</Text>
  
            </BlurView>
            <UserInfo />
          </View>
          <View style={{ position: 'absolute', left: 0, right: 0, bottom: 0, alignItems: 'center', paddingBottom: 20, flexDirection: 'row', justifyContent: 'space-evenly'}}>
              <Ionicons name='ios-more' onPress={moreOptions} size={30} color="#eee" />        
              <Ionicons name='md-heart' onPress={onPressHeart} size={45} color={heartColor} />        
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
          <PushPopup
            visible={pushPopupVisible}
            setVisible={setPushPopupVisible}
            registerForPushNotificationsAsync={registerForPushNotificationsAsync}
          />
        </View>
      );
    } else {
      return (
        <View style={{ flex: 1, backgroundColor: '#eee'}}>
          <View style={{ flex: 9, backgroundColor: '#000' }} {..._panResponder.panHandlers}>
            <SingleVideo 
              shouldPlay={shouldPlay}
              source={'https://stream.mux.com/' + muxPlaybackId + '.m3u8'}
              key={'https://stream.mux.com/' + muxPlaybackId + '.m3u8'}
            >
            </SingleVideo>
            <ProgressBarsContainer />
            <BlurView tint="dark" intensity={20} style={homeStyles.questionContainer}>
              <Text style={{fontSize: 18,color: "#eee", padding: 15, paddingTop: 20, textAlign: 'center'}}>{questionText}</Text>
  
            </BlurView>
            <UserInfo />
          </View>
          <View style={{ position: 'absolute', left: 0, right: 0, bottom: 0, alignItems: 'center', paddingBottom: 20, flexDirection: 'row', justifyContent: 'space-evenly'}}>
              <Ionicons name='ios-more' onPress={moreOptions} size={30} color="#eee" />        
              <Ionicons name='md-heart' onPress={onPressHeart} size={45} color={heartColor} />        
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
          <PushPopup
            visible={pushPopupVisible}
            setVisible={setPushPopupVisible}
            registerForPushNotificationsAsync={registerForPushNotificationsAsync}
          />
        </View>
      );    
    }
  } else {
    if(connectedInternet){
      return (
        <View style={{ backgroundColor: '#000', justifyContent: 'center', alignItems: 'center', flex: 1}}>
          <ActivityIndicator size="small" color="#eee" />
        </View>
      )  
    } else {
      return (
        <View style={{ backgroundColor: '#000', justifyContent: 'center', alignItems: 'center', flex: 1}}>
          <TouchableOpacity onPress={reload} style={{ borderWidth: 1, borderColor: '#eee', justifyContent: 'center', borderRadius: 5}}>
            <Text style={{ color: '#eee', fontSize: 20, paddingHorizontal: 20, paddingVertical: 5}}>Reload</Text>          
          </TouchableOpacity>
        </View>
      )
    }
  }
}