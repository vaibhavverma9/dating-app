import React, { useState, useEffect, useContext, useRef, useMemo } from 'react';
import { Text, View, ActivityIndicator, StyleSheet } from 'react-native';
import { homeStyles } from '../../styles/homeStyles';
import { BlurView } from 'expo-blur';
import { Ionicons, Entypo, Feather } from '@expo/vector-icons'
import { useMutation, useLazyQuery, useQuery } from '@apollo/client';
import { INSERT_LIKE, GET_LIKE, client, GET_VIDEOS, INSERT_USER, UPDATE_LIKE, GET_NUMBER_VIDEOS, UPDATE_PUSH_TOKEN, GET_USER_INFO, UPDATE_VIDEO_LIKES, UPDATE_VIDEO_VIEWS, GET_GENDER_INTEREST, GET_QUESTIONS, UPDATE_VIDEO_DISLIKES, GET_LIKE_COUNT } from '../../utils/graphql/GraphqlClient';
import OptionsModal from './OptionsModal'; 
import { UserIdContext } from '../../utils/context/UserIdContext'
import * as Segment from 'expo-analytics-segment';
import { _retrieveUserId, _storeUserId, _retrieveDoormanUid, _storeDoormanUid, _retrieveLatitude, _retrieveLongitude, _retrieveName, _retrievePushShown, _storePushShown, _storeName, _storeBio, _retrieveBio, _storeGenderInterest, _retrieveGenderGroup} from '../../utils/asyncStorage'; 
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
import ProgressBar from 'react-native-progress/Bar'
import { Dimensions } from 'react-native';
import { getDistance } from 'geolib';
import { colors } from '../../styles/colors';
import { VideoCountContext } from '../../utils/context/VideoCountContext';

 
export default function HomeContents(props) {

  const { uid, phoneNumber } = useDoormanUser();
  const [videoData, setVideoData] = useState(null); 
  const [questionText, setQuestionText] = useState(''); 
  const [shouldPlay, setShouldPlay] = useState(true); 

  const [userCount, setUserCount] = useState(0); 
  // const [upperUserCount, setUpperUserCount] = useState(0); 
  // const [lowerUserCount, setLowerUserCount] = useState(0); 
  const [currentUserVideoCount, setCurrentUserVideoCount] = useState(0); 
  const [currentUserId, setCurrentUserId] = useState(0); 

  const [currentName, setCurrentName] = useState('');

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
  const [pushPopupShown, setPushPopupShown] = useState(false); 
  const [pushPopupVisible, setPushPopupVisible] = useState(false);
  const [pushName, setPushName] = useState(''); 

  const [likeColors, setLikeColors] = useState([]);
  const [dislikeColors, setDislikeColors] = useState([]);

  const [insertLike, { insertLikeData }] = useMutation(INSERT_LIKE);
  const [updatePushToken, { updatePushTokenData }] = useMutation(UPDATE_PUSH_TOKEN);
  const [updateVideoLikes, { updateVideoLikesData }] = useMutation(UPDATE_VIDEO_LIKES);
  const [updateVideoDislikes, { updateVideoDislikesData }] = useMutation(UPDATE_VIDEO_DISLIKES);
  const [updateVideoViews, { updateVideoViewsData }] = useMutation(UPDATE_VIDEO_VIEWS);

  const [optionsModalVisible, setOptionsModalVisible] = useState(false); 

  let playbackObject = useRef(null); 

  const [timedOut, setTimedOut] = useState(false);
  const [noMoreVideos, setNoMoreVideos] = useState(false); 
  const [noLikesLeft, setNoLikesLeft] = useState(false); 
  // const [lastLoaded, setLastLoaded] = useState(props.lastLoaded); 
  const [lastPerformance, setLastPerformance] = useState(props.lastPerformance); 
  const [groupPreference, setGroupPreference] = useState(props.groupPreference); 
  const [genderGroup, setGenderGroup] = useState(props.genderGroup); 

  const point = {
    "type" : "Point", 
    "coordinates": [-87.6298, 41.8781]
  }; 

  const [likeCount, setLikeCount] = useState(0);
  const [likeLimit, setLikeLimit] = useState(10); 
  const [videoCount, setVideoCount] = useContext(VideoCountContext); 

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
    Segment.track("Home Page - Start Videos"); 
    // networkConnected(); 
    getNumberVideos({variables: { userId }}); 

    let yesterday = new Date(Date.now() - 86400000); 
    // getLikeCount({ variables: { likerId: userId, since: yesterday }});
    setTimeout(() => {
      setTimedOut(true);
    }, 5000); 

  }, []);

  useEffect(() => {
    processVideos(props.data); 
  }, [props.data]);

  // async function networkConnected(){
  //   const networkInfo = await Network.getNetworkStateAsync(); 
  //   setConnectedInternet(networkInfo.isConnected); 
  // }


  async function initSegment() {
    let name = await _retrieveName(); 
    let bio = await _retrieveBio(); 
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

    getVideosLower({ variables: { userId, limit: props.limit, groupPreference, lastPerformance } })
  }

  function processVideos(data){
    
    const users = data.usersLocation; 

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
        initColors(users); 
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

    // if(profileVideoCount == 0 && userIndex % 5 == 3){
    //   setAddPopupVisible(true); 
    // }

    if(!pushPopupShown){
      const pushShown = await _retrievePushShown(); 
      if (!pushShown && Constants.isDevice) {
        const { status: existingStatus } = await Permissions.getAsync(Permissions.NOTIFICATIONS);
        if(existingStatus !== 'granted'){
          setPushPopupVisible(true); 
          setPushName(likerName); 
        }        
        _storePushShown(true); 
      }
      setPushPopupShown(true); 
    }

    if(userIndex == 10 * (videoCount + 1) || userIndex == 10){
      setNoLikesLeft(true);
    } else {
      if(!likeColors[likedIndex].like){  
        nextUser(); 
        insertLike({ variables: { likedId: likedId, likerId: userId, matched: false, dislike: false }});
        if(profileVideoCount > 0){
          sendLike(likedId, likerName);
        }
        Segment.track("Like User"); 
      } else {
        nextUser(); 
      }
    }
    updateVideoLikes({ variables: { id : videoId, likes: videoData[likedIndex].userVideos[likedVideoIndex].likes + 1 }});
    updateVideoViews({ variables: { id : videoId, views: videoData[likedIndex].userVideos[likedVideoIndex].views + 1 }});      
  }

  async function onDislike() { 

    const dislikedId = currentUserId; 
    const dislikedIndex = userIndex; 
    const dislikedVideoIndex = videoIndex; 

    if(userIndex == 10 * (videoCount + 1)){
      setNoLikesLeft(true);
    } else {
      nextUser();

      if(!dislikeColors[dislikedIndex].dislike && !likeColors[dislikedIndex].like){
        // setLikeCount(likeCount + 1); 
        insertLike({ variables: { likedId: dislikedId, likerId: userId, matched: false, dislike: true }});
        Segment.track("Dislike User"); 
      }
      updateVideoDislikes({ variables: { id : videoId, dislikes: videoData[dislikedIndex].userVideos[dislikedVideoIndex].dislikes + 1 }});
      updateVideoViews({ variables: { id : videoId, views: videoData[dislikedIndex].userVideos[dislikedVideoIndex].views + 1 }});  
    }

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

      setMuxPlaybackId(videoData[userIndex].userVideos[videoIndex].muxPlaybackId); 
 
      setUserCount(videoData.length); 
      setCurrentUserVideoCount(videoData[userIndex].userVideos.length);
      setQuestionText(videoData[userIndex].userVideos[videoIndex].videoQuestion.questionText);
      setFlags(videoData[userIndex].userVideos[videoIndex].flags); 
      setVideoId(videoData[userIndex].userVideos[videoIndex].id); 
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
      if(playbackStatus.positionMillis == playbackStatus.durationMillis){
        nextVideo(); 
      }
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
            name={name}
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
          <NoLikesPopup 
            visible={noLikesLeft}
            setVisible={setNoLikesLeft}
            goToAddVideo={goToAddVideo}
          />
        </View>
      );    
    }
  } else {
    if(!timedOut){
      return (
        <View style={styles.badInternetView}>
          <ActivityIndicator size="small" color="#eee" />
        </View>
      )  
    } else {
      return (
        <View style={{ height: '100%', justifyContent: 'center', alignItems: 'center', backgroundColor: colors.primaryBlack }}>
          <View style={{ height: '40%', width: '85%', backgroundColor: colors.primaryPurple, borderRadius: 5, padding: 10, alignItems: 'center', justifyContent: 'center' }}>
              <Text style={{ fontSize: 22, fontWeight: 'bold', paddingTop: 15, paddingBottom: 5, color: colors.primaryWhite }}>Out of users!</Text>
              <Text style={{ textAlign: 'center', fontSize: 20, fontWeight: '300', paddingHorizontal: 5, color: colors.primaryWhite }}>Come back tomorrow for more users :)</Text>
          </View>
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