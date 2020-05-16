import React, { createContext, useState } from 'react';

const LocationContext = createContext([{}, () => {}]);

const LocationContextProvider = (props) => {
  const [location, setLocation] = useState([40.7295, 73.9965]);
  return (
    <LocationContext.Provider value={[location, setLocation] }>
      {props.children}
    </LocationContext.Provider>
  )
}

export { LocationContext, LocationContextProvider };