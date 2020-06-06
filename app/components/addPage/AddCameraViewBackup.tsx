import React, { useState, useEffect, useRef } from 'react'; 
import { View, Text, TouchableOpacity, ActivityIndicator } from 'react-native'; 
import { Camera } from 'expo-camera';
import { BlurView } from 'expo-blur';
import { fullPageVideoStyles } from '../../styles/fullPageVideoStyles';
import { Ionicons, MaterialIcons, Feather } from '@expo/vector-icons'
import * as Segment from 'expo-analytics-segment';
import * as ImagePicker from 'expo-image-picker';
import * as Permissions from 'expo-permissions';
import { Video } from 'expo-av'; 
import { addStyles } from '../../styles/addStyles';
import { GET_QUESTIONS, client } from '../../utils/graphql/GraphqlClient';
import { _retrieveUserId, _storeUserId, _retrieveDoormanUid, _storeDoormanUid } from '../../utils/asyncStorage'; 
import * as VideoThumbnails from 'expo-video-thumbnails'; 
import * as Linking from 'expo-linking';
import Constants from 'expo-constants';
import { colors } from '../../styles/colors';
import ViewAllPopup from '../modals/ViewAllPopup';

export default function AddCameraView(props) {

    const [questionData, setQuestionData] = useState([]);
    const [hasCameraPermission, setHasCameraPermission] = useState(null);
    const [hasAudioPermission, setHasAudioPermission] = useState(null);
    const [type, setType] = useState(Camera.Constants.Type.back);
    const [index, setIndex] = useState(0);
    const [videoUri, setVideoUri] = useState('');
    const [thumbnailUri, setThumbnailUri] = useState('');
    const [recording, setRecording] = useState(false); 
    const [shouldPlay, setShouldPlay] = useState(true);
    const [initialized, setInitialized] = useState(false); 
    const [viewAllVisible, setViewAllVisible] = useState(false); 

    let camera = useRef(null);  

    useEffect(() => {
        getCameraPermission();
        getAudioPermission(); 
        getQuestions();
        Segment.screen('Add'); 
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
        });

        props.navigation.addListener('focus', () => {
            setShouldPlay(true); 
            if(hasCameraPermission === false){
                getCameraPermission();
            } 
            if(hasAudioPermission === false){
                getAudioPermission(); 
            }

        });  
    }, [props.navigation])

    function getQuestions(){
        const date = new Date(); 
        const day = date.getDate(); 
        
        client.query({ query: GET_QUESTIONS})
        .then(response => {
            setQuestionData(response.data.questions);             
            setIndex(Math.floor(day / 31 * response.data.questions.length)); 
            setInitialized(true); 
        })
    }

    // tapping back arrow 
    const goBack = () => {
        const rem = (index - 1) % questionData.length;
        if (rem < 0) { setIndex(rem + questionData.length)}
        else { setIndex(rem) }``
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
            let result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.All,
            allowsEditing: true,
            aspect: [4, 3],
            quality: 1,
            });
            if (!result.cancelled && result.type == 'video') {
                setVideoUri(result.uri);
                const { uri, width, height } = await VideoThumbnails.getThumbnailAsync(result.uri, { time: 0 }); 
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
            // let recording = await camera.current.recordAsync();
            // setVideoUri(recording.uri); 
            // const { uri, width, height } = await VideoThumbnails.getThumbnailAsync(recording.uri, { time: 0 }); 
            // setThumbnailUri(uri);           
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
                <View style={{ alignSelf: 'flex-end', alignItems: 'center', padding: 20, flexDirection: 'row', justifyContent: 'center', width: '100%'}}>
                    <MaterialIcons name="fiber-manual-record" onPress={() => stopRecording()} color={"#FF0000"} size={60}/>  
                </View>
            )
        } else {
            return (
                <View style={{ alignSelf: 'flex-end', alignItems: 'center', padding: 20, flexDirection: 'row', justifyContent: 'space-between', width: '100%'}}>
                    <TouchableOpacity onPress={pickVideo} style={{ alignItems: 'center'}}>
                        <MaterialIcons name="video-library" color={"#eee"} size={40}/> 
                        <Text style={{ color: '#eee', fontSize: 12}}>Library</Text>
                    </TouchableOpacity>
                    <MaterialIcons name="fiber-manual-record" onPress={() => record()} color={"#eee"} size={60}/>  
                    <TouchableOpacity onPress={setCameraType} style={{ alignItems: 'center'}}>
                        <MaterialIcons name="switch-camera" color={"#eee"} size={40}/>                     
                        <Text style={{ color: '#eee', fontSize: 12}}>Reverse</Text>
                    </TouchableOpacity>
                </View>
                )
        }
    }

    function sendVideo() {
        const passthroughId = Math.floor(Math.random() * 1000000000) + 1; 
        props.navigation.navigate('Videos', { screen: 'VideosView', params: {videoUri: videoUri, thumbnailUri: thumbnailUri, questionText: questionData[index].questionText, questionId: questionData[index].id, status: 'waiting', passthroughId: passthroughId.toString(), type: 'uploadedVideo', id: passthroughId }});
        setVideoUri(''); 
        setThumbnailUri(''); 
    }

    function viewAll(){
        setViewAllVisible(true); 
    }

    function EnableCameraButton(){
        if(hasCameraPermission === null){
            return(
                <TouchableOpacity onPress={askCameraPermission} style={{ padding: 30}}>
                    <Text style={{ color: '#1da1f2', fontSize: 16 }}>Enable Camera Access</Text>
                </TouchableOpacity>
            )
        } else if (hasCameraPermission === false){
            return(
                <TouchableOpacity onPress={askCameraPermission} style={{ padding: 30}}>
                    <Text style={{ color: '#1da1f2', fontSize: 16 }}>Enable Camera Access</Text>
                </TouchableOpacity>
            )
        } else {
            return(
                <View style={{ padding: 30}}>
                    <Text style={{ color: '#696969', fontSize: 16 }}>Camera Access Enabled</Text>
                </View>
            )
        }
    }

    function EnableAudioButton(){
        if(hasAudioPermission === null){
            return(
                <TouchableOpacity onPress={askAudioPermission}>
                    <Text style={{ color: '#1da1f2', fontSize: 16  }}>Enable Microphone Access</Text>
                </TouchableOpacity>
            )
        } else if (hasAudioPermission === false){
            return(
                <TouchableOpacity onPress={askAudioPermission}>
                    <Text style={{ color: '#1da1f2', fontSize: 16 }}>Enable Microphone Access</Text>
                </TouchableOpacity>
            )
        } else {
            return(
                <View>
                    <Text style={{ color: '#696969', fontSize: 16 }}>Microphone Access Enabled</Text>
                </View>
            )
        }
    }

    function InAppRecording(){
        if('ios' in Constants.platform){
            return(
                <View style={{ flex: 1 }}>
                    <Camera 
                        style={{ flex: 1 }} 
                        type={type}
                        ref={camera}
                    >
                        <View
                        style={{
                            flex: 1,
                            backgroundColor: 'transparent',
                            flexDirection: 'row',
                        }}>
                            <RecordingIcon />
                        </View>
                    </Camera>
                    <BlurView tint="dark" intensity={20} style={fullPageVideoStyles.questionArrowsContainer}>
                        <TouchableOpacity onPress={viewAll}>
                            <Text style={{ color: '#eee'}}>View All</Text>
                        </TouchableOpacity>
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
        } 
        else {
            return (
                <View style={{ flex: 1, backgroundColor: colors.primaryBlack, justifyContent: 'center', alignItems: 'center' }}>
                    <BlurView tint="dark" intensity={20} style={fullPageVideoStyles.questionArrowsContainer}>
                        <TouchableOpacity onPress={viewAll}>
                            <Text style={{ color: '#eee'}}>View All</Text>
                        </TouchableOpacity>
                        <Question /> 
                    </BlurView>
                    <Text style={{ color: '#eee' }}>We do not yet support in-app recording on Android. </Text>
                    <Text style={{ color: '#eee' }}>Please record video separately and upload. </Text>
                    <TouchableOpacity onPress={pickVideo} style={{ paddingTop: 40, alignItems: 'center'}}>
                        <Feather name="upload" color={"#eee"} size={40}/> 
                        <Text style={{ color: '#eee', fontSize: 12}}>Upload</Text>
                    </TouchableOpacity>
                    <ViewAllPopup 
                        visible={viewAllVisible} 
                        setVisible={setViewAllVisible} 
                        questionData={questionData}
                        setIndex={setIndex}
                    />
                </View>
            )
        }
    }
    
    if(initialized){
        if (hasCameraPermission !== true || hasAudioPermission !== true) {
            return (
            <View style={{ backgroundColor: '#000', flex: 1, justifyContent: 'center', alignItems: 'center'}}>
                <Text style={{ color: '#eee', fontSize: 22, fontWeight: 'bold', paddingBottom: 20}}>Share on Reeltalk</Text>
                <Text style={{ color: '#eee', fontSize: 17, paddingBottom: 20}}>Enable access so you can start taking videos.</Text>
                <EnableCameraButton />
                <EnableAudioButton />
            </View>)
        }
    
        if(videoUri == ""){
            return(
                <InAppRecording />
            )
        } else {
            return (
                <View style={{ flex: 1 }}>
                    <Video
                    source={{uri: videoUri}}
                    rate={1.0}
                    volume={1.0}
                    isMuted={false}
                    resizeMode="cover"
                    usePoster={true}
                    shouldPlay={shouldPlay}
                    isLooping
                    style={{ width: '100%', height: '100%'}}
                    >
                    </Video>
                    <BlurView tint="dark" intensity={20} style={fullPageVideoStyles.questionArrowsContainer}>
                        <Question /> 
                    </BlurView>
                    <View style={addStyles.uploadContainer}>
                        <TouchableOpacity onPress={back} style={{ alignItems: 'center'}}>
                            <MaterialIcons name="backspace" color={"#eee"} size={40}/>     
                            <Text style={{ color: '#eee', fontSize: 15}}>Back</Text>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={sendVideo} style={{ alignItems: 'center'}}>
                            <MaterialIcons name="send" color={"#eee"} size={40}/>     
                            <Text style={{ color: '#eee', fontSize: 15}}>Post</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            )
        }
    } else {
        return (
            <View style={{ backgroundColor: '#000', justifyContent: 'center', alignItems: 'center', flex: 1}}>
              <ActivityIndicator size="small" color="#eee" />
            </View>
        )   
    }

    function Question () {
        if(questionData.length == 0){
            return(<Text style={{fontSize: 18,color: "#eee", padding: 15, textAlign: 'center'}}>Loading...</Text>)
        } else if(videoUri == ""){
            return(
                <View style={{ flexDirection: 'row', height:90, alignItems: 'center'}}>
                    <View style={{ paddingRight: 15}}>
                        <Ionicons name="ios-arrow-round-back" color={"#eee"} onPress={goBack} size={45} />
                    </View>
                    <Text style={{fontSize: 20, color: "#eee", textAlign: 'center', width: '75%'}}>
                        {questionData[index].questionText}
                    </Text>
                    <View style={{ paddingLeft: 15}}>
                        <Ionicons name="ios-arrow-round-forward"  color={"#eee"} onPress={goForward} size={45}/>
                    </View>
                </View>
            )    
        } else {
            return(
                <View style={{ flexDirection: 'row', height:90, alignItems: 'center'}}>
                    <Text style={{fontSize: 20, color: "#eee", textAlign: 'center', width: '75%'}}>
                        {questionData[index].questionText}
                    </Text>
                </View>
            )    
        }
    }
}