import React, { useContext, useState, useEffect } from 'react';
import HomeContents from './HomeContents';
import { useQuery, useLazyQuery } from '@apollo/client';
import { GET_VIDEOS, GET_GENDER_INTEREST, GET_GENDER_GROUP } from '../../utils/graphql/GraphqlClient';
import { UserIdContext } from '../../utils/context/UserIdContext'
import { _retrieveLatitude, _retrieveLongitude, _retrieveGender, _storeGender, _retrieveGenderInterest, _storeGenderInterest, _storeLastWatchedUpper, _storeLastWatchedLower, _retrieveLastWatchedUpper, _retrieveLastWatchedLower, _retrieveCollegeLatitude, _storeCollegeLatitude, _retrieveCollegeLongitude, _storeCollegeLongitude, _retrieveGenderGroup, _storeGenderGroup} from '../../utils/asyncStorage'; 
import { View, ActivityIndicator, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { colors } from '../../styles/colors';
import { Feather } from '@expo/vector-icons'; 

export default function HomeView({route, navigation}) {

  // const [data, setData] = useState(null); 
  const [userId, setUserId] = useContext(UserIdContext);
  const limit = 4;
  
  const [genderInterest, setGenderInterest] = useState(''); 
  const [genderGroup, setGenderGroup] = useState(0); 
  const [groupPreference, setGroupPreference] = useState([0]); 
  
  const [timedOut, setTimedOut] = useState(false);
  let currentDate = new Date();
  // const [lastLoaded, setLastLoaded] = useState(currentDate); 

  const [lastPerformance, setLastPerformance] = useState(1.0); 

  const point = {
    "type" : "Point", 
    "coordinates": [-87.6298, 41.8781]
  }; 

  const [notIntoGender, setNotIntoGender] = useState(''); 

  const [getGenderGroup, { data: genderGroupData }] = useLazyQuery(GET_GENDER_GROUP, 
    { 
      onCompleted: (genderGroupData) => { 
        let genderGroup = genderGroupData.users[0].group; 
        _storeGenderGroup(genderGroup); 
        setGenderGroup(genderGroup);   
        assignGenderPreferences(genderGroup); 
      }
    }); 

  useEffect(() => {
    navigation.addListener('focus', async () => {
      let retrievedGroup = await _retrieveGenderGroup(); 
      if(retrievedGroup != genderGroup){
        setGenderGroup(retrievedGroup); 
        assignGenderPreferences(retrievedGroup); 
      }
    });  
  }, [navigation]);

  useEffect(() => {
    queryVideosInit();
    setTimeout(() => { setTimedOut(true) }, 5000); 
  }, []); 

  function assignGenderPreferences(genderGroup){
    if(genderGroup == 1){
      setGroupPreference([2, 6]); 
    } else if(genderGroup == 2){
      setGroupPreference([1, 3]); 
    } else if(genderGroup == 3){
      setGroupPreference([2, 3, 4, 6]); 
    } else if(genderGroup == 4){
      setGroupPreference([3, 4]); 
    } else if(genderGroup == 5){
      setGroupPreference([5, 6]); 
    } else if(genderGroup == 6){
      setGroupPreference([1, 3, 5, 6]); 
    }
  }

  async function queryVideosInit(){
    let genderGroupLocal = genderGroup; 
    if(genderGroupLocal == 0){
      genderGroupLocal = await _retrieveGenderGroup(); 
      if(genderGroupLocal == 0){
        getGenderGroup({variables: { userId }})
      } else {
        _storeGenderGroup(genderGroupLocal); 
        setGenderGroup(genderGroupLocal); 
        assignGenderPreferences(genderGroupLocal); 
      }
    } else {
      assignGenderPreferences(genderGroupLocal); 
    }
  }

  function OutOfUsers(){
    if(!timedOut){
      return (
        <View style={{ backgroundColor: '#000', justifyContent: 'center', alignItems: 'center', flex: 1}}>
          <ActivityIndicator size="small" color="#eee" />
        </View>
      )  
    } else {
      return (
        <View style={{ height: '100%', justifyContent: 'center', alignItems: 'center', backgroundColor: colors.primaryBlack }}>
          <View style={{ height: '40%', width: '85%', backgroundColor: colors.primaryPurple, borderRadius: 5, padding: 10, alignItems: 'center', justifyContent: 'center' }}>
              <Text style={{ fontSize: 22, fontWeight: 'bold', paddingTop: 15, paddingBottom: 5, color: colors.primaryWhite }}>Out of users!</Text>
              <Text style={{ textAlign: 'center', fontSize: 20, fontWeight: '300', paddingHorizontal: 5, color: colors.primaryWhite }}>Come back tomorrow for more users :)</Text>
          </View>
      </View>     
      )
    }
  }

  const { loading, error, data } = useQuery(GET_VIDEOS, {
    variables: { userId, limit, groupPreference, lastPerformance }
  });

  if(loading){
    return (
      <OutOfUsers />
    )
  } else if(error){
    return (
      <OutOfUsers />
    )
  } else if(data){
    if(data.usersLocation.length > 0){
      return (
        <HomeContents 
          route={route}
          navigation={navigation}
          data={data}
          limit={limit}
          groupPreference={groupPreference}
          lastPerformance={lastPerformance}
          genderGroup={genderGroup}
          assignGenderPreferences={assignGenderPreferences}
        />
      )  
    } else {
      return (
        <OutOfUsers />
      )  
    }
  } else {
    return (
      <OutOfUsers />
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
  }
})