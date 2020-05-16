import React from 'react';
import VideoContents from './HomeContents';

export default function HomeView({ route, navigation }) {
  return (
    <VideoContents 
      route={route}
      navigation={navigation}
    />
  );
}