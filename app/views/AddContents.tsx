import React, { useEffect, useState } from 'react';
import { Text, View, Button } from 'react-native';
import { Ionicons } from '@expo/vector-icons'
import { addStyles } from '../../styles/addStyles';
import * as Permissions from 'expo-permissions';
import * as ImagePicker from 'expo-image-picker';
import Constants from 'expo-constants';
import { Video } from 'expo-av';   

export default function AddView (props) {

    const [questionData, setQuestionData] = useState([]);
    const [questionCount, setQuestionCount] = useState(0); 
    const [index, setIndex] = useState(0);
    const [imageUri, setImageUri] = useState(''); 

    useEffect(() => {
        setQuestionData(props.data.questions);
        setQuestionCount(props.data.questions.length); 
        getPermissionAsync(); // to do: move to after user taps camera button
    }, []);

    const getPermissionAsync = async () => {
        if (Constants.platform.ios) {
            const { status } = await Permissions.askAsync(Permissions.CAMERA_ROLL);
            if (status !== 'granted') {
            alert('Sorry, we need camera roll permissions to make this work!');
            }
        }
    };

    const pickVideo = async () => {
        try {
            let result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.All,
            allowsEditing: true,
            aspect: [4, 3],
            quality: 1,
            });
            if (!result.cancelled && result.type == 'video') {
            setImageUri(result.uri); 
            }
            if (!result.cancelled && result.type == 'image') {
            alert('Sorry, please upload a video!');
            }

            console.log(result);
        } catch (error) {
            console.log(error);
        }
    };

    const uploadVideo = () => {
        console.log("uploadVideo"); 
    }

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
            <VideoUpload imageUri={imageUri} pickVideo={pickVideo} uploadVideo={uploadVideo} />
        </View>
    );
}

function VideoUpload (props) {
    if(props.imageUri == ''){
        return(
            <Button title="Pick video from camera roll" onPress={props.pickVideo} />
        )
    } else {
        return(
            <View>
                <Video 
                    source={{ uri: props.imageUri }} 
                    style={{ height: '60%' }} 
                    rate={1.0}
                    volume={1.0}
                    isMuted={false}
                    usePoster={true}
                    shouldPlay
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