// import React, { useEffect, useRef, useState } from 'react'; 
// import { Video, Audio } from 'expo-av';   
// import { View, Animated } from 'react-native';

// export default function MultipleVideos(props) {

//     const renderedGroup = props.limit; 

//     let initialIndex;
//     let indexLimit; 

//     if (props.first) {
//         const renderedIndex = Math.round(props.userIndex / renderedGroup); 
//         initialIndex = renderedIndex * renderedGroup;
//         indexLimit = renderedIndex * renderedGroup + renderedGroup / 2; 
//     } else {
//         const renderedIndex = Math.floor(props.userIndex / renderedGroup); 
//         initialIndex = renderedIndex * renderedGroup + renderedGroup / 2; 
//         indexLimit = renderedIndex * renderedGroup + renderedGroup; 
//     }

//     const playingData = { 
//         isMuted: false, 
//         shouldPlay: props.shouldPlay, 
//         playbackObject: props.playbackObject, 
//         _onPlaybackStatusUpdate: props._onPlaybackStatusUpdate, 
//         display: "flex"
//     }

//     const nonplayingData = {
//         isMuted: true, 
//         shouldPlay: false, 
//         playbackObject: null, 
//         _onPlaybackStatusUpdate: null, 
//         display: "none"
//     }

//     // const [renderedVideos, setRenderedVideos] = useState([]); 

//     useEffect(() => {
//         Audio.setAudioModeAsync({
//             playsInSilentModeIOS: true
//         }); 
//     }, []);

//     const renderedVideos = []; 

//     if(props.videoData) {

//         for(let i = initialIndex; i < indexLimit; i++){
//             const user = props.videoData.users[i];

//             if(user){
//                 for (let j = 0; j < user.userVideos.length; j++){
//                     const muxPlaybackId = user.userVideos[j].muxPlaybackId; 
//                     const muxPlaybackUrl = 'https://stream.mux.com/' + muxPlaybackId + '.m3u8';

//                     if(props.userIndex == i && props.videoIndex == j){
//                         renderedVideos.push(
//                             <PlayingVideo
//                                 key={muxPlaybackId}
//                                 playbackObject={playingData.playbackObject}
//                                 source={muxPlaybackUrl}
//                                 isMuted={playingData.isMuted}
//                                 shouldPlay={playingData.shouldPlay}
//                                 _onPlaybackStatusUpdate={playingData._onPlaybackStatusUpdate}
//                                 display={playingData.display}
//                             />
//                         )            
//                    } 
//                     else {
//                         renderedVideos.push(
//                             <PlayingVideo
//                                 key={muxPlaybackId}
//                                 playbackObject={nonplayingData.playbackObject}
//                                 source={muxPlaybackUrl}
//                                 isMuted={nonplayingData.isMuted}
//                                 shouldPlay={nonplayingData.shouldPlay}
//                                 _onPlaybackStatusUpdate={nonplayingData._onPlaybackStatusUpdate}
//                                 display={nonplayingData.display}
//                             />
//                         )    
//                     }
//                 }
//             }

//         }

//     }
//     return(
//         <View>
//             {renderedVideos}
//         </View>
//     )    
//     // } else {
//     //     return null; 
//     // }
// }

// function PlayingVideo({playbackObject, source, isMuted, shouldPlay, _onPlaybackStatusUpdate, display}){

//     const videoStyle = { width: '100%', height: '100%', display: display}; 
//     return(
//         <Video
//             ref={playbackObject}
//             source={{uri: source}}
//             // posterSource={{ uri: posterSource}}
//             // posterStyle={{ width: '100%', height: '100%', display: display, flex: 1 }}
//             rate={1.0}
//             volume={1.0}
//             isMuted={isMuted}
//             resizeMode="cover"
//             usePoster={true}
//             shouldPlay={shouldPlay}
//             onPlaybackStatusUpdate={_onPlaybackStatusUpdate}
//             progressUpdateIntervalMillis={50}
//             isLooping
//             style={videoStyle}
//             >
//         </Video>
//     )
// }

import React, { useEffect, useRef, useState } from 'react'; 
import { Video, Audio } from 'expo-av';   
import { View, Text, Animated } from 'react-native';

export default function MultipleVideos(props) {

    const renderedGroup = props.limit; 
    const [renderedVideos, setRenderedVideos] = useState([]); 

    let initialIndex;
    let indexLimit; 

    if (props.first) {
        const renderedIndex = Math.round(props.userIndex / renderedGroup); 
        initialIndex = renderedIndex * renderedGroup;
        indexLimit = renderedIndex * renderedGroup + renderedGroup / 2; 
    } else {
        const renderedIndex = Math.floor(props.userIndex / renderedGroup); 
        initialIndex = renderedIndex * renderedGroup + renderedGroup / 2; 
        indexLimit = renderedIndex * renderedGroup + renderedGroup; 
    }

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
        initVideos(); 
    }, []);

    // useEffect(() => {
    //     console.log(renderedVideos); 
    // }, [renderedVideos]);

    function initVideos(){

        const renderedVideosLocal = []; 
        if(props.videoData) {

            for(let i = initialIndex; i < indexLimit; i++){
                const user = props.videoData.users[i];
    
                if(user){
                    for (let j = 0; j < user.userVideos.length; j++){
                        const muxPlaybackId = user.userVideos[j].muxPlaybackId; 
                        const muxPlaybackUrl = 'https://stream.mux.com/' + muxPlaybackId + '.m3u8';
    
                        if(props.userIndex == i && props.videoIndex == j){
                            const renderedVideo = {
                                muxPlaybackId: muxPlaybackId,
                                muxPlaybackUrl: muxPlaybackUrl,
                                playing: playingData 
                            }
                            renderedVideosLocal.push(renderedVideo); 
                        } else {
                            const renderedVideo = {
                                muxPlaybackId: muxPlaybackId,
                                muxPlaybackUrl: muxPlaybackUrl,
                                playing: nonplayingData 
                            }
                            renderedVideosLocal.push(renderedVideo); 
                        }
                    }
                }
    
            }
        }
        setRenderedVideos(renderedVideosLocal); 
    }

    function RenderedVideos(){

        const videoStyle = { width: '100%', height: '100%', display: renderedVideos[0].playing.display}; 

        if(renderedVideos && renderedVideos.length > 0){
            // console.log(renderedVideos);
            // console.log(renderedVideos[0].muxPlaybackId);
            // console.log(renderedVideos[0].muxPlaybackUrl);
            // console.log(renderedVideos[0].playing.display); 


            return (
                <View>
                   <Video
                        ref={renderedVideos[0].playbackObject}
                        source={{uri: renderedVideos[0].muxPlaybackUrl}}
                        rate={1.0}
                        volume={1.0}
                        isMuted={renderedVideos[0].playing.isMuted}
                        resizeMode="cover"
                        usePoster={true}
                        shouldPlay={renderedVideos[0].playing.shouldPlay}
                        onPlaybackStatusUpdate={props._onPlaybackStatusUpdate}
                        progressUpdateIntervalMillis={50}
                        isLooping
                        style={videoStyle}
                        >
                    </Video>

                    {/* {renderedVideos.map(renderedVideo => { 
                        <PlayingVideo
                            key={renderedVideo.muxPlaybackId}
                            playbackObject={renderedVideo.playing.playbackObject}
                            source={renderedVideo.muxPlaybackUrl}
                            isMuted={renderedVideo.playing.isMuted}
                            shouldPlay={renderedVideo.playing.shouldPlay}
                            // _onPlaybackStatusUpdate={renderedVideos[0].playing._onPlaybackStatusUpdate}
                            display={renderedVideo.playing.display}
                        />
                    })} */}
                </View>
            )
        } else {
            return null; 
        }

    };

    if(renderedVideos && renderedVideos.length > 0){
        return(
            <RenderedVideos />
        ) 
    } else {
        return null; 
    }
}

function PlayingVideo({playbackObject, source, isMuted, shouldPlay, display}){

    const videoStyle = { width: '100%', height: '100%', display: display}; 
    return(
        <Video
            // ref={playbackObject}
            source={{uri: source}}
            // posterSource={{ uri: posterSource}}
            // posterStyle={{ width: '100%', height: '100%', display: display, flex: 1 }}
            rate={1.0}
            volume={1.0}
            isMuted={isMuted}
            resizeMode="cover"
            usePoster={true}
            shouldPlay={shouldPlay}
            // onPlaybackStatusUpdate={_onPlaybackStatusUpdate}
            progressUpdateIntervalMillis={50}
            isLooping
            style={videoStyle}
            >
        </Video>
    )
}