import React, { useState}  from 'react';
import { TouchableOpacity} from 'react-native-gesture-handler';
import { Text, View, Image } from "react-native";
import { colors } from '../../styles/colors';
import { _calculateAge } from '../../utils/formulas'; 
import MultipleVideoPopup from '../modals/MultipleVideosPopup'; 

export const ChannelCell = ({userId, url, members, lastMessage, cachedReadReceiptStatus, index, navigation, matchesData}) => {
    const [popupVisible, setPopupVisible] = useState(false); 

    let name = ''; 
    let city = '';
    let region = '';
    let college = ''; 
    let profileUrl = ''; 
    let profileUserId = ''; 
    let userVideos = '';  
    let instagram = '';
    let age = null; 

    const match = members.filter(member => {
        return member.userId != userId.toString();
    });

    name = match[0].nickname; 
    profileUrl = match[0].plainProfileUrl;

    let matchData = [];
    if(matchesData){
        matchData = matchesData.likes.filter(matchData =>{
            return matchData.profileId == match[0].userId; 
        });    

        if(matchData.length > 0){
            city = matchData[0].profileUser.city;
            region = matchData[0].profileUser.region;
            college = matchData[0].profileUser.college;
            profileUserId = matchData[0].profileId;
            userVideos = matchData[0].profileUser.userVideos; 
            instagram = matchData[0].profileUser.instagram;

            if(matchData[0].profileUser.birthday){
                const birthday = new Date(matchData[0].profileUser.birthday);
                age = _calculateAge(birthday);
            } 
    
        }
    };

    function openChannel(){
        navigation.navigate("ChannelView", { name, url, userId, profileUrl }); 
    }

    function watchVideos(){
        setPopupVisible(true); 
    }

    function ProfilePicture({profileUrl, userVideos}){
        if(profileUrl != ''){
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
      
    return (

    <View style={{ flexDirection: 'row', alignItems: 'center', paddingLeft: '5%'}}>
        <ProfilePicture
            profileUrl={profileUrl}
            userVideos={userVideos}
        />
        <TouchableOpacity onPress={openChannel} style={{ paddingLeft: '5%' }}>
            <UserInfo 
                name={name}
                city={city}
                region={region}
                college={college}
                age={age}
                instagram={instagram}
            />   
        </TouchableOpacity>
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
    </View>
    )
}