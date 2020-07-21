

import React, { useEffect, useRef, useState, useMemo } from 'react'; 
import { Video, Audio } from 'expo-av';   
import { View, Animated } from 'react-native';

export default function MultipleVideos(props) {

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

    useEffect(() => {
        Audio.setAudioModeAsync({
            playsInSilentModeIOS: true
        }); 
    }, []);    
    
    const renderedVideos = [];
    const videoData = props.videoData; 
    const renderedUserIndex = props.renderedUserIndex; 
    const userIndex = props.userIndex; 
    const videoIndex = props.videoIndex;
    const userCount = props.userCount;

    if(videoData) {
        const user = useMemo(() => videoData[renderedUserIndex], [renderedUserIndex, videoData]);

        if(user) {
            const videoCount = user.userVideos.length; 
            if(userIndex == renderedUserIndex){
                const renderedVideoIndexA = videoIndex; 

                const muxPlaybackIdA = user.userVideos[renderedVideoIndexA].muxPlaybackId; 
                const muxPlaybackUrlA = 'https://stream.mux.com/' + muxPlaybackIdA + '.m3u8';

                renderedVideos.push(
                    <PlayingVideo
                        key={renderedVideoIndexA}
                        playbackObject={playingData.playbackObject}
                        source={muxPlaybackUrlA}
                        isMuted={playingData.isMuted}
                        shouldPlay={playingData.shouldPlay}
                        _onPlaybackStatusUpdate={playingData._onPlaybackStatusUpdate}
                        display={playingData.display}
                    />
                )

                const renderedVideoIndexB = videoIndex + 1; 

                if(renderedVideoIndexB < videoCount){
                    const muxPlaybackIdB = user.userVideos[renderedVideoIndexB].muxPlaybackId; 
                    const muxPlaybackUrlB = 'https://stream.mux.com/' + muxPlaybackIdB + '.m3u8';
    
                    renderedVideos.push(
                        <PlayingVideo
                            key={renderedVideoIndexB}
                            playbackObject={nonplayingData.playbackObject}
                            source={muxPlaybackUrlB}
                            isMuted={nonplayingData.isMuted}
                            shouldPlay={nonplayingData.shouldPlay}
                            _onPlaybackStatusUpdate={nonplayingData._onPlaybackStatusUpdate}
                            display={nonplayingData.display}
                        />
                    )
                }

            } else if(renderedUserIndex < userCount) {
                const renderedVideoIndex = 0; 
                const muxPlaybackId = user.userVideos[renderedVideoIndex].muxPlaybackId; 
                const muxPlaybackUrl = 'https://stream.mux.com/' + muxPlaybackId + '.m3u8';

                renderedVideos.push(
                    <PlayingVideo
                        key={renderedVideoIndex}
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

    return(
        <View>
            {renderedVideos}
        </View>
    )    
}

function PlayingVideo({playbackObject, source, isMuted, shouldPlay, _onPlaybackStatusUpdate, display}){

    const videoStyle = { width: '100%', height: '100%', display: display}; 
    return(
        <Video
            ref={playbackObject}
            source={{uri: source}}
            // posterSource={{ uri: posterSource}}
            // posterStyle={{ width: '100%', height: '100%', display: display, flex: 1 }}
            rate={1.0}
            volume={1.0}
            isMuted={isMuted}
            resizeMode="cover"
            usePoster={true}
            shouldPlay={shouldPlay}
            onPlaybackStatusUpdate={_onPlaybackStatusUpdate}
            progressUpdateIntervalMillis={50}
            isLooping
            style={videoStyle}
            >
        </Video>
    )
}