import React, { useEffect, useState } from 'react';
import { View, Image, Text, TouchableOpacity, ImageBackground, ActivityIndicator } from 'react-native';
import { FlatList } from 'react-native-gesture-handler';
import { ON_VIDEO_UPDATED } from '../../utils/graphql/GraphqlClient';
import { useSubscription } from '@apollo/client';
import FullPageVideos from '../modals/FullPageVideos';
import { _retrieveUserId, _storeUserId, _retrieveDoormanUid, _storeDoormanUid, _retrieveName, _retrieveBio } from '../../utils/asyncStorage'; 
import { Ionicons} from '@expo/vector-icons'
import { colors } from '../../styles/colors'; 
import { Dimensions } from "react-native"; 

export default function VideosDetailView(props) {

    const [title, setTitle] = useState('');
    const [videos, setVideos] = useState([]); 
    const [uploadedVideos, setUploadedVideos] = useState([]); 
    const thumbnailPadding = '0.2%'; 
    const screenWidth = Math.round(Dimensions.get('window').width);
    const squareWidth = screenWidth * 0.33; 

    // changes in routes
    useEffect(() => {
        let params = props.route.params;
        console.log(params); 
        if (params != undefined){
            setTitle(params.title); 
            setVideos(params.videos); 
        }
    }, [props.route]);

    function goToAddPage(){
        props.navigation.navigate('Add');
    }

    function VideoView({ video }){
        if(video.item.type == 'blankVideo') {
            return <BlankVideoView /> 
        } else if(video.type == 'uploadedVideo'){
            return <UploadingView uploadingVideo={video.item} />
        } else {
            return <IndividualVideoView video={video.item} />
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
                <View style={{ padding: thumbnailPadding}}>
                    <TouchableOpacity onPress={goToVideo}>
                        <Image 
                            style={{ width: squareWidth, height: squareWidth }}
                            source={{uri: thumbnailUri }}
                        />
                    </TouchableOpacity>
                    <FullPageVideos 
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
                <View style={{ padding: thumbnailPadding}}>
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

    function IndividualVideoView({ video }){
        function goToVideo(){
            setFullVideoVisible(true); 
        }
    
        const [fullVideoVisible, setFullVideoVisible] = useState(false);

        const muxPlaybackId = video.muxPlaybackId;
        const questionText = video.videoQuestion ? video.videoQuestion.questionText : ""; 

        const muxPlaybackUrl = 'https://image.mux.com/' + muxPlaybackId + '/thumbnail.jpg?time=0';
        return(
            <View style={{ padding: thumbnailPadding}}>
                <TouchableOpacity onPress={goToVideo}>
                    <Image 
                        style={{ width: squareWidth, height: squareWidth }}
                        source={{uri: muxPlaybackUrl }}
                    />
                </TouchableOpacity>
                <FullPageVideos 
                    visible={fullVideoVisible} 
                    setVisible={setFullVideoVisible} 
                    source={'https://stream.mux.com/' + muxPlaybackId + '.m3u8'}
                    questionText={questionText}
                />
            </View>
        )
    }

    function BlankVideoView(){
        return(
            <View style={{ padding: thumbnailPadding}}>
                <TouchableOpacity onPress={goToAddPage} style={{backgroundColor: colors.secondaryBlack, width: squareWidth, height: squareWidth, justifyContent: 'center', alignItems: 'center' }}>
                    <Ionicons name="ios-add" color={"#eee"} size={60} />
                </TouchableOpacity>
            </View>
        )
    }

    return (
        <View style={{ flex: 1, backgroundColor: colors.primaryBlack}}>
            <View style={{ flex: 1, backgroundColor: colors.primaryBlack, justifyContent: 'flex-end', alignItems: 'center'}}>
                <Text style={{ paddingBottom: 27, fontSize: 18, color: colors.primaryWhite }}>{title}</Text>
            </View>
            <View style={{ flex: 6 }}>
                {/* <Text style={{ color: colors.primaryWhite}}>Hi</Text> */}
                <FlatList
                    data={videos}
                    numColumns={3}
                    renderItem={( video ) => <VideoView video={video} />}
                    keyExtractor={video => video.id} 
                    />
            </View>
        </View>

    )
}

