import React, { useState, useEffect, useContext, useRef } from 'react'; 
import { View, Text, TouchableOpacity, ActivityIndicator, StyleSheet, Alert } from 'react-native'; 
import { Camera } from 'expo-camera';
import { BlurView } from 'expo-blur';
import { fullPageVideoStyles } from '../../styles/fullPageVideoStyles';
import { Ionicons, MaterialIcons, Feather } from '@expo/vector-icons'
import * as Segment from 'expo-analytics-segment';
import * as ImagePicker from 'expo-image-picker';
import * as Permissions from 'expo-permissions';
import { Video } from 'expo-av'; 
import { addStyles } from '../../styles/addStyles';
import * as VideoThumbnails from 'expo-video-thumbnails'; 
import * as Linking from 'expo-linking';
import ViewAllPopup from '../modals/ViewAllPopup';
import { VideoCountContext } from '../../utils/context/VideoCountContext';
import Constants from 'expo-constants';
import * as MediaLibrary from 'expo-media-library';

export default function AuctionContents(props) {

    const [questionData, setQuestionData] = useState([]);
    const [hasCameraPermission, setHasCameraPermission] = useState(null);
    const [hasAudioPermission, setHasAudioPermission] = useState(null);
    const [type, setType] = useState(Camera.Constants.Type.back);
    const [index, setIndex] = useState(0);
    const [videoUri, setVideoUri] = useState('');
    const [fileName, setFileName] = useState(''); 
    const [thumbnailUri, setThumbnailUri] = useState('');
    const [recording, setRecording] = useState(false); 
    const [shouldPlay, setShouldPlay] = useState(true);
    const [initialized, setInitialized] = useState(false); 
    const [viewAllVisible, setViewAllVisible] = useState(false); 
    const [timedOut, setTimedOut] = useState(false);    
    const [videoCount, setVideoCount] = useContext(VideoCountContext); 
    const name = props.name; 

    useEffect(() => { 
        initQuestions(props.data); 
    }, [props.data])

    const camera = useRef(null);  

    useEffect(() => {
        getAudioPermission(); 
        getCameraPermission();
        Segment.screen('Add'); 
        setTimeout(() => { setTimedOut(true) }, 3000); 
    }, []);

    async function getCameraPermission(){
        const { status } = await Permissions.getAsync(Permissions.CAMERA);
        setHasCameraPermission(status === 'granted');
    };

    async function getAudioPermission(){
        const { status } = await Permissions.getAsync(Permissions.AUDIO_RECORDING);
        setHasAudioPermission(status === 'granted');
    };

    async function askCameraPermission(){
        const { status } = await Permissions.askAsync(Permissions.CAMERA);
        setHasCameraPermission(status === 'granted');
        if(status !== 'granted'){
            sendToSettings(); 
        }
    };

    async function askAudioPermission(){
        const { status } = await Permissions.askAsync(Permissions.AUDIO_RECORDING);
        setHasAudioPermission(status === 'granted');
        if(status !== 'granted'){
            sendToSettings(); 
        }
    };

    function sendToSettings(){
        Linking.openURL('app-settings://')
    }

    // changes in tabs will affect shouldPlay 
    useEffect(() => {
        props.navigation.addListener('blur', () => {
            setShouldPlay(false);
            setInitialized(false); 

            if ('android' in Constants.platform) {
                setTimedOut(false); 
                setTimeout(() => { setTimedOut(false) }, 3000); 
            }
        });

        props.navigation.addListener('focus', () => {
            if ('android' in Constants.platform) {
                setTimeout(() => { setTimedOut(true) }, 3000); 
            }
            setInitialized(true); 
            setShouldPlay(true); 
            if(hasCameraPermission === false){
                getCameraPermission();
            } 
            if(hasAudioPermission === false){
                getAudioPermission(); 
            }

        });  
    }, [props.navigation, hasAudioPermission, hasCameraPermission])
 
    function initQuestions(questionData){
        const date = new Date(); 
        const weekday = date.getDay(); 
        const filteredQuestions = questionData.questions.filter((question, index) => {
            if(index % 7 == weekday){
                return question; 
            } else if (props.firstVideo){
                return question; 
            }
        });
        setQuestionData(filteredQuestions); 
        setIndex(0); 
        setInitialized(true); 
    }

    // tapping back arrow 
    const goBack = () => {
        const rem = (index - 1) % questionData.length;
        if (rem < 0) { setIndex(rem + questionData.length)}
        else { setIndex(rem) }
    }

    // tapping forward arrow
    const goForward = () => {
        setIndex((index + 1) % questionData.length);
    }

    // Handle video selection 
    const pickVideo = async () => {
        Segment.track("Pick Video"); 
        await getPermissionAsync(); 
        try {
            const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.All,
                allowsEditing: true,
                aspect: [4, 3],
                quality: 1,
            });

            if (!result.cancelled && result.type == 'video') {
                setVideoUri(result.uri);
                const { uri } = await VideoThumbnails.getThumbnailAsync(result.uri, { time: 0 }); 
                setThumbnailUri(uri);           
            }
            if (!result.cancelled && result.type == 'image') {
                alert('Sorry, please upload a video!');
            }
        } catch (error) {}
    };

    function back(){
        setVideoUri("");
        setThumbnailUri("");           
    }

    function setCameraType(){
        setType(
            type === Camera.Constants.Type.back
            ? Camera.Constants.Type.front
            : Camera.Constants.Type.back
        );
    }

    const getPermissionAsync = async () => {
        const { status } = await Permissions.askAsync(Permissions.CAMERA_ROLL);
        if (status !== 'granted') {
        alert('Sorry, we need camera roll permissions to make this work!');
        }
    };

    async function record(){
        if(camera){
            setRecording(true); 
            const recording = await camera.current.recordAsync();
            setVideoUri(recording.uri); 
            const { uri } = await VideoThumbnails.getThumbnailAsync(recording.uri, { time: 0 }); 
            setThumbnailUri(uri);           
        }
    }

    async function stopRecording(){
        if(camera){
            setRecording(false); 
            camera.current.stopRecording(); 
        }
    }

    function RecordingIcon (){
        if(recording){            
            return (
                <View style={styles.recordingIconSingle}>
                    <MaterialIcons name="fiber-manual-record" onPress={stopRecording} color={"#FF0000"} size={60}/>  
                </View>
            )
        } else {
            return (
                <View style={styles.recordingIconMultiple}>
                    <TouchableOpacity onPress={pickVideo} style={styles.iconGroup}>
                        <MaterialIcons name="video-library" color={"#eee"} size={40}/> 
                        <Text style={styles.iconText}>Library</Text>
                    </TouchableOpacity>
                    <MaterialIcons name="fiber-manual-record" onPress={record} color={"#eee"} size={60}/>  
                    <TouchableOpacity onPress={setCameraType} style={styles.iconGroup}>
                        <MaterialIcons name="switch-camera" color={"#eee"} size={40}/>                     
                        <Text style={styles.iconText}>Reverse</Text>
                    </TouchableOpacity>
                </View>

                )
        }
    }

    async function sendVideo() {
        const passthroughId = Math.floor(Math.random() * 1000000000) + 1; 

        Segment.track("Upload Video"); 

        await props.navigation.navigate('Your Videos', { screen: 'VideosView', params: {videoUri: videoUri, thumbnailUri: thumbnailUri, questionText: questionData[index].questionText, questionId: questionData[index].id, status: 'waiting', passthroughId: passthroughId.toString(), type: 'uploadedVideo', id: passthroughId, videoId: null, auction: true, auctionedId: props.auctionedId, auctionedName: name }});
        setVideoUri(''); 
        setThumbnailUri(''); 
        setVideoCount(videoCount + 1);     
    }

    function save(){
        MediaLibrary.saveToLibraryAsync(videoUri);
        setSaved(true); 

        setTimeout(() => {
            setSaved(false); 
        }, 1000);
    }

    const [saved, setSaved] = useState(false); 

    function SavedIndicator(){
        if(saved){
          return (
            <View style={{ position: 'absolute', left: 0, right: 0, bottom: 0, height: '100%', alignItems: 'center', justifyContent: 'center'}}>
              <BlurView tint="dark" intensity={40} style={{ borderRadius: 5, width: 80, height: 50, alignItems: 'center', justifyContent: 'center'}}>
                <Text style={{ color: '#eee', fontWeight: '500'}}>Saved</Text>
              </BlurView>
            </View>
          )
        } else {
          return null; 
        }
      }

    function viewAll(){
        setViewAllVisible(true); 
    }


    function EnableCameraButton(){
        if(hasCameraPermission === null){
            return(
                <TouchableOpacity onPress={askCameraPermission} style={styles.cameraPermissionsPadding}>
                    <Text style={styles.permissionDisabled}>Enable Camera Access</Text>
                </TouchableOpacity>
            )
        } else if (hasCameraPermission === false){
            return(
                <TouchableOpacity onPress={askCameraPermission} style={styles.cameraPermissionsPadding}>
                    <Text style={styles.permissionDisabled}>Enable Camera Access</Text>
                </TouchableOpacity>
            )
        } else {
            return(
                <View style={styles.cameraPermissionsPadding}>
                    <Text style={styles.permissionEnabled}>Camera Access Enabled</Text>
                </View>
            )
        }
    }

    function EnableAudioButton(){
        if(hasAudioPermission === null){
            return(
                <TouchableOpacity onPress={askAudioPermission}>
                    <Text style={styles.permissionDisabled}>Enable Microphone Access</Text>
                </TouchableOpacity>
            )
        } else if (hasAudioPermission === false){
            return(
                <TouchableOpacity onPress={askAudioPermission}>
                    <Text style={styles.permissionDisabled}>Enable Microphone Access</Text>
                </TouchableOpacity>
            )
        } else {
            return(
                <View>
                    <Text style={styles.permissionEnabled}>Microphone Access Enabled</Text>
                </View>
            )
        }
    }

    const onLoad = (data) => {
        if(data.durationMillis > 30000){
            Alert.alert(
                "Your video is too long!", 
                "Videos must be less than 30 seconds long. Yours was " + Math.ceil(data.durationMillis / 1000) + " seconds :(", 
                [
                    {text: "Ok", onPress: () => {
                        setVideoUri(''); 
                        setThumbnailUri('');                        
                    }}
                ], 
                { cancelable: false }
            ); 
        } 
    }

    function returnHome(){
        props.setOnboardingStage('Home'); 
    }
    
    if(initialized){
        if (hasCameraPermission !== true || hasAudioPermission !== true) {
            return (
                <View style={styles.permissionsViewBackground}>
                    <Text style={styles.permissionsTitle}>Share on Realtalk</Text>
                    <Text style={styles.permissionsSubtitle}>Enable access so you can start taking videos.</Text>
                    <EnableCameraButton />
                    <EnableAudioButton />
                </View>
            )
        }
    
        if(videoUri == ""){
            return(
                <View style={styles.viewBackground}>
                    <Camera 
                        style={styles.cameraFlex} 
                        type={type}
                        ref={camera}
                    >
                        <View
                        style={styles.cameraView}>
                            <RecordingIcon />
                        </View>
                    </Camera>
                    <BlurView tint="dark" intensity={20} style={fullPageVideoStyles.questionArrowsContainer}>
                        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                            <TouchableOpacity onPress={returnHome}>
                                <Text style={styles.viewAllText}>Auctioning {name}</Text>
                            </TouchableOpacity>
                            <Text style={{ color: '#eee', fontSize: 5, paddingHorizontal: 5 }}>{'\u2B24'}</Text>
                            <TouchableOpacity onPress={viewAll}>
                                <Text style={styles.viewAllText}>View All Questions</Text>
                            </TouchableOpacity>
                        </View>
                        <Question /> 
                    </BlurView>
                    <ViewAllPopup 
                        visible={viewAllVisible} 
                        setVisible={setViewAllVisible} 
                        questionData={questionData}
                        setIndex={setIndex}
                    />
                </View>
            )
        } else {
            return (
                <View style={styles.viewBackground}>
                    <Video
                    source={{uri: videoUri}}
                    rate={1.0}
                    volume={1.0}
                    isMuted={false}
                    resizeMode={Video.RESIZE_MODE_STRETCH}
                    usePoster={true}
                    shouldPlay={shouldPlay}
                    isLooping
                    onLoad={onLoad}
                    style={styles.videoDimensions}
                    >
                    </Video>
                    <BlurView tint="dark" intensity={20} style={fullPageVideoStyles.questionArrowsContainer}>
                        <Question /> 
                    </BlurView>
                    <View style={addStyles.uploadContainer}>
                        <View style={{ flexDirection: 'row' }}>
                            <TouchableOpacity onPress={back} style={styles.iconGroup}>
                                <MaterialIcons name="backspace" color={"#eee"} size={40}/>     
                                <Text style={styles.iconTextRecorded}>Back</Text>
                            </TouchableOpacity>
                            <TouchableOpacity onPress={save} style={{ alignItems: 'center', paddingLeft: 20 }}>
                                <MaterialIcons name="file-download" color={"#eee"} size={40}/>     
                                <Text style={styles.iconTextRecorded}>Save</Text>
                            </TouchableOpacity>
                        </View>
                        <TouchableOpacity onPress={sendVideo} style={styles.iconGroup}>
                            <MaterialIcons name="send" color={"#eee"} size={40}/>     
                            <Text style={styles.iconTextRecorded}>Post</Text>
                        </TouchableOpacity>
                    </View>
                    <ViewAllPopup 
                        visible={viewAllVisible} 
                        setVisible={setViewAllVisible} 
                        questionData={questionData}
                        setIndex={setIndex}
                    />
                    <SavedIndicator />
                </View>
            )
        }
    } else {
        return (
            <View style={styles.activityView}>
              <ActivityIndicator size="small" color="#eee" />
            </View>
        )          
    }


    function Question () {
        if(questionData.length == 0){
            return(<Text style={styles.loadingText}>Loading...</Text>)
        } else if(videoUri == ""){
            return(
                <View style={styles.questionView}>
                    <View style={styles.backPadding}>
                        <Ionicons name="ios-arrow-round-back" color={"#eee"} onPress={goBack} size={45} />
                    </View>
                    <Text style={styles.questionText}>
                        {questionData[index].questionText}
                    </Text>
                    <View style={styles.forwardPadding}>
                        <Ionicons name="ios-arrow-round-forward"  color={"#eee"} onPress={goForward} size={45}/>
                    </View>
                </View>
            )    
        } else {
            return(
                <View style={styles.questionView}>
                    <Text style={styles.questionText}>
                        {questionData[index].questionText}
                    </Text>
                </View>
            )    
        }
    }
}

const styles = StyleSheet.create({
    recordingIconSingle: { 
        alignSelf: 'flex-end', 
        alignItems: 'center', 
        padding: 20, 
        flexDirection: 'row', 
        justifyContent: 'center', 
        width: '100%'
    },
    recordingIconMultiple: { 
        alignSelf: 'flex-end', 
        alignItems: 'center', 
        padding: 20, 
        flexDirection: 'row', 
        justifyContent: 'space-between', 
        width: '100%'
    },
    iconGroup: { 
        alignItems: 'center'
    },
    iconText: { 
        color: '#eee', 
        fontSize: 12
    },
    iconTextRecorded: { color: '#eee', fontSize: 15},
    permissionDisabled: { 
        color: '#1da1f2', 
        fontSize: 16 
    },
    permissionEnabled: { 
        color: '#696969', 
        fontSize: 16 
    },
    cameraPermissionsPadding: { padding: 30},
    permissionsViewBackground: { backgroundColor: '#000', flex: 1, justifyContent: 'center', alignItems: 'center'},
    permissionsTitle: { color: '#eee', fontSize: 22, fontWeight: 'bold', paddingBottom: 20},
    permissionsSubtitle: { color: '#eee', fontSize: 17, paddingBottom: 20},
    viewBackground: { flex: 1, backgroundColor: '#000' },
    cameraFlex: { flex: 1 },
    cameraView: {
        flex: 1,
        backgroundColor: 'transparent',
        flexDirection: 'row',
    },
    viewAllText: { color: '#eee'},
    videoDimensions: { width: '100%', height: '100%'},
    activityView: { backgroundColor: '#000', justifyContent: 'center', alignItems: 'center', flex: 1},
    loadingText: {fontSize: 18,color: "#eee", padding: 15, textAlign: 'center'},
    questionView: { flexDirection: 'row', height:90, alignItems: 'center'},
    questionText: {fontSize: 20, color: "#eee", textAlign: 'center', width: '75%'},
    backPadding: { paddingRight: 15},
    forwardPadding: { paddingLeft: 15},
    reloadText: { color: '#eee', fontSize: 20, paddingHorizontal: 20, paddingVertical: 5},
    badInternetView: { backgroundColor: '#000', justifyContent: 'center', alignItems: 'center', flex: 1}
});