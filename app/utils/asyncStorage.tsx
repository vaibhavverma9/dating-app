import { AsyncStorage } from 'react-native'; 

export const _storeLocalId = async() => {
    const randomId = Math.floor(Math.random() * 1000000000) + 1; 
    try {
        await AsyncStorage.setItem('@localId', randomId.toString());
    } catch (error){}
}

export const _retrieveLocalId = async () => {
    try {
      const value = await AsyncStorage.getItem('@localId');
      if (value !== null) {
        return value; 
      } else {
          return ''; 
      }
    } catch (error) {
        return ''; 
    }
};

export const _storeUserId = async(userId) => {
    try {
        await AsyncStorage.setItem('@userId', userId.toString());
    } catch (error){}
}

export const _clearUserId = async() => {
    try {
        await AsyncStorage.setItem('@userId', "0");
    } catch (error){}
}

export const _retrieveUserId = async () => {
    try {
      const value = await AsyncStorage.getItem('@userId');
      if (value !== null) {
        return parseInt(value); 
      } else {
          return 0; 
      }
    } catch (error) {
        return 0; 
    }
};

export const _storeDoormanUid = async(doormanUid) => {
    try {
        await AsyncStorage.setItem('@doormanUid', doormanUid);
    } catch (error){}
}

export const _clearDoormanUid = async () => {
    try {
        await AsyncStorage.setItem('@doormanUid', '');
    } catch (error){}
}

export const _retrieveDoormanUid = async () => {
    try {
      const value = await AsyncStorage.getItem('@doormanUid');
      if (value !== null) {
        return value; 
      } else {
          return ''; 
      }
    } catch (error) {
        return ''; 
    }
};

export const _storeOnboarded = async(onboarded) => {
    try {
        await AsyncStorage.setItem('@onboarded', onboarded.toString());
    } catch (error) {}
}

export const _clearOnboarded = async() => {
    try {
        await AsyncStorage.setItem('@onboarded', '');
    } catch (error) {}
}

export const _retrieveOnboarded = async() => {
    try {
        const value = await AsyncStorage.getItem('@onboarded');
        if (value !== null) {
            return value == "true"; 
        } else {
            return ''; 
        }
    } catch (error) {
        return ''; 
    }
}

export const _storeLatitude = async(latitude) => {
    try {
        await AsyncStorage.setItem('@latitude', latitude.toString());
    } catch (error){}
}

export const _retrieveLatitude = async () => {
    try {
      const value = await AsyncStorage.getItem('@latitude');
      if (value !== null) {
        return parseFloat(value); 
      } else {
          return null; 
      }
    } catch (error) {
        return null; 
    }
};

export const _storeLongitude = async(longitude) => {
    try {
        await AsyncStorage.setItem('@longitude', longitude.toString());
    } catch (error){}
}

export const _retrieveLongitude = async () => {
    try {
      const value = await AsyncStorage.getItem('@longitude');
      if (value !== null) {
        return parseFloat(value); 
      } else {
          return null; 
      }
    } catch (error) {
        return null; 
    }
};

export const _storeName = async(name) => {
    try {
        await AsyncStorage.setItem('@name', name);
    } catch (error){}
}

export const _clearName = async () => {
    try {
        await AsyncStorage.setItem('@name', '');
    } catch (error){
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
        return ''; 
    }
};

export const _storePushShown = async(pushShown) => {
    try {
        await AsyncStorage.setItem('@pushShown', pushShown.toString());
    } catch (error) {}
}

export const _retrievePushShown = async() => {
    try {
        const value = await AsyncStorage.getItem('@pushShown');
        if (value !== null) {
            return value == "true"; 
        } else {
            return false; 
        }
    } catch (error) {
        return false; 
    }
}

export const _storeBio = async(bio) => {
    try {
        await AsyncStorage.setItem('@bio', bio);
    } catch (error){}
}

export const _clearBio = async () => {
    try {
        await AsyncStorage.setItem('@bio', '');
    } catch (error){}
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
        return ''; 
    }
};

export const _storeGenderInterest = async(genderInterest) => {
    try {
        await AsyncStorage.setItem('@genderInterest', genderInterest);
    } catch (error){}
}

export const _clearGenderInterest = async () => {
    try {
        await AsyncStorage.setItem('@genderInterest', '');
    } catch (error){}
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
        return ''; 
    }
};

export const _storeCity = async(city) => {
    try {
        await AsyncStorage.setItem('@city', city);
    } catch (error){}
}

export const _clearCity = async () => {
    try {
        await AsyncStorage.setItem('@city', '');
    } catch (error){}
}

export const _retrieveCity = async () => {
    try {
      const value = await AsyncStorage.getItem('@city');
      if (value !== null) {
        return value; 
      } else {
          return ''; 
      }
    } catch (error) {
        return ''; 
    }
};

export const _storeRegion = async(region) => {
    try {
        await AsyncStorage.setItem('@region', region);
    } catch (error){}
}

export const _clearRegion = async () => {
    try {
        await AsyncStorage.setItem('@region', '');
    } catch (error){}
}

export const _retrieveRegion = async () => {
    try {
      const value = await AsyncStorage.getItem('@region');
      if (value !== null) {
        return value; 
      } else {
          return ''; 
      }
    } catch (error) {
        return ''; 
    }
};

export const _storeCollege = async(college) => {
    try {
        await AsyncStorage.setItem('@college', college);
    } catch (error){}
}

export const _clearCollege = async () => {
    try {
        await AsyncStorage.setItem('@college', '');
    } catch (error){
    }
}

export const _retrieveCollege = async () => {
    try {
      const value = await AsyncStorage.getItem('@college');
      if (value !== null) {
        return value; 
      } else {
          return ''; 
      }
    } catch (error) {
        return ''; 
    }
};

export const _storeLastWatchedUpper = async(lastWatchedUpper) => {
    try {
        await AsyncStorage.setItem('@lastWatchedUpper', lastWatchedUpper);
    } catch (error){}
};

export const _clearLastWatchedUpper = async () => {
    try {
        await AsyncStorage.setItem('@lastWatchedUpper', '');
    } catch (error){}
}

export const _retrieveLastWatchedUpper = async () => {
    try {
      const value = await AsyncStorage.getItem('@lastWatchedUpper');
      if (value !== null) {
        return value; 
      } else {
          return null; 
      }
    } catch (error) {
        return null; 
    }
};

export const _storeLastWatchedLower = async(lastWatchedLower) => {
    try {
        await AsyncStorage.setItem('@lastWatchedLower', lastWatchedLower);
    } catch (error){
        console.log(error, "error in _storeLastWatchedLower"); 
    }
};

export const _clearLastWatchedLower = async () => {
    try {
        await AsyncStorage.setItem('@lastWatchedLower', '');
    } catch (error){}
}

export const _retrieveLastWatchedLower = async () => {
    try {
      const value = await AsyncStorage.getItem('@lastWatchedLower');
      if (value !== null) {
        return value; 
      } else {
          return null; 
      }
    } catch (error) {
        return null; 
    }
};

export const _storeStreamToken = async(streamToken) => {
    try {
        await AsyncStorage.setItem('@streamToken', streamToken);
    } catch (error){
        console.log(error, "error in _storeStreamToken"); 
    }
};

export const _clearStreamToken = async () => {
    try {
        await AsyncStorage.setItem('@streamToken', '');
    } catch (error){}
}

export const _retrieveStreamToken = async () => {
    try {
      const value = await AsyncStorage.getItem('@streamToken');
      if (value !== null) {
        return value; 
      } else {
          return null; 
      }
    } catch (error) {
        return null; 
    }
};