import { createStackNavigator } from '@react-navigation/stack';
import React from 'react';
import ChannelView from '../components/chatPage/ChannelView';
import ChannelListView from '../components/chatPage/ChannelListView';
import { colors } from '../styles/colors';

const Stack = createStackNavigator(); 

const noHeaderView = {
    headerShown: false
}

export function ChatStack(){
    return (
        <Stack.Navigator>
            <Stack.Screen options={noHeaderView} name="ChannelListView" component={ChannelListView} />
            <Stack.Screen options={noHeaderView} name="ChannelView" component={ChannelView} />
        </Stack.Navigator>
    )
}
