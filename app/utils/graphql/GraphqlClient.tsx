const graphqlEndpoint = 'https://reel-talk-2.herokuapp.com/v1/graphql'; 
// const graphqlEndpoint = 'https://vital-robin-42.hasura.app/v1/graphql'; 

import { ApolloClient, HttpLink, InMemoryCache, gql } from '@apollo/client';
import { WebSocketLink } from 'apollo-link-ws';
import { createHttpLink } from 'apollo-link-http';
import { setContext } from 'apollo-link-context';
// import gql from 'graphql-tag';

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


//             { location: {_st_d_within: {distance: 300000, from: $point }}},

// {_not: {likesByLikedId: {likerId: {_eq: $secondId}}}}


export const GET_VIDEOS = gql`
  fragment videoFields on users {
    firstName
    birthday
    city
    region
    college
    instagram
    likesByLikedId(limit: 1, where: {likerId: {_eq: $userId}}, order_by: {created_at: desc}) {
      dislike
      matched
    }
    userVideos(limit: 4, where: {status: {_eq: "ready"}, _or: [{rank: {_eq: 1}},{rank: {_eq: 2}},{views: {_lt: 10}}]}) {
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
    performance
    profileUrl
  }

  query GetVideos ($userId: Int, $limit: Int, $groupPreference: [Int!], $lastPerformance: numeric, $secondId: Int, $region1: String, $region2: String) { 
    usersLocation: users (
      limit: $limit, 
      where: {_and: [
        {userVideos: {status: {_eq: "ready"}, _or: [{rank: {_eq: 1}}, {views: {_lt: 10}}]}},
        {_not: {id: {_eq: $userId}}},        
        {_not: {blocksByBlockedId: {blockerId: {_eq: $userId}}}},
        {performance: {_lt: $lastPerformance}},
        {_or: [{_not: {likesByLikedId: {likerId: {_eq: $userId}}}},
        ]},
        {group: {_in: $groupPreference}},
        {_or: [
          {region: {_eq: $region1}}, 
          {region: {_eq: $region2}}, 
          {userCollege: {region: {_eq: $region1}}}, 
          {userCollege: {region: {_eq: $region2}}},
        ]}
      ]}, 
      order_by: {performance: desc_nulls_last}
    ) {
      ...videoFields
    }
  }
`

// views: {_lt: 10}, 


export const GET_LAST_DAY_VIDEOS = gql`
  query GetLastDayVideos ($userId: Int){
    videos(where: 
      {userId: {_eq: $userId},
      status: {_eq: "ready"}}
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
      passthroughId
    }
  }
`

export const GET_AUCTIONED_VIDEOS = gql`
  query GetAuctionedUsersVideos ($userId: Int) {
    videos(where: {videoUser: {userAuctioned: {auctioneerId: {_eq: $userId}}}, status: {_eq: "ready"}}, order_by: {created_at: desc}) {
      id
      muxPlaybackId
      status
      videoQuestion {
        questionText
      }
      dislikes
      likes
      views
      passthroughId
      videoUser {
        firstName
        college
        instagram
      }
    }
  }
`


export const GET_PAST_VIDEOS = gql`
  query GetLastDayVideos ($userId: Int){
    videos(where: 
      {userId: {_eq: $userId}, 
      views: {_gte: 10},
      status: {_eq: "ready"}}
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

export const GET_FIRST_QUESTIONS = gql`
  query GetFirstQuestions {
    questions(where: {firstSet: {_eq: true}}, order_by: {id: asc}) {
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
  mutation InsertVideo ($questionId: Int, $userId: Int, $passthroughId: String, $status: String) {
    insert_videos(objects: {questionId: $questionId, userId: $userId, passthroughId: $passthroughId,  status: $status}) {
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
    likes: likes(where: {_and: [{_not: {Liker: {blocksByBlockedId: {blockerId: {_eq: $userId}}}}}, {likedId: {_eq: $userId}, dislike: {_eq: false}}]}, order_by: {created_at: desc_nulls_last}) {
      id
      userId: likedId
      profileId: likerId
      profileUser: Liker {
        firstName
        id
        birthday
        city
        region
        college
        profileUrl
        instagram
        userVideos(limit: 4, order_by: {created_at: asc}, where: {_or: [{rank: {_eq: 1}},{views: {_lt: 10}}], status: {_eq: "ready"}, muxPlaybackId: {_is_null: false}}) {
          videoQuestion {
            questionText
          }
          id
          muxPlaybackId
        }
        likesByLikedId_aggregate(where: {likerId: {_eq: $userId}}) {
          aggregate {
            count
          }
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
    mutation UpdateLastUploaded($userId: Int, $timestamp: timestamptz, $performance: numeric){
      update_users(where: {id: {_eq: $userId}}, _set: {lastUploaded: $timestamp, performance: $performance}) {
        affected_rows
      }
    }
`

export const UPDATE_PROFILE_URL = gql`
    mutation UpdateProfileUrl($userId: Int, $profileUrl: String){
      update_users(where: {id: {_eq: $userId}}, _set: {profileUrl: $profileUrl}) {
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

export const ON_MATCHES_UPDATED = gql`
  subscription OnMatchesUpdated($userId: Int){
    likes(where: {_and: [{_not: {Liker: {blocksByBlockedId: {blockerId: {_eq: $userId}}}}},{Liker: {likesByLikedId: {likerId: {_eq: $userId}, dislike: {_eq: false}}}, likedId: {_eq: $userId}, dislike: {_eq: false}}]}, order_by: {created_at: desc_nulls_last}) {
      id
      userId: likedId
      profileId: likerId
      profileUser: Liker {
        firstName
        id
        city
        region
        college
        profileUrl
        instagram
        birthday
        userVideos(limit: 3, order_by: {created_at: asc}, where: {status: {_eq: "ready"}, muxPlaybackId: {_is_null: false}}) {
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

export const ON_YOUR_LIKES_UPDATED = gql`
  subscription OnMatchesUpdated($userId: Int){
    likes(where: {Liked: {likesByLikedId: {likerId: {_eq: $userId}, dislike: {_eq: false}}}}, order_by: {created_at: desc_nulls_last}) {
      id
      userId: likerId
      profileId: likedId
      profileUser: Liked {
        firstName
        id
        city
        region
        college
        profileUrl
        instagram
        userVideos(limit: 3, order_by: {created_at: asc}, where: {status: {_eq: "ready"}, muxPlaybackId: {_is_null: false}}) {
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

export const ON_LIKES_YOU_UPDATED = gql`
subscription onLikesYouUpdated($userId: Int) {
    likes: likes(where: {_and: [{_not: {Liker: {blocksByBlockedId: {blockerId: {_eq: $userId}}}}}, {likedId: {_eq: $userId}, dislike: {_eq: false}}]}, order_by: {created_at: desc_nulls_last}) {
      id
      userId: likedId
      profileId: likerId
      profileUser: Liker {
        firstName
        id
        birthday
        city
        region
        college
        profileUrl
        instagram
        userVideos(limit: 4, order_by: {created_at: asc}, where: {_or: [{rank: {_eq: 1}},{views: {_lt: 10}}], status: {_eq: "ready"}, muxPlaybackId: {_is_null: false}}) {
          videoQuestion {
            questionText
          }
          id
          muxPlaybackId
        }
        likesByLikedId_aggregate(where: {likerId: {_eq: $userId}}) {
          aggregate {
            count
          }
        }  
      }
    }
  }
`

export const GET_USERS_BY_UID = gql`
  query GetUsersByUid ($uid: String){
    users(where: {uid: {_eq: $uid}}) {
      id
      onboarded
    }
  }
`

export const GET_NUMBER_VIDEOS = gql`
  query GetNumberVideos ($userId: Int) {
    videos_aggregate(where: {_and: {userId: {_eq: $userId}, status: {_eq: "ready"}, muxPlaybackId: {_is_null: false}}}) {
      aggregate {
        count
      }
    }
  }
`

export const GET_INSTAGRAM = gql`
  query GetInstagram ($userId: Int){
    users(where: {id: {_eq: $userId}}) {
      instagram
      instagramOnboarded
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

export const UPDATE_TEXT_PERMISSION = gql`
  mutation UpdateOnboarded ($userId: Int, $textPermission: Boolean) {
    update_users(where: {id: {_eq: $userId}}, _set: {textPermission: $textPermission}) {
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

export const UPDATE_BIRTHDAY = gql`
  mutation UpdateBirthday($userId: Int, $birthday: date){
    update_users(where: {id: {_eq: $userId}}, _set: {birthday: $birthday}) {
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

export const UPDATE_INSTAGRAM = gql`
  mutation UpdateInstagram ($userId: Int, $instagram: String) {
    update_users(where: {id: {_eq: $userId}}, _set: {instagram: $instagram}) {
      affected_rows
    }
  }
`

export const UPDATE_INSTAGRAM_ONBOARDING = gql`
  mutation UpdateInstagramOnboarding ($userId: Int, $instagramOnboarding: Boolean) {
    update_users(where: {id: {_eq: $userId}}, _set: {instagramOnboarded: $instagramOnboarding}) {
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
      gender
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
    update_videos(where: {id: {_eq: $id}}, _set: {dislikes: $dislikes}) {
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

export const UPDATE_VIDEO_ERRORED = gql`
  mutation UpdateVideoErrored($passthroughId: String) {
    update_videos(where: {passthroughId: {_eq: $passthroughId}}, _set: {status: "errored"}) {
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

export const GET_LIKE_COUNT = gql`
  query getLikeCount($likerId: Int, $since: timestamptz){
    likes_aggregate(where: {likerId: {_eq: $likerId}, created_at: {_gte: $since}}) {
      aggregate {
        count
      }
    }
  }
`

export const GET_VIDEO_COUNT = gql`
  query getLikeCount($userId: Int, $since: timestamptz){
    videos_aggregate(where: {userId: {_eq: $userId}, created_at: {_gte: $since}, status: {_eq: "ready"}}) {
      aggregate {
        count
      }
    }
  }
`

export const GET_GENDER_GROUP = gql`
  query GetGenderGroup($userId: Int){
    users(where: {id: {_eq: $userId}}) {
      group
    }
  }
`

export const GET_REGIONS = gql`
  query GetGenderGroup($userId: Int){
    users(where: {id: {_eq: $userId}}) {
      region
      userCollege {
        region
      }
    }
  }
`

export const GET_PROFILE_INFO = gql`
  query GetProfileInfo($userId: Int){
    users(where: {id: {_eq: $userId}}) {
      firstName
      profileUrl
      likesByLikedId_aggregate(where: {dislike: {_eq: false}}) {
        aggregate {
          count
        }
      }
      userVideos_aggregate(where: {status: {_eq: "ready"}}) {
        aggregate {
          count
        }
      }
    }
  }

`

export const UPDATE_GENDER_GROUP = gql`
  mutation UpdateGenderGroup ($userId: Int, $group: Int) {
    update_users(where: {id: {_eq: $userId}}, _set: {group: $group}) {
      affected_rows
    }
  }
`

export const INSERT_NPS = gql`
  mutation InsertNps ($userId: Int, $nps: Int) {
    insert_feedback_one(object: {nps: $nps, userId: $userId}) {
      userId
    }
  }
`

export const INSERT_AUCTION = gql`
  mutation InsertAuction ($auctioneerId: Int, $auctionedId: Int) {
    insert_auctionedUsers_one(object: {auctioneerId: $auctioneerId, auctionedId: $auctionedId}) {
      id
    }
  }
`

export const INSERT_AUCTIONED_USER = gql`
  mutation InsertAuctionedUser ($college: String, $collegeId: Int, $group: Int, $instagram: String, $firstName: String, $gender: String, $genderInterest: String, $city: String, $region: String) {
    insert_users_one(object: {college: $college, collegeId: $collegeId, group: $group, instagram: $instagram, firstName: $firstName, gender: $gender, genderInterest: $genderInterest, city: $city, region: $region}) {
      id
    }
  }
`

export const GET_AUCTIONED_USERS = gql`
  query GetAuctionedUsers($userId: Int){
    auctionedUsers(where: {status: {_eq: "active"}, auctioneerId: {_eq: $userId}}) {
      auctionedUsers_users {
        firstName
        instagram
        id
        college
        city
        region
      }
    }  
  }
`

export const UPDATE_AUCTIONED_USER = gql`
  mutation UpdateAuctionedUser($auctionedId: Int, $auctioneerId: Int) {
    update_auctionedUsers(where: {auctionedId: {_eq: $auctionedId}, auctioneerId: {_eq: $auctioneerId}}, _set: {status: "inactive"}) {
      affected_rows
    }
  }
`

export const UPDATE_LAST_ACTIVE = gql`
  mutation UpdateLastActive($userId: Int, $today: timestamptz) {
    update_users(where: {id: {_eq: 1528}}, _set: {lastActive: $today}) {
      affected_rows
    }
  }
`