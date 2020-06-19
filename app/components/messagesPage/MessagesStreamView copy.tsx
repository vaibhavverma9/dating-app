import React, { useEffect, useState, useContext, createRef } from 'react';
import { StreamChat } from 'stream-chat';
import { View, SafeAreaView, TouchableOpacity, Text } from "react-native";
import { UserIdContext } from '../../utils/context/UserIdContext';
import { _retrieveStreamToken, _storeStreamToken } from '../../utils/asyncStorage'; 
import { GET_STREAM_TOKEN, client } from '../../utils/graphql/GraphqlClient';
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
import { useLazyQuery } from '@apollo/client';
import axios from 'axios';

const chatClient = new StreamChat('9uzx7652xgte');

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
            filters={{ type: 'messaging', members: { $in: ['white-flower-0'] } }}
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

export default function MessagesStreamView(props) {

  const [userId, setUserId] = useContext(UserIdContext);
  const [name, setName] = useState('Vaibhav'); 
  const [channel, setChannel] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function getToken() {
      setLoading(true);
      let token;
      try {
        const response = await axios.post("https://gentle-brook-91508.herokuapp.com/join", {
          username: userId.toString()
        });
        token = response.data.token;
      } catch (err) {
        console.log(err);
        return;
      }

      chatClient.setUser( 
        {
          id: userId.toString()
        },
        token
    );

      // const channel = chatClient.channel("team", "group-messaging-2");

      // try {
      //   await channel.watch();
      // } catch (err) {
      //   console.log(err);
      //   return;
      // }

      // setChannel(channel);
      setLoading(false);
    }

    getToken(); 
  }, [userId]);

  const user = {
    id: 'broad-bar-4', 
    name: 'Broad bar', 
    image: 'https://stepupandlive.files.wordpress.com/2014/09/3d-animated-frog-image.jpg'
  }

  const [getStreakToken, { data: streamToken }] = useLazyQuery(GET_STREAM_TOKEN, 
    { 
      onCompleted: (streamToken) => { console.log(streamToken) } 
  }); 

  if(loading){
    return null;
  } else {
    return <AppContainer />;
  }
}