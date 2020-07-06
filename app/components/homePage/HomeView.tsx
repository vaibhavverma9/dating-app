import React, { useContext, useState, useEffect } from 'react';
import HomeContents from './HomeContents';
import { useQuery, useLazyQuery } from '@apollo/client';
import { GET_VIDEOS, GET_BEST_VIDEOS, GET_GENDER_INTEREST, GET_COLLEGE_LOCATION, GET_NUMBER_VIDEOS, client } from '../../utils/graphql/GraphqlClient';
import { UserIdContext } from '../../utils/context/UserIdContext'
import { _retrieveLatitude, _retrieveLongitude, _retrieveGenderInterest, _storeGenderInterest, _storeLastWatchedUpper, _storeLastWatchedLower, _retrieveLastWatchedUpper, _retrieveLastWatchedLower, _retrieveCollegeLatitude, _storeCollegeLatitude, _retrieveCollegeLongitude, _storeCollegeLongitude} from '../../utils/asyncStorage'; 
import { View, ActivityIndicator, Text } from 'react-native';

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

    if(locationVideos){
      if(upperVideos){
        upperLimit = limit; 
      } else {
        lowerLimit = limit; 
      }
    } else {
      noLocationLimit = limit; 
    }  


    // console.log( userId, noLocationLimit, lowerLimit, upperLimit, lastLoadedLower, lastLoadedUpper, lastLoadedNoLocation, notIntoGender, point, collegePoint);
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
        // console.log("pulling data", data); 
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