import React, { useEffect, useRef } from 'react'; 
import { Video, Audio } from 'expo-av';   

export default function SingleVideo(props) {

    useEffect(() => {
        Audio.setAudioModeAsync({
            playsInSilentModeIOS: true
        }); 
    }, [])

    return (
        <Video
            ref={props.playbackObject}
            source={{uri: props.source}}
            rate={1.0}
            volume={1.0}
            isMuted={false}
            resizeMode="cover"
            usePoster={true}
            shouldPlay={props.shouldPlay}
            onPlaybackStatusUpdate={props._onPlaybackStatusUpdate}
            progressUpdateIntervalMillis={50}
            isLooping
            style={{ width: '100%', height: '100%'}}
        >
        </Video>
    )
}