import React, { useEffect } from 'react'; 
import { Video } from 'expo-av';   

export default function SingleVideo(props) {
    const muxUrl = 'https://stream.mux.com/' + props.muxPlaybackId + '.m3u8';
    return (
        <Video
            source={{uri: muxUrl}}
            rate={1.0}
            volume={1.0}
            isMuted={false}
            resizeMode="cover"
            usePoster={true}
            shouldPlay={props.shouldPlay}
            isLooping
            style={{ width: '100%', height: '100%'}}
        >
        </Video>
    )
}