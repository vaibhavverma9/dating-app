import { PanResponder } from 'react-native'; 

export const _panResponder = PanResponder.create({
    // Ask to be the responder:
    onStartShouldSetPanResponder: (evt, gestureState) => true,
    onStartShouldSetPanResponderCapture: (evt, gestureState) => true,
    onMoveShouldSetPanResponder: (evt, gestureState) => {
      console.log("onMoveShouldSetPanResponder"); 
      console.log(gestureState.dx);
      console.log(gestureState.dy);
      console.log(!(gestureState.dx === 0 && gestureState.dy === 0)); 
      return !(gestureState.dx === 0 && gestureState.dy === 0)  
    },
    onMoveShouldSetPanResponderCapture: (evt, gestureState) => true,

    onPanResponderGrant: (evt, gestureState) => {
        console.log("onPanResponderGrant");             
      // The gesture has started. Show visual feedback so the user knows
      // what is happening!
      // gestureState.d{x,y} will be set to zero now
    },
    onPanResponderMove: (evt, gestureState) => {
      // The most recent move distance is gestureState.move{X,Y}
      // The accumulated gesture distance since becoming responder is
      // gestureState.d{x,y}
    },
    onPanResponderTerminationRequest: (evt, gestureState) => true,
    onPanResponderRelease: (evt, gestureState) => {
        console.log("onPanResponderRelease");      
        console.log(gestureState.x0);         
        
        if(gestureState.dx > 100){
          // last user
        } else if(gestureState.dx < -100){
          // next user 
        } else {
          if(gestureState.x0 < 100){
            // lastVideo
          } else {
            // next video
          }
        }
        // The user has released all touches while this view is the
        // responder. This typically means a gesture has succeeded
    },
    onPanResponderTerminate: (evt, gestureState) => {
        console.log("onPanResponderTerminate"); 
      // Another component has become the responder, so this gesture
      // should be cancelled
    },
    onShouldBlockNativeResponder: (evt, gestureState) => {
        console.log("onShouldBlockNativeResponder"); 
      // Returns whether this component should block native components from becoming the JS
      // responder. Returns true by default. Is currently only supported on android.
      return true;
    },
});