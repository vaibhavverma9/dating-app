const graphqlEndpoint = 'https://reel-talk-2.herokuapp.com/v1/graphql';
import { useMutation, useSubscription } from "@apollo/react-hooks";
import React, { useEffect, Fragment, useState } from "react";

import { ApolloClient } from '@apollo/client';
import { WebSocketLink } from 'apollo-link-ws';


const createApolloClient = (authToken) => {
  return new ApolloClient({
    link: new WebSocketLink({
      uri: graphqlEndpoint,
      options: {
        reconnect: true,
        connectionParams: {
          headers: {
            Authorization: `Bearer ${authToken}`
          }
        }
      }
    })
  })
}

export const ON_VIDEO_UPDATED = gql`
  subscription OnVideoUpdated ($passthroughId: String) {
    videos(where: {passthroughId: {_eq: $passthroughId}}) {
      muxPlaybackId
      questionId
      status
      passthroughId
      userId
    }
  }
`