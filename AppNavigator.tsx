import React, { useState, useEffect, useContext } from 'react';
import { View } from 'react-native'; 
import { _retrieveUserId, _storeUserId, _retrieveDoormanUid, _storeDoormanUid, _retrieveOnboarded, _storeOnboarded, _storeLatitude, _storeLongitude, _retrieveLatitude, _retrieveLongitude } from './app/utils/asyncStorage'; 
import { useDoormanUser } from 'react-native-doorman'
import { UserIdContext } from './app/utils/context/UserIdContext'
import { client, GET_USERS_BY_UID, INSERT_USER } from './app/utils/graphql/GraphqlClient';
import { useMutation } from '@apollo/client';
import TabStack from './app/stacks/TabStack'; 
import OnboardingStack from './app/stacks/OnboardingStack';
import { LocationContext } from './app/utils/context/LocationContext';
import { colors } from './app/styles/colors';

export default function AppNavigator(){

  const [onboarded, setOnboarded] = useState(null);
  const { uid, phoneNumber } = useDoormanUser();
  const [userId, setUserId] = useContext(UserIdContext);
  const [location, setLocation] = useContext(LocationContext); 
  const [insertUser, { insertUserData }] = useMutation(INSERT_USER); 

  useEffect(() => {
    console.log(uid); 
    doormanDatabaseAuth(); 
  }, []);

  async function doormanDatabaseAuth() {
    const localUserId = await _retrieveUserId();
    const localDoormanUid = await _retrieveDoormanUid();
    const localOnboarded = await _retrieveOnboarded(); 

    console.log(localUserId, localDoormanUid, localOnboarded); 

    if(localUserId > 0 && localDoormanUid != "" && localOnboarded != ""){ 
      const localLatitude = await _retrieveLatitude(); 
      const localLongitude = await _retrieveLongitude(); 

      if (localLatitude != null && localLongitude != null){
        setLocation([localLatitude, localLongitude]);
      }
  
      setUserId(localUserId); 
      setOnboarded(localOnboarded); 
    } else {
      client.query({ query: GET_USERS_BY_UID , variables: { uid }})
      .then(getUsersResponse => {
        if(getUsersResponse.data.users == 0){
          insertUser({variables: { uid, phoneNumber }})
          .then(insertUserResponse => { 
            _storeUserId(insertUserResponse.data.insert_users.returning[0].id); 
            _storeDoormanUid(uid); 
            _storeOnboarded(false); 

            setUserId(insertUserResponse.data.insert_users.returning[0].id); 
            setOnboarded(false); 
          })
          .catch(insertUserError => { console.log(insertUserError) })
        } else {
          console.log("in database"); 
          console.log(getUsersResponse.data.users[0].onboarded); 
          _storeUserId(getUsersResponse.data.users[0].id);
          _storeDoormanUid(uid); 
          _storeOnboarded(getUsersResponse.data.users[0].onboarded); 

          if(getUsersResponse.data.users[0].location){
            _storeLatitude(getUsersResponse.data.users[0].location.coordinates[0]); 
            _storeLongitude(getUsersResponse.data.users[0].location.coordinates[1]); 
            setLocation(getUsersResponse.data.users[0].location.coordinates[1]);  
          }
          setUserId(getUsersResponse.data.users[0].id);
          setOnboarded(getUsersResponse.data.users[0].onboarded)
        }
      })
      .catch(error => {
        console.log(error)
      });
    }
  }

  if (onboarded == false){
    return (
      <OnboardingStack />
    )
  } else if (onboarded == true){
    return <TabStack />
  } else {
    return <View style={{ flex: 1, backgroundColor: colors.primaryPurple }} />
  }
}