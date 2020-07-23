import React, { useState, useEffect, useContext } from 'react';
import { View, Text } from 'react-native'; 
import { useDoormanUser } from 'react-native-doorman'
import { UserIdContext } from './app/utils/context/UserIdContext'
import { GET_USERS_BY_UID, INSERT_USER } from './app/utils/graphql/GraphqlClient';
import { useMutation, useLazyQuery } from '@apollo/client';
import TabStack from './app/stacks/TabStack'; 
import OnboardingStack from './app/stacks/OnboardingStack';
// import { LocationContext } from './app/utils/context/LocationContext';
import { colors } from './app/styles/colors';
import { VideoCountContextProvider } from './app/utils/context/VideoCountContext';
import * as Sentry from 'sentry-expo'; 

export default function AppNavigator(){

  const [onboarded, setOnboarded] = useState(null);
  const { uid, phoneNumber } = useDoormanUser();
  const [userId, setUserId] = useContext(UserIdContext);
  // const [location, setLocation] = useContext(LocationContext); 
  const [insertUser, { insertUserData }] = useMutation(INSERT_USER); 

  const [getUsersByUid, { data: usersByUid }] = useLazyQuery(GET_USERS_BY_UID,
    {
      onError: (error) => {
        console.log("error", error); 
        Sentry.captureException(error); 
      }, 
      onCompleted: (usersByUid) => {
        initUser(usersByUid); 
      }
    })

  useEffect(() => {
    getUsersByUid({ variables: { uid }});
  }, [uid, getUsersByUid]);

  async function initUser(usersByUid){
    if(usersByUid.users.length == 0){
      insertUser({variables: { uid, phoneNumber }})
      .then(insertUserResponse => { 
        setUserId(insertUserResponse.data.insert_users.returning[0].id); 
        setOnboarded(false); 
        // _storeUserId(insertUserResponse.data.insert_users.returning[0].id); 
        // _storeDoormanUid(uid); 
        // _storeOnboarded(false); 
      })
      .catch(error => {
        Sentry.captureException(error);
        setUserId(0);
        setOnboarded(true); 
      })
    } else {
      setUserId(usersByUid.users[0].id);
      setOnboarded(usersByUid.users[0].onboarded)

      // _storeUserId(usersByUid.users[0].id);
      // _storeDoormanUid(uid); 
      // _storeOnboarded(usersByUid.users[0].onboarded); 

      // if(usersByUid.users[0].location){
      //   _storeLatitude(usersByUid.users[0].location.coordinates[0]); 
      //   _storeLongitude(usersByUid.users[0].location.coordinates[1]); 
        // (getUsersResponse.data.users[0].location.coordinates[1]);  
      // }
    }
  }

  if (onboarded == false){
    return (
      // <UserIdContextProvider>
        <OnboardingStack />
      // {/* </UserIdContextProvider> */}
    )
  } else if (onboarded == true){
    return (      
      // <UserIdContextProvider>
        <VideoCountContextProvider>
          <TabStack />
        </VideoCountContextProvider>
      // </UserIdContextProvider>

    )
  } else {
    return (
      <View style={{ flex: 1, backgroundColor: colors.primaryPurple, justifyContent: 'center', alignItems: 'center' }}>
        <Text style={{ color: '#eee'}}>App is loading, just a sec...</Text>
     </View>     
    ) 
  }
}