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
import * as Network from 'expo-network';
import { View, Text, TouchableOpacity } from 'react-native'; 

// if (process.env.NODE_ENV === 'development') {
//   const whyDidYouRender = require('@welldone-software/why-did-you-render');
//   whyDidYouRender(React, {
//     trackAllPureComponents: true,
//   });
// }

const iosWriteKey = "0QHHf9Gg55EE10Hi5o0LYMfLMN4X7ypl"; 
const androidWriteKey = "idFwR27mq8yZxEpQFGdmdAJ0yzMM6wV0"; 

const graphqlEndpoint = 'https://reel-talk-2.herokuapp.com/v1/graphql'; 

const App = React.memo(function App() {

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
})

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
      
      if (hasuraClaim) {
        setAuthState({ status: "in", user, token });
      } else {
        // Check if refresh is required.
        const metadataRef = firebaseApp
          .database()
          .ref("metadata/" + user.uid + "/refreshTime");

        metadataRef.on("value", async (data) => {
          if(!data.exists) return
          // Force refresh to pick up the latest custom claims changes.
          const token = await user.getIdToken(true);
          setAuthState({ status: "in", user, token });
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

  const [connectedInternet, setConnectedInternet] = useState(true); 

  async function networkConnected(){
    const networkInfo = await Network.getNetworkStateAsync(); 
    setConnectedInternet(networkInfo.isConnected); 
  }

  useEffect(() => {
    networkConnected(); 
  }, []); 

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

  if(connectedInternet){
    return (
      <ApolloProvider client={client}>
        <UserIdContextProvider>
          <AppNavigator />
        </UserIdContextProvider>
      </ApolloProvider>
    )  
  } else {
    return (
      <View style={{ flex: 1, backgroundColor: colors.primaryPurple, justifyContent: 'center', alignItems: 'center'}}>
        <TouchableOpacity style={{ padding: 5, borderColor: '#eee', borderRadius: 5, borderWidth: 1}} onPress={networkConnected}>
          <Text style={{ fontSize: 18, fontWeight: '500', color: '#eee'}}>Reload</Text>
        </TouchableOpacity>
        <Text style={{ color: '#eee', paddingTop: 20}}>The Internet connection appears to be offline.</Text>

     </View>     
    )
  }
}

export default withOta(App);
