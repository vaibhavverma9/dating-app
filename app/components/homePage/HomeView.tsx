import React, { useContext, useState, useEffect } from 'react';
import HomeContents from './HomeContents';
import { useQuery, useLazyQuery } from '@apollo/client';
import { GET_VIDEOS, GET_GENDER_INTEREST, GET_COLLEGE_LOCATION, GET_NUMBER_VIDEOS, client } from '../../utils/graphql/GraphqlClient';
import { UserIdContext } from '../../utils/context/UserIdContext'
import { _retrieveLatitude, _retrieveLongitude, _retrieveGenderInterest, _storeGenderInterest, _storeLastWatchedUpper, _storeLastWatchedLower, _retrieveLastWatchedUpper, _retrieveLastWatchedLower, _retrieveCollegeLatitude, _storeCollegeLatitude, _retrieveCollegeLongitude, _storeCollegeLongitude} from '../../utils/asyncStorage'; 
import { View, ActivityIndicator, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { colors } from '../../styles/colors';
import { Feather } from '@expo/vector-icons'; 

export default function HomeView({route, navigation}) {

  const [data, setData] = useState(null); 
  const [userId, setUserId] = useContext(UserIdContext);
  const limit = 4;
  const [genderInterest, setGenderInterest] = useState(''); 
  const [latitude, setLatitude] = useState(null);
  const [longitude, setLongitude] = useState(null);
  const [timedOut, setTimedOut] = useState(false);
  let currentDate = new Date();
  const [lastLoadedLocation, setLastLoadedLocation] = useState(currentDate);
  const [lastLoadedNoLocation, setLastLoadedNoLocation] = useState(currentDate); 

  // const [upperVideos, setUpperVideos] = useState(true); 
  const [locationVideos, setLocationVideos] = useState(true); 
  // const [lastWatchedUpper, setLastWatchedUpper] = useState(null);
  // const [lastWatchedLower, setLastWatchedLower] = useState(null); 
  // const [lastLoadedUpper, setLastLoadedUpper] = useState(null); 
  // const [lastLoadedLower, setLastLoadedLower] = useState(null); 

  const [collegeLatitude, setCollegeLatitude] = useState(null);
  const [collegeLongitude, setCollegeLongitude] = useState(null);

  const [notIntoGender, setNotIntoGender] = useState(''); 
  // const [profileVideoCount, setProfileVideoCount] = useState(null); 

  const [getGenderInterest, { data: genderInterestData }] = useLazyQuery(GET_GENDER_INTEREST, 
    { 
      onCompleted: (genderInterestData) => { 
        let genderInterest = genderInterestData.users[0].genderInterest; 
        _storeGenderInterest(genderInterest); 
        setGenderInterest(genderInterest); 

        if(genderInterest == "Women"){
          setNotIntoGender("Man"); 
        } else if(genderInterest == "Men"){
          setNotIntoGender("Woman");
        }     
      } 
    }); 
  
  const [getCollegeInterest, { data: collegeInterestData }] = useLazyQuery(GET_COLLEGE_LOCATION, 
    { 
      onCompleted: (collegeInterestData) => { 
        let collegeLongitude;
        let collegeLatitude; 

        if(collegeInterestData.users[0].userCollege){
          collegeLongitude = collegeInterestData.users[0].userCollege.longitude; 
          collegeLatitude = collegeInterestData.users[0].userCollege.latitude;   
        } 
        _storeCollegeLongitude(collegeLongitude); 
        _storeCollegeLatitude(collegeLatitude); 
        setCollegeLongitude(collegeLongitude); 
        setCollegeLatitude(collegeLatitude);  
      } 
    }); 

  const [point, setPoint] = useState({
    "type" : "Point", 
    "coordinates": [latitude, longitude]
  }); 

  const [collegePoint, setCollegePoint] = useState({
    "type" : "Point", 
    "coordinates" : [collegeLatitude, collegeLongitude]
  });

  useEffect(() => {
    queryVideosInit();
    setTimeout(() => { setTimedOut(true) }, 5000); 
  }, []); 

  async function queryVideosInit(){
    let genderInterestLocal = genderInterest; 
    let latitudeLocal = latitude; 
    let longitudeLocal = longitude; 
    let collegeLatitudeLocal = collegeLatitude;
    let collegeLongitudeLocal = collegeLongitude; 

    if(genderInterestLocal == ''){
      genderInterestLocal = await _retrieveGenderInterest(); 
      if(genderInterestLocal == ''){
        getGenderInterest({variables: { userId }})
      } else {
        if(genderInterestLocal == "Women"){
          setNotIntoGender("Man"); 
        } else if(genderInterestLocal == "Men"){
          setNotIntoGender("Woman");
        }    
        setGenderInterest(genderInterestLocal); 
      }
    }    

    let point; 

    if(latitudeLocal == null || longitudeLocal == null){
      latitudeLocal = await _retrieveLatitude();
      longitudeLocal = await _retrieveLongitude(); 

      if(latitudeLocal == null || longitudeLocal == null){
        // query latitude and longitude from the database
        // point = {
        //   "type" : "Point", 
        //   "coordinates": [latitudeLocal, longitudeLocal]
        // }; 
        // setPoint(point); 
        // setLatitude(latitudeLocal); 
        // setLongitude(longitudeLocal);      
      } else {
        point = {
          "type" : "Point", 
          "coordinates": [latitudeLocal, longitudeLocal]
        };
        setPoint(point); 
        setLatitude(latitudeLocal); 
        setLongitude(longitudeLocal);       
      }
    } else {
      point = {
        "type" : "Point", 
        "coordinates": [latitudeLocal, longitudeLocal]
      };  
      setPoint(point); 
      setLatitude(latitudeLocal); 
      setLongitude(longitudeLocal);   
    }


    if(collegeLatitudeLocal == null || collegeLongitudeLocal == null){
      collegeLongitudeLocal = await _retrieveCollegeLongitude(); 
      collegeLatitudeLocal = await _retrieveCollegeLatitude();
      
      if(collegeLongitudeLocal == null || collegeLatitudeLocal == null){
        getCollegeInterest({ variables: { userId } });
      } else {
        setCollegeLongitude(collegeLongitudeLocal); 
        setCollegeLatitude(collegeLatitudeLocal);     
      }
    }
  }

  function goToAddVideo(){
    navigation.navigate('Add');
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
          <View style={{ height: '40%', width: '85%', backgroundColor: colors.primaryPurple, borderRadius: 5, padding: 10, alignItems: 'center' }}>
              <View style={{ paddingTop: '10%', height: '25%'}}>
                  <Feather name="video" size={45} color={colors.primaryWhite} />
              </View>        
              <Text style={{ fontSize: 22, fontWeight: 'bold', paddingTop: 15, paddingBottom: 5, color: colors.primaryWhite }}>Out of users!</Text>
              <Text style={{ textAlign: 'center', fontSize: 20, fontWeight: '300', paddingHorizontal: 5, color: colors.primaryWhite }}>Add new videos to get more likes from users :)</Text>
              <TouchableOpacity onPress={goToAddVideo} style={{ paddingTop: '12%' }}>
                  <View style={styles.addVideoContainer}>
                      <Text style={styles.addVideoText}>Add Video</Text>
                  </View>
              </TouchableOpacity>
          </View>
  
      </View>     
      )
    }
  }

  if(point != null && collegePoint != null){

    const { loading, error, data } = useQuery(GET_VIDEOS, {
      variables: { userId, noLocationLimit: 1, locationLimit: 4, notIntoGender, point, collegePoint, lastLoadedLocation, lastLoadedNoLocation }
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
      if(data.usersLocation.length > 0 || data.usersNoLocation.length > 0){
        return (
          <HomeContents 
            route={route}
            navigation={navigation}
            data={data}
            locationVideos={locationVideos}
            locationLimit={limit}
            noLocationLimit={0}
            limit={limit}
            genderInterest={genderInterest}
            latitude={latitude}
            longitude={longitude}
            collegeLatitude={collegeLatitude}
            collegeLongitude={collegeLongitude}
            lastLoadedLocation={lastLoadedLocation}
            lastLoadedNoLocation={lastLoadedNoLocation}
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