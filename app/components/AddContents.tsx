import React, { useEffect, useState, useContext } from 'react';
import { Text, View, Button } from 'react-native';
import { Ionicons } from '@expo/vector-icons'
import { addStyles } from '../../styles/addStyles';
import * as Permissions from 'expo-permissions';
import * as ImagePicker from 'expo-image-picker';
import Constants from 'expo-constants';
import { Video } from 'expo-av'; 
import axios from 'axios';
import firebase from '../firebase/fbConfig';
import { INSERT_VIDEO, GET_USER_DEVICE_ID, INSERT_USER, GET_ASSET_STATUS, client } from '../graphql/GraphqlClient';
import { useMutation } from '@apollo/client';
import { request } from 'graphql-request'
import { UserIdContext, createUser } from '../context/UserIdContext'

export default function AddView (props) {

    const [questionData, setQuestionData] = useState([]);
    const [questionCount, setQuestionCount] = useState(0); 
    const [muxPlaybackId, setMuxPlaybackId] = useState(''); 
    const [index, setIndex] = useState(0);
    const [videoUri, setVideoUri] = useState('');
    const [shouldPlay, setShouldPlay] = useState(true); 
    const [uploadingVideo, setUploadingVideo] = useState(false); 
    const [assetReady, setAssetReady] = useState(false); 

    const [userId, setUserId] = useContext(UserIdContext);
    
    const createUser = () => {
        const deviceId = Constants.installationId;
      
        // Query if there are any users with deviceId
        client.query({ query: GET_USER_DEVICE_ID, variables: { deviceId: deviceId}})
        .then((response) => {
            if (response.data.users.length == 1){
                setUserId(response.data.users[0].id)
            }
        })
        .catch((error) => {
          console.log(error);
          return 0; 
        });
      }

    useEffect(() => {
        console.log(userId); 
        if(userId == 0){
            createUser(); 
        }
    }, [userId]); 

    // apollo client react hooks
    const [insertVideo, { insertVideoData }] = useMutation(INSERT_VIDEO);


    async function readyAsset (assetId: string, attempt: number) {
        console.log("asset attempt:", attempt)
        const res = await request('https://reel-talk-2.herokuapp.com/v1/graphql', GET_ASSET_STATUS, { muxAssetId: assetId });
        console.log(res); 
        const assetStatus = res.videos[0].status;
        if (assetStatus == 'video.asset.ready'){
            setAssetReady(true); 
            setUploadingVideo(false); 
        } else {
            if(attempt == 10){
                setAssetReady(false); 
                setUploadingVideo(false); 
             } else {
                setTimeout( () => { readyAsset(assetId, attempt + 1) }, 3000);
            }
        }
    }

    useEffect(() => {
        setQuestionData(props.data.questions);
        setQuestionCount(props.data.questions.length); 
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


    async function postData() {
        setUploadingVideo(true); 

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

        setVideoUri(''); 

        // Create a filename
        const random = Math.floor(Math.random() * 1000000000) + 1; 
        console.log("random", random)
        const childName = random.toString() + '.MOV'; 

        // Create a reference to Firebase storage and PUT the blob 
        const ref = firebase
        .storage()
        .ref()
        .child(childName);

        const snapshot = await ref.put(blob);
        blob.close(); 

        // Get download URL from Firebase storage 
        const downloadUrl = await snapshot.ref.getDownloadURL();
        console.log(downloadUrl); 

        // POST download URI to Mux 
        let res = await axios({
            method: 'post', 
            url: 'https://api.mux.com/video/v1/assets/',
            data: { "input": downloadUrl, "playback_policy": "public" },
            auth: {'username': 'eeadaed4-6e99-45e6-85e1-ba733723c8e6', 'password':'O7qEUCRdCzsbrK1XS2h0OK4N0v9YV1fnrQnCt2kWl/D2xSuJfczkVhJ5S4vQvJ3j5elQzPzJyk8'}});
        
        const muxPlaybackId = res.data.data.playback_ids[0].id; 
        const muxAssetId = res.data.data.id; 
        const questionId = questionData[index].id; 

        setMuxPlaybackId(muxPlaybackId);

        // Insert video to Hasura 
        await insertVideo({ variables: { downloadUrl: downloadUrl, muxAssetId: muxAssetId, muxPlaybackId: muxPlaybackId, questionId: questionId, userId: userId }});

        readyAsset(muxAssetId, 0);
    }

    // When Mux asset is ready, reset AddVideo page and navigate to Home page 
    useEffect(() => {
        if(assetReady){
            setAssetReady(false);     
            console.log(muxPlaybackId);
            props.navigation.navigate('Home', { recentUpload: Date.now(), muxPlaybackId: muxPlaybackId, questionText: questionData[index].questionText });
        }           
    }, [assetReady]); 

    // Get permission from user to use camera
    const getPermissionAsync = async () => {
        if (Constants.platform.ios) {
            const { status } = await Permissions.askAsync(Permissions.CAMERA_ROLL);
            if (status !== 'granted') {
            alert('Sorry, we need camera roll permissions to make this work!');
            }
        }
    };

    // Handle video selection 
    const pickVideo = async () => {
        getPermissionAsync(); 
        try {
            let result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.All,
            allowsEditing: true,
            aspect: [4, 3],
            quality: 1,
            });
            if (!result.cancelled && result.type == 'video') {
                setVideoUri(result.uri); 
            }
            if (!result.cancelled && result.type == 'image') {
                alert('Sorry, please upload a video!');
            }

            console.log(result);
        } catch (error) {
            console.log(error);
        }
    };

    // tapping back arrow 
    const goBack = () => {
        const rem = (index - 1) % questionCount;
        if (rem < 0) { setIndex(rem + questionCount)}
        else { setIndex(rem) }
    }

    // tapping forward arrow
    const goForward = () => {
        setIndex((index + 1) % questionCount);
    }

    return (
        <View style={addStyles.container}>
            <View style={addStyles.questionArrowContainer}>
                <Ionicons name="ios-arrow-round-back" onPress={goBack} size={45} />
                <View style={addStyles.questionContainer}>
                    <Question data={questionData} index={index} />
                </View>
                <Ionicons name="ios-arrow-round-forward" onPress={goForward} size={45}/>
            </View>
            <VideoUpload videoUri={videoUri} pickVideo={pickVideo} uploadVideo={postData} shouldPlay={shouldPlay} uploadingVideo={uploadingVideo} />
        </View>
    );
}

function VideoUpload (props) {

    if(props.videoUri == ''){
        if(props.uploadingVideo) {
            return (
            <View>
                <Text style={{textAlign: 'center', fontSize: 20}}>Uploading...</Text>
                <Button title="Answer another question!" onPress={props.pickVideo} />
            </View>)
        } else {
            return(
                <Button title="Pick video from camera roll" onPress={props.pickVideo} />
            )    
        }
    } else {
        return(
            <View>
                <Video 
                    source={{ uri: props.videoUri }} 
                    style={{ height: '65%' }} 
                    rate={1.0}
                    volume={1.0}
                    isMuted={false}
                    usePoster={true}
                    shouldPlay={props.shouldPlay}
                    isLooping    
                /> 
                <Button title="Choose another video" onPress={props.pickVideo} />
                <Button title="Upload!" onPress={props.uploadVideo} />
            </View>
        )
    }
}

function Question (props) {
    if(props.data.length == 0){
        return(<Text>Loading...</Text>)
    } else {
        return(
            <Text style={addStyles.questionText}>
                {props.data[props.index].questionText}
            </Text>
        )    
    }
}

// const readyAsset = (assetId: String) => {
//     console.log("getAssetUser"); 
//     axios({
//         method: 'get', 
//         url: 'https://api.mux.com/video/v1/assets/' + assetId,
//         auth: {'username': 'eeadaed4-6e99-45e6-85e1-ba733723c8e6', 'password':'O7qEUCRdCzsbrK1XS2h0OK4N0v9YV1fnrQnCt2kWl/D2xSuJfczkVhJ5S4vQvJ3j5elQzPzJyk8'}
//    })
//    .then(response => { 
//        if(response.data.data.status != "ready"){
//            console.log("asset not ready"); 
//            setTimeout(() => { readyAsset(assetId) }, 5000); 
//        } else {
//            setAssetReady(true); 
//            setUploadingVideo(false); 
//         }
//     })
//    .catch(error => { 
//        console.log(error);
//     });
// }

    // // Create an authenticated Mux URL
// let res = await axios({
//     method: 'post', 
//     url: 'https://api.mux.com/video/v1/uploads',
//     headers: { 'content-type': 'application/json' },
//     data: { "new_asset_settings": { "playback_policy": ["public"] } },
//     auth: {'username': 'eeadaed4-6e99-45e6-85e1-ba733723c8e6', 'password':'O7qEUCRdCzsbrK1XS2h0OK4N0v9YV1fnrQnCt2kWl/D2xSuJfczkVhJ5S4vQvJ3j5elQzPzJyk8'}
// }); 

// const authenticatedUrl = res.data.data.url; 

// // Use authenticated URL to upload file
// res = await axios({
//     method: 'put', 
//     url: authenticatedUrl,
//     data: blob
// });
// blob.close(); 