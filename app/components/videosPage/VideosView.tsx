import React, { useEffect, useState, useContext } from 'react';
import { View, Image, Text, TouchableOpacity, ImageBackground, ActivityIndicator } from 'react-native';
import * as Segment from 'expo-analytics-segment';
import { Dimensions } from "react-native"; 
import { GET_PROFILE_VIDEOS, INSERT_INIT_VIDEO, UPDATE_LAST_UPLOADED, ON_VIDEO_UPDATED, INSERT_USER, GET_USERS_BY_UID, client } from '../../utils/graphql/GraphqlClient';
import { UserIdContext } from '../../utils/context/UserIdContext'
import { FlatList } from 'react-native-gesture-handler';
import { useMutation, useSubscription } from '@apollo/client';
import FullPageVideoScreen from '../modals/FullPageVideoScreen';
import { _retrieveUserId, _storeUserId, _retrieveDoormanUid, _storeDoormanUid } from '../../utils/asyncStorage'; 
import { useDoormanUser } from 'react-native-doorman'
import axios from 'axios';
import { BlurView } from 'expo-blur';

export default function VideosView(props) {

    const [videos, setVideos] = useState([]); 
    const [muxVideos, setMuxVideos] = useState([]);
    const [userId, setUserId] = useContext(UserIdContext);
    const [insertInitVideo, { insertInitVideoData }] = useMutation(INSERT_INIT_VIDEO); 
    const [updateLastUploaded, { updateLastUploadedData }] = useMutation(UPDATE_LAST_UPLOADED);
    const [uploadedVideos, setUploadedVideos] = useState([]); 

    useEffect(() => {
        console.log(userId); 
        Segment.screen('Videos'); 
        getVideos(); 
    }, [])

    // changes in routes
    useEffect(() => {
        let params = props.route.params;
        if (params != undefined){
            setUploadedVideos([params, ...uploadedVideos]);
            postVideo(params);
        }
    }, [props.route])

    useEffect(() => {
        setVideos([...uploadedVideos, ...muxVideos]); 
    }, [muxVideos, uploadedVideos])

    function getVideos(){
        client.query({ query: GET_PROFILE_VIDEOS, variables: { userId: userId}} )
        .then((response) => {
            setMuxVideos(response.data.videos); 
        })
        .catch((error) => {
          console.log(error);
        });
    };

      // changes in tabs will affect shouldPlay 
    useEffect(() => {
        props.navigation.addListener('focus', () => {
            getVideos(); 
        });  
    }, [props.navigation])

    const screenWidth = Math.round(Dimensions.get('window').width);
    const squareWidth = screenWidth * 0.33; 

    function goToAddPage(){
        props.navigation.navigate('Add');
    }

    function VideoView({ video }){
        if(video.item.thumbnailUri){
            return <UploadingView uploadingVideo={video.item} />
        } else {
            return <MuxVideosView video={video} />
        }
    }

    function UploadingView({ uploadingVideo }){

        function goToVideo(){
            setFullVideoVisible(true); 
        }

        function VideoSubscription({passthroughId}){
            const { data, loading, error } = useSubscription(ON_VIDEO_UPDATED, {variables: { passthroughId : passthroughId }}); 
            console.log(data, loading, error); 
            if(loading){
                return null; 
            } 
            
            if(error || !data) {
                return null; 
            }

            if(data){
                const videos = data.videos; 
                if(videos.length > 0){
                    const video_data = videos[0];
                    const status = video_data.status;
                    if(status == "ready"){
                        const tempUploadedVideos = uploadedVideos.map(uploadedVideo => {
                            if(uploadedVideo.passthroughId == passthroughId){
                                return {...uploadedVideo, status: status}
                            } else { return uploadedVideo }
                        })
                        setUploadedVideos(tempUploadedVideos); 
                    }
                }
            }

            return null; 
        }
    
        const [fullVideoVisible, setFullVideoVisible] = useState(false);
        const questionText = uploadingVideo.questionText;
        const thumbnailUri = uploadingVideo.thumbnailUri;
        const videoUri = uploadingVideo.videoUri; 
        const status = uploadingVideo.status; 
        const passthroughId = uploadingVideo.passthroughId; 

        if (status == "ready"){
            return(
                <View style={{ padding: '0.1%'}}>
                    <TouchableOpacity onPress={goToVideo}>
                        <Image 
                            style={{ width: squareWidth, height: squareWidth }}
                            source={{uri: thumbnailUri }}
                        />
                    </TouchableOpacity>
                    <FullPageVideoScreen 
                        visible={fullVideoVisible} 
                        setVisible={setFullVideoVisible} 
                        source={videoUri}
                        questionText={questionText}
                    />
                </View>
            )
        } else {
            return (
                // <BlurView tint="dark" intensity={40} style={{padding: '0.1%', width: squareWidth, height: squareWidth }}>
                <View style={{ padding: '0.1%'}}>
                    <ImageBackground
                        style={{width: squareWidth, height: squareWidth }}
                        source={{uri: thumbnailUri}}
                    >
                        <View style={{ backgroundColor: 'rgba(0,0,0,.6)', flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                            <ActivityIndicator size="small" color="#eee" />
                        </View>
                    </ImageBackground>
                    <VideoSubscription passthroughId={passthroughId} />
                </View>

            )
        }
    }

    function MuxVideosView({ video }){
        function goToVideo(){
            setFullVideoVisible(true); 
        }
    
        const [fullVideoVisible, setFullVideoVisible] = useState(false);

        const muxPlaybackId = video.item.muxPlaybackId;
        const questionText = video.item.videoQuestion ? video.item.videoQuestion.questionText : ""; 

        const muxPlaybackUrl = 'https://image.mux.com/' + muxPlaybackId + '/thumbnail.jpg?time=0';
        return(
            <View style={{ padding: '0.1%'}}>
                <TouchableOpacity onPress={goToVideo}>
                    <Image 
                        style={{ width: squareWidth, height: squareWidth }}
                        source={{uri: muxPlaybackUrl }}
                    />
                </TouchableOpacity>
                <FullPageVideoScreen 
                    visible={fullVideoVisible} 
                    setVisible={setFullVideoVisible} 
                    source={'https://stream.mux.com/' + muxPlaybackId + '.m3u8'}
                    questionText={questionText}
                />
            </View>
        )
    }

    function AddVideosContent(){
        if(videos.length == 0){
            return(
                    <View style={{ flex: 1}}>
                        <TouchableOpacity onPress={goToAddPage}>
                            <View style={{ alignItems: 'center'}}>
                                <Text style={{ fontSize: 16, color: "#2196F3" }}>Add videos to get discovered!</Text>
                                <Text style={{ fontSize: 16 }}>We show your best videos to your likes. </Text>
                            </View>
                        </TouchableOpacity>
                    </View>
            )    
        } else {
            return null; 
        }
    }

    async function postVideo(params){
        const questionText = params.questionText;
        const questionId = params.questionId; 
        const thumbnailUri = params.thumbnailUri;
        const videoUri = params.videoUri; 
        const passthroughId = params.passthroughId; 
        
        Segment.trackWithProperties("Upload Video", { questionId: questionId}); 


        // Create a blob from the videoUri
        const blob = await new Promise((resolve, reject) => {
            const xhr = new XMLHttpRequest(); 
            xhr.onload = () => {
                resolve(xhr.response);
            };
            xhr.onerror = (error) => {
                console.log(error);
                reject(new TypeError('Network request failed'));
            };
            xhr.responseType = 'blob'; 
            xhr.open('GET', videoUri, true); 
            xhr.send(null); 
        });

        // Create an authenticated Mux URL
        let res = await axios({
            method: 'post', 
            url: 'https://api.mux.com/video/v1/uploads',
            headers: { 'content-type': 'application/json' },
            data: { "new_asset_settings": { "passthrough" : passthroughId,"playback_policy": ["public"] } },
            auth: {'username': 'eeadaed4-6e99-45e6-85e1-ba733723c8e6', 'password':'O7qEUCRdCzsbrK1XS2h0OK4N0v9YV1fnrQnCt2kWl/D2xSuJfczkVhJ5S4vQvJ3j5elQzPzJyk8'}
        }); 

        const authenticatedUrl = res.data.data.url; 
        const uploadId = res.data.data.id; 
        const status = res.data.data.status;

        await insertInitVideo({ variables: { questionId: questionId, userId: userId, passthroughId: passthroughId, status: status, uploadId: uploadId }})
        .then(response => {})
        .catch(error => console.log(error)); 

        // Use authenticated URL to upload file
        await fetch(authenticatedUrl, {
            method: 'PUT', 
            body: blob, 
            headers: { "content-type": blob.type }});

        blob.close(); 

        let timestamp = new Date(); 
        updateLastUploaded({ variables: {userId: userId, timestamp: timestamp}})
    }

    return (
        <View style={{ flex: 1, backgroundColor: '#E6E6FA'}}>
            <FlatList
                style={{ marginTop: '15%'}}
                data={videos}
                numColumns={3}
                renderItem={( video ) => <VideoView video={video} />}
                keyExtractor={video => video.id} 
            />
            <AddVideosContent />
        </View>
    );
}