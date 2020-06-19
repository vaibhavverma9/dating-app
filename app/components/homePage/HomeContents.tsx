import React, { useState, useEffect, useContext, useRef } from 'react';
import { Text, View, ActivityIndicator, StyleSheet } from 'react-native';
import { homeStyles } from '../../styles/homeStyles';
import { BlurView } from 'expo-blur';
import { Ionicons, Entypo, MaterialCommunityIcons } from '@expo/vector-icons'
import { useMutation, useLazyQuery } from '@apollo/client';
import { INSERT_LIKE, GET_LIKE, client, GET_VIDEOS_LOWER, GET_VIDEOS_UPPER, INSERT_USER, UPDATE_LIKE, GET_NUMBER_VIDEOS, UPDATE_PUSH_TOKEN, GET_USER_INFO, UPDATE_VIDEO_LIKES, UPDATE_VIDEO_VIEWS, GET_GENDER_INTEREST, GET_VIDEOS_WOMAN, GET_VIDEOS_MAN, GET_VIDEOS_NEARBY } from '../../utils/graphql/GraphqlClient';
import OptionsModal from './OptionsModal'; 
import { UserIdContext } from '../../utils/context/UserIdContext'
import * as Segment from 'expo-analytics-segment';
import { _retrieveUserId, _storeUserId, _retrieveDoormanUid, _storeDoormanUid, _retrieveLatitude, _retrieveLongitude, _retrieveName, _retrievePushShown, _storePushShown, _storeName, _storeBio, _retrieveBio, _retrieveGenderInterest, _storeGenderInterest, _storeLastWatchedUpper, _storeLastWatchedLower, _retrieveLastWatchedUpper, _retrieveLastWatchedLower
} from '../../utils/asyncStorage'; 
import AddVideoPopup from '../modals/AddVideoPopup'; 
import PushPopup from '../modals/PushPopup'; 
import { PanResponder } from 'react-native'; 
import MultipleVideos from '../videosPage/MultipleVideos'; 
import { useDoormanUser } from 'react-native-doorman'
import { Notifications } from 'expo';
import Constants from 'expo-constants';
import * as Permissions from 'expo-permissions';
import axios from 'axios';
import * as Network from 'expo-network';
import { TouchableOpacity } from 'react-native-gesture-handler';
import SingleVideo from '../videosPage/SingleVideo';
import ProgressBar from 'react-native-progress/Bar'
import { Dimensions } from 'react-native';
import { getDistance } from 'geolib';
import { colors } from '../../styles/colors';

export default function HomeContents(props) {

  const { uid, phoneNumber } = useDoormanUser();
  const [videoData, setVideoData] = useState(null); 
  const limit = 2;
  const [questionText, setQuestionText] = useState(''); 
  const [shouldPlay, setShouldPlay] = useState(true); 

  const [userCount, setUserCount] = useState(0); 
  const [upperUserCount, setUpperUserCount] = useState(0); 
  const [currentUserVideoCount, setCurrentUserVideoCount] = useState(0); 
  const [currentUserId, setCurrentUserId] = useState(0); 

  const [currentName, setCurrentName] = useState('');
  const [currentDistance, setCurrentDistance] = useState(null); 

  const [currentCollege, setCurrentCollege] = useState(''); 
  
  const [userId, setUserId] = useContext(UserIdContext);
  const [name, setName] = useState(''); 
  const [genderInterest, setGenderInterest] = useState(''); 
  const [latitude, setLatitude] = useState(0);
  const [longitude, setLongitude] = useState(0);

  const [userIndex, setUserIndex] = useState(0); 
  const [videoIndex, setVideoIndex] = useState(0);
  const [flags, setFlags] = useState(0); 
  const [videoId, setVideoId] = useState(0); 
  const [lastUploaded, setLastUploaded] = useState(null); 
  const [querying, setQuerying] = useState(false); 
  const [initialized, setInitialized] = useState(false); 
  const [nearbyResults, setNearbyResults] = useState(false); 
  const [muxPlaybackId, setMuxPlaybackId] = useState(''); 

  const [profileVideoCount, setProfileVideoCount] = useState(null); 
  const [addPopupVisible, setAddPopupVisible] = useState(false); 

  const [expoPushToken, setExpoPushToken] = useState(''); 
  const [pushPopupShown, setPushPopupShown] = useState(false); 
  const [pushPopupVisible, setPushPopupVisible] = useState(false);

  const [likeColor, setLikeColor] = useState('white');
  const [dislikeColor, setDislikeColor] = useState('white');
  const [likeColors, setLikeColors] = useState([]);
  const [dislikeColors, setDislikeColors] = useState([]);
  const [likedIndexes, setLikedIndexes] = useState([]); 
  const [dislikedIndexes, setDislikedIndexes] = useState([]); 

  const [insertLike, { insertLikeData }] = useMutation(INSERT_LIKE);
  const [insertUser, { insertUserData }] = useMutation(INSERT_USER); 
  const [updateLike, { updateLikeData }] = useMutation(UPDATE_LIKE); 
  const [updatePushToken, { updatePushTokenData }] = useMutation(UPDATE_PUSH_TOKEN); 
  const [updateVideoLikes, { updateVideoLikesData }] = useMutation(UPDATE_VIDEO_LIKES); 
  const [updateVideoViews, { updateVideoViewsData }] = useMutation(UPDATE_VIDEO_VIEWS); 

  const [optionsModalVisible, setOptionsModalVisible] = useState(false); 

  let playbackObject = useRef(null); 

  const [connectedInternet, setConnectedInternet] = useState(true); 
  const [timedOut, setTimedOut] = useState(false);
  const [upperVideos, setUpperVideos] = useState(true); 
  const [lastWatchedUpper, setLastWatchedUpper] = useState(null);
  const [lastWatchedLower, setLastWatchedLower] = useState(null); 
  const [lastLoadedUpper, setLastLoadedUpper] = useState(null); 
  const [lastLoadedLower, setLastLoadedLower] = useState(null); 

  const [getVideosLower, { data: videosLower }] = useLazyQuery(GET_VIDEOS_LOWER, 
    { 
      onCompleted: (videosLower) => { processVideos(videosLower) } 
    }); 

  const [getVideosUpper, { data: videosUpper }] = useLazyQuery(GET_VIDEOS_UPPER, 
    { 
      onCompleted: (videosUpper) => { processVideos(videosUpper) } 
    }); 
    

  const _panResponder = PanResponder.create({
    onStartShouldSetPanResponder: (evt, gestureState) => true,
    onStartShouldSetPanResponderCapture: (evt, gestureState) => true,
    onMoveShouldSetPanResponder: (evt, gestureState) => {},
    onMoveShouldSetPanResponderCapture: (evt, gestureState) => {},
    onPanResponderGrant: (evt, gestureState) => {},
    onPanResponderMove: (evt, gestureState) => {},
    onPanResponderTerminationRequest: (evt, gestureState) => true,
    onPanResponderRelease: (evt, gestureState) => {

        if(evt.nativeEvent.pageX < 50){
          lastVideo(); 
        } else {
          nextVideo(); 
        }
    },
    onPanResponderTerminate: (evt, gestureState) => {},
    onShouldBlockNativeResponder: (evt, gestureState) => true
  });

  useEffect(() => {
    queryVideosInit(upperVideos);
    initSegment(); 
    countProfileVideos(userId); 
    networkConnected(); 
    setTimeout(() => { setTimedOut(true) }, 3000); 
  }, []);

  async function networkConnected(){
    const networkInfo = await Network.getNetworkStateAsync(); 
    setConnectedInternet(networkInfo.isConnected); 
  }

  function reload(){
    setConnectedInternet(true); 
    setTimedOut(false); 
    queryVideosInit(upperVideos);
    initSegment(); 
    networkConnected(); 
    setTimeout(() => { setTimedOut(true) }, 3000); 
  }

  function resetLastWatched(){
    let currentDate = new Date();
    _storeLastWatchedLower(currentDate.toString()); 
    // setLastWatchedLower(currentDate); 
    _storeLastWatchedUpper(currentDate.toString()); 
    // setLastWatchedUpper(currentDate); 
  }

  async function queryVideosInit(upperVideos){
    let genderInterestLocal = genderInterest; 
    let latitudeLocal = latitude; 
    let longitudeLocal = longitude; 
    let lastWatchedLowerLocal = lastWatchedLower;
    let lastLoadedLowerLocal = lastLoadedLower; 
    let lastWatchedUpperLocal = lastWatchedUpper; 
    let lastLoadedUpperLocal = lastLoadedUpper; 
    let upperVideosLocal = upperVideos; 

    if(genderInterestLocal == ''){
      genderInterestLocal = await _retrieveGenderInterest(); 
      if(genderInterestLocal == ''){
        client.query({ query: GET_GENDER_INTEREST, variables: { userId }})
        .then(response => {
          genderInterestLocal = response.data.users[0].genderInterest; 
          _storeGenderInterest(genderInterestLocal); 
          setGenderInterest(genderInterestLocal); 
        })
      } else {
        setGenderInterest(genderInterestLocal); 
      }
    }    

    if(latitudeLocal == 0){
      latitudeLocal = await _retrieveLatitude();
    }
    setLatitude(latitudeLocal); 

    if(longitudeLocal == 0){
      longitudeLocal = await _retrieveLongitude(); 
    }
    setLongitude(longitudeLocal); 

    let currentDate = new Date();
    // resetLastWatched(); 

    if(lastWatchedLowerLocal == null){
      lastWatchedLowerLocal = await _retrieveLastWatchedLower();
      if(lastWatchedLowerLocal == null){
        lastWatchedLowerLocal = currentDate; 
        _storeLastWatchedLower(lastWatchedLowerLocal.toString()); 
        setLastWatchedLower(lastWatchedLowerLocal); 
      } else {
        lastWatchedLowerLocal = new Date(lastWatchedLowerLocal); 
        setLastWatchedLower(lastWatchedLowerLocal); 
      }
    }

    if(lastLoadedLowerLocal == null){
      lastLoadedLowerLocal = lastWatchedLowerLocal; 
      setLastLoadedLower(lastLoadedLowerLocal); 
    }
  
    if(lastWatchedUpperLocal == null){
      lastWatchedUpperLocal = await _retrieveLastWatchedUpper();
      if(lastWatchedUpperLocal == null){
        lastWatchedUpperLocal = currentDate; 
        _storeLastWatchedUpper(lastWatchedUpperLocal.toString());
        setLastWatchedUpper(lastWatchedUpperLocal); 
        setUpperVideos(false);  
      } else {
        lastWatchedUpperLocal = new Date(lastWatchedUpperLocal); 
        setLastWatchedUpper(lastWatchedUpperLocal); 
      }
    }

    if(lastLoadedUpperLocal == null){
      lastLoadedUpperLocal = lastWatchedUpperLocal; 
      setLastLoadedUpper(lastLoadedUpperLocal); 
    }

    queryVideos(userId, limit, lastLoadedLowerLocal, lastLoadedUpperLocal, upperVideosLocal, genderInterestLocal, nearbyResults, latitudeLocal, longitudeLocal);
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

  async function queryVideos(userId, limit, lastLoadedLower, lastLoadedUpper, upperVideos, genderInterest, nearbyResults, latitude, longitude){

    const point = {
        "type" : "Point", 
        "coordinates": [latitude, longitude]
    }; 

    let notIntoGender = ""; 
    if(genderInterest == "Women"){
      notIntoGender = "Man"; 
    } else if(genderInterest == "Men"){
      notIntoGender = "Woman"; 
    }

    if(upperVideos){
      getVideosUpper({ variables: { userId, limit, lastUploaded: lastLoadedUpper, notIntoGender, point } })
    } else {
      getVideosLower({ variables: { userId, limit, lastUploaded: lastLoadedLower, notIntoGender, point } });

    }
  }

  function processVideos(data){
    if(upperVideos){
      if (data.users.length > 0){
        if(!initialized){
          setInitialized(true); 
          setVideoData(data);
          setCurrentUserId(data.users[0].id); 
          setCurrentName(data.users[0].firstName);
          setCurrentCollege(data.users[0].college); 
          initColors(data); 
  
          let currentLocation = data.users[0].location;
          if(currentLocation){
            const distance = getDistance(
              { latitude: latitude, longitude: longitude }, 
              { latitude: currentLocation.coordinates[0], longitude: currentLocation.coordinates[1] }
            ); 
            const distanceMiles = Math.round(distance / 1609);
            setCurrentDistance(distanceMiles); 
          } else {
            setCurrentDistance(null); 
          }
          
          setMuxPlaybackId(data.users[0].userVideos[0].muxPlaybackId); 
          setUserCount(data.users.length); 
          setUpperUserCount(data.users.length); 
          
          setLastLoadedUpper(data.users[data.users.length - 1].lastUploaded)
          setCurrentUserVideoCount(data.users[0].userVideos.length);
          setQuestionText(data.users[0].userVideos[0].videoQuestion.questionText);  
        } else {
          const tempVideoData = { users: [...videoData.users, ...data.users] }
          setVideoData(tempVideoData);
          setUserCount(userCount + data.users.length); 
          setUpperUserCount(userCount + data.users.length); 
          setLastLoadedUpper(data.users[data.users.length - 1].lastUploaded);
          setQuerying(false);   
          
        }
      }
      if(data.users.length < limit){
        setUpperVideos(false); 
        queryVideosInit(false); 
      } 
    } else {
      if(data.users.length > 0){
        if(!initialized){
          setInitialized(true); 
          setVideoData(data);
          setCurrentUserId(data.users[0].id); 
          setCurrentName(data.users[0].firstName);
          setCurrentCollege(data.users[0].college); 

          initColors(data); 

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
          
          setLastLoadedLower(data.users[data.users.length - 1].lastUploaded)
          setCurrentUserVideoCount(data.users[0].userVideos.length);
          setQuestionText(data.users[0].userVideos[0].videoQuestion.questionText);  
        } else {
          const tempVideoData = { users: [...videoData.users, ...data.users] }
          setVideoData(tempVideoData);
          setUserCount(userCount + data.users.length); 
          setLastLoadedLower(data.users[data.users.length - 1].lastUploaded);
          setQuerying(false);   

          initColors(data); 

        }
      } else if(data.users.length == 0) {
        setQuerying(true); 
        resetLastWatched(); 
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

  async function sendLike(likedId, likedName) {
    let res = await axios({
      method: 'post', 
      url: 'https://gentle-brook-91508.herokuapp.com/push',
      data: { "likerId" : userId, "likedId" : likedId, "likerName" : likedName }
    }); 
  }

  async function onLike() { 

    const likedId = currentUserId; 
    const likedIndex = userIndex; 
    const likedVideoIndex = videoIndex; 
    const likedName = currentName; 

    nextUser(); 

    if(profileVideoCount == 0 && likedIndexes.length % 3 == 1){
      setAddPopupVisible(true); 
    }

    if(profileVideoCount > 0 && pushPopupShown == false && likedIndexes.length == 3){
      const pushShown = await _retrievePushShown(); 
      if(!pushShown){
        setPushPopupVisible(true); 
        _storePushShown(true); 
      }
      setPushPopupShown(true); 
    }


    if(!likeColors[likedIndex].like && !likedIndexes.includes(likedIndex)){
      client.query({ query: GET_LIKE, variables: { likerId: likedId, likedId: userId, dislike: false}})
      .then(response => {
        if(response.data.likes.length == 0){
          insertLike({ variables: { likedId: likedId, likerId: userId, matched: false, dislike: false }});
          if(profileVideoCount > 0){
            sendLike(likedId, likedName);
          }
          updateVideoLikes({ variables: { id : videoId, likes: videoData.users[likedIndex].userVideos[likedVideoIndex].likes + 1 }});
          updateVideoViews({ variables: { id : videoId, views: videoData.users[likedIndex].userVideos[likedVideoIndex].views + 1 }});      
        } else {
          // check if device user has already liked current video user
          client.query({ query: GET_LIKE, variables: { likerId: userId, likedId: likedId, dislike: false}})
          .then(response => {
            if(response.data.likes.length == 0){
              updateLike({ variables: { likedId: userId, likerId: likedId, matched: true, dislike: false}})
              insertLike({ variables: { likedId: likedId, likerId: userId, matched: true, dislike: false }});   
              if(profileVideoCount > 0){
                sendLike(likedId, likedName); 
              }
              updateVideoLikes({ variables: { id : videoId, likes: videoData.users[likedIndex].userVideos[likedVideoIndex].likes + 1 }});
              updateVideoViews({ variables: { id : videoId, views: videoData.users[likedIndex].userVideos[likedVideoIndex].views + 1 }});          
            } 
          })
        }
      })
      .catch(error => {});
    } 

    setLikedIndexes([...likedIndexes, likedIndex]); 
    Segment.track("Like User"); 
  }

  async function onDislike() { 

    const dislikedId = currentUserId; 
    const dislikedIndex = userIndex; 
    const dislikedVideoIndex = videoIndex; 

    if(!likeColors[dislikedIndex].like){
      nextUser(); 
    }

    if(!likeColors[dislikedIndex].like && !dislikeColors[dislikedIndex].dislike && !dislikedIndexes.includes(dislikedIndex)){
      insertLike({ variables: { likedId: dislikedId, likerId: userId, matched: false, dislike: true }});
          updateVideoViews({ variables: { id : videoId, views: videoData.users[dislikedIndex].userVideos[dislikedVideoIndex].views + 1 }});  
    }

    setDislikedIndexes([...dislikedIndexes, dislikedIndex]); 
    Segment.track("Dislike User"); 
  }

  function initColors(data){
    const newLikeColors = data.users.map(user => {
      if(user.likesByLikedId.length == 0){
        return { like: false, color: '#eee' }
      } else {
        const dislike = user.likesByLikedId[0].dislike;
        if(dislike){
          return { like: false, color: '#eee' }
        } else {
          return { like: true, color: '#734f96' }; 
        }
      }
    }); 

    setLikeColors([...likeColors, ...newLikeColors]); 

    const newDislikeColors = data.users.map(user => {
      if(user.likesByLikedId.length == 0){
        return { dislike: false, color: '#eee' }
      } else {
        const dislike = user.likesByLikedId[0].dislike;
        if(dislike){
          return { dislike: true, color: '#734f96' }
        } else {
          return { dislike: false, color: colors.secondaryBlack }; 
        }
      }
    }); 

    setDislikeColors([...dislikeColors, ...newDislikeColors]);
  }

  // set new muxPlaybackId and questionText with any update to videoIndex, userIndex or videoData
  useEffect(() => {
    if(videoData && videoData.users.length > 0){
      setCurrentUserId(videoData.users[userIndex].id); 
      setCurrentName(videoData.users[userIndex].firstName);
      setCurrentCollege(videoData.users[userIndex].college); 

      // if(videoData.users[userIndex].likesByLikedId.length > 0){
      //   const dislike = videoData.users[userIndex].likesByLikedId[0].dislike; 
      //   if(dislike){
      //     setDislikeColor('#734f96');
      //     setLikeColor('#eee')
      //   } else {
      //     setDislikeColor('#eee');
      //     setLikeColor('#734f96')
      //   }
      // }

      let currentLocation = videoData.users[userIndex].location;
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

      setMuxPlaybackId(videoData.users[userIndex].userVideos[videoIndex].muxPlaybackId); 
      if(userIndex > 0){
        if(userIndex - 1 < upperUserCount){
          _storeLastWatchedUpper(videoData.users[userIndex - 1].lastUploaded); 
        } else {
          _storeLastWatchedLower(videoData.users[userIndex - 1].lastUploaded);           
        }
      }
      setUserCount(videoData.users.length); 
      setCurrentUserVideoCount(videoData.users[userIndex].userVideos.length);
      setQuestionText(videoData.users[userIndex].userVideos[videoIndex].videoQuestion.questionText);
      setFlags(videoData.users[userIndex].userVideos[videoIndex].flags); 
      setVideoId(videoData.users[userIndex].userVideos[videoIndex].id); 
    }

    if(videoData && userIndex + limit > videoData.users.length && !querying){
      setQuerying(true); 
      queryVideosInit(upperVideos); 
    }

  }, [videoIndex, userIndex, videoData])

  // changing icons and arrows when moving from user to user
  // useEffect(() => {
  //   if(likedIndexes.includes(userIndex)){
  //     setLikeColor("#734f96"); 
  //     setDislikeColor('#eee'); 
  //   } else if (dislikedIndexes.includes(userIndex)) {
  //     setLikeColor('#eee'); 
  //     setDislikeColor("#734f96"); 
  //   } else {
  //     setLikeColor('#eee'); 
  //     setDislikeColor("#eee"); 
  //   }
  // }, [userIndex])


  const nextVideo = () => {
    if(currentUserVideoCount == 1){
      // do nothing
    } else if(videoIndex + 1 !== currentUserVideoCount){
      setVideoIndex(videoIndex + 1); 
      setCurrentProgress(0); 
    }else {
      setVideoIndex(0); 
      setCurrentProgress(0); 
    }
    Segment.track("Home - Next Video"); 
  }

  const lastVideo = () => {
    if(currentUserVideoCount == 1){
      // do nothing
    } else if(videoIndex == 0){
      setVideoIndex(currentUserVideoCount - 1); 
      setCurrentProgress(0); 
    } else {
      setVideoIndex(videoIndex - 1); 
      setCurrentProgress(0); 
    }
    Segment.track("Home - Last Video"); 
  }

  // tapping back arrow 
  const lastUser = () => {
    setCurrentProgress(0); 
    setVideoIndex(0); 
    if(userIndex !== 0){
      setUserIndex(userIndex - 1);
    }
  }

  // tapping forward arrow
  const nextUser = () => {
    setCurrentProgress(0); 
    setVideoIndex(0);
    if(userIndex !== userCount - 1){
      setUserIndex(userIndex + 1);
    } else {
      resetLastWatched(); 
    }
  }

  function moreOptions() {
    setOptionsModalVisible(true); 
  }


  function goToAddVideo(){
    setAddPopupVisible(false); 
    props.navigation.navigate('Add');
  }

  const [currentProgress, setCurrentProgress] = useState(0); 

  const progressBarWidth = () => {
    const windowWidth = Dimensions.get('window').width;
    return windowWidth / currentUserVideoCount;
    // switch(currentUserVideoCount) {
    //   case 1: return windowWidth;
    //   case 2: return '50%'; 
    //   case 3: return '33.3%';
    //   case 4: return '25%'; 
    // }
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
          <ProgressBar
             progress={1}
             width={width}
             key={i}
            
             color="#734f96"
             unfilledColor="#E6E6FA"
             borderColor="#000"
             borderRadius={1}
             height={3}
            />
        )
      } else if (i == videoIndex) {
        animatedBars.push(
          <ProgressBar
            key={i}
            progress={currentProgress}
             width={width}
             color="#734f96"
             unfilledColor="#E6E6FA"
             borderColor="#000"
             borderRadius={1}
             height={3}

            />
        )
      } else {
        animatedBars.push(
          <ProgressBar
             progress={0}
             width={width}
             key={i}
             color="#734f96"
             unfilledColor="#E6E6FA"
             borderColor="#000"
             borderRadius={1}
             height={3}
            />
        )
      }
    }
    return animatedBars;
  }

  const _onPlaybackStatusUpdate = playbackStatus => {
    if(playbackStatus.positionMillis && playbackStatus.durationMillis){
      const progress = playbackStatus.positionMillis / playbackStatus.durationMillis; 
      setCurrentProgress(progress);   
    } else {
      setCurrentProgress(0); 
    }
  };

  function UserInfo(){

    function DistanceSeparator(){
      if(currentDistance){
        return (
          <Text style={styles.separatorText}>{'\u2B24'}</Text>
        )  
      } else {
        return null; 
      }    
    }

    function Distance(){
      if(currentDistance){
        return (
          <Text style={styles.locationText}>{currentDistance} mi</Text>
        )  
      } else {
        return null; 
      }
    }


    if(currentName){
      if(currentCollege){
        return (
            <View style={homeStyles.userInfoContainer}>
              <View style={{ flexDirection: 'row', alignItems: 'center'}}>
                <Text style={styles.currentNameText}>{currentName}</Text>
                {/* <Text style={styles.separatorText}>{'\u2B24'}</Text> */}
                <DistanceSeparator />
                <Distance />  
              </View>
              <Text style={styles.locationText}>{currentCollege}</Text>      
            </View>
        )    
      } else {
        return (
          <View style={homeStyles.userInfoContainer}>
            <View style={{ flexDirection: 'row', alignItems: 'center'}}>
              <Text style={styles.currentNameText}>{currentName}</Text>     
              <DistanceSeparator />
              <Distance />    
            </View> 
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
        <View style={styles.viewBackground}>
          <View style={styles.videosView} {..._panResponder.panHandlers}>
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
              <Text style={styles.questionText}>{questionText}</Text>
            </BlurView>
            <UserInfo />
          </View>
          <View style={styles.heartView}>
            <TouchableOpacity onPress={onDislike}>
              <Entypo name='cross' size={65} color={dislikeColors[userIndex].color} />  
            </TouchableOpacity>      
            <TouchableOpacity onPress={onLike}>
              <Ionicons name='md-heart' size={65} color={likeColors[userIndex].color} />        
            </TouchableOpacity>      
          </View>
          <View style={{ ...StyleSheet.absoluteFill, height: '15%', alignItems: 'center', justifyContent: 'flex-end', paddingRight: 15, flexDirection: 'row'}}>
            <TouchableOpacity onPress={lastUser} style={{paddingRight: 10}}>
              <Entypo name='back' size={30} color='#eee' />        
            </TouchableOpacity>
            <TouchableOpacity onPress={moreOptions} >
              <Ionicons name='ios-more' size={30} color='#eee' />        
            </TouchableOpacity>
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
            name={currentName}
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
        <View style={styles.viewBackground}>
          <View style={styles.videosView} {..._panResponder.panHandlers}>
            <SingleVideo 
              shouldPlay={shouldPlay}
              source={'https://stream.mux.com/' + muxPlaybackId + '.m3u8'}
              key={'https://stream.mux.com/' + muxPlaybackId + '.m3u8'}
            >
            </SingleVideo>
            <ProgressBarsContainer />
            <BlurView tint="dark" intensity={20} style={homeStyles.questionContainer}>
              <Text style={styles.questionText}>{questionText}</Text>
  
            </BlurView>
            <UserInfo />
          </View>
          <View style={styles.heartView}>
            <TouchableOpacity onPress={onDislike}>      
              <Entypo name='cross' size={65} color={dislikeColors[userIndex].color} />  
            </TouchableOpacity>      
            <TouchableOpacity onPress={onLike}>
              <Ionicons name='md-heart'  size={65} color={likeColors[userIndex].color} />        
            </TouchableOpacity>      
          </View>
          <View style={{ ...StyleSheet.absoluteFill, height: '15%', alignItems: 'center', justifyContent: 'flex-end', paddingRight: 15, flexDirection: 'row'}}>
            <TouchableOpacity onPress={lastUser} style={{paddingRight: 10}}>
              <Entypo name='back' size={30} color='#eee' />        
            </TouchableOpacity>
            <TouchableOpacity onPress={moreOptions} >
              <Ionicons name='ios-more' size={30} color='#eee' />        
            </TouchableOpacity>
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
    if(connectedInternet && !timedOut){
      return (
        <View style={styles.badInternetView}>
          <ActivityIndicator size="small" color="#eee" />
        </View>
      )  
    } else {
      return (
        <View style={styles.badInternetView}>
          <TouchableOpacity onPress={reload} style={{ borderWidth: 1, borderColor: '#eee', justifyContent: 'center', borderRadius: 5}}>
            <Text style={styles.reloadText}>Reload</Text>          
          </TouchableOpacity>
        </View>
      )
    }
  }
}

const styles = StyleSheet.create({
  currentNameText: { color: '#eee'},
  separatorText: { color: '#eee', fontSize: 5, paddingLeft: 5},
  locationText: { color: '#eee', paddingLeft: 5},
  viewBackground: { flex: 1, backgroundColor: '#eee'},
  videosView: { flex: 9, backgroundColor: '#000' },
  questionText: {fontSize: 18,color: "#eee", padding: 15, paddingTop: 20, textAlign: 'center'},
  heartView: { position: 'absolute', left: 0, right: 0, bottom: 0, alignItems: 'center', paddingBottom: 20, flexDirection: 'row', justifyContent: 'space-around'},
  badInternetView: { backgroundColor: '#000', justifyContent: 'center', alignItems: 'center', flex: 1},
  reloadText: { color: '#eee', fontSize: 20, paddingHorizontal: 20, paddingVertical: 5}
});