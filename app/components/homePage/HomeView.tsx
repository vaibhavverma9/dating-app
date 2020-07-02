import React, { useContext, useState, useEffect } from 'react';
import HomeContents from './HomeContents';
import { useQuery } from '@apollo/client';
import { GET_VIDEOS, GET_BEST_VIDEOS, GET_GENDER_INTEREST, GET_COLLEGE_LOCATION, GET_NUMBER_VIDEOS, client } from '../../utils/graphql/GraphqlClient';
import { UserIdContext } from '../../utils/context/UserIdContext'
import { _retrieveLatitude, _retrieveLongitude, _retrieveGenderInterest, _storeGenderInterest, _storeLastWatchedUpper, _storeLastWatchedLower, _retrieveLastWatchedUpper, _retrieveLastWatchedLower, _retrieveCollegeLatitude, _storeCollegeLatitude, _retrieveCollegeLongitude, _storeCollegeLongitude} from '../../utils/asyncStorage'; 
import { View, ActivityIndicator } from 'react-native';

export default function HomeView({ route, navigation }) {

  const [data, setData] = useState(null); 
  const [userId, setUserId] = useContext(UserIdContext);
  const limit = 4;
  const [genderInterest, setGenderInterest] = useState(''); 
  const [latitude, setLatitude] = useState(null);
  const [longitude, setLongitude] = useState(null);

  let currentDate = new Date();
  const [upperVideos, setUpperVideos] = useState(true); 
  const [locationVideos, setLocationVideos] = useState(true); 
  const [lastWatchedUpper, setLastWatchedUpper] = useState(null);
  const [lastWatchedLower, setLastWatchedLower] = useState(null); 
  const [lastLoadedUpper, setLastLoadedUpper] = useState(null); 
  const [lastLoadedLower, setLastLoadedLower] = useState(null); 
  const [lastLoadedNoLocation, setLastLoadedNoLocation] = useState(currentDate); 

  const [collegeLatitude, setCollegeLatitude] = useState(null);
  const [collegeLongitude, setCollegeLongitude] = useState(null);

  const [notIntoGender, setNotIntoGender] = useState(''); 
  // const [profileVideoCount, setProfileVideoCount] = useState(null); 

  const [point, setPoint] = useState({
    "type" : "Point", 
    "coordinates": [latitude, longitude]
  }); 

  const [collegePoint, setCollegePoint] = useState({
    "type" : "Point", 
    "coordinates" : [collegeLatitude, collegeLongitude]
  });

  useEffect(() => {
    queryVideosInit(lastLoadedUpper, lastLoadedLower);
  }, []); 

  async function queryVideosInit(lastLoadedUpper, lastLoadedLower){
    let genderInterestLocal = genderInterest; 
    let latitudeLocal = latitude; 
    let longitudeLocal = longitude; 
    let lastWatchedLowerLocal = lastWatchedLower;
    let lastLoadedLowerLocal = lastLoadedLower; 
    let lastWatchedUpperLocal = lastWatchedUpper; 
    let lastLoadedUpperLocal = lastLoadedUpper; 
    let collegeLatitudeLocal = collegeLatitude;
    let collegeLongitudeLocal = collegeLongitude; 

    if(genderInterestLocal == ''){
      genderInterestLocal = await _retrieveGenderInterest(); 
      if(genderInterestLocal == ''){
        client.query({ query: GET_GENDER_INTEREST, variables: { userId }})
        .then(response => {
          genderInterestLocal = response.data.users[0].genderInterest; 
          _storeGenderInterest(genderInterestLocal); 
          setGenderInterest(genderInterestLocal); 
        })
      } else {
        setGenderInterest(genderInterestLocal); 
      }
    }    

    if(latitudeLocal == null){
      latitudeLocal = await _retrieveLatitude();
    }
    setLatitude(latitudeLocal); 

    if(longitudeLocal == null){
      longitudeLocal = await _retrieveLongitude(); 
    }
    setLongitude(longitudeLocal); 

    if(collegeLatitudeLocal == null || collegeLongitudeLocal == null){
      collegeLongitudeLocal = await _retrieveCollegeLongitude(); 
      collegeLatitudeLocal = await _retrieveCollegeLatitude();
      
      if(collegeLongitudeLocal == null || collegeLatitudeLocal == null){
        client.query({ query: GET_COLLEGE_LOCATION, variables: { userId }})
        .then(response => {
          if(response.data.users[0].userCollege){
            collegeLongitudeLocal = response.data.users[0].userCollege.longitude; 
            collegeLatitudeLocal = response.data.users[0].userCollege.latitude;   
          } else {
            collegeLongitudeLocal = longitudeLocal;
            collegeLatitudeLocal = latitudeLocal;
          }
          _storeCollegeLongitude(collegeLongitudeLocal); 
          _storeCollegeLatitude(collegeLatitudeLocal); 
          setCollegeLongitude(collegeLongitudeLocal); 
          setCollegeLatitude(collegeLatitudeLocal);     
        })
      } else {
        setCollegeLongitude(collegeLongitudeLocal); 
        setCollegeLatitude(collegeLatitudeLocal);     
      }
    }

    let currentDate = new Date();

    if(lastWatchedUpperLocal == null){
      lastWatchedUpperLocal = await _retrieveLastWatchedUpper();
      if(lastWatchedUpperLocal == null){
        lastWatchedUpperLocal = currentDate; 
        _storeLastWatchedUpper(lastWatchedUpperLocal.toString());
        setLastWatchedUpper(lastWatchedUpperLocal); 
        setUpperVideos(false);  
      } else {
        lastWatchedUpperLocal = new Date(lastWatchedUpperLocal); 
        setLastWatchedUpper(lastWatchedUpperLocal); 
      }
    }

    if(lastLoadedUpperLocal == null){
      lastLoadedUpperLocal = lastWatchedUpperLocal; 
      setLastLoadedUpper(lastLoadedUpperLocal); 
    }

    if(lastWatchedLowerLocal == null){
      lastWatchedLowerLocal = await _retrieveLastWatchedLower();
      if(lastWatchedLowerLocal == null){
        lastWatchedLowerLocal = currentDate; 
        _storeLastWatchedLower(lastWatchedLowerLocal.toString()); 
        setLastWatchedLower(lastWatchedLowerLocal); 
      } else {
        lastWatchedLowerLocal = new Date(lastWatchedLowerLocal); 
        setLastWatchedLower(lastWatchedLowerLocal); 
      }
    }

    if(lastLoadedLowerLocal == null){
      lastLoadedLowerLocal = lastWatchedLowerLocal; 
      setLastLoadedLower(lastLoadedLowerLocal); 
    }

    queryVideos(genderInterestLocal, latitudeLocal, longitudeLocal, collegeLatitudeLocal, collegeLongitudeLocal);
  }

  async function queryVideos(genderInterest, latitude, longitude, collegeLatitude, collegeLongitude){

    const point = {
        "type" : "Point", 
        "coordinates": [latitude, longitude]
    }; 

    setPoint(point); 

    const collegePoint = {
      "type" : "Point", 
      "coordinates" : [collegeLongitude, collegeLatitude]
    }

    setCollegePoint(collegePoint); 

    if(genderInterest == "Women"){
      setNotIntoGender("Man"); 
    } else if(genderInterest == "Men"){
      setNotIntoGender("Woman");
    } 
  }

  if(point != null && collegePoint != null){

    let lowerLimit = 0;
    let upperLimit = 0;
    let noLocationLimit = 0; 
    let bestLimit = 0;  
    let videoQuery; 

    // if(profileVideoCount && profileVideoCount == 0){
    //   bestLimit = 5; 
    // } else if(profileVideoCount && profileVideoCount > 0) {
      if(locationVideos){
        if(upperVideos){
          upperLimit = limit; 
        } else {
          lowerLimit = limit; 
        }
      } else {
        noLocationLimit = limit; 
      }  
    // }

    const { loading, error, data } = useQuery(GET_VIDEOS, {
      variables: { userId, noLocationLimit: 0, lowerLimit: limit, upperLimit: limit, lastLoadedLower, lastLoadedUpper, lastLoadedNoLocation, notIntoGender, point, collegePoint }
    });   

    if(loading){
      return (
        <View style={{ backgroundColor: '#000', justifyContent: 'center', alignItems: 'center', flex: 1}}>
          <ActivityIndicator size="small" color="#eee" />
        </View>
      )
    } else if(error){
      return (
        <View style={{ backgroundColor: '#000', justifyContent: 'center', alignItems: 'center', flex: 1}}>
          <ActivityIndicator size="small" color="#eee" />
        </View>
      )
    } else if(data){
      if(data.lowerUsersLocation.length > 0 || data.upperUsersLocation.length > 0 || data.usersNoLocation.length > 0){
        return (
          <HomeContents 
            route={route}
            navigation={navigation}
            data={data}
            lastWatchedLower={lastWatchedLower}
            lastLoadedLower={lastLoadedLower}
            lastWatchedUpper={lastWatchedUpper}
            lastLoadedUpper={lastLoadedUpper}
            lastLoadedNoLocation={lastLoadedNoLocation}
            upperVideos={upperVideos}
            locationVideos={locationVideos}
            limit={limit}
            upperLimit={upperLimit}
            lowerLimit={lowerLimit}
            noLocationLimit={noLocationLimit}
            genderInterest={genderInterest}
            latitude={latitude}
            longitude={longitude}
            collegeLatitude={collegeLatitude}
            collegeLongitude={collegeLongitude}
            // profileVideoCount={profileVideoCount}
          />
        )  
      } else {
        return (
          <View style={{ backgroundColor: '#000', justifyContent: 'center', alignItems: 'center', flex: 1}}>
            <ActivityIndicator size="small" color="#eee" />
          </View>
        )  
      }
    } else {
      return (
        <View style={{ backgroundColor: '#000', justifyContent: 'center', alignItems: 'center', flex: 1}}>
          <ActivityIndicator size="small" color="#eee" />
        </View>
      )
    }
  } else {
    return (
      <View style={{ backgroundColor: '#000', justifyContent: 'center', alignItems: 'center', flex: 1}}>
        <ActivityIndicator size="small" color="#eee" />
      </View>
    )
  }

}