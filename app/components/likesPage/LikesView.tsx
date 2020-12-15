import React, { useContext, useEffect, useState } from 'react';
import { UserIdContext } from '../../utils/context/UserIdContext';
import * as Segment from 'expo-analytics-segment';
import { useLazyQuery, useMutation, useSubscription } from '@apollo/client';
import { View, TouchableOpacity, Text, Image, StyleSheet, SafeAreaView, StatusBar, ActivityIndicator, Dimensions } from "react-native";
import { Feather } from '@expo/vector-icons'
import { colors } from '../../styles/colors';
import { FlatList} from 'react-native-gesture-handler';
import { Divider } from 'react-native-paper';
import { INSERT_LIKE, GET_NUMBER_VIDEOS, GET_LIKES, GET_INSTAGRAM, ON_YOUR_LIKES_UPDATED, ON_LIKES_YOU_UPDATED } from '../../utils/graphql/GraphqlClient';
import { _retrieveName  } from '../../utils/asyncStorage'; 
import MultipleVideoPopup from '../modals/MultipleVideosPopup'; 
import NoVideosPopup from '../modals/NoVideosPopup';
import NoInstagramPopup from '../modals/NoInstagramPopup';
import InstagramPopup from '../modals/InstagramPopup'; 
import InstagramOnboardingPopup from '../modals/InstagramOnboardingPopup'; 
import * as Linking from 'expo-linking';
import { Ionicons } from '@expo/vector-icons'
import axios from 'axios';

const MessagesStreamView = (props) => {
    
    const [userId, setUserId] = useContext(UserIdContext);
    const [likes, setLikes] = useState(null); 
    const [insertLike, { insertLikeData }] = useMutation(INSERT_LIKE);
    const [userName, setUserName] = useState(''); 
    const [profileVideoCount, setProfileVideoCount] = useState(null); 
    const [lastVideoIndex, setLastVideoIndex] = useState(-1); 
    const [instagramPopup, setInstagramPopup] = useState(false); 
    const [instagramOnboardingPopup, setInstagramOnboardingPopup] = useState(false); 
    const [viewingLikesYou, setViewingLikesYou] = useState(true); 
    const [matches, setMatches] = useState(null); 

    const { data, loading, error } = useSubscription(ON_YOUR_LIKES_UPDATED, { variables: { userId }});    

    const { data: onLikesYouData } = useSubscription(ON_LIKES_YOU_UPDATED, { variables: { userId }}); 

    useEffect(() => {
      if(onLikesYouData){
        const uniqueLikes = Array.from(new Set(onLikesYouData.likes.map(like => like.profileUser.id))).map(
          id => {
            return onLikesYouData.likes.find(like => like.profileUser.id === id); 
          }
        )
        
        if(uniqueLikes.length == 0){
          setViewingLikesYou(false); 
        }

        setLikes(uniqueLikes);
      }
    }, [onLikesYouData]);

    const [getNumberVideos, { data: numberVideos }] = useLazyQuery(GET_NUMBER_VIDEOS,
      {
        onCompleted: (numberVideos) => {
          const count = numberVideos.videos_aggregate.aggregate.count;
          setProfileVideoCount(count); 
        }
      });

      const [instagramOnboarded, setInstagramOnboarded] = useState(true); 

      const [getInstagramData, { data: instagramData }] = useLazyQuery(GET_INSTAGRAM,
        {
          onCompleted: (instagramData) => {
            setInstagramOnboarded(instagramData.users[0].instagramOnboarded); 

            if(instagramData.users[0].instagramOnboarded && !instagramData.users[0].instagram){
                setInstagramPopup(true); 
            }
        }
    });

    useEffect(() => {
      if(viewingLikesYou){
        if(!instagramOnboarded && likes && likes.length > 0){
          setInstagramOnboardingPopup(true); 
        }  
      } else {
        if(!instagramOnboarded && matches && matches.length > 0){
          setInstagramOnboardingPopup(true); 
        }  
      }
    }, [instagramOnboarded, likes, matches, viewingLikesYou]);

    useEffect(() => {
        Segment.screen('Likes'); 
        // getLikes({ variables: { userId }})
        initName(); 
        getNumberVideos({variables: { userId }}); 
        // getInstagramData({ variables: { userId }});
      }, []);

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

    async function initName(){
        let name = await _retrieveName(); 
        setUserName(name); 
    }

    function goToAddVideo(){
        props.navigation.navigate('Add Video');
    }

    function goToHome(){
      props.navigation.navigate('Home');
    }

    function AddVideoCta(){
      if(profileVideoCount > 0){
        return (
          <Text style={{ fontSize: 20, fontWeight: 'bold', color: colors.primaryWhite }}>Add videos to get more likes!</Text>
        )
      } else {
        return (
          <Text style={{ fontSize: 20, fontWeight: 'bold', color: colors.primaryWhite }}>Add videos to get likes!</Text>
        )
      }
    }

    function AddVideo(){
        return (
            <View style={{ height: '100%', justifyContent: 'center', alignItems: 'center' }}>
                <View style={{ height: '30%', width: '85%', backgroundColor: colors.primaryPurple, borderRadius: 5, padding: 10, alignItems: 'center', justifyContent: 'space-evenly' }}>
                    <View style={{ }}>
                        <Feather name="video" size={45} color={colors.primaryWhite} />
                    </View>        
                    <AddVideoCta />
                    <TouchableOpacity onPress={goToAddVideo} style={{ }}>
                        <View style={styles.addVideoContainer}>
                            <Text style={styles.addVideoText}>Add Video</Text>
                        </View>
                    </TouchableOpacity>
                </View>    
            </View>                
        )
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

    function _calculateAge(birthday) { 
        var today = new Date();
        var age = today.getFullYear() - birthday.getFullYear();
        var m = today.getMonth() - birthday.getMonth();
        if (m < 0 || (m === 0 && today.getDate() < birthday.getDate())) {
            age--;
        }
        return age;
    }
   

    const Item = React.memo(function Item({profileUser, index}) {
        const [popupVisible, setPopupVisible] = useState(false); 
        const [noVideosPopupVisible, setNoVideosPopupVisible] = useState(false);
        const [noInstagramPopupVisible, setNoInstagramPopupVisible] = useState(false);

        const name = profileUser.firstName; 
        const city = profileUser.city;
        const region = profileUser.region;
        const college = profileUser.college; 
        const profileUrl = profileUser.profileUrl; 
        const profileUserId = profileUser.id; 
        const userVideos = profileUser.userVideos;  
        const instagram = profileUser.instagram; 
        const [likedByUser, setLikedByUser] = useState(viewingLikesYou ? profileUser.likesByLikedId_aggregate.aggregate.count > 0 : false);  
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

        setNoVideosPopupVisible
        function showNoInstagramPopup(){
          setNoInstagramPopupVisible(true); 
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
                        <TouchableOpacity onPress={
                          
                          
                        } style={{ height: 70, width: 70, borderRadius: 35, alignItems: 'center', justifyContent: 'center'}}>
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

          function sendInstagram(){
            Segment.trackWithProperties("Likes - Send Instagram", { instagram: instagram}); 
            Linking.openURL('https://www.instagram.com/' + instagram.replace('@', '')); 
          }

          if(instagram){
            return (
              <TouchableOpacity onPress={sendInstagram} style={{ paddingLeft: '5%' }}>
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
              <TouchableOpacity onPress={showNoInstagramPopup} style={{ paddingLeft: '5%' }}>
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

        async function sendLike(likedId, likerName) {
          const res = await axios({
            method: 'post', 
            url: 'https://gentle-brook-91508.herokuapp.com/push',
            data: { "likerId" : userId, "likedId" : likedId, "likerName" : likerName }
          }); 
        }

        function likeBack(){
          insertLike({ variables: { likedId: profileUserId, likerId: userId, matched: false, dislike: false }});
          sendLike(profileUserId, name); 
          setLikedByUser(true); 
          setViewingLikesYou(false); 
        }

        function LikeButton(){
          if(viewingLikesYou){
            if(likedByUser){
              return (
                <View style={{ position: 'absolute', right: 20 }}>
                  <Ionicons name='md-heart' size={30} color={colors.primaryPurple} />        
                </View>      
              )
            } else {
              return (            
                <TouchableOpacity onPress={likeBack} style={{ position: 'absolute', right: 20 }}>
                  <Ionicons name='md-heart' size={30} color={colors.chineseWhite} />        
                </TouchableOpacity>      
              )  
            }
          } else {
            return null; 
          }
        };

        return (
            <View>    
              <VideoDivider />            
                <View style={{ flexDirection: 'row', alignItems: 'center', paddingLeft: '5%'}}>
                    <ProfilePicture
                        profileUrl={profileUrl}
                        userVideos={userVideos}
                    />
                    <TouchableUserInfo />
                    <LikeButton />
                </View>
                <MultipleVideoPopup 
                    userVideos={userVideos}
                    visible={popupVisible}
                    setVisible={setPopupVisible}            
                    name={name}
                    city={city}
                    region={region}
                    college={college}
                    // likedByUser={likedByUser}
                    // likeBack={likeBack}
                    // viewingLikesYou={viewingLikesYou}
                />
                <NoVideosPopup 
                  visible={noVideosPopupVisible}
                  setVisible={setNoVideosPopupVisible}
                  name={name}
                  requestedId={profileUserId}
                  requesterName={userName}
                />
                <NoInstagramPopup 
                  visible={noInstagramPopupVisible}
                  setVisible={setNoInstagramPopupVisible}
                  name={name}
                  requestedId={profileUserId}
                  requesterName={userName}
                />
                

            </View>          
        )
    }); 

    function UserInfo({name, city, region, college, age, instagram}){

      const fontSize = 13; 

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
              <Text style={{ fontSize, paddingLeft: 5}}>{city}, {region}</Text>
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
                <Text style={{ fontSize, paddingLeft: 5}}>{age}</Text>
              )
            } else {
              return null; 
            }
          }

          function Instagram(){
            if(instagram != null){
                if(instagram.includes('@')){
                  return(
                      <Text style={{ fontSize, fontWeight: '500'}}>IG: {instagram}</Text>
                    )    
                } else {
                  return(
                      <Text style={{ fontSize, fontWeight: '500'}}>IG: @{instagram}</Text>
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
                    <Text style={{ fontSize }}>{name}</Text>
                    <DistanceSeparator />
                    <Distance />  
                    <AgeSeparator />
                    <Age />
                  </View>
                  <Text style={{ fontSize }}>{college}</Text>   
                  <Instagram />
                </View>   
            )    
          } else {
            return (
              <View>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <Text style={{ fontSize }}>{name}</Text>     
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

    function LikesHeader(){

      function toggle(){
        setViewingLikesYou(!viewingLikesYou); 
      }

      function InstagramLikesYouTip(){
        if(likes.length > 0){
          return(
            <Text style={{ alignSelf: 'center', paddingTop: 10}}>Tip: Shoot your shot on Instagram!</Text>
          )  
        } else {
          return null;
        }
      }

      function InstagramYourLikesTip(){
        if(matches.length > 0){
          return(
            <Text style={{ alignSelf: 'center', paddingTop: 10}}>Tip: Shoot your shot on Instagram!</Text>
          )  
        } else {
          return null;
        }
      }


      if(viewingLikesYou){
        return(
          <View>
            <View style={{ flexDirection: 'row', justifyContent: 'space-around', paddingTop: '10%' }}>
              <Text style={{ fontSize: 23, textDecorationLine: 'underline', fontWeight: '500' }}>Likes You</Text>                        
              <TouchableOpacity onPress={toggle}>
                <Text style={{ fontSize: 23, fontWeight: '500' }}>Your Likes</Text>                                      
              </TouchableOpacity>
            </View>
            <InstagramLikesYouTip />
          
          </View>
        )
      } else {
        return(
          <View>
            <View style={{ flexDirection: 'row', justifyContent: 'space-around', paddingTop: '10%' }}>
              <TouchableOpacity onPress={toggle}>
                <Text style={{ fontSize: 23, fontWeight: '500' }}>Likes You</Text>        
              </TouchableOpacity>                
              <Text style={{ fontSize: 23, textDecorationLine: 'underline', fontWeight: '500' }}>Your Likes</Text>                        
            </View>
            <InstagramYourLikesTip />
          </View>
        )
      }
    }

    function LikesList(){

      if(viewingLikesYou){
        if(likes.length > 0){
          return (
            <FlatList
              data={likes}
              renderItem={({ item, index }) => <Item profileUser={item.profileUser} index={index} />}
              keyExtractor={item => item.id.toString()}
              style={{ paddingTop: '15%' }}
              ItemSeparatorComponent={ItemSeparator}
            />
          )
        } else {
          return (
            <AddVideo />
          )
        }
      } else {
        if(matches.length > 0){
          return (
            <FlatList
              data={matches}
              renderItem={({ item, index }) => <Item profileUser={item.profileUser} index={index} />}
              keyExtractor={item => item.id.toString()}
              style={{ paddingTop: '15%' }}
              ItemSeparatorComponent={ItemSeparator}
            />
          )
        } else {
          return (
            <LikeUsers /> 
          )
        }
      }
    };


    if(likes && matches){
      return (
              <SafeAreaView style={{ flex: 1, marginTop: StatusBar.currentHeight || 0}}>
                <LikesHeader />
                <LikesList />
                  <InstagramPopup
                    visible={instagramPopup}
                    setVisible={setInstagramPopup}
                  />
                  <InstagramOnboardingPopup
                    visible={instagramOnboardingPopup}
                    setVisible={setInstagramOnboardingPopup}
                  />

              </SafeAreaView>
      )
    } else {
      return(
        <View style={styles.activityView}>
          <ActivityIndicator size="small" color="#eee" />
        </View>
      )
    }

};

export default React.memo(MessagesStreamView);

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