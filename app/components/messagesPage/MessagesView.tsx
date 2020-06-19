import React, { useEffect, useState, useContext } from 'react';
import { FlatList, StyleSheet, View, Button, Image, Text, TextInput, ActivityIndicator, ImageBackground } from 'react-native';
import { Divider } from 'react-native-paper';
import { GET_LIKES, INSERT_LIKE, INSERT_USER, client, INSERT_MESSAGE, UPDATE_LIKE } from '../../utils/graphql/GraphqlClient';
import { TouchableOpacity, TouchableWithoutFeedback } from 'react-native-gesture-handler';
import { useMutation, useLazyQuery } from '@apollo/client';
import { UserIdContext } from '../../utils/context/UserIdContext'
import { Ionicons, MaterialIcons } from '@expo/vector-icons'
import MessagesOptions from './MessagesOptions'; 
import FullPageVideos from '../modals/FullPageVideos';
import * as Segment from 'expo-analytics-segment';
import { _retrieveUserId, _storeUserId, _retrieveDoormanUid, _storeDoormanUid } from '../../utils/asyncStorage'; 
import { colors } from '../../styles/colors';
import { Dimensions } from "react-native"; 

export default function MessagesView(props) {

  const [insertLike, { insertLikeData }] = useMutation(INSERT_LIKE);
  const [allData, setAllData] = useState([]); 
  const [likesData, setLikesData] = useState([]); 
  const [matchesData, setMatchesData] = useState([]);
  const [enabledData, setEnabledData] = useState([])
  const [userId, setUserId] = useContext(UserIdContext);
  const [timedOut, setTimedOut] = useState(false);

  const [insertMessage, { insertMessageData }] = useMutation(INSERT_MESSAGE);
  const [insertUser, { insertUserData }] = useMutation(INSERT_USER); 
  const [updateLike, { updateLikeData }] = useMutation(UPDATE_LIKE);

  const initDisabled = {all: true, matches: false, likes: false };
  const [disabled, setDisabled] = useState(initDisabled);
  const [initialized, setInitialized] = useState(false); 

  const [getLikes, { data: likesQueried }] = useLazyQuery(GET_LIKES, 
  { 
    onCompleted: (likesQueried) => { initMessages(likesQueried) } 
  }); 

  function initMessages(likesQueried){
    setAllData(likesQueried.likes); 
    setInitialized(true); 
  }

  useEffect(() => {
    const matchesData = allData.filter((like) => { return like.matched });
    setMatchesData(matchesData)

    const likesData = allData.filter((like) => { return !like.matched });
    setLikesData(likesData);
  }, [allData])

  useEffect(() => {
    if(disabled.all){
      setEnabledData(allData); 
    } else if(disabled.matches){
      setEnabledData(matchesData); 
    } else if(disabled.likes){
      setEnabledData(likesData); 
    }
  }, [disabled, allData])

  useEffect(() => {
    Segment.screen('Messages'); 
    getLikes({ variables: { userId }}); 
    setTimeout(() => { setTimedOut(true) }, 3000); 
  }, [])
  
  function reload(){
    setTimedOut(false);   
    getLikes({ variables: { userId }}); 
    setTimeout(() => { setTimedOut(true) }, 3000); 
  }

  function Item({ item }) {

    const [messagesOptionsVisible, setMessagesOptionsVisible] = useState(false); 

    const moreOptions = () => {
      setMessagesOptionsVisible(true); 
    }

    

    if(item){
      const videos = item.Liker.userVideos;
      const name = item.Liker.firstName;
      const college = item.Liker.college;

      function UserInfo(){
        if(name){
          if(college){
            return (
              <View>
                <Text style={{ color: colors.chineseWhite, fontSize: 14}}>{name}</Text>
                <Text style={{ color: colors.chineseWhite, fontSize: 12}}>{college}</Text>        
              </View>
            )    
          } else {
            return (
              <View>
                <Text style={{ color: colors.chineseWhite, fontSize: 14}}>{name}</Text>
              </View>
            )    
          }
        } else {
          return <Text style={{ color: colors.chineseWhite, fontSize: 14}}></Text>
        }
      }
      
      const [contactFlow, setContactFlow] = useState(false); 
      // const muxPlaybackId = video[0].muxPlaybackId;
      // const questionText = video[0].videoQuestion.questionText
      // const muxPlaybackUrl = 'https://image.mux.com/' + muxPlaybackId + '/thumbnail.jpg?time=0';

      return (
        <TouchableWithoutFeedback style={{ paddingHorizontal: '2%' }} onPress={() => {setContactFlow(!contactFlow)}}>
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between'}}>
            {/* <Text style={{ color: colors.chineseWhite, fontSize: 14}}>{name}</Text> */}
            <UserInfo />
            <TouchableOpacity onPress={moreOptions}>
              <Ionicons name="ios-more" size={20} color={colors.primaryWhite}/>
            </TouchableOpacity>
          </View>
          <View style={{ paddingBottom: '2%'}}>
            <ItemButton item={item} contactFlow={contactFlow} setContactFlow={setContactFlow}/>
          </View>
          <VideosDisplay videos={videos} />
          <MessagesOptions 
            visible={messagesOptionsVisible} 
            setVisible={setMessagesOptionsVisible} 
            userId={userId}
            currentUserId={item.Liker.id}
            allData={allData}
            setAllData={setAllData}
          />
            {/* <FullPageVideos 
              visible={fullVideoVisible} 
              setVisible={setFullVideoVisible} 
              source={'https://stream.mux.com/' + muxPlaybackId + '.m3u8'}
              questionText={questionText}
            /> */}
          
        </TouchableWithoutFeedback>
        
      );
    } else {
      return null; 
    }
  }

  function VideosDisplay({videos}){

    if(videos && videos.length > 0){

      return (
        <View style={styles.videoSectionStyle}>
          {videos.map(video => <VideoView key={video.id} video={video} />)}
        </View>
      ) 
    } else {
        return null; 
    }
  }

  function VideoView({ video }){

    const muxPlaybackId = video.muxPlaybackId; 
    const muxThumbnailUrl = 'https://image.mux.com/' + muxPlaybackId + '/thumbnail.jpg?time=0';
    const [fullVideoVisible, setFullVideoVisible] = useState(false);

    const goToVideo = () => {
      setFullVideoVisible(true); 
    }

    return (
      <View style={styles.thumbnailPaddingStyle}>
        <TouchableOpacity onPress={goToVideo}>
            <ImageBackground 
                style={styles.thumbnailDimensions}
                source={{uri: muxThumbnailUrl }}
            >
            </ImageBackground>
        </TouchableOpacity>
        <FullPageVideos 
          visible={fullVideoVisible} 
          setVisible={setFullVideoVisible} 
          source={'https://stream.mux.com/' + muxPlaybackId + '.m3u8'}
          questionText={video.videoQuestion.questionText}
          videoId={video.id}
        />
      </View>
    )
  }
 
  function ItemButton({item, contactFlow, setContactFlow}){
    if(item.matched){

      // const [contactFlow, setContactFlow] = useState(false); 
      const [value, onChangeText] = useState('(Send IG or #)');

      if(contactFlow){
        return(
          <View style={{ alignItems: 'flex-start'}}>
            <TextInput
              style={{ height: 40, width: '40%', borderColor: colors.secondaryGray, borderWidth: 1, borderRadius: 4, color: colors.secondaryGray, padding: 5 }}
              onChangeText={text => onChangeText(text)}
              value={value}
              onFocus={() => onChangeText('')}
            />
            <TouchableOpacity onPress={() => {
              setContactFlow(false);
              insertMessage({ variables: { message: value, receiverId: item.likerId, senderId: userId }});
            }} style={{ alignItems: 'center', justifyContent: 'center', paddingTop: 10}}>
              <Text style={{ color: colors.secondaryGray, fontSize: 14 }}>
                Send message!
              </Text>
            </TouchableOpacity>
          </View>
        )
      } else{
        return(
          <View style={{alignItems: 'flex-start'}}>
            <TouchableOpacity onPress={() => {setContactFlow(true)}} style={{ alignItems: 'center', justifyContent: 'center'}}>
              <Text style={{ color: colors.secondaryGray, fontSize: 14 }}>{item.Liker.messages.length == 1 ? item.Liker.messages[0].message : 'Message'}</Text>
            </TouchableOpacity>
          </View>
        )      
      }
    } else {
      return(
        <View style={{alignItems: 'flex-start'}}>
          <TouchableOpacity onPress={() => {likeBack(item.likerId)}} style={{ alignItems: 'center', justifyContent: 'center'}}>
            <Text style={{ color: colors.secondaryGray, fontSize: 14 }}>
              Like back
            </Text>
          </TouchableOpacity>
          <Text style={{ color: colors.secondaryGray }}>{item.Liker.messages.length == 1 ? item.Liker.messages[0].message : ''}</Text>
        </View>
      )  
    }
  }

  const ItemSeparator = () => {
    return (
      <View style={{ paddingLeft: '2%', paddingVertical: '5%'}}>
        <Divider style={{ backgroundColor: '#eee'}} /> 
      </View>
    );
  }
  
  async function likeBack(existingLikerId: number) {
    
    const allDataTemp = allData.map(like => { 
      if(like.likerId == existingLikerId){
        return {...like, matched: true}
      } else { return like }
    })
    setAllData(allDataTemp); 
    
    updateLike({ variables: { likedId: userId, likerId: existingLikerId, matched: true}});
    insertLike({ variables: { likedId: existingLikerId, likerId: userId, matched: true }});
  }

  function disableHeader({text}){
    if(text == 'ALL') {
      setDisabled({all: true, matches: false, likes: false }); 
    } else if (text == 'MATCHES') {
      setDisabled({all: false, matches: true, likes: false }); 
    } else if (text == 'LIKES'){
      setDisabled({all: false, matches: false, likes: true }); 
    } 
  }

  function HeaderButton({text, disabled}){
    const textStyle = disabled ? styles.headerText: styles.disabledHeaderText;

    return (
      <TouchableOpacity onPress={() => { disableHeader({text}) }}>
        <View>
          <Text style={textStyle}>{text}</Text>
        </View>
    </TouchableOpacity>)
  }

  function AnswerQuestionText (){
    if(allData.length == 0){
      return(
        <View style={{alignItems: 'center'}}>
          <Text>Add videos to get discovered!</Text>
        </View>
      )        
    } else { return null; }
  }

  if(initialized){
    return (
      <View style={styles.container}>
        <View style={{paddingBottom: '1%', flexDirection: 'row', justifyContent: 'space-around'}}>
          <HeaderButton text={'ALL'} disabled={disabled.all} />
          <HeaderButton text={'MATCHES'} disabled={disabled.matches} />
          <HeaderButton text={'LIKES'} disabled={disabled.likes} />
        </View>
        <AnswerQuestionText />
        <FlatList
          data={enabledData}
          renderItem={({ item }) => <Item item={item} />}
          keyExtractor={item => { 
            const likerId = item.likerId;
            return likerId.toString()
          }}
          ItemSeparatorComponent={ItemSeparator}
        />
      </View>
    );
  } else {
    if(!timedOut){
      return (
          <View style={styles.activityView}>
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



const windowWidth = Math.round(Dimensions.get('window').width);
const thumbnailWidth = windowWidth * 0.33; 
const thumbnailHeight = windowWidth * 0.4; 

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: '15%',
    backgroundColor: colors.primaryBlack
  },
  headerText: {
    margin: 8, textAlign: 'center', fontSize: 15, color: colors.primaryWhite
  },
  disabledHeaderText: {
    margin: 8, textAlign: 'center', fontSize: 15, color: colors.secondaryGray
  },
  thumbnailPaddingStyle: { padding: '0.2%'}, 
  thumbnailDimensions: { width: thumbnailWidth, height: thumbnailHeight },
  videoSectionStyle: { flex: 1, flexDirection: 'row' },
  badInternetView: { backgroundColor: '#000', justifyContent: 'center', alignItems: 'center', flex: 1},
  reloadText: { color: '#eee', fontSize: 20, paddingHorizontal: 20, paddingVertical: 5},
  activityView: { backgroundColor: '#000', flex: 1, justifyContent: 'center', alignItems: 'center' }
});