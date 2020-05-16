import React, { createContext, useState } from 'react';

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