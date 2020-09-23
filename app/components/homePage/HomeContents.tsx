import React, { useState, useEffect, useContext, useRef, useMemo } from 'react';
import { Text, View, ActivityIndicator, StyleSheet } from 'react-native';
import { homeStyles } from '../../styles/homeStyles';
import { BlurView } from 'expo-blur';
import { Ionicons, Entypo } from '@expo/vector-icons'
import { useMutation, useLazyQuery } from '@apollo/client';
import { INSERT_LIKE, GET_VIDEOS, GET_NUMBER_VIDEOS, UPDATE_PUSH_TOKEN, GET_USER_INFO, UPDATE_VIDEO_LIKES, UPDATE_VIDEO_VIEWS, UPDATE_VIDEO_DISLIKES } from '../../utils/graphql/GraphqlClient';
import OptionsModal from './OptionsModal'; 
import { UserIdContext } from '../../utils/context/UserIdContext'
import * as Segment from 'expo-analytics-segment';
import { _retrieveUserId, _storeUserId, _retrieveDoormanUid, _storeDoormanUid, _retrieveLatitude, _retrieveLongitude, _retrieveName, _retrievePushShown, _storePushShown, _storeName, _storeBio, _retrieveBio, _storeGenderInterest, _retrieveGenderGroup, _storeAddVideoShown, _retrieveAddVideoShown, _retrieveExplanationShown, _storeExplanationShown } from '../../utils/asyncStorage'; 
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
import { TouchableOpacity } from 'react-native';
import SingleVideo from '../videosPage/SingleVideo';
import ProgressBar from 'react-native-progress/Bar';
import { Dimensions } from 'react-native';
import { getDistance } from 'geolib';
import { colors } from '../../styles/colors';
import { VideoCountContext } from '../../utils/context/VideoCountContext';
import { useIsFocused } from '@react-navigation/native';
import LikeDislikeExplanation from '../modals/LikeDislikeExplanation'; 
import { Linking } from 'expo';

export default function HomeContents(props) {
  const isFocused = useIsFocused();
  const { uid, phoneNumber } = useDoormanUser();
  const [videoData, setVideoData] = useState(null); 
  const [questionText, setQuestionText] = useState(''); 
  const [shouldPlay, setShouldPlay] = useState(true); 

  const [userCount, setUserCount] = useState(0); 
  // const [upperUserCount, setUpperUserCount] = useState(0); 
  // const [lowerUserCount, setLowerUserCount] = useState(0); 
  const [currentUserVideoCount, setCurrentUserVideoCount] = useState(0); 
  const [currentUserId, setCurrentUserId] = useState(0); 
  const [currentAge, setCurrentAge] = useState(null);

  const [currentName, setCurrentName] = useState('');
  const [currentInstagram, setCurrentInstagram] = useState(''); 

  const [currentCollege, setCurrentCollege] = useState(''); 
  const [currentCity, setCurrentCity] = useState(null);
  const [currentRegion, setCurrentRegion] = useState(null); 
  
  const [userId, setUserId] = useContext(UserIdContext);
  const [name, setName] = useState(''); 

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
  const [pushPopupVisible, setPushPopupVisible] = useState(false);
  const [likeDislikeExplanation, setLikeDislikeExplanation] = useState(false); 
  const [pushName, setPushName] = useState(''); 
  const [pushProfileUrl, setProfileUrl] = useState(''); 

  const [likeColors, setLikeColors] = useState([]);
  const [dislikeColors, setDislikeColors] = useState([]);

  const [insertLike, { insertLikeData }] = useMutation(INSERT_LIKE);
  const [updatePushToken, { updatePushTokenData }] = useMutation(UPDATE_PUSH_TOKEN);
  const [updateVideoLikes, { updateVideoLikesData }] = useMutation(UPDATE_VIDEO_LIKES);
  const [updateVideoDislikes, { updateVideoDislikesData }] = useMutation(UPDATE_VIDEO_DISLIKES);
  const [updateVideoViews, { updateVideoViewsData }] = useMutation(UPDATE_VIDEO_VIEWS);

  const [optionsModalVisible, setOptionsModalVisible] = useState(false); 

  const playbackObject = useRef(null); 

  const [noMoreVideos, setNoMoreVideos] = useState(false); 
  const [noLikesLeft, setNoLikesLeft] = useState(false); 
  // const [lastLoaded, setLastLoaded] = useState(props.lastLoaded); 
  const [lastPerformance, setLastPerformance] = useState(props.lastPerformance); 
  const [groupPreference, setGroupPreference] = useState(props.groupPreference); 
  const [videoCount, setVideoCount] = useContext(VideoCountContext); 
  const [secondId, setSecondId] = useState(props.secondId); 
  const [region1, setRegion1] = useState(props.region1); 
  const [region2, setRegion2] = useState(props.region2); 
  const [isMuted, setIsMuted] = useState(false); 
  const [currentProgress, setCurrentProgress] = useState(0); 

  const videoLimit = 10; 

  const [liked, setLiked] = useState(false); 
  const [disliked, setDisliked] = useState(false); 

  const [getVideosLower, { data: videosLower }] = useLazyQuery(GET_VIDEOS, 
  { 
    onCompleted: (videosLower) => { 
      processVideos(videosLower) 
    } 
  }); 

  const [getNumberVideos, { data: numberVideos }] = useLazyQuery(GET_NUMBER_VIDEOS,
  {
    onCompleted: (numberVideos) => {
      const count = numberVideos.videos_aggregate.aggregate.count;
      setProfileVideoCount(count); 
    }
  });

  const [getUserInfo, { data: userInfo }] = useLazyQuery(GET_USER_INFO, 
  {
    onCompleted: (userInfo) => { 
      const users = userInfo.users; 
      
      if(users[0].firstName){
        setName(users[0].firstName); 
        _storeName(users[0].firstName); 
      };

      if(users[0].bio){
        _storeBio(users[0].bio); 
      }

      Segment.identifyWithTraits(userId.toString(), {'name' : name, 'phoneNumber' : phoneNumber});
      Segment.screen('Home');   
    } 
  });

  const _panResponder = PanResponder.create({
    onStartShouldSetPanResponder: (evt, gestureState) => true,
    onStartShouldSetPanResponderCapture: (evt, gestureState) => true,
    // onMoveShouldSetPanResponder: (evt, gestureState) => {},
    // onMoveShouldSetPanResponderCapture: (evt, gestureState) => {},
    // onPanResponderGrant: (evt, gestureState) => {},
    // onPanResponderMove: (evt, gestureState) => {},
    onPanResponderTerminationRequest: (evt, gestureState) => true,
    onPanResponderRelease: (evt, gestureState) => {

      nextVideo(); 
      // setShouldPlay(!shouldPlay);         
    },
    // onPanResponderTerminate: (evt, gestureState) => {},
    onShouldBlockNativeResponder: (evt, gestureState) => true
  });

  useEffect(() => {
    if(isFocused){
      setShouldPlay(true); 
    } else {
      setShouldPlay(false); 
    }

    initPopups(); 
    initSegment(); 
    Segment.track("Home Page - Start Videos"); 
    // networkConnected(); 
    getNumberVideos({variables: { userId }}); 

  }, []);

  async function initSegment() {
    const name = await _retrieveName(); 
    const bio = await _retrieveBio(); 
    if(name == '' || bio == ''){
      getUserInfo({ variables: { userId }}); 
    } else {
      setName(name); 
      Segment.identifyWithTraits(userId.toString(), {'name' : name, 'phoneNumber' : phoneNumber});
      Segment.screen('Home'); 
    }
  }

  // useEffect(() => {
  //   if(props.lastLoaded != lastLoaded){
  //     setQuerying(false); 
  //   }
  // }, [lastLoaded]);
  
  useEffect(() => {
    if(props.lastPerformance != lastPerformance){
      setQuerying(false); 
    }
  }, [lastPerformance]); 

  useEffect(() => {
    setInitialized(false); 
    setUserIndex(0);
    setVideoIndex(0); 
    queryVideos(); 
  }, [groupPreference]);


  async function queryVideos(){

    getVideosLower({ variables: { userId, limit: props.limit, groupPreference, lastPerformance, secondId, region1, region2} })
  }

  function processVideos(data){
    
    const users = data.usersLocation; 
    initColors(users); 

    if (users.length > 0){
      if(!initialized){
        setInitialized(true); 
        setVideoData(users);
        setCurrentUserId(users[0].id); 
        setCurrentName(users[0].firstName);
        setCurrentInstagram(users[0].instagram);
        setCurrentCollege(users[0].college);
        setCurrentCity(users[0].city);
        setCurrentRegion(users[0].region); 

        if(users[0].birthday){
          const birthday = new Date(users[0].birthday);
          const age = _calculateAge(birthday) ;
          setCurrentAge(age); 
          } else {
          setCurrentAge(null); 
        }

        setMuxPlaybackId(users[0].userVideos[0].muxPlaybackId); 
        // setLastLoaded(users[users.length - 1].lastUploaded); 
        setLastPerformance(users[users.length - 1].performance); 
        setUserCount(users.length); 
        setCurrentUserVideoCount(users[0].userVideos.length);
        setQuestionText(users[0].userVideos[0].videoQuestion.questionText);  
      } else {
        const tempVideoData = [...videoData, ...users];
        setVideoData(tempVideoData);
        setUserCount(userCount + users.length); 
        setLastPerformance(users[users.length - 1].performance); 
        // setLastLoaded(users[users.length - 1].lastUploaded); 
      }
    } else {
      // Stops any further querying
      setQuerying(true);  
    }
  }

  // changes in tabs will affect shouldPlay 
  useEffect(() => {
    props.navigation.addListener('blur', () => {
      setShouldPlay(false);
    });

    props.navigation.addListener('focus', async () => {
      setShouldPlay(true);
    });  
  }, [props.navigation]);

  const registerForPushNotificationsAsync = async () => {
    if (Constants.isDevice) {
      const { status } = await Permissions.askAsync(Permissions.NOTIFICATIONS);
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
    const res = await axios({
      method: 'post', 
      url: 'https://gentle-brook-91508.herokuapp.com/push',
      data: { "likerId" : userId, "likedId" : likedId, "likerName" : likerName }
    }); 
  }

  async function createChannel(likedId){
    try {
      const response = await axios.post("https://gentle-brook-91508.herokuapp.com/createChannelStream", {
        userId: userId.toString(),
        likerId: likedId.toString(),
      });
    } catch (err) {
      console.log(err); 
      return;
    }
  }

  const [addVideoShown, setAddVideoShown] = useState(false);
  const [pushShown, setPushShown] = useState(false); 

  async function initPopups(){
    const addVideoShown = await _retrieveAddVideoShown(); 
    const pushShown = await _retrievePushShown(); 
    // const explanationShown = await _retrieveExplanationShown(); 

    setAddVideoShown(addVideoShown);
    setPushShown(pushShown); 

    // if(!explanationShown){
    //   setLikeDislikeExplanation(true); 
    //   _storeExplanationShown(true); 
    // }

  }

  async function onLike() { 

    Segment.track("Like User"); 


    const likedId = currentUserId; 
    const likedIndex = userIndex; 
    const likedName = currentName; 
    let likedVideoIndex = videoIndex; 

    if(currentProgress < 0.25 && videoIndex > 0){
      likedVideoIndex = videoIndex - 1; 
    } 

    if (!pushShown && Constants.isDevice) {
      const { status: existingStatus } = await Permissions.getAsync(Permissions.NOTIFICATIONS);
      if(existingStatus !== 'granted'){
        setPushName(likedName); 
        setProfileUrl(videoData[likedIndex].profileUrl)
        setPushPopupVisible(true); 
        setPushShown(true); 
      }        
      _storePushShown(true); 
    }

    if(profileVideoCount == 0 && userIndex == 6){
      if(pushShown && !addVideoShown){
        setAddPopupVisible(true); 
        setAddVideoShown(true); 
        _storeAddVideoShown(true);  
      }
    }

    if((userIndex == videoLimit * (videoCount + 1) || userIndex == videoLimit) && profileVideoCount == 0){
      setNoLikesLeft(true);
      Segment.track("Home - Out of Likes")
    } else {
      if(!likeColors[likedIndex].like){  

          nextUser(); 

        insertLike({ variables: { likedId: likedId, likerId: userId, matched: false, dislike: false }});
        sendLike(likedId, name);
        createChannel(likedId); 

        updateVideoLikes({ variables: { id : videoId, likes: videoData[likedIndex].userVideos[likedVideoIndex].likes + 1 }});
        updateVideoViews({ variables: { id : videoId, views: videoData[likedIndex].userVideos[likedVideoIndex].views + 1 }});      
    
      } else {
          nextUser(); 
      }
    }
  }

  async function onDislike() { 

    Segment.track("Dislike User"); 


    const dislikedId = currentUserId; 
    const dislikedIndex = userIndex; 
    let dislikedVideoIndex = videoIndex; 

    if(currentProgress < 0.25 && videoIndex > 0){
      dislikedVideoIndex = videoIndex - 1; 
    } 

    if((userIndex == videoLimit * (videoCount + 1) || userIndex == videoLimit) && profileVideoCount == 0){
      setNoLikesLeft(true);
      Segment.track("Home - Out of Likes")
    } else {
        nextUser(); 

      if(!dislikeColors[dislikedIndex].dislike && !likeColors[dislikedIndex].like){
        // setLikeCount(likeCount + 1); 
        insertLike({ variables: { likedId: dislikedId, likerId: userId, matched: false, dislike: true }});
        updateVideoDislikes({ variables: { id : videoId, dislikes: videoData[dislikedIndex].userVideos[dislikedVideoIndex].dislikes + 1 }});
        updateVideoViews({ variables: { id : videoId, views: videoData[dislikedIndex].userVideos[dislikedVideoIndex].views + 1 }});    
      }
    }

  }

  function initColors(users){
    // console.log(users);
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

  function _calculateAge(birthday) { // birthday is a date
    const today = new Date();
    let age = today.getFullYear() - birthday.getFullYear();
    let m = today.getMonth() - birthday.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthday.getDate())) {
        age--;
    }
    return age;
  }

  // set new muxPlaybackId and questionText with any update to videoIndex, userIndex or videoData
  useEffect(() => {
    if(videoData && videoData.length > 0){
      setCurrentUserId(videoData[userIndex].id); 
      setCurrentName(videoData[userIndex].firstName);
      setCurrentInstagram(videoData[userIndex].instagram);
      setCurrentCollege(videoData[userIndex].college); 
      setCurrentCity(videoData[userIndex].city);
      setCurrentRegion(videoData[userIndex].region); 

      if(videoData[userIndex].birthday){
        const birthday = new Date(videoData[userIndex].birthday);
        const age = _calculateAge(birthday);
        setCurrentAge(age); 
      } else {
        setCurrentAge(null);
      }

      setUserCount(videoData.length); 
      setCurrentUserVideoCount(videoData[userIndex].userVideos.length);

      if(videoIndex < videoData[userIndex].userVideos.length){
        setMuxPlaybackId(videoData[userIndex].userVideos[videoIndex].muxPlaybackId);  
        setQuestionText(videoData[userIndex].userVideos[videoIndex].videoQuestion.questionText);
        setFlags(videoData[userIndex].userVideos[videoIndex].flags); 
        setVideoId(videoData[userIndex].userVideos[videoIndex].id);   
      }
    }

    if(videoData && userIndex + props.limit > videoData.length && !querying){
      setQuerying(true); 
      queryVideos(); 
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

    if(userIndex !== userCount - 1){
      // setLikeCount(likeCount + 1); 
      setUserIndex(userIndex + 1);
      setCurrentProgress(0); 
      setVideoIndex(0);    
    } else {
      if(userIndex == 0){
        setQuerying(true);
        queryVideos(); 
      } else {
        setNoMoreVideos(true); 
        Segment.track("Home - Out of Users")
      }
    }
  }

  function moreOptions() {
    setOptionsModalVisible(true); 
  }


  function goToAddVideo(){
    setAddPopupVisible(false); 
    setNoLikesLeft(false); 
    props.navigation.navigate('Add Video');
  }


  const progressBarWidth = () => {
    const windowWidth = Dimensions.get('window').width;
    return windowWidth / currentUserVideoCount;
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

  const [loaded, setLoaded] = useState(false); 

  // useEffect(() => {
  //   if(!loaded && currentProgress){
  //     set
  //   }
  // }, [loaded, currentProgress]);

  const _onPlaybackStatusUpdate = playbackStatus => {

    if(playbackStatus.isBuffering){  
      if(loaded){
        setLoaded(false); 
      }
    } else {
      if(!loaded){
        setLoaded(true); 
      }
    }

    if(playbackStatus.positionMillis && playbackStatus.durationMillis){
      const progress = playbackStatus.positionMillis / playbackStatus.durationMillis; 
      if(shouldPlay){
        setCurrentProgress(progress);   
      }
      if(playbackStatus.positionMillis == playbackStatus.durationMillis || playbackStatus.didJustFinish){
        nextVideo(); 
      }
    } else {
      if(currentProgress > 0.5){
        nextVideo();
      } else {
        setCurrentProgress(0); 
      }
    }

  };

  const instagramLink = () => {
    const link = 'https://www.instagram.com/' + currentInstagram.replace('@', '') + '/'; 
    Linking.openURL(link); 
  }


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

    function AgeSeparator(){
      if(currentAge != null){
        return (
          <Text style={styles.separatorText}>{'\u2B24'}</Text>
        )  
      } else {
        return null; 
      }    
    }

    function Age(){
      if(currentAge != null){
        return (
          <Text style={styles.locationText}>{currentAge}</Text>
        )
      } else {
        return null; 
      }
    }

    function InstagramSeparator(){
      if(currentInstagram != null){
        return (
          <Text style={styles.separatorText}>{'\u2B24'}</Text>
        )  
      } else {
        return null; 
      }    
    }

    function Instagram(){
      if(currentInstagram != null){
        if(currentInstagram.includes('@')){
          return (
              <Text style={styles.locationText}>{currentInstagram}</Text>
          )
        } else {
          return (
            <Text style={styles.locationText}>@{currentInstagram}</Text>
          )
        }
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
                <AgeSeparator />
                <Age />
                <InstagramSeparator />
                <Instagram />
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
              <AgeSeparator />
              <Age />
              <InstagramSeparator />
              <Instagram />
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

  function PlayButton(){
    if(shouldPlay){
      return null;
    } else {
      return(
        <View style={{ justifyContent: 'center', alignItems: 'center', ...StyleSheet.absoluteFill}}>
          <Entypo name='controller-play' size={45} color={colors.primaryWhite} style={{ opacity: 0.4 }} />  
        </View>
      )
    }
  }

  function LoadingIcon(){
    if(!loaded && currentProgress == 0){
      return(
        <View style={{ justifyContent: 'center', alignItems: 'center', ...StyleSheet.absoluteFill}}>
          <ActivityIndicator size="small" color={colors.primaryWhite} style={{ opacity: 0.4 }} />
        </View>
      )
    } else {
      return null; 
    }
  }

  function LikeIndicator(){
    if(liked){
      return (
        <View style={{ position: 'absolute', left: 0, right: 0, bottom: 0, height: '100%', alignItems: 'center', justifyContent: 'center'}}>
          <BlurView tint="dark" intensity={40} style={{ borderRadius: 5, width: 80, height: 50, alignItems: 'center', justifyContent: 'center'}}>
            <Text style={{ color: '#eee', fontWeight: '500'}}>Liked</Text>
          </BlurView>
        </View>
      )  
    } else {
      return null;
    }
  }

  function DislikeIndicator(){
    if(disliked){
      return (
        <View style={{ position: 'absolute', left: 0, right: 0, bottom: 0, height: '100%', alignItems: 'center', justifyContent: 'center'}}>
          <BlurView tint="dark" intensity={40} style={{ borderRadius: 5, width: 80, height: 50, alignItems: 'center', justifyContent: 'center'}}>
            <Text style={{ color: '#eee', fontWeight: '500'}}>Passed</Text>
          </BlurView>
        </View>
      )
    } else {
      return null; 
    }
  }

  if(initialized && !noMoreVideos){
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
              isMuted={isMuted}
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
              isMuted={isMuted}
            />
            <ProgressBarsContainer />
            <BlurView tint="dark" intensity={40} style={homeStyles.questionContainer}>
              <Text style={styles.questionText}>{questionText}</Text>
            </BlurView>
            <UserInfo />
            <PlayButton />
            <LoadingIcon />
            <LikeIndicator />
            <DislikeIndicator />


          </View>


          <View style={styles.heartView}>
            <TouchableOpacity onPress={onDislike}>
              <Entypo name='cross' size={65} color={dislikeColor} />  
            </TouchableOpacity>      
            <TouchableOpacity onPress={onLike}>
              <Ionicons name='md-heart' size={65} color={likeColor} />        
            </TouchableOpacity>      
          </View>
          <View style={{ ...StyleSheet.absoluteFill, height: '15%', alignItems: 'flex-end', justifyContent: 'center'}}>
            <TouchableOpacity onPress={lastUser} style={{ paddingRight: 10}}>
              <Entypo name='back' size={30} color='#eee' />        
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
            registerForPushNotificationsAsync={registerForPushNotificationsAsync}
          />
          <PushPopup
            visible={pushPopupVisible}
            setVisible={setPushPopupVisible}
            registerForPushNotificationsAsync={registerForPushNotificationsAsync}
            name={pushName}
            profileUrl={pushProfileUrl}
          />
          <LikeDislikeExplanation 
            visible={likeDislikeExplanation}
            setVisible={setLikeDislikeExplanation}          
          />
          <NoLikesPopup 
            visible={noLikesLeft}
            setVisible={setNoLikesLeft}
            goToAddVideo={goToAddVideo}
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
              <Ionicons name='md-heart'  size={65} color={likeColor} />        
            </TouchableOpacity>      
          </View>
          <View style={{ ...StyleSheet.absoluteFill, height: '15%', alignItems: 'flex-end', justifyContent: 'center'}}>
            <TouchableOpacity onPress={lastUser} style={{ paddingRight: 10}}>
              <Entypo name='back' size={30} color='#eee' />        
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
            registerForPushNotificationsAsync={registerForPushNotificationsAsync}            
          />
          <PushPopup
            visible={pushPopupVisible}
            setVisible={setPushPopupVisible}
            registerForPushNotificationsAsync={registerForPushNotificationsAsync}
            name={pushName}
            profileUrl={pushProfileUrl}
          />
          <LikeDislikeExplanation 
            visible={likeDislikeExplanation}
            setVisible={setLikeDislikeExplanation}          
          />
          <NoLikesPopup 
            visible={noLikesLeft}
            setVisible={setNoLikesLeft}
            goToAddVideo={goToAddVideo}
          />
        </View>
      );    
    }
  } else {
    if(noMoreVideos == true){
      return (
        <View style={{ height: '100%', justifyContent: 'center', alignItems: 'center', backgroundColor: colors.primaryWhite }}>
          <View style={{ height: '40%', width: '85%', backgroundColor: colors.primaryPurple, borderRadius: 5, padding: 10, alignItems: 'center', justifyContent: 'center' }}>
              <Text style={{ fontSize: 22, fontWeight: 'bold', paddingTop: 15, paddingBottom: 5, color: colors.primaryWhite }}>No more users near you!</Text>
              <Text style={{ textAlign: 'center', fontSize: 20, fontWeight: '300', paddingHorizontal: 5, color: colors.primaryWhite }}>Come back again for new content :)</Text>
          </View>
      </View>      
      )    
    } else {
      return (
        <View style={styles.badInternetView}>
          <ActivityIndicator size="small" color="#eee" style={{ opacity: 0.4 }} />
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
  reloadText: { color: '#eee', fontSize: 20, paddingHorizontal: 20, paddingVertical: 5},
  addVideoContainer: { 
    backgroundColor: colors.primaryWhite, 
    borderRadius: 5,
    width: 250,
    height: 50, 
    justifyContent: 'center', 
    alignItems: 'center'
  }, 
  addVideoText: {
      fontSize: 17,
      color: colors.primaryPurple,
      fontWeight: 'bold'
  }
});