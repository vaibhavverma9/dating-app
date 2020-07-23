// import './wdyr'; 
import React, { useState, useEffect } from 'react';
import * as Sentry from 'sentry-expo'; 
import 'react-native-gesture-handler';
import { ApolloClient, ApolloProvider, InMemoryCache } from '@apollo/client';
import { UserIdContextProvider } from './app/utils/context/UserIdContext'; 
import {decode, encode} from 'base-64'
import { WebSocketLink } from 'apollo-link-ws';
import * as Segment from 'expo-analytics-segment';
import { DoormanProvider, AuthFlow, AuthGate  } from 'react-native-doorman'; 
import { ActivityIndicator } from 'react-native'
import AppNavigator from './AppNavigator';
import { colors } from './app/styles/colors';
import { withOta } from './app/hoc/with-ota';
import firebaseApp from './app/utils/firebase/fbConfig';

const iosWriteKey = "0QHHf9Gg55EE10Hi5o0LYMfLMN4X7ypl"; 
const androidWriteKey = "idFwR27mq8yZxEpQFGdmdAJ0yzMM6wV0"; 

const graphqlEndpoint = 'https://reel-talk-2.herokuapp.com/v1/graphql'; 
// const graphqlEndpoint = 'https://vital-robin-42.hasura.app/v1/graphql'; 

function App() {

  console.log("rerendering App"); 

  useEffect(() => {
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
  }, []);

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

    const user = firebaseApp.auth().currentUser; 
    if (user) {
      const token = await user.getIdToken(); 
      const idTokenResult = await user.getIdTokenResult();
      const hasuraClaim = idTokenResult.claims["https://hasura.io/jwt/claims"];

      
      if(hasuraClaim){
        setAuthState({ status: "in", token });
      } else {
        // Check if refresh is required.
        const metadataRef = firebaseApp
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