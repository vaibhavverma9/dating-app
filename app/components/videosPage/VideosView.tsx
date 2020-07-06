import React, { useEffect, useState, useContext } from 'react';
import { View, Image, Text, TouchableOpacity, ImageBackground, ActivityIndicator, StyleSheet, RefreshControl } from 'react-native';
import * as Segment from 'expo-analytics-segment';
import { Dimensions } from "react-native"; 
import { GET_LAST_DAY_VIDEOS, INSERT_INIT_VIDEO, UPDATE_LAST_UPLOADED, ON_VIDEO_UPDATED, INSERT_USER, GET_USERS_BY_UID, GET_PAST_VIDEOS, DELETE_VIDEO_PASSTHROUGH_ID, client } from '../../utils/graphql/GraphqlClient';
import { UserIdContext } from '../../utils/context/UserIdContext'
import { ScrollView } from 'react-native-gesture-handler';
import { useMutation, useSubscription, useLazyQuery } from '@apollo/client';
import FullPageVideos from '../modals/FullPageVideos';
import { _retrieveUserId, _storeUserId, _retrieveDoormanUid, _storeDoormanUid, _retrieveName, _retrieveBio } from '../../utils/asyncStorage'; 
import axios from 'axios';
import { Ionicons, MaterialIcons, Entypo, SimpleLineIcons } from '@expo/vector-icons'
import { colors } from '../../styles/colors'; 
import SettingsPopup from '../modals/SettingsPopup';
import * as UpChunk from '@mux/upchunk';
import * as FileSystem from 'expo-file-system';
import RNFetchBlob from 'rn-fetch-blob'

export default function VideosView(props) {

    const [lastDayVideos, setLastDayVideos] = useState([]); 
    const [storedLastDayVideos, setStoredLastDayVideos] = useState([]);
    const [pastVideos, setPastVideos] = useState([]); 
    const [userId, setUserId] = useContext(UserIdContext);
    const [insertInitVideo, { insertInitVideoData }] = useMutation(INSERT_INIT_VIDEO); 
    const [updateLastUploaded, { updateLastUploadedData }] = useMutation(UPDATE_LAST_UPLOADED);
    const [deleteVideoPassthrough, { deleteVideoPassthroughData }] = useMutation(DELETE_VIDEO_PASSTHROUGH_ID); 

    const [uploadedVideos, setUploadedVideos] = useState([]); 
    const [name, setName] = useState(''); 
    const [bio, setBio] = useState(''); 
    const [initialized, setInitialized] = useState(false); 
    const [settingsVisible, setSettingsVisible] = useState(false); 
    const [timedOut, setTimedOut] = useState(false);

    const [bestVideos, setBestVideos] = useState([]);
    const [averageVideos, setAverageVideos] = useState([]);
    const [worstVideos, setWorstVideos] = useState([]);

    let yesterday = new Date(Date.now() - 86400000); 
    const thumbnailPadding = '0.2%'; 
    const length = 110; 

    const [getStoredLastDayVideos, { data: storedLastDayVideosData }] = useLazyQuery(GET_LAST_DAY_VIDEOS, 
    { 
        onCompleted: (storedLastDayVideosData) => { setStoredLastDayVideos(storedLastDayVideosData.videos) } 
    }); 

    const [getPastVideos, { data: getPastVideosData }] = useLazyQuery(GET_PAST_VIDEOS, 
    { 
        onCompleted: (getPastVideosData) => { initPastVideos(getPastVideosData.videos) } 
    }); 


    function wait(timeout) {
        return new Promise(resolve => {
          setTimeout(resolve, timeout);
        });
    }

    const [refreshing, setRefreshing] = React.useState(false);

    const onRefresh = React.useCallback(() => {
        setRefreshing(true);

        getStoredLastDayVideos({variables: { userId, yesterday}}); 
        getPastVideos({variables: { userId, yesterday}}); 

        wait(2000).then(() => setRefreshing(false));
    }, [refreshing]);

    useEffect(() => {
        Segment.screen('Videos'); 
        getStoredLastDayVideos({variables: { userId, yesterday}}); 
        getPastVideos({variables: { userId, yesterday}}); 
        initProfile(); 
        setTimeout(() => { setTimedOut(true) }, 3000); 
    }, [])

    function reload(){
        setTimedOut(false);   
        getStoredLastDayVideos({variables: { userId, yesterday}}); 
        getPastVideos({variables: { userId, yesterday}}); 
        initProfile(); 
        setTimeout(() => { setTimedOut(true) }, 3000);   
    }

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

    function initPastVideos(videoData){
        setBestVideos(videoData.filter(video => { return video.rank == 1 }));
        setAverageVideos(videoData.filter(video => { return video.rank == 2 }));
        setWorstVideos(videoData.filter(video => { return video.rank == 3 }));
        setInitialized(true); 
    }

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
                    if(status == "preparing" || status == "ready"){ 
                        const tempUploadedVideos = uploadedVideos.map(uploadedVideo => {
                            if(uploadedVideo.passthroughId == passthroughId && uploadedVideo.status != "errored"){
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
        const questionId = uploadingVideo.questionId; 
        const thumbnailUri = uploadingVideo.thumbnailUri;
        const videoUri = uploadingVideo.videoUri; 
        const passthroughId = uploadingVideo.passthroughId; 
        const id = uploadingVideo.id; 

        async function reuploadVideo(){

            const uploadedVideosFiltered = uploadedVideos.filter(video => { return video.id !== id })
            deleteVideoPassthrough({ variables: { passthroughId: passthroughId }}); 

            const newPassthroughId = Math.floor(Math.random() * 1000000000) + 1; 

            const params = {
                questionText: questionText,
                questionId: questionId, 
                thumbnailUri: thumbnailUri,
                videoUri: videoUri,
                passthroughId:  newPassthroughId.toString(),
                status: 'waiting',
                type: 'uploadedVideo',
                id: newPassthroughId, 
                videoId: null
            }; 

            setUploadedVideos([params, ...uploadedVideosFiltered]);
            postVideo(params);
        };


        if (status == "ready" || status == "preparing"){
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
        } else if(status == "errored") {
            return (
                <TouchableOpacity onPress={reuploadVideo} style={styles.thumbnailPaddingStyle}>
                    <ImageBackground
                        style={styles.thumbnailDimensions}
                        source={{uri: thumbnailUri}}
                    >
                        <View style={styles.activityView}>
                            <Ionicons name="ios-refresh" color={"#eee"} size={40} />
                            <Text style={{ color: '#eee', fontSize: 16 }}>Upload failed</Text>
                        </View>
                    </ImageBackground>
                    <VideoSubscription passthroughId={passthroughId} />
                </TouchableOpacity>

            )
        } else {
            return (
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

    async function removeVideo(videoId){
        setUploadedVideos(uploadedVideos.filter(video => { return video.id !== videoId })); 
        setStoredLastDayVideos(storedLastDayVideos.filter(video => { return video.id !== videoId }));
        setBestVideos(bestVideos.filter(video => { return video.id !== videoId }));
        setAverageVideos(averageVideos.filter(video => { return video.id !== videoId }));
        setWorstVideos(worstVideos.filter(video => { return video.id !== videoId }));
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
        const total = video.likes + video.dislikes; 

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
                                <Text style={styles.videoViewsText}>{total}</Text>
                            </View>
                        </ImageBackground>
                    </TouchableOpacity>
                    <FullPageVideos
                        visible={fullVideoVisible}
                        setVisible={setFullVideoVisible}
                        source={'https://stream.mux.com/' + muxPlaybackId + '.m3u8'}
                        questionText={questionText}
                        likes={video.likes}
                        views={total}
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
                reject(new TypeError('Network request failed'));
            };
            xhr.responseType = 'blob'; 
            xhr.open('GET', videoUri, true); 
            xhr.send(null); 
        });

        let res = await axios({
            method: 'post', 
            url: 'https://gentle-brook-91508.herokuapp.com/muxAuthenticatedUrl',
            data: { "passthroughId" : passthroughId }
          }); 

        const authenticatedUrl = res.data.url;
        const status = res.data.status;

        await insertInitVideo({ variables: { questionId: questionId, userId: userId, passthroughId: passthroughId, status: status }})
        .then(response => { console.log(response) })
        .catch(error => {console.error(error) }); 

        try {
            let res3 = await fetch(authenticatedUrl, {
                method: 'PUT', 
                body: blob, 
                headers: { "content-type": blob.type}
            });        
        } catch(error){
            console.error(error); 
        }

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
        } else {
            return (
                <Text style={styles.sectionSubtitles}>Add videos to stay on top of the feed</Text>
            )
        }
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

    function BestVideoSubtitle(){
        if(bestVideos.length > 0){
            return (
                <Text style={styles.sectionSubtitles}>We show your best videos to each user.</Text>
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
        tapToAddName: { fontWeight: '600', fontSize: 20, color: colors.primaryWhite },
        title: { fontWeight: 'bold', fontSize: 20, color: colors.primaryWhite },
        namePadding: { padding: 15},
        bioPadding: { paddingBottom: 25},
        bio: { fontWeight: '200', fontSize: 14, color: colors.primaryWhite },
        editProfileButtonStyle: {  borderWidth: 1, borderRadius: 3, height: 30, width: 130, justifyContent: 'center', alignItems: 'center', borderColor: colors.primaryWhite},
        editProfileText: { fontSize: 16, fontWeight: '200', color: colors.primaryWhite  },
        explanationPadding: { paddingHorizontal: 40, paddingVertical: 30 },
        titleView: { flexDirection: 'row', alignItems: 'flex-end'},
        scrollViewStyle: { flex: 1, backgroundColor: colors.primaryBlack },
        viewFlexStart: { justifyContent: 'flex-start'},
        headerContainer: { alignItems: 'center'},
        thumbnailPaddingTop: { paddingTop: 10, paddingLeft: thumbnailPadding },
        thumbnailPaddingTop2: { paddingTop: 30, paddingLeft: thumbnailPadding },
        settingsContainer: { position: "absolute", top: 50, right: 15},
        badInternetView: { backgroundColor: '#000', justifyContent: 'center', alignItems: 'center', flex: 1},
        reloadText: { color: '#eee', fontSize: 20, paddingHorizontal: 20, paddingVertical: 5}
      
    });

    if(initialized){
        return (
            <ScrollView 
                style={styles.scrollViewStyle}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={'#eee'} />}
            >
                <View style={styles.viewFlexStart}>
                    <View style={styles.headerContainer}>
                        <Name />
                        <Bio /> 
                        <EditProfileButton /> 
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
                        <VideoSection videos={lastDayVideos.slice(3, 6)}  />
                    </View>
                    <View style={styles.thumbnailPaddingTop2}>
                        <TouchableOpacity style={styles.titleView} onPress={goToBestVideos}>
                            <SectionTitle text={'Best Videos'} videos={bestVideos} />
                        </TouchableOpacity>
                        <BestVideoSubtitle />
                        <VideoSection videos={bestVideos.slice(0, 3)}  />
                        <VideoSection videos={bestVideos.slice(3, 6)}  />
                    </View>
                    <View style={styles.thumbnailPaddingTop2}>
                        <TouchableOpacity style={styles.titleView} onPress={goToAverageVideos}>
                            <SectionTitle text={'Good Videos'} videos={averageVideos} />
                        </TouchableOpacity>
                        <VideoSection videos={averageVideos.slice(0, 3)}  />
                        <VideoSection videos={averageVideos.slice(3, 6)}  />
                    </View>
                    <View style={styles.thumbnailPaddingTop2}>
                        <TouchableOpacity style={styles.titleView} onPress={goToWorstVideos}>
                            <SectionTitle text={'Not-So-Great Videos'} videos={worstVideos} />
                        </TouchableOpacity>
                        <VideoSection videos={worstVideos.slice(0, 3)}  />
                        <VideoSection videos={worstVideos.slice(3, 6)}  />
                    </View>
                </View>
                <TouchableOpacity onPress={openSettings} style={styles.settingsContainer}>
                    <MaterialIcons name="menu" color={colors.secondaryWhite} size={30}/>  
                </TouchableOpacity>
                <SettingsPopup visible={settingsVisible} setVisible={setSettingsVisible} />
            </ScrollView>
        );
    } else {
        if(!timedOut){
            return (
                <View style={styles.activityView}>
                  <ActivityIndicator size="small" color="#eee" />
                </View>
            )          
        } else {
            return (
                <View style={styles.badInternetView}>
                    <View style={{ borderWidth: 1, borderColor: '#eee', justifyContent: 'center', borderRadius: 5}}>
                        <Text style={styles.reloadText}>We're losing you. Please check your network connection.</Text>          
                    </View>
                </View>
              )
        }
    }
}