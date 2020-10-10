import React, { useEffect, useState, useContext, createRef } from 'react';
import { StreamChat } from 'stream-chat';
import { View, SafeAreaView, TouchableOpacity, Text, StyleSheet, Dimensions, Image, ActivityIndicator } from "react-native";
import { UserIdContext } from '../../utils/context/UserIdContext';
import { _retrieveName } from '../../utils/asyncStorage'; 
import {
  Chat,
  Channel,
  MessageList,
  MessageInput,
  ChannelList,
} from "stream-chat-expo";

import { createAppContainer } from 'react-navigation';
import { createStackNavigator } from 'react-navigation-stack';
import axios from 'axios';
import { ON_MATCHES_UPDATED } from '../../utils/graphql/GraphqlClient';
import { useMutation, useSubscription } from '@apollo/client';
import * as Segment from 'expo-analytics-segment';
import { colors } from '../../styles/colors';
import { Ionicons, Feather } from '@expo/vector-icons'
import MessagesOptions from './MessagesOptions'; 
import MultipleVideoPopup from '../modals/MultipleVideosPopup'; 
import ChannelMultipleVideos from '../modals/ChannelMultipleVideos'; 
import * as Permissions from 'expo-permissions';
import Constants from 'expo-constants';
import { Notifications } from 'expo';
import { UPDATE_PUSH_TOKEN } from '../../utils/graphql/GraphqlClient';
import NoVideosPopup from '../modals/NoVideosPopup';


const chatClient = new StreamChat('9uzx7652xgte', { timeout: 6000 });

export default function MessagesStreamView(props) {

  const [userId, setUserId] = useContext(UserIdContext);
  const [matchesData, setMatchesData] = useState(null);
  const [messagesOptionsVisible, setMessagesOptionsVisible] = useState(false); 
  const [optionsProfileId, setOptionsProfileId] = useState(null); 
  const [initialized, setInitialized] = useState(false); 
  const [updatePushToken, { updatePushTokenData }] = useMutation(UPDATE_PUSH_TOKEN);
  const [videosVisible, setVideosVisible] = useState(false); 

  const { data, loading, error } = useSubscription(ON_MATCHES_UPDATED, {variables: { userId }}); 

  useEffect(() => {
    Segment.screen('Messages'); 
  }, []); 

  useEffect(() => {
    if(data){
      setMatchesData(data.likes)
    }
  }, [data]); 

  useEffect(() => {
    async function askPush() {
      const { status: existingStatus } = await Permissions.getAsync(Permissions.NOTIFICATIONS);
      if(existingStatus !== 'granted'){
        registerForPushNotificationsAsync(); 
      }
  
    }
  
    async function initClient() {
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
  
      if(!initialized){
        await chatClient.disconnect();
  
        await chatClient.setUser( 
          {
            id: userId.toString(),
            name: name
          },
          token
        );

        await chatClient.addDevice(
          Constants.installationId,
          'apn', 
          userId.toString()
        );
  
        setInitialized(true); 
      }
  
      const filter = { type: 'messaging', $and : [{ members: { $in: [userId.toString()]}}]};
      const sort = { last_message_at: -1 };
  
  
      const channels = await chatClient.queryChannels(filter, sort, {
        watch: true,
        state: true,
      });  
    };

    if(matchesData && matchesData.length > 0){
      initClient();
      askPush();  
    }   
  }, [matchesData]); 

  const registerForPushNotificationsAsync = async () => {
    if (Constants.isDevice) {
      const { status } = await Permissions.askAsync(Permissions.NOTIFICATIONS);
      const token = await Notifications.getExpoPushTokenAsync();
      updatePushToken({ variables: { userId, expoPushToken: token } })
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

  function CustomChannelPreview(props){

    const channelPreviewButton = createRef(); 
    const [popupVisible, setPopupVisible] = useState(false); 
    const [noVideosPopupVisible, setNoVideosPopupVisible] = useState(false);

    const onSelectChannel = () => {
      props.setActiveChannel(props.channel); 
    }

    const channel = props.channel; 
    const unreadCount = channel.countUnread();

    const profileId = parseInt(props.channel.data.membersIds.filter(memberId => {
      return memberId != userId.toString(); 
    })[0]);    

    const like = matchesData.filter(like => {
      return profileId == like.profileId; 
    });

    if(like.length == 0){
      return null;
    }

    const firstName = like[0].profileUser.firstName;
    const city = like[0].profileUser.city;
    const region = like[0].profileUser.region;
    const college = like[0].profileUser.college;
    const videos = like[0].profileUser.userVideos;
    const profileUrl = like[0].profileUser.profileUrl;
    // console.log(like[0].profileUser.id); 
    const latestMessage = props.latestMessage.text;

    function watchVideos(){
      setPopupVisible(true); 
    }

    function showNoVideosPopup(){
      setNoVideosPopupVisible(true); 
    }


    function ProfilePicture(){
      if(profileUrl != null){
        if(videos.length > 0){
          return(
            <View style={{ paddingTop: '2%'}}>
              <TouchableOpacity onPress={watchVideos} style={{ height: 70, width: 70, borderRadius: 35, borderColor: colors.primaryPurple, borderWidth: 3, alignItems: 'center', justifyContent: 'center'}}>
                <Image
                    style={{ height: 60, width: 60, borderRadius: 30 }}
                    resizeMode="cover"
                    source={{ uri: profileUrl}}
                />
              </TouchableOpacity> 
            </View>
          )
        } else {
          return(
            <View style={{ paddingTop: '2%'}}>
              <TouchableOpacity onPress={showNoVideosPopup} style={{ height: 70, width: 70, borderRadius: 35, alignItems: 'center', justifyContent: 'center'}}>
                  <Image
                      style={{ height: 60, width: 60, borderRadius: 30 }}
                      resizeMode="cover"
                      source={{ uri: profileUrl}}
                    />
              </TouchableOpacity>
            </View>
          )                    
        }
      } else {
          return null;  
      }
  }

    return (
      <TouchableOpacity
        delayPressIn={0}
        style={{
          display: 'flex',
          borderBottomColor: colors.primaryPurple,
          borderBottomWidth: 1,
          paddingVertical: 10
        }}
        onPress={onSelectChannel}
      >
        <View style={{ flexDirection: 'row', alignItems: 'center', height: 60, paddingBottom: 10}}>
          <ProfilePicture />
          <View style={{ justifyContent: 'space-around', height: 40, paddingLeft: 5}}>
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
        <MultipleVideoPopup 
          userVideos={videos}
          visible={popupVisible}
          setVisible={setPopupVisible}
          name={firstName}
          city={city}
          region={region}
          college={college}
        />
        <NoVideosPopup 
          visible={noVideosPopupVisible}
          setVisible={setNoVideosPopupVisible}
          name={firstName}
        />
      </TouchableOpacity>
    );

  }; 

  function goToAddVideo(){
    props.navigation.navigate('Add Video');
  }


  function AddVideo(){
      return (
        <View style={{ height: '100%', justifyContent: 'center', alignItems: 'center' }}>
          <View style={{ height: '40%', width: '85%', backgroundColor: colors.primaryPurple, borderRadius: 5, padding: 10, alignItems: 'center' }}>
              <View style={{ paddingTop: '5%', height: '25%'}}>
                  <Feather name="video" size={45} color={colors.primaryWhite} />
              </View>        
              <Text style={{ fontSize: 22, fontWeight: 'bold', paddingTop: 12, paddingBottom: 5, color: colors.primaryWhite }}>No matches yet!</Text>
              <Text style={{ textAlign: 'center', fontSize: 20, fontWeight: '300', paddingHorizontal: 5, color: colors.primaryWhite }}>Add videos to get likes from users :)</Text>
              <TouchableOpacity onPress={goToAddVideo} style={{ paddingTop: '8%' }}>
                  <View style={styles.addVideoContainer}>
                      <Text style={styles.addVideoText}>Add Video</Text>
                  </View>
              </TouchableOpacity>
          </View>

      </View>           
      )
  }


  function ChannelListScreen(props){
    if(matchesData){
      if(matchesData.length > 0){
        return (
          <SafeAreaView>
            <Chat client={chatClient}>
              <View style={{ display: 'flex', height: '100%', paddingLeft: '5%' }}>
                <Text style={{ fontSize: 27, fontWeight: '500', paddingBottom: '15%'}}>Matches</Text>
                <ChannelList
                  filters={{ type: 'messaging', members: { $in: [userId.toString()] } }}
                  sort={{ last_message_at: -1 }}
                  client={chatClient}
                  loadMoreThreshold={10}
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
                  allData={matchesData}
                  setAllData={setMatchesData}
                />
                <ChannelMultipleVideos 
                  visible={videosVisible}
                  setVisible={setVideosVisible}
                  matchesData={matchesData}
                  currentUserId={optionsProfileId}
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
    } else {
      return null; 
    }
  };

  ChannelListScreen.navigationOptions = () => ({
    headerShown: false
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

    const like = matchesData.filter(like => {
      return profileId == like.profileId; 
    });

    const currentName = like[0].profileUser.firstName;
    const profileUrl = like[0].profileUser.profileUrl; 
    const videos = like[0].profileUser.userVideos; 

    const moreOptions = () => {
      setMessagesOptionsVisible(true); 
      setOptionsProfileId(profileId); 
    }

    function watchVideos(){
      setVideosVisible(true); 
      setOptionsProfileId(profileId); 
    }

    function ProfilePicture(){
      if(profileUrl != null){
        if(videos.length > 0){
          return(
            <TouchableOpacity onPress={watchVideos} style={{ height: 40, width: 40, borderRadius: 30, borderColor: colors.primaryPurple, borderWidth: 3, alignItems: 'center', justifyContent: 'center'}}>
              <Image
                  style={{ height: 30, width: 30, borderRadius: 30 }}
                  source={{ uri: profileUrl}}
              />
            </TouchableOpacity> 
          )
        } else {
          return(
            <View style={{ height: 40, width: 40, borderRadius: 30, alignItems: 'center', justifyContent: 'center'}}>
                <Image
                    style={{ height: 30, width: 30, borderRadius: 30 }}
                    source={{ uri: profileUrl}}
                />
            </View>
          )                    
        }
      } else {
          return null;  
      }
  }

    return {
      // title: currentName,
      headerBackTitleVisible: false,
      headerTitle: () => (
        <View style={{ flexDirection: 'row', alignItems: 'center', paddingBottom: 5 }}>
          <ProfilePicture />
          <Text style={{ fontSize: 16, fontWeight: '600', paddingLeft: 10 }}>{currentName}</Text>
        </View>
      ),
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