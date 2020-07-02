import React, { useState, useEffect, useContext, useRef, useMemo } from 'react';
import { Text, View, ActivityIndicator, StyleSheet } from 'react-native';
import { homeStyles } from '../../styles/homeStyles';
import { BlurView } from 'expo-blur';
import { Ionicons, Entypo, MaterialCommunityIcons } from '@expo/vector-icons'
import { useMutation, useLazyQuery, useQuery } from '@apollo/client';
import { INSERT_LIKE, GET_LIKE, client, GET_VIDEOS, INSERT_USER, UPDATE_LIKE, GET_NUMBER_VIDEOS, UPDATE_PUSH_TOKEN, GET_USER_INFO, UPDATE_VIDEO_LIKES, UPDATE_VIDEO_VIEWS, GET_GENDER_INTEREST, GET_QUESTIONS, UPDATE_VIDEO_DISLIKES } from '../../utils/graphql/GraphqlClient';
import OptionsModal from './OptionsModal'; 
import { UserIdContext } from '../../utils/context/UserIdContext'
import * as Segment from 'expo-analytics-segment';
import { _retrieveUserId, _storeUserId, _retrieveDoormanUid, _storeDoormanUid, _retrieveLatitude, _retrieveLongitude, _retrieveName, _retrievePushShown, _storePushShown, _storeName, _storeBio, _retrieveBio, _retrieveGenderInterest, _storeGenderInterest, _storeLastWatchedUpper, _storeLastWatchedLower, _retrieveLastWatchedUpper, _retrieveLastWatchedLower} from '../../utils/asyncStorage'; 
import AddVideoPopup from '../modals/AddVideoPopup'; 
import NoLikesPopup from '../modals/NoLikesPopup'; 
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
  const [questionText, setQuestionText] = useState(''); 
  const [shouldPlay, setShouldPlay] = useState(true); 

  const [userCount, setUserCount] = useState(0); 
  const [upperUserCount, setUpperUserCount] = useState(0); 
  const [lowerUserCount, setLowerUserCount] = useState(0); 
  const [currentUserVideoCount, setCurrentUserVideoCount] = useState(0); 
  const [currentUserId, setCurrentUserId] = useState(0); 

  const [currentName, setCurrentName] = useState('');

  const [currentCollege, setCurrentCollege] = useState(''); 
  const [currentCity, setCurrentCity] = useState(null);
  const [currentRegion, setCurrentRegion] = useState(null); 
  
  const [userId, setUserId] = useContext(UserIdContext);
  const [name, setName] = useState(''); 
  const [latitude, setLatitude] = useState(props.latitude);
  const [longitude, setLongitude] = useState(props.longitude);
  const [collegeLatitude, setCollegeLatitude] = useState(props.collegeLatitude);
  const [collegeLongitude, setCollegeLongitude] = useState(props.collegeLongitude);

  const [userIndex, setUserIndex] = useState(0); 
  const [videoIndex, setVideoIndex] = useState(0);
  const [flags, setFlags] = useState(0); 
  const [videoId, setVideoId] = useState(0); 
  const [querying, setQuerying] = useState(true); 
  const [initialized, setInitialized] = useState(false); 
  const [muxPlaybackId, setMuxPlaybackId] = useState(''); 

  const renderedUserIndex1 = useMemo(() => userIndex % 2 === 0 ? userIndex : userIndex + 1, [userIndex]);
  const renderedUserIndex2 = useMemo(() => userIndex % 2 === 1 ? userIndex : userIndex + 1, [userIndex]); 

  const [profileVideoCount, setProfileVideoCount] = useState(null); 
  const [addPopupVisible, setAddPopupVisible] = useState(false); 

  const [expoPushToken, setExpoPushToken] = useState(''); 
  const [pushPopupShown, setPushPopupShown] = useState(false); 
  const [pushPopupVisible, setPushPopupVisible] = useState(false);

  const [likeColors, setLikeColors] = useState([]);
  const [dislikeColors, setDislikeColors] = useState([]);
  const [likedIndexes, setLikedIndexes] = useState([]); 
  const [dislikedIndexes, setDislikedIndexes] = useState([]); 

  const [insertLike, { insertLikeData }] = useMutation(INSERT_LIKE);
  const [insertUser, { insertUserData }] = useMutation(INSERT_USER);
  const [updateLike, { updateLikeData }] = useMutation(UPDATE_LIKE);
  const [updatePushToken, { updatePushTokenData }] = useMutation(UPDATE_PUSH_TOKEN);
  const [updateVideoLikes, { updateVideoLikesData }] = useMutation(UPDATE_VIDEO_LIKES);
  const [updateVideoDislikes, { updateVideoDislikesData }] = useMutation(UPDATE_VIDEO_DISLIKES);
  const [updateVideoViews, { updateVideoViewsData }] = useMutation(UPDATE_VIDEO_VIEWS);

  const [optionsModalVisible, setOptionsModalVisible] = useState(false); 

  let playbackObject = useRef(null); 

  const [connectedInternet, setConnectedInternet] = useState(true); 
  const [timedOut, setTimedOut] = useState(false);

  const [upperVideos, setUpperVideos] = useState(props.upperVideos);
  const [locationVideos, setLocationVideos] = useState(props.locationVideos); 
  const [genderInterest, setGenderInterest] = useState(props.genderInterest); 

  const [lastLoadedUpper, setLastLoadedUpper] = useState(props.lastLoadedUpper);
  const [lastLoadedLower, setLastLoadedLower] = useState(props.lastLoadedLower);
  const [lastWatchedUpper, setLastWatchedUpper] = useState(props.lastWatchedUpper);
  const [lastWatchedLower, setLastWatchedLower] = useState(props.lastWatchedLower); 
  const [lowerLimit, setLowerLimit] = useState(props.lowerLimit);
  const [upperLimit, setUpperLimit] = useState(props.upperLimit); 
  const [noLocationLimit, setNoLocationLimit] = useState(props.noLocationLimit); 
  const [initLowerVideos, setInitLowerVideos] = useState(false);
  const [initialLowerVideos, setInitialLowerVideos] = useState(null);  
  const [noLikesLeft, setNoLikesLeft] = useState(false); 


  let currentDate = new Date();
  const [lastLoadedNoLocation, setLastLoadedNoLocation] = useState(props.lastLoadedNoLocation); 

  const [getVideosLower, { data: videosLower }] = useLazyQuery(GET_VIDEOS, 
    { 
      onCompleted: (videosLower) => { processVideos(videosLower, upperVideos) } 
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
    initSegment(); 
    networkConnected(); 
    countProfileVideos(userId);  
    setTimeout(() => { setTimedOut(true) }, 3000); 
  }, []);

  function countProfileVideos(userId){
    client.query({ query: GET_NUMBER_VIDEOS, variables: { userId }})
    .then(response => {
      const profileVideoCount = response.data.videos_aggregate.aggregate.count; 
      setProfileVideoCount(profileVideoCount); 
    })
  }

  useEffect(() => {
    processVideos(props.data, upperVideos); 
  }, [props.data]);

  async function networkConnected(){
    const networkInfo = await Network.getNetworkStateAsync(); 
    setConnectedInternet(networkInfo.isConnected); 
  }

  function reload(){
    setConnectedInternet(true); 
    setTimedOut(false); 
    initSegment(); 
    networkConnected(); 
    setTimeout(() => { setTimedOut(true) }, 3000); 
  }


  async function initSegment() {
    let name = await _retrieveName(); 
    let bio = await _retrieveBio(); 
    if(name == '' || bio == ''){
      client.query({ query: GET_USER_INFO, variables: { userId }})
      .then(response => {
        const users = response.data.users; 

        if(users[0].firstName && name == ''){
          name = users[0].firstName; 
          setName(name); 
          _storeName(name); 
        };

        if(users[0].bio && bio == ''){
          bio = users[0].bio; 
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

  const [reset, setReset] = useState(false); 

  function resetLastWatched(){
    if(!reset){
      _storeLastWatchedLower(currentDate.toString()); 
      _storeLastWatchedUpper(currentDate.toString()); 
      setReset(true)  
    }
  }

  useEffect(() => {
    if(props.lastLoadedLower != lastLoadedLower){
      setQuerying(false); 
    }
  }, [lastLoadedLower]);

  useEffect(() => {
    if(props.lastLoadedUpper != lastLoadedUpper){
      setQuerying(false); 
    }
  }, [lastLoadedUpper]);

  useEffect(() => {
    if(props.lastLoadedNoLocation != lastLoadedNoLocation){
      setQuerying(false); 
    }
  }, [lastLoadedNoLocation]); 

  async function queryVideosInit(lastLoadedUpper, lastLoadedLower, lastLoadedNoLocation, upperLimit, lowerLimit, noLocationLimit){
    let genderInterestLocal = genderInterest; 
    let latitudeLocal = latitude; 
    let longitudeLocal = longitude; 
    let lastLoadedLowerLocal = lastLoadedLower; 
    let lastLoadedUpperLocal = lastLoadedUpper;
    let lastLoadedNoLocationLocal = lastLoadedNoLocation;
    let collegeLatitudeLocal = collegeLatitude;
    let collegeLongitudeLocal = collegeLongitude; 
    let lastWatchedLowerLocal = lastWatchedLower;
    let lastWatchedUpperLocal = lastWatchedUpper; 

    if(latitudeLocal == 0){
      latitudeLocal = await _retrieveLatitude();
    }
    setLatitude(latitudeLocal); 

    if(longitudeLocal == 0){
      longitudeLocal = await _retrieveLongitude(); 
    }
    setLongitude(longitudeLocal); 

    // if(collegeLatitudeLocal == null || collegeLongitudeLocal == null){
    //   collegeLongitudeLocal = await _retrieveCollegeLongitude(); 
    //   collegeLatitudeLocal = await _retrieveCollegeLatitude();
      
    //   if(collegeLongitudeLocal == null || collegeLatitudeLocal == null){
    //     client.query({ query: GET_COLLEGE_LOCATION, variables: { userId }})
    //     .then(response => {
    //       if(response.data.users[0].userCollege){
    //         collegeLongitudeLocal = response.data.users[0].userCollege.longitude; 
    //         collegeLatitudeLocal = response.data.users[0].userCollege.latitude;   
    //       } else {
    //         collegeLongitudeLocal = longitudeLocal;
    //         collegeLatitudeLocal = latitudeLocal;
    //       }
    //       _storeCollegeLongitude(collegeLongitudeLocal); 
    //       _storeCollegeLatitude(collegeLatitudeLocal); 
    //       setCollegeLongitude(collegeLongitudeLocal); 
    //       setCollegeLatitude(collegeLatitudeLocal);     
    //     })
    //   } else {
    //     setCollegeLongitude(collegeLongitudeLocal); 
    //     setCollegeLatitude(collegeLatitudeLocal);     
    //   }
    // }

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

    queryVideos(userId, lowerLimit, upperLimit, noLocationLimit, lastLoadedLowerLocal, lastLoadedUpperLocal, lastLoadedNoLocationLocal, genderInterestLocal, latitudeLocal, longitudeLocal, collegeLatitudeLocal, collegeLongitudeLocal);
  }

  async function queryVideos(userId, lowerLimit, upperLimit, noLocationLimit, lastLoadedLower, lastLoadedUpper, lastLoadedNoLocationLocal, genderInterest, latitude, longitude, collegeLatitude, collegeLongitude){

    const point = {
        "type" : "Point", 
        "coordinates": [latitude, longitude]
    }; 

    const collegePoint = {
      "type" : "Point", 
      "coordinates": [collegeLongitude, collegeLatitude]
    };    

    let notIntoGender = ""; 
    if(genderInterest == "Women"){
      notIntoGender = "Man"; 
    } else if(genderInterest == "Men"){
      notIntoGender = "Woman"; 
    }

    getVideosLower({ variables: { userId, noLocationLimit, lowerLimit, upperLimit, lastLoadedLower, lastLoadedUpper, lastLoadedNoLocation, notIntoGender, point, collegePoint } })
  }

  function processVideos(data, upperVideos){

    if(locationVideos){
      if(upperVideos){
        let initialLowerVideosLocal = initialLowerVideos; 

        if(!initLowerVideos){
          initialLowerVideosLocal = data; 
          setInitialLowerVideos(data);
          setInitLowerVideos(true); 
        }

        const users = data.upperUsersLocation; 
  
        if (users.length > 0){
          if(!initialized){
            setInitialized(true); 
            setVideoData(users);
            setCurrentUserId(users[0].id); 
            setCurrentName(users[0].firstName);
            setCurrentCollege(users[0].college);
            setCurrentCity(users[0].city);
            setCurrentRegion(users[0].region); 
            initColors(users); 
    
            // let currentLocation = users[0].location;
            // if(currentLocation){
            //   const distance = getDistance(
            //     { latitude: latitude, longitude: longitude }, 
            //     { latitude: currentLocation.coordinates[0], longitude: currentLocation.coordinates[1] }
            //   ); 
            //   const distanceMiles = Math.round(distance / 1609);
            //   setCurrentDistance(distanceMiles); 
            // } else {
            //   setCurrentDistance(null); 
            // }
            
            setMuxPlaybackId(users[0].userVideos[0].muxPlaybackId); 
            setUserCount(users.length); 
            setUpperUserCount(users.length); 
            _storeLastWatchedUpper(users[0].lastUploaded);
            setLastLoadedUpper(users[users.length - 1].lastUploaded)
            setCurrentUserVideoCount(users[0].userVideos.length);
            setQuestionText(users[0].userVideos[0].videoQuestion.questionText);  
          } else {
            const tempVideoData = [...videoData, ...users];
            setVideoData(tempVideoData);
            setUserCount(userCount + users.length); 
            setUpperUserCount(upperUserCount + users.length); 
            setLastLoadedUpper(users[users.length - 1].lastUploaded);
            initColors(users); 
          }
        }

        if(users.length < props.upperLimit){
          setUpperVideos(false); 
          setLowerLimit(props.limit);
          setUpperLimit(0); 
          processVideos(initialLowerVideosLocal, false); 
          // queryVideosInit(lastLoadedUpper, lastLoadedLower, lastLoadedNoLocation, 0, props.limit, 0); 
        } 
      } else {
        const users = data.lowerUsersLocation; 
        if(users.length > 0){
          if(!initialized){
            setInitialized(true); 
            setVideoData(users);
            setCurrentUserId(users[0].id); 
            setCurrentName(users[0].firstName);
            setCurrentCollege(users[0].college); 
            setCurrentCity(users[0].city);
            setCurrentRegion(users[0].region); 
            initColors(users); 
  
            // let currentLocation = users[0].location;
            // if(currentLocation){
            //   const distance = getDistance(
            //     { latitude: latitude, longitude: longitude }, 
            //     { latitude: currentLocation.coordinates[1], longitude: currentLocation.coordinates[0] }
            //   ); 
            //   const distanceMiles = Math.round(distance / 1609);
            //   setCurrentDistance(distanceMiles); 
            // } else {
            //   setCurrentDistance(null); 
            // }
            
            setMuxPlaybackId(users[0].userVideos[0].muxPlaybackId); 
            setUserCount(users.length); 
            setLowerUserCount(users.length); 
            
            setLastLoadedLower(users[users.length - 1].lastUploaded)
            setCurrentUserVideoCount(users[0].userVideos.length);
            setQuestionText(users[0].userVideos[0].videoQuestion.questionText);  
          } else {
            const tempVideoData = [...videoData, ...users]; 
            setVideoData(tempVideoData);
            setUserCount(userCount + users.length); 
            setLowerUserCount(lowerUserCount + users.length); 
            setLastLoadedLower(users[users.length - 1].lastUploaded);
            initColors(users); 
  
          }
        } 

        if(users.length < lowerLimit){
          setLowerLimit(0);
          setNoLocationLimit(props.limit); 
          setLocationVideos(false); 
          resetLastWatched(); 
          queryVideosInit(lastLoadedUpper, lastLoadedLower, lastLoadedNoLocation, 0, 0, props.limit); 
        } 
      }
    } else {
      const users = data.usersNoLocation; 
      if(users.length > 0){
        if(!initialized){
          setInitialized(true); 
          setVideoData(users);
          setCurrentUserId(users[0].id); 
          setCurrentName(users[0].firstName);
          setCurrentCollege(users[0].college); 
          setCurrentCity(users[0].city);
          setCurrentRegion(users[0].region); 
          initColors(users); 

          // let currentLocation = users[0].location;
          // if(currentLocation){
          //   const distance = getDistance(
          //     { latitude: latitude, longitude: longitude }, 
          //     { latitude: currentLocation.coordinates[1], longitude: currentLocation.coordinates[0] }
          //   ); 
          //   const distanceMiles = Math.round(distance / 1609);
          //   setCurrentDistance(distanceMiles); 
          // } else {
          //   setCurrentDistance(null); 
          // }
          
          setMuxPlaybackId(users[0].userVideos[0].muxPlaybackId); 
          setUserCount(users.length); 
          
          setLastLoadedNoLocation(users[users.length - 1].lastUploaded)
          setCurrentUserVideoCount(users[0].userVideos.length);
          setQuestionText(users[0].userVideos[0].videoQuestion.questionText);  
        } else {
          const tempVideoData = [...videoData, ...users]; 
          setVideoData(tempVideoData);
          setUserCount(userCount + users.length); 
          setLastLoadedNoLocation(users[users.length - 1].lastUploaded)
          initColors(users); 
        }
      } else {
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

  async function sendLike(likedId, likerName) {
    let res = await axios({
      method: 'post', 
      url: 'https://gentle-brook-91508.herokuapp.com/push',
      data: { "likerId" : userId, "likedId" : likedId, "likerName" : likerName }
    }); 
  }

  async function onLike() { 

    const likedId = currentUserId; 
    const likedIndex = userIndex; 
    const likedVideoIndex = videoIndex; 
    const likerName = name; 

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

    if(!likeColors[likedIndex].like){
      client.query({ query: GET_LIKE, variables: { likerId: likedId, likedId: userId, dislike: false}})
      .then(response => {
        if(response.data.likes.length == 0){
          insertLike({ variables: { likedId: likedId, likerId: userId, matched: false, dislike: false }});
          if(profileVideoCount > 0){
            sendLike(likedId, likerName);
          }
          updateVideoLikes({ variables: { id : videoId, likes: videoData[likedIndex].userVideos[likedVideoIndex].likes + 1 }});
          updateVideoViews({ variables: { id : videoId, views: videoData[likedIndex].userVideos[likedVideoIndex].views + 1 }});      
        } else {
          updateLike({ variables: { likedId: userId, likerId: likedId, matched: true }})
          insertLike({ variables: { likedId: likedId, likerId: userId, matched: true, dislike: false }});   
          sendLike(likedId, likerName); 
          updateVideoLikes({ variables: { id : videoId, likes: videoData[likedIndex].userVideos[likedVideoIndex].likes + 1 }});
          updateVideoViews({ variables: { id : videoId, views: videoData[likedIndex].userVideos[likedVideoIndex].views + 1 }});          
        }
      })
      .catch(error => {});
    } 

    Segment.track("Like User"); 
  }

  async function onDislike() { 

    const dislikedId = currentUserId; 
    const dislikedIndex = userIndex; 
    const dislikedVideoIndex = videoIndex; 

    nextUser();

    if(!dislikeColors[dislikedIndex].dislike && !likeColors[dislikedIndex].like){
      insertLike({ variables: { likedId: dislikedId, likerId: userId, matched: false, dislike: true }});
      updateVideoDislikes({ variables: { id : videoId, dislikes: videoData[dislikedIndex].userVideos[dislikedVideoIndex].dislikes + 1 }});
      updateVideoViews({ variables: { id : videoId, views: videoData[dislikedIndex].userVideos[dislikedVideoIndex].views + 1 }});  
    }

    Segment.track("Dislike User"); 
  }

  function initColors(users){
    const newLikeColors = users.map(user => {
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

    const newDislikeColors = users.map(user => {
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
    if(videoData && videoData.length > 0){
      setCurrentUserId(videoData[userIndex].id); 
      setCurrentName(videoData[userIndex].firstName);
      setCurrentCollege(videoData[userIndex].college); 
      setCurrentCity(videoData[userIndex].city);
      setCurrentRegion(videoData[userIndex].region); 


      // let currentLocation = videoData[userIndex].location;
      // if(currentLocation){
      //   const distance = getDistance(
      //     { latitude: latitude, longitude: longitude }, 
      //     { latitude: currentLocation.coordinates[1], longitude: currentLocation.coordinates[0] }
      //   ); 
      //   const distanceMiles = Math.round(distance / 1609); 
      //   setCurrentDistance(distanceMiles); 
      // } else {
      //   setCurrentDistance(null); 
      // }

      setMuxPlaybackId(videoData[userIndex].userVideos[videoIndex].muxPlaybackId); 
 
      if(userIndex > 0 && locationVideos){
        if(videoData[userIndex - 1].lastUploaded < videoData[userIndex].lastUploaded){
          _storeLastWatchedUpper(videoData[userIndex].lastUploaded); 
        } else {
          _storeLastWatchedLower(videoData[userIndex].lastUploaded); 
        }
      }
 
      setUserCount(videoData.length); 
      setCurrentUserVideoCount(videoData[userIndex].userVideos.length);
      setQuestionText(videoData[userIndex].userVideos[videoIndex].videoQuestion.questionText);
      setFlags(videoData[userIndex].userVideos[videoIndex].flags); 
      setVideoId(videoData[userIndex].userVideos[videoIndex].id); 
    }

    if(videoData && userIndex + lowerLimit + upperLimit + noLocationLimit > videoData.length && !querying){
      setQuerying(true); 
      queryVideosInit(lastLoadedUpper, lastLoadedLower, lastLoadedNoLocation, upperLimit, lowerLimit, noLocationLimit); 
    }

  }, [videoIndex, userIndex, videoData])

  const nextVideo = () => {
    updateVideoViews({ variables: { id : videoId, views: videoData[userIndex].userVideos[videoIndex].views + 1 }});  
     if(currentUserVideoCount == 1){
      // do nothing
    } else if(videoIndex + 1 !== currentUserVideoCount){
      setVideoIndex(videoIndex + 1); 
      setCurrentProgress(0); 
    } else {
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
      // setNoLikesLeft(true);
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
      if(currentCity != null || currentRegion != null){
        return (
          <Text style={styles.separatorText}>{'\u2B24'}</Text>
        )  
      } else {
        return null; 
      }    
    }

    function Distance(){
      if(currentCity != null || currentRegion != null){
        return (
          <Text style={styles.locationText}>{currentCity}, {currentRegion}</Text>
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

  const [dislikeColor, setDislikeColor] = useState('#eee');
  const [likeColor, setLikeColor] = useState('#eee'); 

  useEffect(() => {
    setDislikeColor(dislikeColors[userIndex] ? dislikeColors[userIndex].color : '#eee');
    setLikeColor(likeColors[userIndex] ? likeColors[userIndex].color : '#eee'); 
  }, [userIndex, dislikeColors, likeColors]); 


  if(initialized){
    if('ios' in Constants.platform){
      return (
        <View style={styles.viewBackground}>
          <View style={styles.videosView} {..._panResponder.panHandlers}>
            <MultipleVideos 
              key={renderedUserIndex1}
              shouldPlay={shouldPlay}
              playbackObject={playbackObject}
              _onPlaybackStatusUpdate={_onPlaybackStatusUpdate}
              videoData={videoData}
              userIndex={userIndex}
              videoIndex={videoIndex}
              renderedUserIndex={renderedUserIndex1}
              userCount={userCount}
            />
            <MultipleVideos 
              key={renderedUserIndex2}
              shouldPlay={shouldPlay}
              playbackObject={playbackObject}
              _onPlaybackStatusUpdate={_onPlaybackStatusUpdate}
              videoData={videoData}
              userIndex={userIndex}
              videoIndex={videoIndex}
              renderedUserIndex={renderedUserIndex2}
              userCount={userCount}
            />
            <ProgressBarsContainer />
            <BlurView tint="dark" intensity={40} style={homeStyles.questionContainer}>
              <Text style={styles.questionText}>{questionText}</Text>
            </BlurView>
            <UserInfo />
          </View>
          <View style={styles.heartView}>
            <TouchableOpacity onPress={onDislike}>
              <Entypo name='cross' size={65} color={dislikeColor} />  
            </TouchableOpacity>      
            <TouchableOpacity onPress={onLike}>
              <Ionicons name='md-heart' size={65} color={likeColor} />        
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
          {/* <NoLikesPopup 
            visible={noLikesLeft}
            setVisible={setNoLikesLeft}
          /> */}
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
              <Entypo name='cross' size={65} color={dislikeColor} />  
            </TouchableOpacity>      
            <TouchableOpacity onPress={onLike}>
              <Ionicons name='md-heart'  size={65} color={likeColor} />        
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
          {/* <NoLikesPopup 
            visible={noLikesLeft}
            setVisible={setNoLikesLeft}
          /> */}
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