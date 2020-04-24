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
      users(limit: 3, where: {userVideos: {}}) {
          firstName
          lastName
          userVideos {
            muxPlaybackId
            videoQuestion {
              questionText
            }
          }
        }
  }
`; 

export const GET_QUESTIONS = gql`
  {
    questions {
      questionText
    }
  }
`