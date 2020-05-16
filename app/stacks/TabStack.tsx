import React from 'react';
import HomeView from '../components/homePage/HomeView';
import AddCameraView from '../components/addPage/AddCameraView'
import FeedbackView from '../components/feedbackPage/FeedbackView'; 
import MessagesView from '../components/messagesPage/MessagesView'; 
import VideosView from '../components/videosPage/VideosView'; 
import { MaterialIcons } from '@expo/vector-icons';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

const Tab = createBottomTabNavigator(); 

export default function TabStack (){
    return (
        <NavigationContainer>
            <Tab.Navigator
            screenOptions={({ route }) => ({
                tabBarIcon: ({ focused, color, size }) => {
                let iconName;
        
                if (route.name === 'Home') {
                    iconName = 'home';
                } else if (route.name === 'Add') {
                    iconName = 'add';
                } else if (route.name === 'Messages') {
                    iconName = 'inbox';
                } else if (route.name == 'Feedback'){
                    iconName = 'feedback'; 
                } else if (route.name === 'Videos') {
                    iconName = 'video-library';
                }; 
        
        
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
            <Tab.Screen name="Add" component={AddCameraView} />
            <Tab.Screen name="Messages" component={MessagesView} />
            <Tab.Screen name="Videos" component={VideosView} />
            <Tab.Screen name="Feedback" component={FeedbackView} />
            </Tab.Navigator>
        </NavigationContainer>
    )
  }