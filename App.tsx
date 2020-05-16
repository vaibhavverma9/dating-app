import React from 'react';
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
import { LocationContextProvider } from './app/utils/context/LocationContext';

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

Segment.initialize({ androidWriteKey, iosWriteKey });

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

// export const UserIdContext = createContext(0);

const client = new ApolloClient({
  cache: new InMemoryCache(),
  link: new WebSocketLink({
  // link: new HttpLink({
    uri: graphqlEndpoint,
  })
});

export default function App() {

  
  return (
    <ApolloProvider client={client}>
      <DoormanProvider 
        publicProjectId="zYoqBfXTFc7Ialp1SYGF"
      >
        <AuthGate>
          {({ user, loading }) => {
            if (loading) return <ActivityIndicator />
          
            // if a user is authenticated
            if (user) {
              return <AuthenticatedApp />
            }
            
            // otherwise, send them to the auth flow
            return <AuthFlow 
              backgroundColor="#734f96"
              headerTintColor="#E6E6FA"
            />
          }}
        </AuthGate>
      </DoormanProvider>
    </ApolloProvider>
  );
}

function AuthenticatedApp () {
  return (
    <UserIdContextProvider>
      <LocationContextProvider>
        <AppNavigator />
      </LocationContextProvider>
    </UserIdContextProvider>
  )
}