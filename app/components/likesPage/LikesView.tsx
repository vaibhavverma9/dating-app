import React, { useContext, useEffect, useState } from 'react';
import { UserIdContext } from '../../utils/context/UserIdContext';
import * as Segment from 'expo-analytics-segment';
import { useLazyQuery, useMutation } from '@apollo/client';
import { GET_LIKES } from '../../utils/graphql/GraphqlClient';
import { View, TouchableOpacity, Text, Image, StyleSheet, SafeAreaView, StatusBar } from "react-native";
import { Feather, Entypo, Ionicons } from '@expo/vector-icons'
import { colors } from '../../styles/colors';
import { FlatList, ScrollView} from 'react-native-gesture-handler';
import { Divider } from 'react-native-paper';
import { INSERT_LIKE } from '../../utils/graphql/GraphqlClient';
import { _retrieveName  } from '../../utils/asyncStorage'; 
import axios from 'axios';
import MultipleVideoPopup from '../modals/MultipleVideosPopup'; 

export default function MessagesStreamView(props) {
    
    const [userId, setUserId] = useContext(UserIdContext);
    const [likes, setLikes] = useState(null); 
    const [insertLike, { insertLikeData }] = useMutation(INSERT_LIKE);
    const [name, setName] = useState(''); 

    const [getLikes, { data: likesQueried }] = useLazyQuery(GET_LIKES, 
    { 
        onCompleted: (likesQueried) => { 
            setLikes(likesQueried.likes); 
        } 
    }); 

    useEffect(() => {
        Segment.screen('Likes'); 
        getLikes({ variables: { userId }})
        initName(); 
    }, []);

    async function initName(){
        let name = await _retrieveName(); 
        setName(name); 
    }

    function goToAddVideo(){
        props.navigation.navigate('Add');
    }

    function AddVideo(){
        return (
            <View style={{ height: '100%', justifyContent: 'center', alignItems: 'center' }}>
                <View style={{ height: '40%', width: '85%', backgroundColor: colors.primaryPurple, borderRadius: 5, padding: 10, alignItems: 'center' }}>
                    <View style={{ paddingTop: '5%', height: '25%'}}>
                        <Feather name="video" size={45} color={colors.primaryWhite} />
                    </View>        
                    <Text style={{ fontSize: 22, fontWeight: 'bold', paddingTop: 12, paddingBottom: 5, color: colors.primaryWhite }}>No likes!</Text>
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

    const ItemSeparator = () => {
        return (
            <View style={{ padding: '5%'}}>
                <Divider /> 
            </View>
        );
    }

    async function sendLike(likedId, likerName) {
        let res = await axios({
          method: 'post', 
          url: 'https://gentle-brook-91508.herokuapp.com/push',
          data: { "likerId" : userId, "likedId" : likedId, "likerName" : likerName }
        }); 
    }

    async function createChannel(profileUserId){
        try {
          const response = await axios.post("https://gentle-brook-91508.herokuapp.com/createChannelStream", {
            userId: userId.toString(),
            likerId: profileUserId.toString(),
          });
        } catch (err) {
          console.log(err); 
          return;
        }
      }
    

    function Item({profileUser}){
        const [popupVisible, setPopupVisible] = useState(false); 

        const name = profileUser.firstName; 
        const city = profileUser.city;
        const region = profileUser.region;
        const college = profileUser.college; 
        const profileUrl = profileUser.profileUrl; 
        const profileUserId = profileUser.id; 
        const userVideos = profileUser.userVideos; 

        function onLike(){
            insertLike({ variables: { likedId: profileUserId, likerId: userId, matched: false, dislike: false }});
            sendLike(profileUserId, name);   
            createChannel(profileUserId); 

            setLikes(likes.filter(like => {
                return like.profileUser.id != profileUserId; 
            }))            
        }

        function onDislike(){
            insertLike({ variables: { likedId: profileUserId, likerId: userId, matched: false, dislike: true }});
            setLikes(likes.filter(like => {
                return like.profileUser.id != profileUserId; 
            }))

        }
        
        function watchVideos(){
            setPopupVisible(true); 
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
                        <View style={{ height: 70, width: 70, borderRadius: 35, alignItems: 'center', justifyContent: 'center'}}>
                            <Image
                                style={{ height: 60, width: 60, borderRadius: 30 }}
                                source={{ uri: profileUrl}}
                            />
                        </View>
                    )                    
                }
            } else {
                return null;  
            }
        }

        return (
            <View>                
                <View style={{ flexDirection: 'row', alignItems: 'center', paddingLeft: '5%'}}>
                    <ProfilePicture
                        profileUrl={profileUrl}
                        userVideos={userVideos}
                    />
                    <UserInfo 
                        name={name}
                        city={city}
                        region={region}
                        college={college}
                    />         
                </View>
                <View style={{ flexDirection: 'row', justifyContent: 'space-evenly' }}>
                    <TouchableOpacity onPress={onDislike} style={{ alignItems: 'center', justifyContent: 'flex-end', width: 60, height: 60, borderRadius: 40, borderWidth: 1,  borderColor: colors.primaryPurple}}>
                        <Entypo name='cross' size={45}  />  
                    </TouchableOpacity>      
                    <TouchableOpacity onPress={onLike} style={{ alignItems: 'center', justifyContent: 'flex-end', width: 60, height: 60, borderRadius: 40, borderWidth: 1,  borderColor: colors.primaryPurple}}>
                        <Ionicons name='md-heart' size={45} />       
                    </TouchableOpacity>      
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
            </View>          
        )
    }

    function UserInfo({name, city, region, college}){

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
    
    
        if(name){
          if(college){
            return (
                <View style={{ paddingLeft: '5%' }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center'}}>
                    <Text>{name}</Text>
                    {/* <Text style={styles.separatorText}>{'\u2B24'}</Text> */}
                    <DistanceSeparator />
                    <Distance />  
                  </View>
                  <Text style={{ paddingBottom: '2%'}}>{college}</Text>   
                </View>   
            )    
          } else {
            return (
                <View style={{ flexDirection: 'row', alignItems: 'center', paddingLeft: '5%' }}>
                  <Text >{name}</Text>     
                  <DistanceSeparator />
                  <Distance />    
                </View> 
            )    
          }
        } else {
          return null; 
        }
      }

    if(likes){
        if(likes.length > 0){
            return (
                    <SafeAreaView style={{ flex: 1, marginTop: StatusBar.currentHeight || 0,}}>
                        <Text style={{ fontSize: 27, fontWeight: '500', paddingLeft: '5%' }}>Likes You</Text>
                        <FlatList
                            data={likes}
                            renderItem={({ item, index }) => <Item profileUser={item.profileUser} />}
                            keyExtractor={item => item.id.toString()}
                            style={{ paddingTop: '15%' }}
                            ItemSeparatorComponent={ItemSeparator}
                        />
                    </SafeAreaView>
            )
        } else {
            return (
                <AddVideo />
              )      
        }
    } else {
        return null; 
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
    }
  });