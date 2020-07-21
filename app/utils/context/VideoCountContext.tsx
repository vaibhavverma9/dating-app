import React, { createContext, useState, useEffect, useContext } from 'react';
import { UserIdContext } from './UserIdContext'
import { useLazyQuery } from '@apollo/client';
import { GET_VIDEO_COUNT } from '../graphql/GraphqlClient';

const VideoCountContext = createContext([{}, () => {}]);

const VideoCountContextProvider = (props) => {
  const [videoCount, setVideoCount] = useState(0);

  return (
    <VideoCountContext.Provider value={[videoCount, setVideoCount] }>
      {props.children}
    </VideoCountContext.Provider>
  )
}

export { VideoCountContext, VideoCountContextProvider };