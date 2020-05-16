import React, { useState, useEffect, useRef, useContext } from 'react'; 
import { View, Text, TouchableOpacity } from 'react-native'; 
import { Camera } from 'expo-camera';
import { BlurView } from 'expo-blur';
import { fullPageVideoStyles } from '../../styles/fullPageVideoStyles';
import { Ionicons, MaterialIcons } from '@expo/vector-icons'
import * as Segment from 'expo-analytics-segment';
import * as ImagePicker from 'expo-image-picker';
import * as Permissions from 'expo-permissions';
import { Video } from 'expo-av'; 
import { addStyles } from '../../styles/addStyles';
import { INSERT_USER, GET_QUESTIONS, client } from '../../utils/graphql/GraphqlClient';
import { useMutation } from '@apollo/client';
import { UserIdContext } from '../../utils/context/UserIdContext'
import { _retrieveUserId, _storeUserId, _retrieveDoormanUid, _storeDoormanUid } from '../../utils/asyncStorage'; 
import { useDoormanUser } from 'react-native-doorman'
import * as VideoThumbnails from 'expo-video-thumbnails'; 

export default function AddCameraView(props) {

    const [questionData, setQuestionData] = useState([]);
    const [questionCount, setQuestionCount] = useState(0); 
    const [hasCameraPermission, setHasCameraPermission] = useState(null);
    const [hasAudioPermission, setHasAudioPermission] = useState(null);
    const [type, setType] = useState(Camera.Constants.Type.back);
    const [index, setIndex] = useState(0);
    const [videoUri, setVideoUri] = useState('');
    const [thumbnailUri, setThumbnailUri] = useState('');
    const [recording, setRecording] = useState(false); 
    const [shouldPlay, setShouldPlay] = useState(true);

    const [userId, setUserId] = useContext(UserIdContext);
    const [insertUser, { insertUserData }] = useMutation(INSERT_USER); 
    const { uid, phoneNumber } = useDoormanUser();

    let camera = useRef(null);  

    useEffect(() => {
        (async () => {
            const { status } = await Permissions.askAsync(Permissions.CAMERA);
            setHasCameraPermission(status === 'granted');
        })();
        (async () => {
            const { status } = await Permissions.askAsync(Permissions.AUDIO_RECORDING);
            setHasAudioPermission(status === 'granted');
        })();
        getQuestions()

        Segment.screen('Add'); 
    }, []);

    // changes in tabs will affect shouldPlay 
    useEffect(() => {
        props.navigation.addListener('blur', () => {
            setShouldPlay(false);
        });

        props.navigation.addListener('focus', () => {
            setShouldPlay(true); 
        });  
    }, [props.navigation])

    function getQuestions(){
        client.query({ query: GET_QUESTIONS})
        .then(response => {
            setQuestionData(response.data.questions); 
            setQuestionCount(response.data.questions.length); 
            setIndex(Math.floor(Math.random() * response.data.questions.length)); 
        })
        .catch(error => console.log(error));
    }

    if (hasCameraPermission === null || hasAudioPermission === null) {
        return <View />;
    }
    if (hasCameraPermission === false || hasAudioPermission === false) {
        return <Text>No access to camera</Text>;
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

            console.log(result);
        } catch (error) {
            console.log(error);
        }
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
            let recording = await camera.current.recordAsync();
            setVideoUri(recording.uri); 
            const { uri, width, height } = await VideoThumbnails.getThumbnailAsync(recording.uri, { time: 0 }); 
            console.log("uri, width, height", uri, width, height); 
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
        props.navigation.navigate('Videos', { videoUri: videoUri, thumbnailUri: thumbnailUri, questionText: questionData[index].questionText, questionId: index, status: 'waiting', passthroughId: passthroughId.toString() });
        setVideoUri(''); 
        setThumbnailUri(''); 
    }
    
    if(videoUri == ""){
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
                        backgroundColor: 'transpare',
                        flexDirection: 'row',
                    }}>
                        <RecordingIcon />
                    </View>
                </Camera>
                <BlurView tint="dark" intensity={20} style={fullPageVideoStyles.questionArrowsContainer}>
                    <Question /> 
                </BlurView>
            </View>
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