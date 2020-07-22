// import './wdyr'; 
import React, { useState, useEffect } from 'react';
import * as Sentry from 'sentry-expo'; 
import 'react-native-gesture-handler';
import { ApolloClient, ApolloProvider, HttpLink, InMemoryCache, gql } from '@apollo/client';
import { UserIdContextProvider } from './app/utils/context/UserIdContext'; 
import {decode, encode} from 'base-64'
import { WebSocketLink } from 'apollo-link-ws';
import * as Segment from 'expo-analytics-segment';
import { DoormanProvider, AuthFlow, AuthGate  } from 'react-native-doorman'; 
import { ActivityIndicator } from 'react-native'
import * as firebase from 'firebase'; 
import AppNavigator from './AppNavigator';
// import { LocationContextProvider } from './app/utils/context/LocationContext';
import { colors } from './app/styles/colors';
import { withOta } from './app/hoc/with-ota';

// Set the configuration for your app
var firebaseConfig = {
  apiKey: "AIzaSyCaXNTEyRQIS9NJfV56PvPXU7rvm82OVFk",
  authDomain: "reeltalk-402aa.firebaseapp.com",
  databaseURL: "https://reeltalk-402aa.firebaseio.com",
  projectId: "reeltalk-402aa",
  storageBucket: "reeltalk-402aa.appspot.com",
  messagingSenderId: "602717352439",
  appId: "1:602717352439:web:04ddfb94ae69256918fef2",
  measurementId: "G-WCDWEF23HM"
};

firebase.initializeApp(firebaseConfig);

const iosWriteKey = "0QHHf9Gg55EE10Hi5o0LYMfLMN4X7ypl"; 
const androidWriteKey = "idFwR27mq8yZxEpQFGdmdAJ0yzMM6wV0"; 

if (!global.btoa) {
global.btoa = encode;
}

if (!global.atob) {
global.atob = decode;
}

Sentry.init({
  dsn: 'https://8187be7306d04ef78c02712b775acea2@o380965.ingest.sentry.io/5207574',
  enableInExpoDevelopment: true,
  debug: true
}); 

const graphqlEndpoint = 'https://reel-talk-2.herokuapp.com/v1/graphql'; 
// const graphqlEndpoint = 'https://vital-robin-42.hasura.app/v1/graphql'; 

function App() {

  return(
    <AuthenticatedApp  />
  ) 
}

function AuthenticatedApp (){
  
  return (
      <DoormanProvider 
        publicProjectId="zYoqBfXTFc7Ialp1SYGF"
      >
        <AuthGate>
          {({ user, loading }) => {
            
            if (loading) {
              return <ActivityIndicator/>
            }

            // if a user is authenticated
            if (user) {
              return <DoormanAuthenticatedApp />
            }
            

            // otherwise, send them to the auth flow
            return <AuthFlow 
              backgroundColor={colors.primaryPurple}
              headerTintColor={colors.secondaryWhite}
            />
          }}
        </AuthGate>
      </DoormanProvider>
  );
}

function DoormanAuthenticatedApp () {

  const [authState, setAuthState] = useState({ status: "loading" });

  useEffect(() => {
    Segment.initialize({ androidWriteKey, iosWriteKey });
    Segment.screen('App Open'); 
    authenticateFirebaseToken();
  }, []);

  async function authenticateFirebaseToken(){
    const user = firebase.auth().currentUser; 
    if (user) {
      const token = await user.getIdToken(); 
      const idTokenResult = await user.getIdTokenResult();
      const hasuraClaim = idTokenResult.claims["https://hasura.io/jwt/claims"];

      
      if(hasuraClaim){
        setAuthState({ status: "in", token });
      } else {
        // Check if refresh is required.
        const metadataRef = firebase
          .database()
          .ref("metadata/" + user.uid + "/refreshTime");
  
        metadataRef.on("value", async (data) => {
          if(!data.exists()) return;
          // Force refresh to pick up the latest custom claims changes.
          const token = await user.getIdToken(true);
          // console.log(token); 
          setAuthState({ status: "in", token });
        });
      }
    } else {
      setAuthState({ status: "out" });
    }
  }

  return(
    <FirebaseAuthenticatedApp authState={authState} />
  )
}

function FirebaseAuthenticatedApp({authState}){

  const isIn = authState.status === "in";
  const headers = isIn ? { Authorization: `Bearer ${authState.token}` } : {};

  const client = new ApolloClient({
    cache: new InMemoryCache(),
    link: new WebSocketLink({
      uri: graphqlEndpoint,
      options: {
        lazy: true,
        reconnect: true,
        connectionParams: {
          headers
        }
      }
    })
  });

  // console.log(client); 

  return (
    <ApolloProvider client={client}>
      <UserIdContextProvider>
        <AppNavigator />
      </UserIdContextProvider>
    </ApolloProvider>
  )
}

export default withOta(App);