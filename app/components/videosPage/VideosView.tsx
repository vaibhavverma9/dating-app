import React, { useEffect, useState, useContext } from 'react';
import { View, Image, Text, TouchableOpacity, ImageBackground, ActivityIndicator, StyleSheet, RefreshControl } from 'react-native';
import * as Segment from 'expo-analytics-segment';
import { Dimensions } from "react-native"; 
import { GET_LAST_DAY_VIDEOS, INSERT_INIT_VIDEO, UPDATE_LAST_UPLOADED, ON_VIDEO_UPDATED, UPDATE_PROFILE_URL, GET_PAST_VIDEOS, DELETE_VIDEO_PASSTHROUGH_ID, UPDATE_VIDEO_ERRORED, GET_PROFILE_INFO } from '../../utils/graphql/GraphqlClient';
import { UserIdContext } from '../../utils/context/UserIdContext'
import { ScrollView } from 'react-native-gesture-handler';
import { useMutation, useSubscription, useLazyQuery } from '@apollo/client';
import FullPageVideos from '../modals/FullPageVideos';
import { _retrieveName, _retrieveBio, _retrieveProfileUrl, _storeProfileUrl } from '../../utils/asyncStorage'; 
import axios from 'axios';
import { Ionicons, MaterialIcons, Entypo, SimpleLineIcons, MaterialCommunityIcons } from '@expo/vector-icons'
import { colors } from '../../styles/colors'; 
import SettingsPopup from '../modals/SettingsPopup';
import * as Sentry from 'sentry-expo'; 
import Constants from 'expo-constants';
import { useDoormanUser } from 'react-native-doorman'
import { _clearDoormanUid, _clearOnboarded, _clearUserId, _clearBio, _clearName } from '../../utils/asyncStorage'; 
import * as Permissions from 'expo-permissions';
import * as ImagePicker from 'expo-image-picker';
import firebaseApp from '../../utils/firebase/fbConfig';
import * as FileSystem from 'expo-file-system';

export default function VideosView(props) {

    const [lastDayVideos, setLastDayVideos] = useState([]); 
    const [storedLastDayVideos, setStoredLastDayVideos] = useState([]);
    const [userId, setUserId] = useContext(UserIdContext);
    const [insertInitVideo, { insertInitVideoData }] = useMutation(INSERT_INIT_VIDEO); 
    const [updateLastUploaded, { updateLastUploadedData }] = useMutation(UPDATE_LAST_UPLOADED);
    const [deleteVideoPassthrough, { deleteVideoPassthroughData }] = useMutation(DELETE_VIDEO_PASSTHROUGH_ID); 
    const [updateVideoErrored, { updateVideoErroredData }] = useMutation(UPDATE_VIDEO_ERRORED); 
    const [updateProfileUrl, { updateProfileUrlData }] = useMutation(UPDATE_PROFILE_URL);

    const [uploadedVideos, setUploadedVideos] = useState([]); 
    const [name, setName] = useState(''); 
    const [imageUri, setImageUri] = useState('');
    const [bio, setBio] = useState(''); 
    const [initialized, setInitialized] = useState(false); 
    const [settingsVisible, setSettingsVisible] = useState(false); 
    const [timedOut, setTimedOut] = useState(false);

    const [bestVideos, setBestVideos] = useState([]);
    const [averageVideos, setAverageVideos] = useState([]);
    const [worstVideos, setWorstVideos] = useState([]);

    const yesterday = new Date(Date.now() - 86400000); 
    const thumbnailPadding = '0.2%'; 
    const length = 110; 

    const { signOut } = useDoormanUser();

    const pressSignOut = async () => {
    
        await _clearDoormanUid();
        await _clearOnboarded(); 
        await _clearUserId();  
        await _clearBio();
        await _clearName(); 
        signOut();
    }


    const [getStoredLastDayVideos, { data: storedLastDayVideosData }] = useLazyQuery(GET_LAST_DAY_VIDEOS, 
    { 
        onCompleted: (storedLastDayVideosData) => { setStoredLastDayVideos(storedLastDayVideosData.videos) } 
    }); 

    const [getPastVideos, { data: getPastVideosData }] = useLazyQuery(GET_PAST_VIDEOS, 
    { 
        onCompleted: (getPastVideosData) => { initPastVideos(getPastVideosData.videos) } 
    }); 

    const [getProfileInfo, { data: getProfileInfoData }] = useLazyQuery(GET_PROFILE_INFO, 
    { 
        onCompleted: (getProfileInfoData) => { 
        
            const name = getProfileInfoData.users[0].firstName;
            setName(name);
            const profileUrl = getProfileInfoData.users[0].profileUrl;
            // const likeCount = getProfileInfoData.users[0].likesByLikedId_aggregate.aggregate.count;
            // const videoCount = getProfileInfoData.users[0].userVideos_aggregate.aggregate.count;
            if(profileUrl != null){
                setImageUri(profileUrl);     
            }
        } 
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
        initProfileInfo(); 
        resetName(); 
        setTimeout(() => { setTimedOut(true) }, 3000); 
    }, [])

    useEffect(() => {
        props.navigation.addListener('focus', () => {
            resetName(); 
        });  
      }, [props.navigation]);

    async function initProfileInfo(){
        const profileUrl = await _retrieveProfileUrl(); 
        if(profileUrl != ''){
            setImageUri(profileUrl); 
        }
        getProfileInfo({variables: { userId }}); 
    }

    async function resetName(){
        const name = await _retrieveName(); 
        setName(name);
    }

    // changes in routes
    useEffect(() => {
        const params = props.route.params;
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
        props.navigation.navigate('Add Video');
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
                    const videoData = videos[0];
                    const status = videoData.status;
                    if(status == "preparing" || status == "ready"){ 
                        const tempUploadedVideos = uploadedVideos.map(uploadedVideo => {
                            if(uploadedVideo.passthroughId == passthroughId && uploadedVideo.status != "errored"){
                                return {...uploadedVideo, status: status, id: videoData.id}
                            } else { return uploadedVideo }
                        })
                        setUploadedVideos(tempUploadedVideos); 
                    } else if (status == "errored"){
                        const tempUploadedVideos = uploadedVideos.map(uploadedVideo => {
                            if(uploadedVideo.passthroughId == passthroughId){
                                return {...uploadedVideo, status: status, id: videoData.id}
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

        // console.log("checking blob", blob); 

        // const video = {
        //     uri: videoUri,
        //     type: 'video'
        // }

        // const data = new FormData(); 
        // data.append("name", "avatar");
        // data.append("fileData", video);
        // data.append("passthroughId", passthroughId); 

        // const config = {
        //     method: 'POST',
        //     headers: {
        //         'Accept': 'application/json',
        //         'Content-Type': 'multipart/form-data',
        //     },
        //     body: data,
        // };

        // const response = await fetch("https://gentle-brook-91508.herokuapp.com/" + "muxUpload", config);

        // console.log(response); 

        const res = await axios({ 
            method: 'post', 
            url: 'https://gentle-brook-91508.herokuapp.com/muxAuthenticatedUrl',
            data: { "passthroughId" : passthroughId }
          }); 

        const authenticatedUrl = res.data.url;
        const status = res.data.status;

        // await insertInitVideo({ variables: { questionId: questionId, userId: userId, passthroughId: passthroughId, status: status }})
        // .then()
        // .catch(error => {
        //     Sentry.captureException(error);
        // }); 


        // const response = await axios.post("https://gentle-brook-91508.herokuapp.com/muxUpload", {
        //     blob: blob, 
        //     passthroughId: passthroughId 
        // });

        // console.log(response);

        FileSystem.uploadAsync(authenticatedUrl, videoUri, {
            headers: { "content-type": 'video' },
            httpMethod: 'PUT'
        });

        // try {
        //     await fetch(authenticatedUrl, {
        //         method: 'PUT', 
        //         body: blob, 
        //         headers: { "content-type": blob.type}
        //     });        
        // } catch(error){
        //     console.log(error); 
            // Sentry.captureException(error);
            // const tempUploadedVideos = uploadedVideos.map(uploadedVideo => {
            //     if(uploadedVideo.passthroughId == passthroughId){
            //         return {...uploadedVideo, status: "errored"}
            //     } else { return uploadedVideo }
            // })
            // setUploadedVideos(tempUploadedVideos); 
        // }

        // blob.close();}

        const timestamp = new Date(); 
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
        tapToAddName: { fontWeight: '400', fontSize: 16, color: colors.primaryWhite },
        title: { fontWeight: '500', fontSize: 20, color: colors.primaryWhite },
        namePadding: { paddingTop: 10 },
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
        settingsContainer: { position: "absolute", top: 10, right: 15},
        badInternetView: { backgroundColor: '#000', justifyContent: 'center', alignItems: 'center', flex: 1},
        reloadText: { color: '#eee', fontSize: 20, paddingHorizontal: 20, paddingVertical: 5}
      
    });

    function Settings(){
        if('ios' in Constants.platform){
            return(
                <TouchableOpacity onPress={openSettings} style={styles.settingsContainer}>
                    <MaterialIcons name="menu" color={colors.secondaryWhite} size={30}/>  
                </TouchableOpacity>
            )
        } else {
            return(
                <TouchableOpacity onPress={pressSignOut} style={styles.settingsContainer}>
                    <MaterialCommunityIcons name="location-exit" size={30} color={colors.secondaryWhite}/>
                </TouchableOpacity>
            )            
        }
    }

    function ProfilePicture(){
        if(imageUri != ''){
            return(
                <Image
                    style={{ height: 120, width: 120, borderRadius: 60}}
                    source={{ uri: imageUri}}
                />
            )
        } else {
            return (
                    <View
                        style={{ height: 120, width: 120, borderRadius: 60,  borderColor: colors.primaryPurple, borderWidth: 1, justifyContent: 'center', alignItems: 'center' }}
                    >
                        <Ionicons name="md-person" size={60} color={colors.primaryPurple} />
                    </View>
            )    
        }
    }

    const getPermissionAsync = async () => {
        const { status } = await Permissions.askAsync(Permissions.CAMERA_ROLL);
        if (status !== 'granted') {
        alert('Sorry, we need camera roll permissions to make this work!');
        }
    };


    const pickProfilePicture = async () => {
        await getPermissionAsync(); 
        try {
            const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.All,
            allowsEditing: true,
            aspect: [4, 3],
            quality: 1,
            });
            if (!result.cancelled && result.type == 'video') {
                alert('Sorry, please upload an image!');      
            }
            if (!result.cancelled && result.type == 'image') {
                setImageUri(result.uri);
                uploadImage(result.uri); 
            }
        } catch (error) {}
    }

    const uploadImage = async(uri) => {
        const response = await fetch(uri);
        const blob = await response.blob();
        const randomId = Math.floor(Math.random() * 1000) + 1; 
        const imageName = userId + '-' + randomId;
        var ref = firebaseApp.storage().ref().child('profilePictures/' + imageName);
        await ref.put(blob);
        const profileUrl = await ref.getDownloadURL(); 
        updateProfileUrl({ variables: { userId, profileUrl }})
        _storeProfileUrl(profileUrl); 

        const profileIds = [{
            id: userId.toString(), 
            name: name,
            image: profileUrl
        }]; 

        try {
            const response = await axios.post("https://gentle-brook-91508.herokuapp.com/updateUsersStream", {
              likerIds: profileIds
            });
        } catch (err) {
            console.log(err); 
            return;
        }
    }


    if(initialized){
        return (
            <ScrollView 
                style={styles.scrollViewStyle}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={'#eee'} />}
            >
                <View style={styles.viewFlexStart}>
                    <View style={{ paddingLeft: '5%', paddingTop: '5%', width: 140, alignItems: 'center'}}>
                        <TouchableOpacity onPress={pickProfilePicture}>
                            <ProfilePicture />
                        </TouchableOpacity>
                        <Name />
                    </View>



                    <View style={styles.headerContainer}>
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
                <Settings />
                <SettingsPopup visible={settingsVisible} setVisible={setSettingsVisible} />
            </ScrollView>
        );
    } else {
        if(timedOut){
            return (
                <View style={styles.badInternetView}>
                    <View style={{ borderWidth: 1, borderColor: '#eee', justifyContent: 'center', borderRadius: 5}}>
                        <Text style={styles.reloadText}>We're losing you. Please check your network connection.</Text>          
                    </View>
                </View>
              )
        } else {
            return (
                <View style={styles.activityView}>
                  <ActivityIndicator size="small" color="#eee" />
                </View>
            )     
        }
    }
    
}