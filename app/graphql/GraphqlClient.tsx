const graphqlEndpoint = 'https://reel-talk-2.herokuapp.com/v1/graphql';

import { ApolloClient, HttpLink, InMemoryCache, gql } from '@apollo/client';

export const client = new ApolloClient({
    cache: new InMemoryCache(),
    link: new HttpLink({
      uri: graphqlEndpoint,
    })
});

export const GET_VIDEOS = gql`
  { 
    users(limit: 10, where: {userVideos: {}}) {
      firstName
      lastName
      userVideos(limit: 4) {
        muxPlaybackId
        videoQuestion {
          questionText
        }
      }
      id
    }
  }
`; 

export const GET_QUESTIONS = gql`
  {
    questions {
      questionText
      id
    }
  }
`

export const GET_USER_DEVICE_ID = gql`
  query GetUserDeviceId ($deviceId: String) {
    users(where: {deviceId: {_eq: $deviceId}}) {
      id
    }
  }
`

export const INSERT_VIDEO = gql`
  mutation InsertVideo ($downloadUrl: String, $muxAssetId: String, $muxPlaybackId: String, $questionId: Int, $userId: Int) {
    insert_videos(objects: {downloadUrl: $downloadUrl, muxAssetId: $muxAssetId, muxPlaybackId: $muxPlaybackId, questionId: $questionId, userId: $userId}) {
      returning {
        id
      }
    }
  }
`
export const INSERT_USER = gql`
  mutation InsertUser($deviceId: String) {
    insert_users(objects: {deviceId: $deviceId}) {
      returning {
        id
      }
    }
  }
`

export const GET_USER_VIDEOS = gql`
query GetUserVideos($userId: Int) {
  videos(limit: 4, where: {userId: {_eq: $userId}}, order_by: {timeStamp: desc_nulls_last}) {
    muxPlaybackId
    videoQuestion {
      questionText
    }
  }
}
`

export const GET_ASSET_STATUS = `
    query GetAssetStatus ($muxAssetId: String) {    
        videos(where: {muxAssetId: {_eq: $muxAssetId}}) {
            status
            muxAssetId
        }
    }
`