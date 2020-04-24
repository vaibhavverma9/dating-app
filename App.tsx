import React from 'react';
import HomeView from './app/views/HomeView';
import AddView from './app/views/AddView';
import { View } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { MaterialIcons } from '@expo/vector-icons';
import * as Sentry from 'sentry-expo'; 
import 'react-native-gesture-handler';
import { ApolloProvider } from '@apollo/client';
import { client } from './graphql/GraphqlClient';

Sentry.init({
  dsn: 'https://8187be7306d04ef78c02712b775acea2@o380965.ingest.sentry.io/5207574',
  enableInExpoDevelopment: true,
  debug: true
}); 

function ToDoScreen() {
  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
    </View>
  );
}

const Tab = createBottomTabNavigator(); 


export default function App() {
  return (
    <ApolloProvider client={client}>
      <NavigationContainer>
        <Tab.Navigator
          screenOptions={({ route }) => ({
            tabBarIcon: ({ focused, color, size }) => {
              let iconName;

              if (route.name === 'Home') {
                iconName = 'home';
              } else if (route.name === 'Inbox') {
                iconName = 'inbox';
              } else if (route.name === 'Add') {
                iconName = 'add';
              } else if (route.name === 'Videos') {
                iconName = 'video-library';
              } else if (route.name === 'Profile') {
                iconName = 'person';
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
          <Tab.Screen name="Inbox" component={ToDoScreen} />
          <Tab.Screen name="Add" component={AddView} />
          <Tab.Screen name="Videos" component={ToDoScreen} />
          <Tab.Screen name="Profile" component={ToDoScreen} />
        </Tab.Navigator>
      </NavigationContainer>
    </ApolloProvider>
  );
}