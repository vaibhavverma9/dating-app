import React, { useEffect, useState, useContext, createRef } from 'react';
import { StreamChat } from 'stream-chat';
import { View, SafeAreaView, TouchableOpacity, Text, StyleSheet, Dimensions, ImageBackground } from "react-native";
import { UserIdContext } from '../../utils/context/UserIdContext';
import { _retrieveStreamToken, _storeStreamToken, _retrieveName } from '../../utils/asyncStorage'; 
import {
  Avatar,
  Chat,
  Channel,
  MessageList,
  MessageInput,
  ChannelList,
  IconBadge,
} from "stream-chat-expo";

import { createAppContainer } from 'react-navigation';
import { createStackNavigator } from 'react-navigation-stack';
import axios from 'axios';
import { GET_MATCHES_LIKES, INSERT_LIKE } from '../../utils/graphql/GraphqlClient';
import { useLazyQuery, useMutation } from '@apollo/client';
import * as Segment from 'expo-analytics-segment';
import { colors } from '../../styles/colors';
import FullPageVideos from '../modals/FullPageVideos';
import { Ionicons, Feather, Entypo } from '@expo/vector-icons'
import MessagesOptions from './MessagesOptions'; 

const chatClient = new StreamChat('9uzx7652xgte');

export default function MessagesStreamView(props) {

  const [userId, setUserId] = useContext(UserIdContext);
  const [loading, setLoading] = useState(false);
  const [allData, setAllData] = useState([]); 
  const [likesData, setLikesData] = useState([]); 
  const [matchesData, setMatchesData] = useState([]);
  const [enabledData, setEnabledData] = useState([])
  const [timedOut, setTimedOut] = useState(false);

  const initDisabled = { all: true, matches: false, likes: false };
  const [disabled, setDisabled] = useState(initDisabled);

  const [messagesOptionsVisible, setMessagesOptionsVisible] = useState(false); 
  const [optionsProfileId, setOptionsProfileId] = useState(null); 
  const [insertLike, { insertLikeData }] = useMutation(INSERT_LIKE);

  const [getLikes, { data: likesQueried }] = useLazyQuery(GET_MATCHES_LIKES, 
  { 
    onCompleted: (likesQueried) => { 
      const matches = likesQueried.matches;
      const likes = likesQueried.likes;
      setAllData([...matches, ...likes]); 
      setMatchesData(matches);
      setLikesData(likes);
    } 
  }); 

  useEffect(() => {
    Segment.screen('Messages'); 
    getLikes({ variables: { userId }}); 
    setTimeout(() => { setTimedOut(true) }, 3000); 
  }, []);

  useEffect(() => {
    if(allData.length > 0){
      if(disabled.all){
        setEnabledData(allData); 
      } else if(disabled.matches){
        setEnabledData(matchesData); 
      } else if(disabled.likes){
        setEnabledData(likesData); 
      }
    }
  }, [disabled, allData]);

  useEffect(() => {
    if(allData.length > 0){
      initClient(); 
    }   
  }, [allData]);

  async function initClient() {
    setLoading(true);
    let token;
    try {
      const response = await axios.post("https://gentle-brook-91508.herokuapp.com/joinStream", {
        userId: userId.toString()
      });
      token = response.data.token;
    } catch (err) {
      console.log(err); 
      return;
    }

    let name = await _retrieveName(); 


    await chatClient.disconnect();

    await chatClient.setUser( 
      {
        id: userId.toString(),
        name: name
      },
      token
    );

    setLoading(false);

    const profileIds = allData.map(like => {
      if(like.profileUser.userVideos.length > 0){
        return { 
          id: like.profileId.toString(),
          name: like.profileUser.firstName,
          image: 'https://image.mux.com/' + like.profileUser.userVideos[0].muxPlaybackId + '/thumbnail.jpg?time=0'
        };   
      } else {
        return { 
          id: like.profileId.toString(),
          name: like.profileUser.firstName
        };   
      }
    });

    try {
      const response = await axios.post("https://gentle-brook-91508.herokuapp.com/updateUsersStream", {
        likerIds: profileIds
      });
    } catch (err) {
      console.log(err); 
      return;
    }

    const filter = { type: 'messaging', $and : [{ members: { $in: [userId.toString()]}}]};
    const sort = { last_message_at: -1 };


    const channels = await chatClient.queryChannels(filter, sort, {
      watch: true,
      state: true,
    });  

    for(let i=0; i < allData.length; i++){
      const like = allData[i]; 
      const profileId = like.profileId; 

      const filter = { type: 'messaging', $and : [{ members: { $in: [userId.toString()]}}, { members: { $in: [profileId.toString()]}}]};
      const sort = { last_message_at: -1 };
  
  
      const channels = await chatClient.queryChannels(filter, sort, {
        watch: true,
        state: true,
      });  

      if(channels.length == 0){
        try {
          const response = await axios.post("https://gentle-brook-91508.herokuapp.com/createChannelStream", {
            userId: userId.toString(),
            likerId: profileId.toString(),
          });
        } catch (err) {
          return;
        }
      }
    }
  };

  function CustomChannelPreview(props){
    const channelPreviewButton = createRef(); 

    const onSelectChannel = () => {
      props.setActiveChannel(props.channel); 
    }

    const channel = props.channel; 
    const unreadCount = channel.countUnread();

    const profileId = parseInt(props.channel.data.membersIds.filter(memberId => {
      return memberId != userId.toString(); 
    })[0]);    

    const like = enabledData.filter(like => {
      return profileId == like.profileId; 
    });

    if(like.length == 0){
      return null;
    }

    const firstName = like[0].profileUser.firstName;
    const videos = like[0].profileUser.userVideos;
    // console.log(like[0].profileUser.id); 
    const latestMessage = props.latestMessage.text;

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

    return (
      <TouchableOpacity
        style={{
          display: 'flex',
          borderBottomColor: colors.primaryPurple,
          borderBottomWidth: 1,
          paddingVertical: 10
        }}
        onPress={onSelectChannel}
      >
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center'}}>
          <View style={{ justifyContent: 'space-around', height: 40}}>
            <Text
              style={{
                fontWeight: 'bold',
                fontSize: 14,
                flex: 9
              }}
            >
              {firstName}
            </Text>
            <Text
              style={{
                fontWeight: unreadCount > 0 ? 'bold' : 'normal',
                fontSize: 14,
                flex: 9,
              }}
              ellipsizeMode="tail"
              numberOfLines={1}
            >
              {latestMessage}
            </Text>
          </View>
        </View>
        <VideosDisplay videos={videos} />

      </TouchableOpacity>
    );

  }

  function goToAddVideo(){
    props.navigation.navigate('Add');
  }


  function AddVideo(){
    if(!timedOut){
      return null;
    } else {
      return (
        <View style={{ height: '100%', justifyContent: 'center', alignItems: 'center' }}>
          <View style={{ height: '40%', width: '85%', backgroundColor: colors.primaryPurple, borderRadius: 5, padding: 10, alignItems: 'center' }}>
              <View style={{ paddingTop: '5%', height: '25%'}}>
                  <Feather name="video" size={45} color={colors.primaryWhite} />
              </View>        
              <Text style={{ fontSize: 22, fontWeight: 'bold', paddingTop: 12, paddingBottom: 5, color: colors.primaryWhite }}>No likes yet!</Text>
              <Text style={{ textAlign: 'center', fontSize: 20, fontWeight: '300', paddingHorizontal: 5, color: colors.primaryWhite }}>Add videos to get likes from users :)</Text>
              <TouchableOpacity onPress={goToAddVideo} style={{ paddingTop: '8%' }}>
                  <View style={styles.addVideoContainer}>
                      <Text style={styles.addVideoText}>Add Video</Text>
                  </View>
              </TouchableOpacity>
          </View>

      </View>           )
    }
  }

  function ChannelListScreen(props){
    if(allData.length > 0){
      return (
        <SafeAreaView>
          <Chat client={chatClient}>
            <View style={{ display: 'flex', height: '100%', padding: 10 }}>
              <ChannelList
                filters={{ type: 'messaging', members: { $in: [userId.toString()] } }}
                sort={{ last_message_at: -1 }}
                Preview={CustomChannelPreview}
                onSelect={(channel) => {
                  props.navigation.navigate('Channel', {
                    channel,
                  });
                }}
              />
              <MessagesOptions 
                visible={messagesOptionsVisible} 
                setVisible={setMessagesOptionsVisible} 
                userId={userId}
                currentUserId={optionsProfileId}
                allData={allData}
                setAllData={setAllData}
              />
            </View>
          </Chat>
        </SafeAreaView>
      );
    } else {
      return (
        <AddVideo />
      )
    }
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

  ChannelListScreen.navigationOptions = () => ({
    headerTitle: () => (
      <View style={{ paddingBottom: '1%', flexDirection: 'row', justifyContent: 'space-around', width: '100%' }}>
          <HeaderButton text={'ALL'} disabled={disabled.all} />
          <HeaderButton text={'MATCHES'} disabled={disabled.matches} />
          <HeaderButton text={'LIKES'} disabled={disabled.likes} />
      </View>
    ),
  });

  function ChannelScreen(props){
    const channel = props.navigation.getParam('channel'); 

    return (
      <SafeAreaView>
        <Chat client={chatClient}>
          <Channel client={chatClient} channel={channel}>
            <View style={{ display: 'flex', height: '100%' }}>
              <MessageList />
              <MessageInput />
            </View>
          </Channel>
        </Chat>
      </SafeAreaView>
    );
  }

  ChannelScreen.navigationOptions = ({ navigation }) => { 
    const channel = navigation.getParam('channel');

    const profileId = parseInt(channel.data.membersIds.filter(memberId => {
      return memberId != userId.toString(); 
    })[0]);    

    const like = enabledData.filter(like => {
      return profileId == like.profileId; 
    });

    const currentName = like[0].profileUser.firstName;

    const moreOptions = () => {
      setMessagesOptionsVisible(true); 
      setOptionsProfileId(profileId); 
    }

    return {
      title: currentName,
      headerBackTitleVisible: false,
      headerRight: () => (
        <TouchableOpacity onPress={moreOptions} style={{ paddingRight: 20}}>
          <Ionicons name="ios-more" size={30} color={colors.primaryBlack}/>
        </TouchableOpacity>      
      )
    };
  };

  const RootStack = createStackNavigator(
    {
      ChannelList: {
        screen: ChannelListScreen
      }, 
      Channel: {
        screen: ChannelScreen
      }
    }, 
    {
      initialRouteName: 'ChannelList'
    }
  )

  const AppContainer = createAppContainer(RootStack);

    return (
      <AppContainer />
    )
}

const windowWidth = Math.round(Dimensions.get('window').width);
const thumbnailWidth = windowWidth * 0.32; 
const thumbnailHeight = windowWidth * 0.4; 


const styles = StyleSheet.create({
  videoSectionStyle: { flex: 1, flexDirection: 'row' },
  thumbnailPaddingStyle: { padding: '0.2%'}, 
  thumbnailDimensions: { width: thumbnailWidth, height: thumbnailHeight },
  headerText: {
    margin: 8, textAlign: 'center', fontSize: 15, fontWeight: 'bold', color: colors.primaryPurple
  },
  disabledHeaderText: {
    margin: 8, textAlign: 'center', fontSize: 15, color: colors.secondaryGray
  },
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