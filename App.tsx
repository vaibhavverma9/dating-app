import React, { createContext } from 'react';
import HomeView from './app/components/HomeView';
import AddView from './app/components/AddView';
import FeedbackView from './app/components/FeedbackView'; 
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { MaterialIcons } from '@expo/vector-icons';
import * as Sentry from 'sentry-expo'; 
import 'react-native-gesture-handler';
import { ApolloClient, ApolloProvider, HttpLink, InMemoryCache, gql } from '@apollo/client';
import { UserIdContextProvider } from './app/context/UserIdContext'; 

Sentry.init({
  dsn: 'https://8187be7306d04ef78c02712b775acea2@o380965.ingest.sentry.io/5207574',
  enableInExpoDevelopment: true,
  debug: true
}); 

const graphqlEndpoint = 'https://reel-talk-2.herokuapp.com/v1/graphql';

export const client = new ApolloClient({
  cache: new InMemoryCache(),
  link: new HttpLink({
    uri: graphqlEndpoint,
  })
});

export const UserIdContext = createContext(0);

const Tab = createBottomTabNavigator(); 

export default function App() {

  return (
    <ApolloProvider client={client}>
      <UserIdContextProvider>
        <NavigationContainer>
          <Tab.Navigator
            screenOptions={({ route }) => ({
              tabBarIcon: ({ focused, color, size }) => {
                let iconName;

                if (route.name === 'Home') {
                  iconName = 'home';
                } else if (route.name === 'Add') {
                  iconName = 'add';
                } else if (route.name == 'Feedback'){
                  iconName = 'inbox'; 
                }

                // You can return any component that you like here!
                return <MaterialIcons name={iconName} size={size} color={color} />;
              },
              })}
              tabBarOptions={{
                activeTintColor: 'white',
                inactiveTintColor: 'gray',
                style: {
                  backgroundColor: '#0e1111', 
                  borderTopColor: '#transparent'
                }
              }}
            >
            <Tab.Screen name="Home" component={HomeView} />
            <Tab.Screen name="Add" component={AddView} />
            <Tab.Screen name="Feedback" component={FeedbackView} />
          </Tab.Navigator>
        </NavigationContainer>
      </UserIdContextProvider>
    </ApolloProvider>
  );
}


{/* <UserIdContext.Provider value={userId}> */}
      {/* </UserIdContext.Provider> */}

// function ToDoScreen() {
//   return (
//     <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
//     </View>
//   );
// }

// if (route.name === 'Home') {
//   iconName = 'home';
// } else if (route.name === 'Add') {
//   iconName = 'add';
// } else if (route.name === 'Videos') {
//   iconName = 'video-library';
// } else if (route.name === 'Profile') {
//   iconName = 'person';
// } else if (route.name === 'Inbox') {
//   iconName = 'inbox';
// }

{/* <Tab.Screen name="Home" component={HomeView} />
<Tab.Screen name="Inbox" component={ToDoScreen} />
<Tab.Screen name="Add" component={AddView} />
<Tab.Screen name="Videos" component={ToDoScreen} />
<Tab.Screen name="Profile" component={ToDoScreen} /> */}

// import {decode, encode} from 'base-64'

// if (!global.btoa) {
// global.btoa = encode;
// }

// if (!global.atob) {
// global.atob = decode;
// }