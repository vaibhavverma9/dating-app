import { split } from 'apollo-link';
import { HttpLink } from 'apollo-link-http';
import { WebSocketLink } from 'apollo-link-ws';
import { getMainDefinition } from 'apollo-utilities';
import { useSubscription } from '@apollo/react-hooks';
import gql from 'graphql-tag';

// Create an http link:
const httpLink = new HttpLink({
    uri: 'http://localhost:3000/graphql',
    // headers: {
    //     Authorization: `Bearer ${token}`
    // }
});

// Create a WebSocket link:
const wsLink = new WebSocketLink({
    uri: `https://reel-talk-2.herokuapp.com/v1/graphql`,
    options: {
        reconnect: true,
        connectionParams: {
            headers: {
                Authorization: `Bearer ${token}`
            }
        }
    }
});

// using the ability to split links, you can send data to each link
// depending on what kind of operation is being sent
const link = split(
    // split based on operation type
    ({ query }) => {
      const definition = getMainDefinition(query);
      return (
        definition.kind === 'OperationDefinition' &&
        definition.operation === 'subscription'
      );
    },
    wsLink,
    httpLink,
);

  const COMMENTS_SUBSCRIPTION = gql`
  subscription onCommentAdded($repoFullName: String!) {
    commentAdded(repoFullName: $repoFullName) {
      id
      content
    }
  }
`;

const ASSET_STATUS_SUBSCRIPTION = gql`
    subscription onStatusChange ($assetId: String) {
        videos(where: {muxAssetId: {_eq: $assetId}}) {
        status
        }
    }
`

function onAssetStastusChange({ assetId }){
    const { data, loading } = useSubscription(
        ASSET_STATUS_SUBSCRIPTION,
        { variables: { assetId } }
    );
    console.log(data); 
}