import { AsyncStorage } from 'react-native'; 

export const _storeLocalId = async() => {
    const randomId = Math.floor(Math.random() * 1000000000) + 1; 
    try {
        console.log("storing random id", randomId); 
        await AsyncStorage.setItem('@localId', randomId.toString());
    } catch (error){
        console.log("error in _storeLocalId", error)
    }
}

export const _retrieveLocalId = async () => {
    console.log("retrieve_data")
    try {
      const value = await AsyncStorage.getItem('@localId');
      if (value !== null) {
        console.log(value);
        return value; 
      } else {
          console.log("localId not available"); 
          return ''; 
      }
    } catch (error) {
        console.log("error in _retrieveLocalId", error); 
        return ''; 
    }
};

export const _storeUserId = async(userId) => {
    try {
        await AsyncStorage.setItem('@userId', userId.toString());
    } catch (error){
        console.log("error in _storeUserId", error)
    }
}

export const _clearUserId = async() => {
    try {
        await AsyncStorage.setItem('@userId', "0");
    } catch (error){
        console.log("error in _clearUserId", error)
    }
}

export const _retrieveUserId = async () => {
    try {
      const value = await AsyncStorage.getItem('@userId');
      if (value !== null) {
          console.log("retrieving user id", value); 
        return parseInt(value); 
      } else {
          console.log("userId not available"); 
          return 0; 
      }
    } catch (error) {
        console.log("error in _retrieveUserId", error); 
        return 0; 
    }
};

export const _storeDoormanUid = async(doormanUid) => {
    try {
        await AsyncStorage.setItem('@doormanUid', doormanUid);
    } catch (error){
        console.log("error in _storeDoormanUid", error)
    }
}

export const _clearDoormanUid = async () => {
    try {
        await AsyncStorage.setItem('@doormanUid', '');
    } catch (error){
        console.log("error in _clearDoormanUid", error); 
    }
}

export const _retrieveDoormanUid = async () => {
    try {
      const value = await AsyncStorage.getItem('@doormanUid');
      if (value !== null) {
        console.log(value);
        return value; 
      } else {
          console.log("doormanUid not available"); 
          return ''; 
      }
    } catch (error) {
        console.log("error in _retrieveDoormanUid", error); 
        return ''; 
    }
};

export const _storeOnboarded = async(onboarded) => {
    try {
        await AsyncStorage.setItem('@onboarded', onboarded.toString());
    } catch (error) {
        console.log("error in _storeOnboarded", error); 
    }
}

export const _clearOnboarded = async() => {
    try {
        await AsyncStorage.setItem('@onboarded', '');
    } catch (error) {
        console.log("error in _clearOnboarded", error); 
    }
}

export const _retrieveOnboarded = async() => {
    try {
        const value = await AsyncStorage.getItem('@onboarded');
        if (value !== null) {
            console.log(value, value == "true"); 
            return value == "true"; 
        } else {
            console.log("onboarded not availale");
            return ''; 
        }
    } catch (error) {
        console.log("error in _retrieveOnboarded", error); 
        return ''; 
    }
}

export const _storeLatitude = async(latitude) => {
    try {
        await AsyncStorage.setItem('@latitude', latitude.toString());
    } catch (error){
        console.log("error in _storeLatitude", error)
    }
}

export const _retrieveLatitude = async () => {
    console.log("retrieve latitude")
    try {
      const value = await AsyncStorage.getItem('@latitude');
      if (value !== null) {
          console.log("retrieving latitude", value); 
        return parseFloat(value); 
      } else {
          console.log("latitude not available"); 
          return null; 
      }
    } catch (error) {
        console.log("error in _retrieveLatitude", error); 
        return null; 
    }
};

export const _storeLongitude = async(longitude) => {
    try {
        await AsyncStorage.setItem('@longitude', longitude.toString());
    } catch (error){
        console.log("error in _storeLongitude", error)
    }
}

export const _retrieveLongitude = async () => {
    console.log("retrieve latitude")
    try {
      const value = await AsyncStorage.getItem('@latitude');
      if (value !== null) {
          console.log("retrieving latitude", value); 
        return parseFloat(value); 
      } else {
          console.log("latitude not available"); 
          return null; 
      }
    } catch (error) {
        console.log("error in _retrieveLongitude", error); 
        return null; 
    }
};

export const _storeName = async(name) => {
    try {
        await AsyncStorage.setItem('@name', name);
    } catch (error){
        console.log("error in _storeName", error)
    }
}

export const _clearName = async () => {
    try {
        await AsyncStorage.setItem('@name', '');
    } catch (error){
        console.log("error in _clearName", error); 
    }
}

export const _retrieveName = async () => {
    try {
      const value = await AsyncStorage.getItem('@name');
      if (value !== null) {
        return value; 
      } else {
          return ''; 
      }
    } catch (error) {
        console.log("error in _retrieveName", error); 
        return ''; 
    }
};

export const _storePushShown = async(pushShown) => {
    try {
        await AsyncStorage.setItem('@pushShown', pushShown.toString());
    } catch (error) {
        console.log("error in _storePushShown", error); 
    }
}

export const _retrievePushShown = async() => {
    try {
        const value = await AsyncStorage.getItem('@pushShown');
        if (value !== null) {
            console.log(value, value == "true"); 
            return value == "true"; 
        } else {
            console.log("pushShown not availale");
            return false; 
        }
    } catch (error) {
        console.log("error in _retrievePushShown", error); 
        return false; 
    }
}

export const _storeBio = async(bio) => {
    try {
        await AsyncStorage.setItem('@bio', bio);
    } catch (error){
        console.log("error in _storeBio", error)
    }
}

export const _clearBio = async () => {
    try {
        await AsyncStorage.setItem('@bio', '');
    } catch (error){
        console.log("error in _clearBio", error); 
    }
}

export const _retrieveBio = async () => {
    try {
      const value = await AsyncStorage.getItem('@bio');
      if (value !== null) {
        return value; 
      } else {
          return ''; 
      }
    } catch (error) {
        console.log("error in _retrieveBio", error); 
        return ''; 
    }
};

export const _storeGenderInterest = async(genderInterest) => {
    try {
        await AsyncStorage.setItem('@genderInterest', genderInterest);
    } catch (error){
        console.log("error in _storeGenderInterest", error)
    }
}

export const _clearGenderInterest = async () => {
    try {
        await AsyncStorage.setItem('@genderInterest', '');
    } catch (error){
        console.log("error in _clearGenderInterest", error); 
    }
}

export const _retrieveGenderInterest = async () => {
    try {
      const value = await AsyncStorage.getItem('@genderInterest');
      if (value !== null) {
        return value; 
      } else {
          return ''; 
      }
    } catch (error) {
        console.log("error in _retrieveGenderInterest", error); 
        return ''; 
    }
};