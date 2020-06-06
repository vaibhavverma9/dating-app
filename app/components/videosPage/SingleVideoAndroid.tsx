import React, { useEffect, useRef } from 'react'; 
import { Video } from 'expo-av';   

export default function SingleVideo() {

    const uri = "https://stream.mux.com/2SNz7Mg5ff00ACBazeXhEd81TNKmyOyPMO8mUa29yJUY.m3u8"; 
    return (
        <Video 
            source={{uri: uri}}   // Can be a URL or a local file.
        />
    )
}