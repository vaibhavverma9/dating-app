import React, { createContext, useState } from 'react';
import { GET_USER_DEVICE_ID, client } from '../graphql/GraphqlClient';
import Constants from 'expo-constants';

const UserIdContext = createContext([{}, () => {}]);

const UserIdContextProvider = (props) => {
  const [userId, setUserId] = useState(0);
  return (
    <UserIdContext.Provider value={[userId, setUserId] }>
      {props.children}
    </UserIdContext.Provider>
  )
}

export { UserIdContext, UserIdContextProvider };