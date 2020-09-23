import React, { useContext, useEffect, useState } from 'react';
import { UserIdContext } from '../../utils/context/UserIdContext';
import * as Segment from 'expo-analytics-segment';
import { useLazyQuery, useMutation, useSubscription } from '@apollo/client';
import { View, TouchableOpacity, Text, Image, StyleSheet, SafeAreaView, StatusBar, ActivityIndicator } from "react-native";
import { Feather, Entypo, Ionicons } from '@expo/vector-icons'
import { colors } from '../../styles/colors';
import { FlatList, ScrollView} from 'react-native-gesture-handler';
import { Divider } from 'react-native-paper';
import { INSERT_LIKE, GET_INSTAGRAM, ON_YOUR_LIKES_UPDATED } from '../../utils/graphql/GraphqlClient';
import { _retrieveName  } from '../../utils/asyncStorage'; 
import axios from 'axios';
import MultipleVideoPopup from '../modals/MultipleVideosPopup'; 
import NoVideosPopup from '../modals/NoVideosPopup';
import InstagramPopup from '../modals/InstagramPopup'; 
import { profile } from 'console';

export default function MessagesStreamView(props) {
    
    const [userId, setUserId] = useContext(UserIdContext);
    const [matches, setMatches] = useState(null); 
    const [userName, setUserName] = useState(''); 
    const [lastVideoIndex, setLastVideoIndex] = useState(-1); 
    const [instagramPopup, setInstagramPopup] = useState(false); 

    const { data, loading, error } = useSubscription(ON_YOUR_LIKES_UPDATED, {variables: { userId }});    

    const [getInstagramData, { data: instagramData }] = useLazyQuery(GET_INSTAGRAM,
        {
          onCompleted: (instagramData) => {
            if(!instagramData.users[0].instagram){
                setInstagramPopup(true); 
            }
        }
    });
  

    useEffect(() => {
        if(data){

            const uniqueMatches = Array.from(new Set(data.likes.map(match => match.profileUser.id))).map(
                id => {
                    return data.likes.find(match => match.profileUser.id === id); 
                }
            )
    
            setMatches(uniqueMatches);
        }
      }, [data]); 
    

    useEffect(() => {
        Segment.screen('Your Likes'); 
        initName(); 
        getInstagramData({ variables: { userId }})
      }, []);

    async function initName(){
        let name = await _retrieveName(); 
        setUserName(name); 
    }

    function goToHome(){
        props.navigation.navigate('Home');
    }

    function LikeUsers(){
      return (
          <View style={{ height: '100%', justifyContent: 'center', alignItems: 'center' }}>
              <View style={{ height: '30%', width: '85%', backgroundColor: colors.primaryPurple, borderRadius: 5, padding: 10, alignItems: 'center', justifyContent: 'space-evenly' }}>
                  <View style={{ }}>
                      <Feather name="video" size={45} color={colors.primaryWhite} />
                  </View>        
                  <Text style={{ fontSize: 18, fontWeight: 'bold', color: colors.primaryWhite }}>Your likes will appear here!</Text>
                  <TouchableOpacity onPress={goToHome} style={{ }}>
                      <View style={styles.addVideoContainer}>
                          <Text style={styles.addVideoText}>Like Users</Text>
                      </View>
                  </TouchableOpacity>
              </View>    
          </View>                
      )
  }

    const ItemSeparator = () => {
        return (
            <View style={{ padding: '5%'}}>
                <Divider /> 
            </View>
        );
    }
   
    function Item({profileUser, index}){
        const [popupVisible, setPopupVisible] = useState(false); 
        const [noVideosPopupVisible, setNoVideosPopupVisible] = useState(false);

        const name = profileUser.firstName; 
        const city = profileUser.city;
        const region = profileUser.region;
        const college = profileUser.college; 
        const profileUrl = profileUser.profileUrl; 
        const profileUserId = profileUser.id; 
        const userVideos = profileUser.userVideos; 
        const instagram = profileUser.instagram; 
        let age = null; 

        useEffect(() => {
          if(userVideos.length > 0 && index > lastVideoIndex){
            setLastVideoIndex(index); 
          }  
        }, []);

        if(profileUser.birthday){
            const birthday = new Date(profileUser.birthday);
            age = _calculateAge(birthday);
        } 
        
        function watchVideos(){
            setPopupVisible(true); 
        }

        function showNoVideosPopup(){
          setNoVideosPopupVisible(true); 
        }

        function ProfilePicture({profileUrl, userVideos}){
            if(profileUrl != null){
                if(userVideos.length > 0){
                    return(
                        <TouchableOpacity onPress={watchVideos} style={{ height: 70, width: 70, borderRadius: 35, borderColor: colors.primaryPurple, borderWidth: 3, alignItems: 'center', justifyContent: 'center'}}>
                            <Image
                                style={{ height: 60, width: 60, borderRadius: 30 }}
                                source={{ uri: profileUrl}}
                            />
                        </TouchableOpacity>
                    )                    
                } else {
                    return(
                        <TouchableOpacity onPress={showNoVideosPopup} style={{ height: 70, width: 70, borderRadius: 35, alignItems: 'center', justifyContent: 'center'}}>
                            <Image
                                style={{ height: 60, width: 60, borderRadius: 30 }}
                                source={{ uri: profileUrl}}
                            />
                        </TouchableOpacity>
                    )                    
                }
            } else {
                return null;  
            }
        }

        function VideoDivider(){
          if(index == lastVideoIndex + 1){
            return (
              <View style={{ alignSelf: 'center', paddingBottom: 30, paddingTop: 20 }}>
                <Text style={{ fontSize: 21, fontWeight: '500' }}>Users Without Videos</Text>
              </View>
            )  
          } else {
            return null; 
          }
        }
        
        function TouchableUserInfo(){
          if(userVideos.length > 0){
            return (
              <TouchableOpacity onPress={watchVideos} style={{ paddingLeft: '5%' }}>
                <UserInfo 
                    name={name}
                    city={city}
                    region={region}
                    college={college}
                    age={age}
                    instagram={instagram}
                />   
              </TouchableOpacity>
            )
          } else {
            return (
              <TouchableOpacity onPress={showNoVideosPopup} style={{ paddingLeft: '5%' }}>
                <UserInfo 
                    name={name}
                    city={city}
                    region={region}
                    college={college}
                    age={age}
                    instagram={instagram}
                />   
              </TouchableOpacity>
            )
          }
        }

        return (
            <View>    
              <VideoDivider />            
                <View style={{ flexDirection: 'row', alignItems: 'center', paddingLeft: '5%'}}>
                    <ProfilePicture
                        profileUrl={profileUrl}
                        userVideos={userVideos}
                    />
                    <TouchableUserInfo />
                </View>
                 <MultipleVideoPopup 
                    userVideos={userVideos}
                    visible={popupVisible}
                    setVisible={setPopupVisible}            
                    name={name}
                    city={city}
                    region={region}
                    college={college}
                />
                <NoVideosPopup 
                  visible={noVideosPopupVisible}
                  setVisible={setNoVideosPopupVisible}
                  name={name}
                  requestedId={profileUserId}
                  requesterName={userName}
                />
            </View>          
        )
    }

    function UserInfo({name, city, region, college, age, instagram}){


        function DistanceSeparator(){
          if(city != null || region != null){
            return (
              <Text style={{ fontSize: 5, paddingLeft: 5}}>{'\u2B24'}</Text>
            )  
          } else {
            return null; 
          }    
        }
    
        function Distance(){
          if(city != null || region != null){
            return (
              <Text style={{ paddingLeft: 5}}>{city}, {region}</Text>
            )  
          } else {
            return null; 
          }
        }

        function AgeSeparator(){
            if(age != null){
              return (
                <Text style={{ fontSize: 5, paddingLeft: 5}}>{'\u2B24'}</Text>
              )  
            } else {
              return null; 
            }    
          }
      
          function Age(){
            if(age != null){
              return (
                <Text style={{ paddingLeft: 5}}>{age}</Text>
              )
            } else {
              return null; 
            }
          }

          function Instagram(){
              if(instagram != null){
                  if(instagram.includes('@')){
                    return(
                        <Text style={{ fontWeight: '500'}}>IG: {instagram}</Text>
                      )    
                  } else {
                    return(
                        <Text style={{ fontWeight: '500'}}>IG: @{instagram}</Text>
                      )    
                  }
              } else {
                  return null;
              }
          }
    
    
        if(name){
          if(college){
            return (
                <View>
                  <View style={{ flexDirection: 'row', alignItems: 'center'}}>
                    <Text>{name}</Text>
                    {/* <Text style={styles.separatorText}>{'\u2B24'}</Text> */}
                    <DistanceSeparator />
                    <Distance />  
                    <AgeSeparator />
                    <Age />
                  </View>
                  <Text>{college}</Text>   
                  <Instagram />
                </View>   
            )    
          } else {
            return (
                <View>
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                        <Text >{name}</Text>     
                        <DistanceSeparator />
                        <Distance />    
                        <AgeSeparator />
                        <Age />
                    </View> 
                    <Instagram />
                </View>
            )    
          }
        } else {
          return null; 
        }
      }

    if(matches){
        if(matches.length > 0){
            return (
                    <SafeAreaView style={{ flex: 1, marginTop: StatusBar.currentHeight || 0,}}>
                        <Text style={{ fontSize: 27, fontWeight: '500', paddingLeft: '5%' }}>Your Likes</Text>
                        <FlatList
                            data={matches}
                            renderItem={({ item, index }) => <Item profileUser={item.profileUser} index={index} />}
                            keyExtractor={item => item.id.toString()}
                            style={{ paddingTop: '15%' }}
                            ItemSeparatorComponent={ItemSeparator}
                        />
                        <InstagramPopup
                            visible={instagramPopup}
                            setVisible={setInstagramPopup}
                        />

                    </SafeAreaView>
            )
        } else {
            return (
                <LikeUsers />
              )      
        }
    } else {
      return(
        <View style={styles.activityView}>
          <ActivityIndicator size="small" color="#eee" />
        </View>
      )
    }

}

const styles = StyleSheet.create({
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
    },
    activityView: { backgroundColor: '#000', flex: 1, justifyContent: 'center', alignItems: 'center' },

  });