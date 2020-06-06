import React, { useEffect, useRef } from 'react'; 
import { Video, Audio } from 'expo-av';   

export default function SingleVideo(props) {

    useEffect(() => {
        Audio.setAudioModeAsync({
            playsInSilentModeIOS: true,
            playThroughEarpieceAndroid: false
        }); 
    }, [])

    return (
        <Video
            source={{uri: props.source}}
            rate={1.0}
            volume={1.0}
            isMuted={false}
            resizeMode="cover"
            usePoster={true}
            shouldPlay={props.shouldPlay}
            progressUpdateIntervalMillis={50}
            isLooping
            style={{ width: '100%', height: '100%'}}
        >
        </Video>
    )

    // return (
    //     <Video
    //         source={{ uri: 'http://d23dyxeqlo5psv.cloudfront.net/big_buck_bunny.mp4' }}
    //         rate={1.0}
    //         volume={1.0}
    //         isMuted={false}
    //         resizeMode="cover"
    //         shouldPlay
    //         isLooping
    //         style={{ width: 300, height: 300 }}
    //     />
    // )
}