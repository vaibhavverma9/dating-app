const graphqlEndpoint = 'https://reel-talk-2.herokuapp.com/v1/graphql';

import { ApolloClient, HttpLink, InMemoryCache, gql } from '@apollo/client';
import { WebSocketLink } from 'apollo-link-ws';
import { createHttpLink } from 'apollo-link-http';
import { setContext } from 'apollo-link-context';
 
export const client = new ApolloClient({
    cache: new InMemoryCache(),
    link: new WebSocketLink({
      uri: graphqlEndpoint,
      options: {
        lazy: true,
        reconnect: true,
        connectionParams: {
          headers: {
            // Authorization: 'x-hasura-admin-secret: kobeglass81discipline'
          },
        }
      }
    })
});

// {_and: [
//   { location: {_is_null: true}},
//   { userCollege: { location: {_is_null: true}}}
// ]}


// {
//   _or: [
//     { location: {_st_d_within: {distance: 300000, from: $collegePoint }}},
//     { location: {_st_d_within: {distance: 300000, from: $point }}},
//     { userCollege : { location: {_st_d_within: {distance: 300000, from: $point }}}},
//     { userCollege : { location: {_st_d_within: {distance: 300000, from: $collegePoint }}}},
//   ]
// },

//         {lastUploaded: {_lt: $lastLoadedLower}}
// {_not: {id: {_eq: $userId}}},        
// {_not: {blocksByBlockedId: {blockerId: {_eq: $userId}}}}


export const GET_VIDEOS = gql`
  fragment videoFields on users {
    firstName
    city
    region
    college
    location
    likesByLikedId(limit: 1, where: {likerId: {_eq: $userId}}, order_by: {created_at: desc}) {
      dislike
      matched
    }
    userVideos(limit: 4, where: {status: {_eq: "ready"}}, order_by: {views: asc}) {
      muxPlaybackId
      videoQuestion {
        questionText
      }
      id
      flags
      likes
      dislikes
      views
    }
    id
    lastUploaded
  }

  query GetVideos ($userId: Int, $noLocationLimit: Int, $lowerLimit: Int, $upperLimit: Int, $lastLoadedLower: timestamptz, $lastLoadedUpper: timestamptz, $lastLoadedNoLocation: timestamptz, $notIntoGender: String, $point: geography!, $collegePoint: geography!) { 
    lowerUsersLocation: users (
      limit: 4, 
      where: {_and: [
        {userVideos: {status: {_eq: "ready"}}},
      ]}, 
      order_by: {lastUploaded: desc_nulls_last}
    ) {
      ...videoFields
    }

    upperUsersLocation: users (
      limit: $upperLimit, 
      where: {_and: [
        {_or: [
          {gender: {_neq: $notIntoGender}},
          {gender: {_is_null: true}}
        ]},
        {
          _or: [
            { location: {_st_d_within: {distance: 300000, from: $collegePoint }}},
            { location: {_st_d_within: {distance: 300000, from: $point }}},
            { userCollege : { location: {_st_d_within: {distance: 300000, from: $point }}}},
            { userCollege : { location: {_st_d_within: {distance: 300000, from: $collegePoint }}}},
          ]
        },
        {userVideos: {status: {_eq: "ready"}}},
        {_not: {id: {_eq: $userId}}},        
        {_not: {blocksByBlockedId: {blockerId: {_eq: $userId}}}},
        {lastUploaded: {_gt: $lastLoadedUpper}}
      ]}, 
      order_by: {lastUploaded: asc_nulls_last}
    ) {
      ...videoFields
    }

    usersNoLocation: users (
      limit: $noLocationLimit, 
      where: {_and: [
        {_or: [
          {gender: {_neq: $notIntoGender}},
          {gender: {_is_null: true}}
        ]},
        {_or: [
          {_and: [
            {_not: { location: {_st_d_within: {distance: 300000, from: $collegePoint }}}},
            {_not: { location: {_st_d_within: {distance: 300000, from: $point }}}},
            {_not: { userCollege : { location: {_st_d_within: {distance: 300000, from: $point }}}}},
            {_not: { userCollege : { location: {_st_d_within: {distance: 300000, from: $collegePoint }}}}},
          ]},
          {_and: [
            { location: {_is_null: true}},  
            {_not: { userCollege : { location: {_st_d_within: {distance: 300000, from: $point }}}}},
            {_not: { userCollege : { location: {_st_d_within: {distance: 300000, from: $collegePoint }}}}},
          ]}
        ]},
        {userVideos: {status: {_eq: "ready"}}},
        {_not: {id: {_eq: $userId}}},        
        {_not: {blocksByBlockedId: {blockerId: {_eq: $userId}}}},
        {lastUploaded: {_lt: $lastLoadedNoLocation}}
      ]}, 
      order_by: {lastUploaded: desc_nulls_last}
    ){
      ...videoFields
    }

  }
`

export const GET_BEST_VIDEOS = gql`
  fragment videoFields on users {
    firstName
    city
    region
    college
    location
    likesByLikedId(limit: 1, where: {likerId: {_eq: $userId}}, order_by: {created_at: desc}) {
      dislike
      matched
    }
    userVideos(limit: 4, where: {status: {_eq: "ready"}}, order_by: {views: asc}) {
      muxPlaybackId
      videoQuestion {
        questionText
      }
      id
      flags
      likes
      dislikes
      views
    }
    id
    lastUploaded
  }

  query GetBestVideos ($userId: Int, $bestLimit: Int, $noLocationLimit: Int, $lowerLimit: Int, $upperLimit: Int, $lastLoadedLower: timestamptz, $lastLoadedUpper: timestamptz, $lastLoadedNoLocation: timestamptz, $notIntoGender: String, $point: geography!, $collegePoint: geography!) { 

    bestUsersLocation: users(
      limit: $bestLimit,
      order_by: {likesByLikedId_aggregate: {count: desc_nulls_last}},
      where: {_and: [
        {_or: [
          {gender: {_neq: $notIntoGender}},
          {gender: {_is_null: true}}
        ]},
        {
          _or: [
            { location: {_st_d_within: {distance: 300000, from: $collegePoint }}},
            { location: {_st_d_within: {distance: 300000, from: $point }}},
            { userCollege : { location: {_st_d_within: {distance: 300000, from: $point }}}},
            { userCollege : { location: {_st_d_within: {distance: 300000, from: $collegePoint }}}},
          ]
        },
        {userVideos: {status: {_eq: "ready"}}},
      ]}
      ){
        ...videoFields
      }

    bestUsersNoLocation: users(
      limit: $bestLimit,
      order_by: {likesByLikedId_aggregate: {count: desc_nulls_last}},
      where: {_and: [
        {_or: [
          {gender: {_neq: $notIntoGender}},
          {gender: {_is_null: true}}
        ]},
        {_or: [
          {_and: [
            {_not: { location: {_st_d_within: {distance: 300000, from: $collegePoint }}}},
            {_not: { location: {_st_d_within: {distance: 300000, from: $point }}}},
            {_not: { userCollege : { location: {_st_d_within: {distance: 300000, from: $point }}}}},
            {_not: { userCollege : { location: {_st_d_within: {distance: 300000, from: $collegePoint }}}}},
          ]},
          {_and: [
            { location: {_is_null: true}},  
            {_not: { userCollege : { location: {_st_d_within: {distance: 300000, from: $point }}}}},
            {_not: { userCollege : { location: {_st_d_within: {distance: 300000, from: $collegePoint }}}}},
          ]}
        ]},
        {userVideos: {status: {_eq: "ready"}}},
      ]}
      ){
        ...videoFields
      }
  }
`



// bestUsersNoLocation: users(
//   limit: $bestLimit,
//   order_by: {likesByLikedId_aggregate: {count: desc_nulls_last}},
//   where: {
//     {_or: [
//       {gender: {_neq: $notIntoGender}},
//       {gender: {_is_null: true}}
//     ]},
//     {_or: [
//       {_and: [
//         {_not: { location: {_st_d_within: {distance: 300000, from: $collegePoint }}}},
//         {_not: { location: {_st_d_within: {distance: 300000, from: $point }}}},
//         {_not: { userCollege : { location: {_st_d_within: {distance: 300000, from: $point }}}}},
//         {_not: { userCollege : { location: {_st_d_within: {distance: 300000, from: $collegePoint }}}}},
//       ]},
//       {_and: [
//         { location: {_is_null: true}},  
//         {_not: { userCollege : { location: {_st_d_within: {distance: 300000, from: $point }}}}},
//         {_not: { userCollege : { location: {_st_d_within: {distance: 300000, from: $collegePoint }}}}},
//       ]}
//     ]},        
//     {userVideos: {status: {_eq: "ready"}}},
//   }
//   ) {
//     ...videoFields
//   }

export const GET_LAST_DAY_VIDEOS = gql`
  query GetLastDayVideos ($userId: Int, $yesterday: timestamptz){
    videos(where: 
      {userId: {_eq: $userId}, 
      status: {_eq: "ready"},
      created_at: {_gt: $yesterday}}
    , order_by: {created_at: desc}){
      id
      muxPlaybackId
      status
      videoQuestion {
        questionText
      }
      likes
      dislikes
      views
    }
  }
`

export const GET_PAST_VIDEOS = gql`
  query GetLastDayVideos ($userId: Int, $yesterday: timestamptz){
    videos(where: 
      {userId: {_eq: $userId}, 
      status: {_eq: "ready"},
      created_at: {_lte: $yesterday}}
    , order_by: {created_at: desc}){
      id
      muxPlaybackId
      status
      rank
      videoQuestion {
        questionText
      }
      likes
      dislikes
      views
    }
  }
`

export const GET_QUESTIONS = gql`
  query GetQuestions ($userId: Int){
    questions(order_by: {id: desc}) {
      id
      questionText
    }
  }
`

export const GET_QUESTIONS_SAMPLE = gql`
  query GetQuestions {
    questions {
      id
      questionText
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

export const GET_USER_INFO = gql`
  query GetUserName($userId: Int) {
    users(where: {id: {_eq: $userId}}) {
      firstName
      bio
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
  query GetLikes($userId: Int) {
    likes(distinct_on: likerId, where: {_and: [
      {likedId: {_eq: $userId}}, 
      {Liker: {_not: {blocksByBlockedId: {blockerId: {_eq: $userId}}}}},
      {Liker: {userVideos: {status: {_eq: "ready"}}}},
      {dislike: {_eq: false}}
    ]}) {
      matched
      likerId
      created_at
      Liker {
        firstName
        id
        college
        userVideos(limit: 3, order_by: {created_at: asc}, where: {muxPlaybackId: {_is_null: false}}) {
          videoQuestion {
            questionText
          }
          id
          muxPlaybackId
        }
      }
    }
  }
`

export const GET_LIKE = gql`
    query GetLike ($likerId: Int, $likedId: Int, $dislike: Boolean) {
      likes(where: {_and: [{likerId: {_eq: $likerId}}, {likedId: {_eq: $likedId}}, {dislike: {_eq: $dislike}}]}) {
        matched
        dislike
      }
    }  
`

export const INSERT_LIKE = gql`
    mutation InsertLikes ($likedId: Int, $likerId: Int, $matched: Boolean, $dislike: Boolean) {
      insert_likes(objects: {likedId: $likedId, likerId: $likerId, matched: $matched, dislike: $dislike}) {
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
      id
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
  mutation UpdateOnboarded ($userId: Int, $onboarded: Boolean) {
    update_users(where: {id: {_eq: $userId}}, _set: {onboarded: $onboarded}) {
      affected_rows
    }
  }
`

export const UPDATE_CITY = gql`
  mutation UpdateName ($userId: Int, $city: String) {
    update_users(where: {id: {_eq: $userId}}, _set: {city: $city}) {
      affected_rows
    }
  }
`

export const UPDATE_REGION = gql`
  mutation UpdateName ($userId: Int, $region: String) {
    update_users(where: {id: {_eq: $userId}}, _set: {region: $region}) {
      affected_rows
    }
  }
`

export const UPDATE_NAME = gql`
  mutation UpdateName ($userId: Int, $firstName: String) {
    update_users(where: {id: {_eq: $userId}}, _set: {firstName: $firstName}) {
      affected_rows
    }
  }
`

export const UPDATE_COLLEGE = gql`
  mutation UpdateName ($userId: Int, $college: String, $collegeId: Int) {
    update_users(where: {id: {_eq: $userId}}, _set: {college: $college, collegeId: $collegeId}) {
      affected_rows
    }
  }
`

export const UPDATE_BIO = gql`
  mutation UpdateName ($userId: Int, $bio: String) {
    update_users(where: {id: {_eq: $userId}}, _set: {bio: $bio}) {
      affected_rows
    }
  }
`

export const UPDATE_GENDER = gql`
  mutation UpdateGender ($userId: Int, $gender: String) {
    update_users(where: {id: {_eq: $userId}}, _set: {gender: $gender}) {
      affected_rows
    }
  }
`

export const UPDATE_GENDER_INTEREST = gql`
  mutation UpdateGenderInterest ($userId: Int, $genderInterest: String) {
    update_users(where: {id: {_eq: $userId}}, _set: {genderInterest: $genderInterest}) {
      affected_rows
    }
  }
`

export const GET_GENDER_INTEREST = gql`
  query GetGenderInterest($userId: Int){
    users(where: {id: {_eq: $userId}}) {
      genderInterest
    }
  }
`

export const GET_COLLEGE_LOCATION = gql`
  query GetCollegeLocation($userId: Int){
    users(where: {id: {_eq: $userId}}) {
      userCollege {
        latitude
        longitude
      }
    }
  }
`

export const UPDATE_SHOW_TO_PEOPLE = gql`
  mutation UpdateShowToPeople ($userId: Int, $showToPeopleLookingFor: String) {
    update_users(where: {id: {_eq: $userId}}, _set: {showToPeopleLookingFor: $showToPeopleLookingFor}) {
      affected_rows
    }
  }
`

export const UPDATE_PUSH_TOKEN = gql`
  mutation UpdatePushToken($userId: Int, $expoPushToken: String) {
    update_users(where: {id: {_eq: $userId}}, _set: {expoPushToken: $expoPushToken}) {
      affected_rows
    }
  }
`

export const UPDATE_VIDEO_LIKES = gql`
  mutation UpdateVideoLikes($id: Int, $likes: Int){
    update_videos(where: {id: {_eq: $id}}, _set: {likes: $likes}) {
      affected_rows
    }
  }
`

export const UPDATE_VIDEO_DISLIKES = gql`
  mutation UpdateVideoLikes($id: Int, $dislikes: Int){
    update_videos(where: {id: {_eq: $id}}, _set: {likes: $dislikes}) {
      affected_rows
    }
  }
`


export const UPDATE_VIDEO_VIEWS = gql`
  mutation UpdateVideoViews($id: Int, $views: Int){
    update_videos(where: {id: {_eq: $id}}, _set: {views: $views}) {
      affected_rows
    }
  }
`

export const GET_CITY_REGION = gql`
  query getCityRegion($userId: Int) {
    users(where: {id: {_eq: $userId}}) {
      city
      region
    }
  }
`

export const DELETE_VIDEO = gql`
  mutation DeleteVideos($videoId: Int) {
    update_videos(where: {id: {_eq: $videoId}}, _set: {status: "removed"}) {
      affected_rows
    }
  }
`

export const DELETE_VIDEO_PASSTHROUGH_ID = gql`
  mutation DeleteVideos($passthroughId: String) {
    update_videos(where: {passthroughId: {_eq: $passthroughId}}, _set: {status: "removed"}) {
      affected_rows
    }
  }
`

export const GET_COLLEGES = gql`
  query GetColleges {
    colleges {
      nickname
      name
      id
      latitude
      longitude
    }
  }
`

export const GET_STREAM_TOKEN = gql`
  query getStreamToken($userId: Int) {
    users(where: {id: {_eq: $userId}}) {
      streamToken
    }
  }
`