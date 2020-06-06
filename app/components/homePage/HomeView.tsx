import React from 'react';
import HomeContents from './HomeContents';

export default function HomeView({ route, navigation }) {
  return (
    <HomeContents 
      route={route}
      navigation={navigation}
    />
  );
}