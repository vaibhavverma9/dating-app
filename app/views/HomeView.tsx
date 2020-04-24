import React, { useEffect } from 'react';
import VideoContents from './VideoContents';
import { GET_VIDEOS } from '../../graphql/GraphqlClient';
import { useQuery } from '@apollo/client';

export default function HomeView({ navigation }) {

  const { data, error, loading} = useQuery(GET_VIDEOS)
  if (loading) return null;
  if (error) return `Error!: ${error}`;

  return (
    <VideoContents 
      data={data}
      navigation={navigation}
    />
  );
}