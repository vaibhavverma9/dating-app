import React, { useEffect, useRef, useState } from 'react'; 
import { Video, Audio } from 'expo-av';   

export default function SingleVideo(props) {

    const [loaded, setLoaded] = useState(false); 
    const [currentProgress, setCurrentProgress] = useState(0); 
    let playbackObject = useRef(null); 

    const _onPlaybackStatusUpdate = (playbackStatus) => {
        console.log(playbackStatus); 
        if(playbackStatus.isBuffering){
            if(loaded){
                setLoaded(false); 
            }
        } else {
        if(!loaded){
            setLoaded(true); 
        }
        }

        if(playbackStatus.positionMillis && playbackStatus.durationMillis){
            const progress = playbackStatus.positionMillis / playbackStatus.durationMillis; 
            setCurrentProgress(progress);   
        } else {
            if(currentProgress < 0.5){
                setCurrentProgress(0); 
            }
        }
    }

    
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