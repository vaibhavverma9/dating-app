import React from 'react';
import HomeView from '../components/homePage/HomeView';
import AddCameraView from '../components/addPage/AddCameraView';
import AuctionView from '../components/auctionPage/AuctionView'; 
import LikesView from '../components/likesPage/LikesView'; 
import VideosView from '../components/videosPage/VideosView'; 
import EditProfileView from '../components/videosPage/EditProfileView'; 
import EditNameView from '../components/videosPage/EditNameView';
import EditBioView from '../components/videosPage/EditBioView';
import VideosDetailView from '../components/videosPage/VideosDetailView';
import EditLocationView from '../components/videosPage/EditLocationView'; 
import EditCollegeView from '../components/videosPage/EditCollegeView'; 
import EditInstagramView from '../components/videosPage/EditInstagramView'; 
import { MaterialIcons, FontAwesome5 } from '@expo/vector-icons';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { colors } from '../styles/colors';
import EditGenderInterestView from '../components/videosPage/EditGenderInterestView';
import EditGenderView from '../components/videosPage/EditGenderView'; 
import { ChatStack } from './ChatStack'; 

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

    const videoStyles = {
        headerShown: true,
        title: '',
        headerStyle: { backgroundColor: colors.primaryBlack, height: 40, shadowRadius: 0,
            shadowOffset: {
                height: 0,
        } }
    }
    function VideosStack() {
        return (
            <Stack.Navigator>
                <Stack.Screen options={videoStyles} name="VideosView" component={VideosView} />
                <Stack.Screen options={editProfileStyles} name="Edit profile" component={EditProfileView} />
                <Stack.Screen options={editProfileStyles} name="Name" component={EditNameView} />
                <Stack.Screen options={editProfileStyles} name="Bio" component={EditBioView} />
                <Stack.Screen options={editProfileStyles} name="Gender" component={EditGenderView} />
                <Stack.Screen options={editProfileStyles} name="Gender Preferences" component={EditGenderInterestView} />
                <Stack.Screen options={videoDetailStyles} name="Location" component={EditLocationView} />
                <Stack.Screen options={videoDetailStyles} name="VideosDetail" component={VideosDetailView} />                
                <Stack.Screen options={editProfileStyles} name="College" component={EditCollegeView} />
                <Stack.Screen options={editProfileStyles} name="Instagram" component={EditInstagramView} />
            </Stack.Navigator>
        )
    }


    return (
            <Tab.Navigator
            screenOptions={({ route }) => ({
                tabBarIcon: ({ color, size }) => {
                let iconName;
        
                if (route.name === 'Home') {
                    iconName = 'home';
                } else if (route.name === 'Add Video') {
                    iconName = 'add';
                } else if (route.name === 'Likes') {
                    iconName = 'favorite';
                } else if (route.name === 'Your Videos') {
                    iconName = 'video-library';
                } else if (route.name === 'Auction Friend'){
                    return <FontAwesome5 name='user-friends' size={size} color={color} />;
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
                <Tab.Screen name="Add Video" component={AddCameraView} />
                <Tab.Screen name="Likes" component={ChatStack} /> 
                <Tab.Screen name="Your Videos" component={VideosStack} />
            </Tab.Navigator>

    )
}