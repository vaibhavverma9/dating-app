import React, { useState, useContext, useEffect } from 'react';
import { Text, View, StyleSheet, Keyboard, Image } from 'react-native';
import { TouchableOpacity, TouchableWithoutFeedback } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { UserIdContext } from '../../utils/context/UserIdContext'
import { _storeOnboarded, _storeLatitude, _storeLongitude, _storeCollege, _storeCollegeLatitude, _storeCollegeLongitude, _storeProfileUrl, _retrieveName } from '../../utils/asyncStorage'; 
import { colors } from '../../styles/colors';
import * as Permissions from 'expo-permissions';
import * as ImagePicker from 'expo-image-picker';
import firebaseApp from '../../utils/firebase/fbConfig';
import { UPDATE_PROFILE_URL, UPDATE_ONBOARDED } from '../../utils/graphql/GraphqlClient';
import { useMutation } from '@apollo/client';
import axios from 'axios';
import * as Segment from 'expo-analytics-segment';

export default function ProfilePictureOnboarding(props) {

    const [userId, setUserId] = useContext(UserIdContext);
    const [profilePictureSubmitted, setProfilePictureSubmitted] = useState(false); 
    const [imageUri, setImageUri] = useState('');
    const [updateProfileUrl, { updateProfileUrlData }] = useMutation(UPDATE_PROFILE_URL);
    const [name, setName] = useState(''); 
    const [sendBack, setSendBack] = useState(false);
    const [updateOnboarded, { updateOnboardedData }] = useMutation(UPDATE_ONBOARDED);

    function tapBack(){
        setSendBack(true); 
    }

    useEffect(() => {
        initName(); 
    }, []);

    async function initName(){
        const name = await _retrieveName(); 
        setName(name); 
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
    }

    const submitProfilePicture = () => {
        uploadImage(imageUri); 
        props.navigation.navigate("TabStack");
        completeOnboarding(); 
    }

    function completeOnboarding(){
        _storeOnboarded(true); 
        updateOnboarded({ variables: { userId, onboarded: true }}); 
        Segment.track("Onboarding - Complete Onboarding");
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
                        style={{ height: 120, width: 120, borderRadius: 60, borderColor: primaryColor, borderWidth: 1, justifyContent: 'center', alignItems: 'center' }}
                    >
                        <Ionicons name="md-person" size={60} color={primaryColor} />
                    </View>
            )    
        }
    }

    function SubmitButton(){
        if(imageUri != ''){
            return (
                <TouchableOpacity onPress={submitProfilePicture} style={styles.locationsContainer}>
                    <Text style={styles.locationsText}>Submit</Text>
                </TouchableOpacity>
            )    
        } else {
            return(
                <View style={styles.noSubmitContainer}>
                    <Text style={styles.locationsText}>Submit</Text>
                </View>

            )
        }
    }


    return (
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
            <View style={{ height: '100%', justifyContent: 'center', alignItems: 'center', backgroundColor: primaryColor }}>
                <View style={{ height: '50%', width: '85%', backgroundColor: secondaryColor, borderRadius: 5, padding: 10, alignItems: 'center', justifyContent: 'space-evenly' }}>
                    <Text style={{ fontSize: 25, fontWeight: 'bold', height: '25%', color: primaryColor }}>Add a profile picture</Text>
                    <TouchableOpacity onPress={pickProfilePicture} style={{ 
                        height: '15%',
                        width: '100%', 
                        alignItems: 'center', 
                        justifyContent: 'center'
                    }}>
                        <ProfilePicture />
                    </TouchableOpacity>
                    <View style={{ paddingTop: '12%' }}>
                        <SubmitButton />
                    </View>
                </View>
                <View style={{ height: '25%', justifyContent: 'center'}}>
                </View>
            </View>
        </TouchableWithoutFeedback>
    );
}

const primaryColor = colors.primaryPurple;
const secondaryColor = colors.secondaryWhite; 

const styles = StyleSheet.create({
    locationsContainer: { 
        backgroundColor: primaryColor, 
        borderRadius: 5,
        width: 250,
        height: 50, 
        justifyContent: 'center', 
        alignItems: 'center'
    }, 
    noSubmitContainer: {
        backgroundColor: colors.lightPurple, 
        borderRadius: 5,
        width: 250,
        height: 50, 
        justifyContent: 'center', 
        alignItems: 'center'
    },
    locationsText: {
        fontSize: 17,
        color: secondaryColor,
        fontWeight: 'bold'
    }
});
