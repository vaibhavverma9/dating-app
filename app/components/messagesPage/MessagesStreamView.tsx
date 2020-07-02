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
import { GET_LIKES } from '../../utils/graphql/GraphqlClient';
import { useLazyQuery } from '@apollo/client';
import * as Segment from 'expo-analytics-segment';
import { colors } from '../../styles/colors';
import FullPageVideos from '../modals/FullPageVideos';
import { Ionicons } from '@expo/vector-icons'
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
  const [optionsLikerId, setOptionsLikerId] = useState(null); 

  const [getLikes, { data: likesQueried }] = useLazyQuery(GET_LIKES, 
  { 
    onCompleted: (likesQueried) => { setAllData(likesQueried.likes) } 
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
      const matchesData = allData.filter((like) => { return like.matched });
      setMatchesData(matchesData)

      const likesData = allData.filter((like) => { return !like.matched });
      setLikesData(likesData);
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

    const likerIds = allData.map(like => {
      return { 
        id: like.likerId.toString(),
        name: like.Liker.firstName,
        image: 'https://image.mux.com/' + like.Liker.userVideos[0].muxPlaybackId + '/thumbnail.jpg?time=0'
      }; 
    });

    try {
      const response = await axios.post("https://gentle-brook-91508.herokuapp.com/updateUsersStream", {
        likerIds
      });
    } catch (err) {
      return;
    }

    for(let i=0; i < allData.length; i++){
      const like = allData[i]; 
      const likerId = like.likerId; 

      const filter = { type: 'messaging', $and : [{ members: { $in: [userId.toString()]}}, { members: { $in: [likerId.toString()]}}]};
      const sort = { last_message_at: -1 };
  
  
      const channels = await chatClient.queryChannels(filter, sort, {
        watch: true,
        state: true,
      });  
      
      if(channels.length == 0){
        try {
          const response = await axios.post("https://gentle-brook-91508.herokuapp.com/createChannelStream", {
            userId: userId.toString(),
            likerId: likerId.toString(),
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

    const likerId = parseInt(props.channel.data.membersIds.filter(memberId => {
      return memberId != userId.toString(); 
    })[0]);    

    const like = enabledData.filter(like => {
      return likerId == like.likerId; 
    });

    if(like.length == 0){
      return null;
    }

    const firstName = like[0].Liker.firstName;
    const videos = like[0].Liker.userVideos;
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
        <VideosDisplay videos={videos} />

      </TouchableOpacity>
    );

  }

  function ChannelListScreen(props){
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
              currentUserId={optionsLikerId}
              allData={allData}
              setAllData={setAllData}
            />
          </View>
        </Chat>
      </SafeAreaView>
    );
  }

  function disableHeader({text}){
    if(text == 'ALL') {
      setDisabled({all: true, matches: false, likes: false }); 
    } else if (text == 'MATCHES') {
      setDisabled({all: false, matches: true, likes: false }); 
    } else if (text == 'LIKES YOU'){
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
          <HeaderButton text={'LIKES YOU'} disabled={disabled.likes} />
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

    const likerId = parseInt(channel.data.membersIds.filter(memberId => {
      return memberId != userId.toString(); 
    })[0]);    

    const like = enabledData.filter(like => {
      return likerId == like.likerId; 
    });

    const currentName = like[0].Liker.firstName;

    const moreOptions = () => {
      setMessagesOptionsVisible(true); 
      setOptionsLikerId(likerId); 
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

  // if(loading){
  //   return null;
  // } else {
    return (
      <AppContainer />
    )
//  }
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
  }
});