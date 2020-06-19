import React, { useEffect, useState, useContext, createRef } from 'react';
import { StreamChat } from 'stream-chat';
import { View, SafeAreaView, TouchableOpacity, Text } from "react-native";
import { UserIdContext } from '../../utils/context/UserIdContext';
import { _retrieveStreamToken, _storeStreamToken } from '../../utils/asyncStorage'; 
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

const chatClient = new StreamChat('9uzx7652xgte');

export default function MessagesStreamView(props) {

  const [userId, setUserId] = useContext(UserIdContext);
  const [loading, setLoading] = useState(false);
  const [allData, setAllData] = useState([]); 
  const [timedOut, setTimedOut] = useState(false);

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
      console.log("initializing client");
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
      return;
    }

    await chatClient.setUser( 
      {
        id: userId.toString()
      },
      token
    );

    const filter = { type: 'messaging', members: { $in: [userId.toString()]}};
    const sort = { last_message_at: -1 };


    const channels = await chatClient.queryChannels(filter, sort, {
      watch: true,
      state: true,
    });  

    setLoading(false);

    const likerIds = allData.map(like => {
      return { id: like.likerId.toString() }; 
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
      
      if(channels.length == 0){
        try {
          console.log("calling createChannelStream");
          const response = await axios.post("https://gentle-brook-91508.herokuapp.com/createChannelStream", {
            userId: userId.toString(),
            likerId: likerId.toString(),
          });
        } catch (err) {
          console.log(err); 
          return;
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

    return (
      <TouchableOpacity
        style={{
          display: 'flex',
          flexDirection: 'row',
          borderBottomColor: '#EBEBEB',
          borderBottomWidth: 1,
          padding: 10,
        }}
        onPress={onSelectChannel}
      >
        <Avatar image={channel.data.image} size={40} />
        <View
          style={{
            display: 'flex',
            flexDirection: 'column',
            flex: 1,
            paddingLeft: 10,
          }}
        >
          <View
            style={{
              display: 'flex',
              flexDirection: 'row',
              justifyContent: 'space-between',
            }}
          >
            <Text
              style={{
                fontWeight: unreadCount > 0 ? 'bold' : 'normal',
                fontSize: 14,
                flex: 9,
              }}
              ellipsizeMode="tail"
              numberOfLines={1}
            >
              {channel.data.name}
            </Text>
            <IconBadge unread={unreadCount} showNumber>
              <Text
                style={{
                  color: '#767676',
                  fontSize: 11,
                  flex: 3,
                  textAlign: 'right',
                }}
              >
                {props.latestMessage.created_at}
              </Text>
            </IconBadge>
          </View>
        </View>
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
          </View>
        </Chat>
      </SafeAreaView>
    );
  }

  ChannelListScreen.navigationOptions = () => ({
    headerTitle: () => (
      <Text style={{ fontWeight: 'bold' }}>Awesome Conversations</Text>
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
    return {
      headerTitle: (
        <Text style={{ fontWeight: 'bold' }}>{channel.data.name}</Text>
      ),
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

  if(loading){
    return null;
  } else {
    return (
      <AppContainer />
    )
 }
}