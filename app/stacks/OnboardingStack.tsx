import React from 'react';
import NameOnboarding from "../components/onboarding/NameOnboarding";
import { createStackNavigator } from '@react-navigation/stack';
import { NavigationContainer } from '@react-navigation/native';
import GenderOnboarding from '../components/onboarding/GenderOnboarding';
import { Ionicons } from '@expo/vector-icons'
import { View } from 'react-native';
import GenderInterestOnboarding from '../components/onboarding/GenderInterestOnboarding';
import CollegeOnboarding from '../components/onboarding/CollegeOnboarding';
import ProfilePictureOnboarding from '../components/onboarding/ProfilePictureOnboarding';
import LocationOnboarding from '../components/onboarding/LocationOnboarding';
import AgeOnboarding from '../components/onboarding/AgeOnboarding';
import TabStack from './TabStack';
import TutorialOnboarding from '../components/onboarding/TutorialOnboarding';
import InstagramOnboarding from '../components/onboarding/InstagramOnboarding';

const Stack = createStackNavigator(); 

export default function OnboardingStack (){

    const onboardingStyle = {
        // headerShown: false,
        headerTransparent: true,
        title: '',
        headerBackTitleVisible: false,
        headerBackImage: (props) => (
                <Ionicons name="ios-arrow-back" style={{padding: 10}} size={40} color={'#eee'} />
        )
    }

    const tabStyle = {
        headerShown: false,

    }

    return (
        // <NavigationContainer>
            <Stack.Navigator>
                <Stack.Screen options={onboardingStyle} name="NameOnboarding" component={NameOnboarding} />
                <Stack.Screen options={onboardingStyle} name="GenderOnboarding" component={GenderOnboarding} />
                <Stack.Screen options={onboardingStyle} name="GenderInterestOnboarding" component={GenderInterestOnboarding} />
                <Stack.Screen options={onboardingStyle} name="AgeOnboarding" component={AgeOnboarding} />
                <Stack.Screen options={onboardingStyle} name="CollegeOnboarding" component={CollegeOnboarding} />
                <Stack.Screen options={onboardingStyle} name="ProfilePictureOnboarding" component={ProfilePictureOnboarding} />
                <Stack.Screen options={onboardingStyle} name="LocationOnboarding" component={LocationOnboarding} />
                <Stack.Screen options={onboardingStyle} name="TutorialOnboarding" component={TutorialOnboarding} />
                <Stack.Screen options={onboardingStyle} name="InstagramOnboarding" component={InstagramOnboarding} />
                <Stack.Screen options={tabStyle} name="TabStack" component={TabStack} />
            </Stack.Navigator>
        // </NavigationContainer>
    )
  }