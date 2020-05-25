import React, { useEffect, useState, useContext } from 'react';
import { View, Image, Text, TouchableOpacity, ImageBackground, ActivityIndicator } from 'react-native';
import * as Segment from 'expo-analytics-segment';
import { Dimensions } from "react-native"; 
import { GET_LAST_DAY_VIDEOS, INSERT_INIT_VIDEO, UPDATE_LAST_UPLOADED, ON_VIDEO_UPDATED, INSERT_USER, GET_USERS_BY_UID, GET_PAST_VIDEOS, client } from '../../utils/graphql/GraphqlClient';
import { UserIdContext } from '../../utils/context/UserIdContext'
import { ScrollView } from 'react-native-gesture-handler';
import { useMutation, useSubscription } from '@apollo/client';
import FullPageVideos from '../modals/FullPageVideos';
import { _retrieveUserId, _storeUserId, _retrieveDoormanUid, _storeDoormanUid, _retrieveName, _retrieveBio } from '../../utils/asyncStorage'; 
import axios from 'axios';
import { Ionicons, MaterialIcons, Entypo, SimpleLineIcons } from '@expo/vector-icons'
import { colors } from '../../styles/colors'; 
import SettingsPopup from '../modals/SettingsPopup';

export default function VideosView(props) {

    const [lastDayVideos, setLastDayVideos] = useState([]); 
    const [storedLastDayVideos, setStoredLastDayVideos] = useState([]);
    const [pastVideos, setPastVideos] = useState([]); 
    const [userId, setUserId] = useContext(UserIdContext);
    const [insertInitVideo, { insertInitVideoData }] = useMutation(INSERT_INIT_VIDEO); 
    const [updateLastUploaded, { updateLastUploadedData }] = useMutation(UPDATE_LAST_UPLOADED);
    const [uploadedVideos, setUploadedVideos] = useState([]); 
    const [name, setName] = useState(''); 
    const [bio, setBio] = useState(''); 
    const [initialized, setInitialized] = useState(false); 
    const [settingsVisible, setSettingsVisible] = useState(false); 

    const [bestVideos, setBestVideos] = useState([]);
    const [averageVideos, setAverageVideos] = useState([]);
    const [worstVideos, setWorstVideos] = useState([]);

    let yesterday = new Date(Date.now() - 86400000); 
    const thumbnailPadding = '0.2%'; 

    useEffect(() => {
        Segment.screen('Videos'); 
        getStoredLastDayVideos(); 
        getPastVideos(); 
        initProfile(); 
    }, [])

    useEffect(() => {
        props.navigation.addListener('focus', () => {
            initProfile(); 
        });  
      }, [props.navigation]);

    async function initProfile(){
        const name = await _retrieveName(); 
        const bio = await _retrieveBio(); 
        setName(name);
        setBio(bio);
    }

    // changes in routes
    useEffect(() => {
        let params = props.route.params;
        if (params != undefined){
            setUploadedVideos([params, ...uploadedVideos]);
            postVideo(params);
        }
    }, [props.route])

    useEffect(() => {
        const blankVideo = { type: 'blankVideo', id: 0 }
        setLastDayVideos([blankVideo, ...uploadedVideos, ...storedLastDayVideos]); 
    }, [storedLastDayVideos, uploadedVideos])

    function getStoredLastDayVideos(){
        client.query({ query: GET_LAST_DAY_VIDEOS, variables: { userId, yesterday}} )
        .then((response) => {
            setStoredLastDayVideos(response.data.videos); 
        })
        .catch((error) => {
          console.log(error);
        });
    };

    function getPastVideos(){
        client.query({ query: GET_PAST_VIDEOS, variables: { userId, yesterday}} )
        .then((response) => {
            // setBestVideos(response.data.videos); 
            // setBestVideos(response.data.videos.filter(video => { return video.rank == 1 }));
            // setAverageVideos(response.data.videos.filter(video => { return video.rank == 2 }));
            // setWorstVideos(response.data.videos.filter(video => { return video.rank == 3 }));
            setInitialized(true); 
        })
        .catch((error) => {
          console.log(error);
        });
    };

    const windowWidth = Math.round(Dimensions.get('window').width);
    const thumbnailWidth = windowWidth * 0.33; 
    const thumbnailHeight = windowWidth * 0.4; 

    function goToAddPage(){
        props.navigation.navigate('Add');
    }

    function VideoView({ video }){
        if(video.type == 'blankVideo') {
            return <BlankVideoView /> 
        } else if(video.type == 'uploadedVideo'){
            return <UploadingView uploadingVideo={video} />
        } else {
            return <IndividualVideoView video={video} />
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
                            style={{ width: thumbnailWidth, height: thumbnailHeight }}
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
                        style={{width: thumbnailWidth, height: thumbnailHeight }}
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
                    <ImageBackground 
                        style={{ width: thumbnailWidth, height: thumbnailHeight, justifyContent: 'flex-end' }}
                        source={{uri: muxPlaybackUrl }}
                    >
                        <View style={{ flexDirection: 'row', padding: 4, alignItems: 'center'}}>
                            <SimpleLineIcons name="control-play" color={colors.secondaryWhite} size={14}/>
                            <Text style={{ color: colors.secondaryWhite, paddingLeft: 2, fontSize: 14 }}>{video.views}</Text>
                        </View>
                    </ImageBackground>
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
                <TouchableOpacity onPress={goToAddPage} style={{backgroundColor: colors.secondaryBlack, width: thumbnailWidth, height: thumbnailHeight, justifyContent: 'center', alignItems: 'center' }}>
                    <Ionicons name="ios-add" color={"#eee"} size={60} />
                </TouchableOpacity>
            </View>
        )
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

    function VideoSection ({ videos }) {        
        return (
            <View style={{ flex: 1, flexDirection: 'row' }}>
                {videos.map(video => <VideoView key={video.id} video={video} />)}
            </View>
        )
    }

    function LastDayVideosSubtitle({ videosLength }) {
        if(videosLength == 0){
            return null;
        } else if (videosLength == 1){
            return (
                <Text style={{ color: colors.secondaryWhite }}>Add new videos to get likes</Text>
            )    
        } else {
            return (
                <Text style={{ color: colors.secondaryWhite }}>Add more videos to get more likes</Text>
            )
        }
    }

    function ProfilePicture() {
        const length = 110; 

        let muxPlaybackId = ""; 
        if(pastVideos.length > 0){
            muxPlaybackId = pastVideos[0].muxPlaybackId;
        }
        else if(storedLastDayVideos.length > 0){
            muxPlaybackId = storedLastDayVideos[0].muxPlaybackId;
        } else {
            return (
                <View
                    style={{ 
                        width: length, 
                        height: length, 
                        borderRadius: length/2, 
                        backgroundColor: colors.secondaryGray, 
                        justifyContent: 'center', 
                        alignItems: 'center'
                    }}                
                 >                    
                    <MaterialIcons name="person" color={colors.secondaryWhite} size={50}/>  
                </View>
            )
        }

        const muxPlaybackUrl = 'https://image.mux.com/' + muxPlaybackId + '/thumbnail.jpg?time=0';
        return (
            <Image
                style={{ width: length, height: length, borderRadius: length/ 2 }}
                source={{ uri: muxPlaybackUrl }}
            />
        )
    }

    function Name () {
        if(name == ''){
            return (
                <TouchableOpacity onPress={goToEditName} style={{ padding: 15}}>
                    <Text style={{ fontWeight: '600', fontSize: 20, color: colors.primaryWhite }}>Tap to add name</Text>
                </TouchableOpacity>
            )
        } else {
            return (
                <View style={{ padding: 15}}>
                    <Text style={{ fontWeight: 'bold', fontSize: 20, color: colors.primaryWhite }}>{name}</Text>
                </View>
            )
        }
    }

    function Bio (){
        if(bio == ''){
            return (
                <TouchableOpacity onPress={goToEditBio} style={{ paddingBottom: 25}}>
                    <Text style={{ fontWeight: '200', fontSize: 14, color: colors.primaryWhite  }}>Tap to add bio</Text>
                </TouchableOpacity>
            )
        } else {
            return (
                <View style={{ paddingBottom: 25}}>
                    <Text style={{ fontWeight: '200', fontSize: 14, color: colors.primaryWhite  }}>{bio}</Text>
                </View>
            )
        }
    }

    function goToEditName(){
        props.navigation.navigate('Name', {name});
    }

    function goToEditBio(){
        props.navigation.navigate('Bio', {bio}); 
    }

    function goToEditProfile(){
        props.navigation.navigate("Edit profile", {name, bio});
    }

    function goToNewVideos(){
        const title = 'New Videos'; 
        props.navigation.navigate('VideosDetail', {title, videos: lastDayVideos}); 
    }

    function goToBestVideos(){
        const title = 'Best Performing Videos'; 
        props.navigation.navigate('VideosDetail', {title, videos: bestVideos});
    }

    function goToAverageVideos(){
        const title = 'Average Performing Videos'; 
        props.navigation.navigate('VideosDetail', {title, videos: averageVideos});
    }

    function goToWorstVideos(){
        const title = 'Worst Performing Videos'; 
        props.navigation.navigate('VideosDetail', {title, videos: worstVideos});
    }

    function EditProfileButton () {
        return (
            <TouchableOpacity onPress={goToEditProfile} style={{  borderWidth: 1, borderRadius: 3, height: 30, width: 130, justifyContent: 'center', alignItems: 'center', borderColor: colors.primaryWhite}}>
                <Text style={{ fontSize: 16, fontWeight: '200', color: colors.primaryWhite  }}>Edit Profile</Text>
            </TouchableOpacity>
        )
    }

    function openSettings(){
        console.log("openSettings"); 
        setSettingsVisible(true); 
    }

    function ExplanationText(){
        return (
            <View style={{ paddingHorizontal: 50, paddingVertical: 30 }}>
                <Text style={{ color: colors.chineseWhite, textAlign: 'center' }}>We show your best videos to users.</Text>
            </View>
        )
    }

    function SectionTitle({text, videos}){
        if(videos.length > 0){
            return (
                <View style={{ flexDirection: 'row', alignItems: 'flex-end'}}>
                    <Text style={{ fontWeight: 'bold', fontSize: 20, color: colors.primaryWhite }}>{text}</Text>
                    <Entypo name="chevron-right" color={colors.primaryWhite} size={17}/>  
                </View>
            )    
        } else {
            return null; 
        }
    }
    
    if(initialized){
        return (
                <ScrollView style={{ flex: 1, backgroundColor: colors.primaryBlack}}>
                    <View style={{ justifyContent: 'flex-start'}}>
                        <View style={{ paddingTop: 50, alignItems: 'center'}}>
                            <ProfilePicture />  
                            <Name />
                            <Bio /> 
                            <EditProfileButton /> 
                            <ExplanationText />
                        </View>
                        <View style={{ paddingTop: 10, paddingLeft: thumbnailPadding }}>
                            <TouchableOpacity onPress={goToNewVideos}>
                                <View style={{ flexDirection: 'row', alignItems: 'flex-end'}}>
                                    <Text style={{ fontWeight: 'bold', fontSize: 20, color: colors.primaryWhite }}>New Videos</Text>
                                    <Entypo name="chevron-right" color={colors.primaryWhite} size={17}/>  
                                </View>
                                <LastDayVideosSubtitle videosLength={lastDayVideos.length} />
                            </TouchableOpacity>
                            <VideoSection videos={lastDayVideos.slice(0, 3)}/>
                            <VideoSection videos={lastDayVideos.slice(4, 6)}  />
                        </View>
                        <View style={{ paddingTop: 30, paddingLeft: thumbnailPadding }}>
                            <TouchableOpacity style={{ flexDirection: 'row', alignItems: 'flex-end'}} onPress={goToBestVideos}>
                                <SectionTitle text={'Best Performing'} videos={bestVideos} />
                            </TouchableOpacity>
                            <VideoSection videos={bestVideos.slice(0, 3)}  />
                            <VideoSection videos={bestVideos.slice(4, 6)}  />
                        </View>
                        <View style={{ paddingTop: 30, paddingLeft: thumbnailPadding }}>
                            <TouchableOpacity style={{ flexDirection: 'row', alignItems: 'flex-end'}} onPress={goToAverageVideos}>
                                <SectionTitle text={'Average Performing'} videos={averageVideos} />
                            </TouchableOpacity>
                            <VideoSection videos={averageVideos.slice(0, 3)}  />
                            <VideoSection videos={averageVideos.slice(4, 6)}  />
                        </View>
                        <View style={{ paddingTop: 30, paddingLeft: thumbnailPadding }}>
                            <TouchableOpacity style={{ flexDirection: 'row', alignItems: 'flex-end'}} onPress={goToWorstVideos}>
                                <SectionTitle text={'Worst Performing'} videos={worstVideos} />
                            </TouchableOpacity>
                            <VideoSection videos={worstVideos.slice(0, 3)}  />
                            <VideoSection videos={worstVideos.slice(4, 6)}  />
                        </View>
                    </View>
                    <TouchableOpacity onPress={openSettings} style={{ position: "absolute", top: 50, right: 15}}>
                        <MaterialIcons name="menu" color={colors.secondaryWhite} size={30}/>  
                    </TouchableOpacity>
                    <SettingsPopup visible={settingsVisible} setVisible={setSettingsVisible} />
                </ScrollView>
        );
    } else {
        return (
            <View style={{ backgroundColor: '#000', justifyContent: 'center', alignItems: 'center', flex: 1}}>
              <ActivityIndicator size="small" color="#eee" />
            </View>
        )      
    }
}