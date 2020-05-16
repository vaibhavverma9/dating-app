import React, { useEffect, useRef, useState } from 'react'; 
import { Video, Audio } from 'expo-av';   
import { View } from 'react-native';

export default function MultipleVideos(props) {

    const renderedGroup = 3; 

    const renderedIndex = Math.floor(props.userIndex / renderedGroup); 

    useEffect(() => {
        Audio.setAudioModeAsync({
            playsInSilentModeIOS: true
        }); 
    }, []);

    const playingData = { 
        isMuted: false, 
        shouldPlay: props.shouldPlay, 
        playbackObject: props.playbackObject, 
        _onPlaybackStatusUpdate: props._onPlaybackStatusUpdate, 
        display: "flex"
    }

    const nonplayingData = {
        isMuted: true, 
        shouldPlay: false, 
        playbackObject: null, 
        _onPlaybackStatusUpdate: null, 
        display: "none"
    }

    const renderedVideos = [];

    if(props.videoData) {

        for(let i = renderedIndex * renderedGroup; i < renderedIndex * renderedGroup + renderedGroup; i++){
            const user = props.videoData.users[i];

            if(user){
                for (let j = 0; j < user.userVideos.length; j++){
                    const muxPlaybackId = user.userVideos[j].muxPlaybackId; 
                    const muxPlaybackUrl = 'https://stream.mux.com/' + muxPlaybackId + '.m3u8';
    
                    if(props.userIndex == i && props.videoIndex == j){
                        renderedVideos.push(
                            <PlayingVideo
                                key={muxPlaybackId}
                                playbackObject={playingData.playbackObject}
                                source={muxPlaybackUrl}
                                isMuted={playingData.isMuted}
                                shouldPlay={playingData.shouldPlay}
                                _onPlaybackStatusUpdate={playingData._onPlaybackStatusUpdate}
                                display={playingData.display}
                            />
                        )            
                   } 
                    else {
                        renderedVideos.push(
                            <PlayingVideo
                                key={muxPlaybackId}
                                playbackObject={nonplayingData.playbackObject}
                                source={muxPlaybackUrl}
                                isMuted={nonplayingData.isMuted}
                                shouldPlay={nonplayingData.shouldPlay}
                                _onPlaybackStatusUpdate={nonplayingData._onPlaybackStatusUpdate}
                                display={nonplayingData.display}
                            />
                        )    
                    }
                }
            }

        }



        return(
            <View>
                {renderedVideos}
            </View>
        )    
    } else {
        return null; 
    }
}

function PlayingVideo({playbackObject, source, isMuted, shouldPlay, _onPlaybackStatusUpdate, display}){
    return(
        <Video
            ref={playbackObject}
            source={{uri: source}}
            rate={1.0}
            volume={1.0}
            isMuted={isMuted}
            resizeMode="cover"
            usePoster={true}
            shouldPlay={shouldPlay}
            onPlaybackStatusUpdate={_onPlaybackStatusUpdate}
            progressUpdateIntervalMillis={50}
            isLooping
            style={{ width: '100%', height: '100%', display: display}}
            >
        </Video>
    )
}