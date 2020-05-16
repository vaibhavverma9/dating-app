import React, { useEffect, useState, useContext } from 'react';
import { FlatList, StyleSheet, View, Button, Image, Text, TextInput } from 'react-native';
import { Divider } from 'react-native-paper';
import { GET_LIKES, INSERT_LIKE, INSERT_USER, client, INSERT_MESSAGE, UPDATE_LIKE } from '../../utils/graphql/GraphqlClient';
import { TouchableOpacity } from 'react-native-gesture-handler';
import { useMutation } from '@apollo/client';
import { UserIdContext } from '../../utils/context/UserIdContext'
import { Ionicons } from '@expo/vector-icons'
import MessagesOptions from './MessagesOptions'; 
import FullPageVideoScreen from '../modals/FullPageVideoScreen';
import * as Segment from 'expo-analytics-segment';
import { _retrieveUserId, _storeUserId, _retrieveDoormanUid, _storeDoormanUid } from '../../utils/asyncStorage'; 

export default function MessagesView(props) {

  const [insertLike, { insertLikeData }] = useMutation(INSERT_LIKE);
  const [allData, setAllData] = useState([]); 
  const [likesData, setLikesData] = useState([]); 
  const [matchesData, setMatchesData] = useState([]);
  const [enabledData, setEnabledData] = useState([])
  const [userId, setUserId] = useContext(UserIdContext);

  const [insertMessage, { insertMessageData }] = useMutation(INSERT_MESSAGE);
  const [insertUser, { insertUserData }] = useMutation(INSERT_USER); 
  const [updateLike, { updateLikeData }] = useMutation(UPDATE_LIKE);

  const initDisabled = {all: true, matches: false, likes: false };
  const [disabled, setDisabled] = useState(initDisabled);

  const getData = (userId: number) => {
    client.query({ query: GET_LIKES, variables: { userId: userId}})
    .then(response => {
      setAllData(response.data.likes);
    })
    .catch(error => console.log(error)); 
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
    getData(userId); 
    Segment.screen('Messages'); 
  }, [])
  
  function Item({ item }) {

    const [messagesOptionsVisible, setMessagesOptionsVisible] = useState(false); 
    const [fullVideoVisible, setFullVideoVisible] = useState(false);

    const moreOptions = () => {
      setMessagesOptionsVisible(true); 
    }

    const goToVideo = () => {
      setFullVideoVisible(true); 
    }

    if(item){
      const video = item.Liker.userVideos;
  
      if(video && video.length > 0){
        const muxPlaybackId = video[0].muxPlaybackId;
        const questionText = video[0].videoQuestion.questionText
        const muxPlaybackUrl = 'https://image.mux.com/' + muxPlaybackId + '/thumbnail.jpg?time=0';
        return (
          <View style={{flexDirection: 'row', flex: 1}}>
            <TouchableOpacity onPress={goToVideo}>
              <Image
                style={{ width: 75, height: 75, borderRadius: 75/ 2 }}
                source={{ uri: muxPlaybackUrl }}
              />
            </TouchableOpacity>
            <View style={{flex: 6, justifyContent: 'center', alignContent: 'center'}}>
              <ItemButton item={item}/>
            </View>
            <View style={{flex: 2, justifyContent: 'center', alignContent: 'center', paddingBottom: '10%'}}>
            <Ionicons name="ios-more" onPress={moreOptions} size={25} color="#303030"/>
            </View>
            <MessagesOptions 
              visible={messagesOptionsVisible} 
              setVisible={setMessagesOptionsVisible} 
              userId={userId}
              currentUserId={item.Liker.id}
              allData={allData}
              setAllData={setAllData}
            />
            <FullPageVideoScreen 
              visible={fullVideoVisible} 
              setVisible={setFullVideoVisible} 
              source={'https://stream.mux.com/' + muxPlaybackId + '.m3u8'}
              questionText={questionText}
            />
            
          </View>
          
        );
      } else {
        return null;
      };
    } else {
      return null; 
    }
  }

  function ItemButton({item}){
    if(item.matched){

      const [contactFlow, setContactFlow] = useState(false); 
      const [value, onChangeText] = React.useState('(Send IG or #)');

      if(contactFlow){
        return(
          <View style={{ paddingLeft: '5%', paddingRight: '5%'}}>
            <TextInput
              style={{ height: 40, borderColor: 'gray', borderWidth: 1 }}
              onChangeText={text => onChangeText(text)}
              value={value}
            />
            <Button title="Send message!" onPress={() => {
              setContactFlow(false);
              insertMessage({ variables: { message: value, receiverId: item.likerId, senderId: userId }});
            }}/>
          </View>
        )
      } else{
        return(
          <View style={{alignItems: 'center'}}>
            <Button title="Contact" onPress={() => {setContactFlow(true)}}/>
            <Text>{item.Liker.messages.length == 1 ? item.Liker.messages[0].message : ''}</Text>
          </View>
        )      
      }
    } else {
      return(
        <Button title="Like back" onPress={() => { 
          likeBack(item.likerId); 
        }}/>
      )  
    }
  }

  const ItemSeparator = () => {
    return (
      <View style={{ padding: '2%'}}>
        <Divider /> 
      </View>
    );
  }
  
  async function likeBack(existingLikerId: number) {
    console.log(existingLikerId, userId); 
    
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
}



const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: '15%',
    paddingLeft: '2%',
    backgroundColor: '#E6E6FA'
  },
  item: {
    padding: 10,
    fontSize: 18,
    height: 44,
  },
  title: {
    fontSize: 20, 
    fontWeight: 'bold'
  },
  headerText: {
    margin: 8, textAlign: 'center', fontSize: 15, color: '#841584'
  },
  disabledHeaderText: {
    margin: 8, textAlign: 'center', fontSize: 15, color: '#007AFF'
  }

});