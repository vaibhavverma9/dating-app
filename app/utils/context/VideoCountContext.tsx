import React, { createContext, useState, useEffect, useContext } from 'react';
import { UserIdContext } from './UserIdContext'
import { useLazyQuery } from '@apollo/client';
import { GET_VIDEO_COUNT } from '../graphql/GraphqlClient';

const VideoCountContext = createContext([{}, () => {}]);

const VideoCountContextProvider = (props) => {
  const [videoCount, setVideoCount] = useState(0);
  const [userId, setUserId] = useContext(UserIdContext);

  const [getVideoCount, { data: videoCountData }] = useLazyQuery(GET_VIDEO_COUNT, 
    { 
      onCompleted: (videoCountData) => { 
        setVideoCount(videoCountData.videos_aggregate.aggregate.count); 
      } 
    }); 

  useEffect(() => {
    let yesterday = new Date(Date.now() - 86400000); 
    getVideoCount({ variables: { userId, since: yesterday }}); 
  }, [])

  return (
    <VideoCountContext.Provider value={[videoCount, setVideoCount] }>
      {props.children}
    </VideoCountContext.Provider>
  )
}

export { VideoCountContext, VideoCountContextProvider };