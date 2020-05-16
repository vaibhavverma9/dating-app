const graphqlEndpoint = 'https://reel-talk-2.herokuapp.com/v1/graphql';

import { ApolloClient, HttpLink, InMemoryCache, gql } from '@apollo/client';
import { WebSocketLink } from 'apollo-link-ws';

export const client = new ApolloClient({
    cache: new InMemoryCache(),
    // link: new HttpLink({
    link: new WebSocketLink({
      uri: graphqlEndpoint,
    })
});

export const GET_VIDEOS = gql`
  query GetVideos ($userId: Int) { 
    users(
      limit: 10, 
      where: {_and: [
        {userVideos: {status: {_eq: "ready"}}}, 
        {_not: {id: {_eq: $userId}}},        
        {_not: {likesByLikedid: {Liker: {id: {_eq: $userId}}}}},
        {_not: {blocksByBlockedId: {blockerId: {_eq: $userId}}}}
      ]}, 
      order_by: {lastUploaded: desc_nulls_last}
    ) {
      firstName
      userVideos(limit: 4, where: {status: {_eq: "ready"}}) {
        muxPlaybackId
        videoQuestion {
          questionText
        }
        id
        flags
      }
      id
    }
  }
`; 

export const GET_VIDEOS_NO_USERID = gql`
  query GetVideos { 
    users(
      limit: 10, 
      where: {_and: [
        {userVideos: {status: {_eq: "ready"}}}, 
      ]}, 
      order_by: {lastUploaded: desc_nulls_last}
    ) {
      firstName
      userVideos(limit: 4, where: {status: {_eq: "ready"}}) {
        muxPlaybackId
        videoQuestion {
          questionText
        }
        id
        flags
      }
      id
    }
  }
`;

export const GET_VIDEOS_NEARBY = gql`
  query GetVideos ($userId: Int, $point: geography!) { 
    users(
      limit: 10, 
      where: {_and: [
        {userVideos: {status: {_eq: "ready"}}}, 
        {_not: {id: {_eq: $userId}}},        
        {_not: {likesByLikedid: {Liker: {id: {_eq: $userId}}}}},
        {_not: {blocksByBlockedId: {blockerId: {_eq: $userId}}}},
        { location: {_st_d_within: {distance: 20000, from: $point }}}
      ]}, 
      order_by: {lastUploaded: desc_nulls_last}
    ) {
      firstName
      userVideos(limit: 4, where: {status: {_eq: "ready"}}) {
        muxPlaybackId
        videoQuestion {
          questionText
        }
        id
        flags
      }
      id
    }
  }
`; 

export const GET_PROFILE_VIDEOS = gql`
  query GetUserVideos ($userId: Int){
    videos(where: {userId: {_eq: $userId}, status: {_eq: "ready"}}, order_by: {created_at: desc}){
      id
      muxPlaybackId
      status
      videoQuestion {
        questionText
      }
    }
  }
`

export const GET_QUESTIONS = gql`
  {
    questions {
      questionText
      id
    }
  }
`

export const INSERT_INIT_VIDEO = gql`
  mutation InsertVideo ($questionId: Int, $userId: Int, $passthroughId: String, $status: String, $uploadId: String) {
    insert_videos(objects: {questionId: $questionId, userId: $userId, passthroughId: $passthroughId,  status: $status, uploadId: $uploadId}) {
      returning {
        id
      }
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
  mutation InsertUser ($uid: String, $phoneNumber: String) {
    insert_users(objects: {uid: $uid, phoneNumber: $phoneNumber}) {
      returning {
        id
      }
    }
  }
`

export const GET_USER_VIDEOS = gql`
query GetUserVideos($userId: Int) {
  videos(limit: 4, where: {userId: {_eq: $userId}}, order_by: {created_at: desc_nulls_last}) {
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


export const GET_LIKES = gql`
    query GetLikes ($userId: Int) {
      likes(where: {_and: [
        {Liker: {userVideos: {}}}, 
        {likedId: {_eq: $userId}},
        {Liker: {_not: {blocksByBlockedId: {blockerId: {_eq: $userId}}}}}, 
        {likerId: {_neq: $userId}}
      ]}, 
        order_by: {created_at: desc}) {
        matched
        likerId
        created_at
        Liker {
          id
          messages(where: {receiverId: {_eq: $userId}}, limit: 1, order_by: {created_at: desc}) {
            message
          }
          userVideos(limit: 1, order_by: {created_at: desc}) {
            videoQuestion {
              questionText
            }
            muxPlaybackId
          }
        }
      }
    }  
`

// likerId

export const GET_LIKE = gql`
    query GetLike ($likerId: Int, $likedId: Int) {
      likes(where: {_and: [{likerId: {_eq: $likerId}}, {likedId: {_eq: $likedId}}]}) {
        matched
      }
    }  
`

export const INSERT_LIKE = gql`
    mutation InsertLikes ($likedId: Int, $likerId: Int, $matched: Boolean) {
      insert_likes(objects: {likedId: $likedId, likerId: $likerId, matched: $matched}) {
        returning {
          id
        }
      }
    }
`

export const INSERT_MESSAGE = gql`
    mutation InsertMessage ($message: String, $receiverId: Int, $senderId: Int){
      insert_messages(objects: {message: $message, receiverId: $receiverId, senderId: $senderId}) {
        returning {
          id
        }
      }
    }
`

export const UPDATE_LIKE = gql`
    mutation UpdateLike($likedId: Int, $likerId: Int, $matched: Boolean){
      update_likes(where: {_and: [{likedId: {_eq: $likedId}}, {likerId: {_eq: $likerId}}]}, _set: {matched: $matched}) {
        returning {
          id
        }
      }
    }
`

export const UPDATE_LAST_UPLOADED = gql`
    mutation UpdateLastUploaded($userId: Int, $timestamp: timestamptz){
      update_users(where: {id: {_eq: $userId}}, _set: {lastUploaded: $timestamp}) {
        affected_rows
      }
    }
`

export const UPDATE_VIDEOS = gql`
    mutation UpdateVideos($id: Int, $flags: Int){
      update_videos(where: {id: {_eq: $id}}, _set: {flags: $flags}) {
        affected_rows
      }
    }
`

export const INSERT_BLOCK = gql`
  mutation InsertBlock ($blockedId: Int, $blockerId: Int) {
    insert_blocks(objects: {blockedId: $blockedId, blockerId: $blockerId}){
      affected_rows
    }
  }
`

export const ON_VIDEO_UPDATED = gql`
  subscription OnVideoUpdated ($passthroughId: String) {
    videos(where: {passthroughId: {_eq: $passthroughId }}) {
      muxPlaybackId
      questionId
      status
      userId
    }
  }
`

export const GET_USERS_BY_UID = gql`
  query GetUsersByUid ($uid: String){
    users(where: {uid: {_eq: $uid}}) {
      id
      onboarded
      location
    }
  }
`

export const GET_NUMBER_VIDEOS = gql`
  query GetNumberVideos ($userId: Int) {
    videos_aggregate(where: {_and: {userId: {_eq: $userId}, muxPlaybackId: {_is_null: false}}}) {
      aggregate {
        count
      }
    }
  }
`

export const UPDATE_LATITUDE_LONGITUDE = gql`
  mutation UpdateLatitudeLongitude ($userId: Int, $point: geography!) {
    update_users(where: {id: {_eq: $userId}}, _set: {location: $point}) {
      affected_rows
    }
  }
`

export const UPDATE_ONBOARDED = gql`
  mutation UpdateLatitudeLongitude ($userId: Int, $onboarded: Boolean) {
    update_users(where: {id: {_eq: $userId}}, _set: {onboarded: $onboarded}) {
      affected_rows
    }
  }
`