import React, { useEffect, useState, useContext } from 'react';
import { View, Image, Text, TouchableOpacity, ImageBackground, ActivityIndicator, StyleSheet } from 'react-native';
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
    const length = 110; 

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
            postVideo(params, uploadedVideos);
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
        .catch((error) => {});
    };

    function getPastVideos(){
        client.query({ query: GET_PAST_VIDEOS, variables: { userId, yesterday}} )
        .then((response) => {
            setBestVideos(response.data.videos.filter(video => { return video.rank == 1 }));
            setAverageVideos(response.data.videos.filter(video => { return video.rank == 2 }));
            setWorstVideos(response.data.videos.filter(video => { return video.rank == 3 }));
            setInitialized(true); 
        })
        .catch((error) => {});
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
                                return {...uploadedVideo, status: status, id: video_data.id}
                            } else { return uploadedVideo }
                        })
                        setUploadedVideos(tempUploadedVideos); 
                    } else if (status == "errored"){
                        const tempUploadedVideos = uploadedVideos.map(uploadedVideo => {
                            if(uploadedVideo.passthroughId == passthroughId){
                                return {...uploadedVideo, status: status, id: video_data.id}
                            } else { return uploadedVideo }
                        })
                        setUploadedVideos(tempUploadedVideos); 
                    }
                }
            }

            return null; 
        }
    
        const [fullVideoVisible, setFullVideoVisible] = useState(false);
        const [status, setStatus] = useState(uploadingVideo.status);
        const questionText = uploadingVideo.questionText;
        const thumbnailUri = uploadingVideo.thumbnailUri;
        const videoUri = uploadingVideo.videoUri; 
        const passthroughId = uploadingVideo.passthroughId; 
        const id = uploadingVideo.id; 


        if (status == "ready"){
            return(
                <View style={styles.thumbnailPaddingStyle}>
                    <TouchableOpacity onPress={goToVideo}>
                        <Image 
                            style={styles.thumbnailDimensions}
                            source={{uri: thumbnailUri }}
                        />
                    </TouchableOpacity>
                    <FullPageVideos 
                        visible={fullVideoVisible} 
                        setVisible={setFullVideoVisible} 
                        source={videoUri}
                        questionText={questionText}
                        showOptions={true}
                        videoId={id}
                        removeVideo={removeVideo}
                    />
                </View>
            )
        } else if(status == "removed") {
            return null; 
        } else if(status == "errored") {
            return (
                // <BlurView tint="dark" intensity={40} style={{padding: '0.1%', width: squareWidth, height: squareWidth }}>
                <View style={styles.thumbnailPaddingStyle}>
                    <ImageBackground
                        style={styles.thumbnailDimensions}
                        source={{uri: thumbnailUri}}
                    >
                        <Text>Error!</Text>
                    </ImageBackground>
                    <VideoSubscription passthroughId={passthroughId} />
                </View>

            )
        } else {
            return (
                // <BlurView tint="dark" intensity={40} style={{padding: '0.1%', width: squareWidth, height: squareWidth }}>
                <View style={styles.thumbnailPaddingStyle}>
                    <ImageBackground
                        style={styles.thumbnailDimensions}
                        source={{uri: thumbnailUri}}
                    >
                        <View style={styles.activityView}>
                            <ActivityIndicator size="small" color="#eee" />
                        </View>
                    </ImageBackground>
                    <VideoSubscription passthroughId={passthroughId} />
                </View>

            )
        }
    }

    function removeVideo(videoId){
        setUploadedVideos(uploadedVideos.filter(video => {return video.id != videoId })); 
        setLastDayVideos(lastDayVideos.filter(video => { return video.id != videoId }));
        setBestVideos(bestVideos.filter(video => { return video.id != videoId }));
        setAverageVideos(averageVideos.filter(video => { return video.id != videoId }));
        setWorstVideos(worstVideos.filter(video => { return video.id != videoId }));
    }

    function IndividualVideoView({ video }){
        function goToVideo(){
            setFullVideoVisible(true); 
        }

    
        const [fullVideoVisible, setFullVideoVisible] = useState(false);
        const [status, setStatus] = useState("ready"); 
        const muxPlaybackId = video.muxPlaybackId;
        const questionText = video.videoQuestion ? video.videoQuestion.questionText : ""; 
        const muxPlaybackUrl = 'https://image.mux.com/' + muxPlaybackId + '/thumbnail.jpg?time=0';

        if(status == "ready"){
            return(
                <View style={styles.thumbnailPaddingStyle}>
                    <TouchableOpacity onPress={goToVideo}>
                        <ImageBackground 
                            style={styles.thumbnailDimensionsFlexEnd}
                            source={{uri: muxPlaybackUrl }}
                        >
                            <View style={styles.videoViews}>
                                <SimpleLineIcons name="control-play" color={colors.secondaryWhite} size={14}/>
                                <Text style={styles.videoViewsText}>{video.views}</Text>
                            </View>
                        </ImageBackground>
                    </TouchableOpacity>
                    <FullPageVideos 
                        visible={fullVideoVisible} 
                        setVisible={setFullVideoVisible} 
                        source={'https://stream.mux.com/' + muxPlaybackId + '.m3u8'}
                        questionText={questionText}
                        likes={video.likes}
                        views={video.views}
                        showOptions={true}
                        videoId={video.id}
                        removeVideo={removeVideo}
                    />
                </View>
            )
        } else {
            return null; 
        }

    }

    function BlankVideoView(){
        return(
            <View style={styles.thumbnailPaddingStyle}>
                <TouchableOpacity onPress={goToAddPage} style={styles.goToAddPageStyle}>
                    <Ionicons name="ios-add" color={"#eee"} size={60} />
                </TouchableOpacity>
            </View>
        )
    }

    async function postVideo(params, uploadedVideos){
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
        .catch(error => {}); 

        // Use authenticated URL to upload file
        await fetch(authenticatedUrl, {
            method: 'PUT', 
            body: blob, 
            headers: { "content-type": blob.type }});

        blob.close();

        let timestamp = new Date(); 
        updateLastUploaded({ variables: {userId: userId, timestamp: timestamp}});
    }

    function VideoSection ({ videos }) {        
        return (
            <View style={styles.videoSectionStyle}>
                {videos.map(video => <VideoView key={video.id} video={video} />)}
            </View>
        )
    }

    function LastDayVideosSubtitle({ videosLength }) {
        if(videosLength == 0){
            return null;
        } else if (videosLength == 1){
            return (
                <Text style={styles.sectionSubtitles}>Add new videos to get likes</Text>
            )    
        } else {
            return (
                <Text style={styles.sectionSubtitles}>Add more videos to get more likes</Text>
            )
        }
    }

    function ProfilePicture() {

        let muxPlaybackId = ""; 
        if(pastVideos.length > 0){
            muxPlaybackId = pastVideos[0].muxPlaybackId;
        }
        else if(storedLastDayVideos.length > 0){
            muxPlaybackId = storedLastDayVideos[0].muxPlaybackId;
        } else {
            return (
                <View
                    style={styles.profilePictureStyle}                
                 >                    
                    <MaterialIcons name="person" color={colors.secondaryWhite} size={50}/>  
                </View>
            )
        }

        const muxPlaybackUrl = 'https://image.mux.com/' + muxPlaybackId + '/thumbnail.jpg?time=0';
        return (
            <Image
                style={styles.profilePictureImageStyle}
                source={{ uri: muxPlaybackUrl }}
            />
        )
    }

    function Name () {
        if(name == ''){
            return (
                <TouchableOpacity onPress={goToEditName} style={styles.namePadding}>
                    <Text style={styles.tapToAddName}>Tap to add name</Text>
                </TouchableOpacity>
            )
        } else {
            return (
                <View style={styles.namePadding}>
                    <Text style={styles.title}>{name}</Text>
                </View>
            )
        }
    }

    function Bio (){
        if(bio == ''){
            return (
                <TouchableOpacity onPress={goToEditBio} style={styles.bioPadding}>
                    <Text style={styles.bio}>Tap to add bio</Text>
                </TouchableOpacity>
            )
        } else {
            return (
                <View style={styles.bioPadding}>
                    <Text style={styles.bio}>{bio}</Text>
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
        const title = 'Your Best Videos'; 
        props.navigation.navigate('VideosDetail', {title, videos: bestVideos});
    }

    function goToAverageVideos(){
        const title = 'Your Good Videos'; 
        props.navigation.navigate('VideosDetail', {title, videos: averageVideos});
    }

    function goToWorstVideos(){
        const title = 'Your Not-So-Great Videos'; 
        props.navigation.navigate('VideosDetail', {title, videos: worstVideos});
    }

    function EditProfileButton () {
        return (
            <TouchableOpacity onPress={goToEditProfile} style={styles.editProfileButtonStyle}>
                <Text style={styles.editProfileText}>Edit Profile</Text>
            </TouchableOpacity>
        )
    }

    function openSettings(){
        setSettingsVisible(true); 
    }

    function ExplanationText(){
        return (
            <View style={styles.explanationPadding}>
                <Text style={styles.explanationText}>We show a few of your best videos to each user.</Text>
            </View>
        )
    }

    function SectionTitle({text, videos}){
        if(videos.length > 0){
            return (
                <View style={styles.titleView}>
                    <Text style={styles.title}>{text}</Text>
                    <Entypo name="chevron-right" color={colors.primaryWhite} size={17}/>  
                </View>
            )    
        } else {
            return null; 
        }
    }


    const styles = StyleSheet.create({
        thumbnailPaddingStyle: { padding: thumbnailPadding},
        thumbnailDimensions: { width: thumbnailWidth, height: thumbnailHeight },
        activityView: { backgroundColor: '#000', flex: 1, justifyContent: 'center', alignItems: 'center' },
        thumbnailDimensionsFlexEnd: { width: thumbnailWidth, height: thumbnailHeight, justifyContent: 'flex-end' },
        videoViews: { flexDirection: 'row', padding: 4, alignItems: 'center'},
        videoViewsText: { color: colors.secondaryWhite, paddingLeft: 2, fontSize: 14 },
        goToAddPageStyle: {backgroundColor: colors.secondaryBlack, width: thumbnailWidth, height: thumbnailHeight, justifyContent: 'center', alignItems: 'center' },
        videoSectionStyle: { flex: 1, flexDirection: 'row' },
        sectionSubtitles: { color: colors.secondaryWhite },
        profilePictureStyle: { 
            width: length, 
            height: length, 
            borderRadius: length/2, 
            backgroundColor: colors.secondaryGray, 
            justifyContent: 'center', 
            alignItems: 'center'
        }, 
        profilePictureImageStyle: { width: length, height: length, borderRadius: length/ 2 },
        tapToAddName: { fontWeight: '600', fontSize: 20, color: colors.primaryWhite },
        title: { fontWeight: 'bold', fontSize: 20, color: colors.primaryWhite },
        namePadding: { padding: 15},
        bioPadding: { paddingBottom: 25},
        bio: { fontWeight: '200', fontSize: 14, color: colors.primaryWhite },
        editProfileButtonStyle: {  borderWidth: 1, borderRadius: 3, height: 30, width: 130, justifyContent: 'center', alignItems: 'center', borderColor: colors.primaryWhite},
        editProfileText: { fontSize: 16, fontWeight: '200', color: colors.primaryWhite  },
        explanationPadding: { paddingHorizontal: 50, paddingVertical: 30 },
        explanationText: { color: colors.chineseWhite, textAlign: 'center' },
        titleView: { flexDirection: 'row', alignItems: 'flex-end'},
        scrollViewStyle: { flex: 1, backgroundColor: colors.primaryBlack},
        viewFlexStart: { justifyContent: 'flex-start'},
        headerContainer: { paddingTop: 50, alignItems: 'center'},
        thumbnailPaddingTop: { paddingTop: 10, paddingLeft: thumbnailPadding },
        thumbnailPaddingTop2: { paddingTop: 30, paddingLeft: thumbnailPadding },
        settingsContainer: { position: "absolute", top: 50, right: 15}
    });

    if(initialized){
        return (
                <ScrollView style={styles.scrollViewStyle}>
                    <View style={styles.viewFlexStart}>
                        <View style={styles.headerContainer}>
                            <ProfilePicture />  
                            <Name />
                            <Bio /> 
                            <EditProfileButton /> 
                            <ExplanationText />
                        </View>
                        <View style={styles.thumbnailPaddingTop}>
                            <TouchableOpacity onPress={goToNewVideos}>
                                <View style={styles.titleView}>
                                    <Text style={styles.title}>New Videos</Text>
                                    <Entypo name="chevron-right" color={colors.primaryWhite} size={17}/>  
                                </View>
                                <LastDayVideosSubtitle videosLength={lastDayVideos.length} />
                            </TouchableOpacity>
                            <VideoSection videos={lastDayVideos.slice(0, 3)}/>
                            <VideoSection videos={lastDayVideos.slice(4, 6)}  />
                        </View>
                        <View style={styles.thumbnailPaddingTop2}>
                            <TouchableOpacity style={styles.titleView} onPress={goToBestVideos}>
                                <SectionTitle text={'Best Videos'} videos={bestVideos} />
                            </TouchableOpacity>
                            <VideoSection videos={bestVideos.slice(0, 3)}  />
                            <VideoSection videos={bestVideos.slice(4, 6)}  />
                        </View>
                        <View style={styles.thumbnailPaddingTop2}>
                            <TouchableOpacity style={styles.titleView} onPress={goToAverageVideos}>
                                <SectionTitle text={'Good Videos'} videos={averageVideos} />
                            </TouchableOpacity>
                            <VideoSection videos={averageVideos.slice(0, 3)}  />
                            <VideoSection videos={averageVideos.slice(4, 6)}  />
                        </View>
                        <View style={styles.thumbnailPaddingTop2}>
                            <TouchableOpacity style={styles.titleView} onPress={goToWorstVideos}>
                                <SectionTitle text={'Not-So-Great Videos'} videos={worstVideos} />
                            </TouchableOpacity>
                            <VideoSection videos={worstVideos.slice(0, 3)}  />
                            <VideoSection videos={worstVideos.slice(4, 6)}  />
                        </View>
                    </View>
                    <TouchableOpacity onPress={openSettings} style={styles.settingsContainer}>
                        <MaterialIcons name="menu" color={colors.secondaryWhite} size={30}/>  
                    </TouchableOpacity>
                    <SettingsPopup visible={settingsVisible} setVisible={setSettingsVisible} />
                </ScrollView>
        );
    } else {
        return (
            <View style={styles.activityView}>
              <ActivityIndicator size="small" color="#eee" />
            </View>
        )      
    }
}