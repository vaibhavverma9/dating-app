import { TouchableOpacity, View, Modal, Text, StyleSheet, Dimensions} from 'react-native';
import React, { useEffect, useState, useRef } from 'react'; 
import { BlurView } from 'expo-blur';
import { fullPageVideoStyles } from '../../styles/fullPageVideoStyles';
import { colors } from '../../styles/colors';
import { Video, Audio } from 'expo-av';   
import { homeStyles } from '../../styles/homeStyles';
import ProgressBar from 'react-native-progress/Bar';

export default function ChannelMultipleVideos(props) {

  const [index, setIndex] = useState(0); 
  const renderedVideos = [];
  let playbackObject = useRef(null); 
  const [currentProgress, setCurrentProgress] = useState(0); 
  const [questionText, setQuestionText] = useState(''); 

  const [userVideos, setUserVideos] = useState([]);
  const [name, setName] = useState('');
  const [college, setCollege] = useState('');
  const [city, setCity] = useState('');
  const [region, setRegion] = useState(''); 

  useEffect(() => {

    if(props.matchesData && props.currentUserId){
      const like = props.matchesData.filter(like => {
        return props.currentUserId == like.profileId; 
      });
  
      setName(like[0].profileUser.firstName);
      setCollege(like[0].profileUser.college);
      setCity(like[0].profileUser.city);
      setRegion(like[0].profileUser.region);
      setUserVideos(like[0].profileUser.userVideos); 
    }

  }, [props.matchesData, props.currentUserId]);

  useEffect(() => {
    if(userVideos.length > 0){
      setQuestionText(userVideos[index].videoQuestion.questionText)
    }
  }, [userVideos, index]); 

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

    for (let i = 0; i < userVideos.length; i++){
      if(i < index){
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
      } else if (i == index) {
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

  const progressBarWidth = () => {
    const windowWidth = Dimensions.get('window').width;
    return windowWidth / userVideos.length;
  }

  const _onPlaybackStatusUpdate = playbackStatus => {

    if(playbackStatus.positionMillis && playbackStatus.durationMillis){
      const progress = playbackStatus.positionMillis / playbackStatus.durationMillis; 
      setCurrentProgress(progress);   
      if(playbackStatus.positionMillis + 50 >= playbackStatus.durationMillis || playbackStatus.didJustFinish){
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

  const playingData = { 
    isMuted: false, 
    shouldPlay: true, 
    playbackObject: playbackObject, 
    _onPlaybackStatusUpdate: _onPlaybackStatusUpdate, 
    display: "flex"
  }

  const nonplayingData = {
      isMuted: true, 
      shouldPlay: false, 
      playbackObject: null, 
      _onPlaybackStatusUpdate: null, 
      display: "none"
  }

  useEffect(() => {
    Audio.setAudioModeAsync({
        playsInSilentModeIOS: true
    }); 
  }, []);    

  function touchScren(){
    nextVideo(); 
  }

  function nextVideo(){
    if(index + 1 < userVideos.length){
      setCurrentProgress(0); 
      setIndex(index + 1);
    } else {
      props.setVisible(false); 
      setIndex(0); 
    }
  }

  if(index < userVideos.length){
    const muxPlaybackUrlA = 'https://stream.mux.com/' + userVideos[index].muxPlaybackId + '.m3u8';   

    renderedVideos.push(
      <PlayingVideo
          key={index}
          playbackObject={playingData.playbackObject}
          source={muxPlaybackUrlA}
          isMuted={playingData.isMuted}
          shouldPlay={playingData.shouldPlay}
          _onPlaybackStatusUpdate={playingData._onPlaybackStatusUpdate}
          display={playingData.display}
      />
    )
  }

  if(index + 1 < userVideos.length){

    const muxPlaybackUrlB = 'https://stream.mux.com/' + userVideos[index + 1].muxPlaybackId + '.m3u8';   

    renderedVideos.push(
      <PlayingVideo
          key={index + 1}
          playbackObject={nonplayingData.playbackObject}
          source={muxPlaybackUrlB}
          isMuted={nonplayingData.isMuted}
          shouldPlay={nonplayingData.shouldPlay}
          _onPlaybackStatusUpdate={nonplayingData._onPlaybackStatusUpdate}
          display={nonplayingData.display}
      />
    )
  }

  function UserInfo(){

    function DistanceSeparator(){
      if(city != null || region != null){
        return (
          <Text style={{ color: '#eee', fontSize: 5, paddingLeft: 5}}>{'\u2B24'}</Text>
        )  
      } else {
        return null; 
      }    
    }

    function Distance(){
      if(city != null || region != null){
        return (
          <Text style={{ color: '#eee', paddingLeft: 5}}>{city}, {region}</Text>
        )  
      } else {
        return null; 
      }
    }


    if(name){
      if(college){
        return (
            <View style={homeStyles.userInfoContainer}>
              <View style={{ flexDirection: 'row', alignItems: 'center'}}>
                <Text style={{ color: '#eee'}}>{name}</Text>
                {/* <Text style={styles.separatorText}>{'\u2B24'}</Text> */}
                <DistanceSeparator />
                <Distance />  
              </View>
              <Text style={{ color: '#eee', paddingLeft: 5}}>{college}</Text>      
            </View>
        )    
      } else {
        return (
          <View style={homeStyles.userInfoContainer}>
            <View style={{ flexDirection: 'row', alignItems: 'center'}}>
              <Text style={{ color: '#eee'}}>{name}</Text>     
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

  return (
    <Modal
      animationType="slide"
      transparent={false}
      visible={props.visible}>
      <TouchableOpacity style={{ flex: 1, backgroundColor: colors.primaryBlack }} onPress={touchScren}>

        {renderedVideos}

        <BlurView tint="dark" intensity={40} style={homeStyles.questionContainer}>
          <Text style={{fontSize: 18,color: "#eee", padding: 15, textAlign: 'center'}}>{questionText}</Text>
        </BlurView>
        <ProgressBarsContainer />
        <UserInfo />
      </TouchableOpacity>
      </Modal>
  );
}

function PlayingVideo({playbackObject, source, isMuted, shouldPlay, _onPlaybackStatusUpdate, display}){

  const videoStyle = { width: '100%', height: '100%', display: display}; 
  return(
      <Video
          ref={playbackObject}
          source={{uri: source}}
          rate={1.0}
          volume={1.0}
          isMuted={isMuted}
          resizeMode="cover"
          usePoster={true}
          shouldPlay={shouldPlay}
          onPlaybackStatusUpdate={_onPlaybackStatusUpdate}
          progressUpdateIntervalMillis={50}
          isLooping
          style={videoStyle}
          >
      </Video>
  )
}