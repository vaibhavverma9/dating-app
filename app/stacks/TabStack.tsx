import React from 'react';
import HomeView from '../components/homePage/HomeView';
import AddCameraView from '../components/addPage/AddCameraView'
import MessagesView from '../components/messagesPage/MessagesView'; 
import VideosView from '../components/videosPage/VideosView'; 
import EditProfileView from '../components/videosPage/EditProfileView'; 
import EditNameView from '../components/videosPage/EditNameView';
import EditBioView from '../components/videosPage/EditBioView';
import VideosDetailView from '../components/videosPage/VideosDetailView';
import EditLocationView from '../components/videosPage/EditLocationView'; 
import { MaterialIcons } from '@expo/vector-icons';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { colors } from '../styles/colors';
import EditGenderInterestView from '../components/videosPage/EditGenderInterestView';


const Tab = createBottomTabNavigator(); 
const Stack = createStackNavigator(); 

export default function TabStack (){

    const editProfileStyles = { 
        headerBackTitleVisible: false,
        headerStyle: { backgroundColor: colors.primaryBlack },
        headerTintColor: 'white'
    }

    const videoDetailStyles = {
        headerBackTitleVisible: false,
        headerStyle: { backgroundColor: colors.primaryBlack },
        headerTintColor: 'white',
        title: '',
        headerTransparent: true
    }

    function VideosStack() {
        return (
            <Stack.Navigator>
                <Stack.Screen options={{ headerShown: false }} name="VideosView" component={VideosView} />
                <Stack.Screen options={editProfileStyles} name="Edit profile" component={EditProfileView} />
                <Stack.Screen options={editProfileStyles} name="Name" component={EditNameView} />
                <Stack.Screen options={editProfileStyles} name="Bio" component={EditBioView} />
                <Stack.Screen options={editProfileStyles} name="Gender Preferences" component={EditGenderInterestView} />
                <Stack.Screen options={videoDetailStyles} name="Location" component={EditLocationView} />
                <Stack.Screen options={videoDetailStyles} name="VideosDetail" component={VideosDetailView} />                
            </Stack.Navigator>
        )
    }

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
                <Tab.Screen name="Videos" component={VideosStack} />
            </Tab.Navigator>

        </NavigationContainer>
    )
}