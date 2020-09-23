import React, { useState, useEffect, useContext } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { _retrieveName, _retrieveBio, _retrieveCity, _retrieveRegion, _retrieveGenderInterest, _retrieveCollege, _retrieveInstagram } from '../../utils/asyncStorage'; 
import { colors } from '../../styles/colors';
import { GET_INSTAGRAM } from '../../utils/graphql/GraphqlClient';
import { UserIdContext } from '../../utils/context/UserIdContext'
import * as SMS from 'expo-sms';
import { useLazyQuery } from '@apollo/client';

export default function EditProfileView(props) {
    
    const [userId, setUserId] = useContext(UserIdContext);
    const [name, setName] = useState(props.route.params.name);
    const [bio, setBio] = useState(props.route.params.bio);
    const [city, setCity] = useState(null);
    const [region, setRegion] = useState(null); 
    const [genderInterest, setGenderInterest] = useState(null); 
    const [college, setCollege] = useState(''); 
    const [instagram, setInstagram] = useState(''); 

    useEffect(() => {
        props.navigation.addListener('focus', () => {
            initProfile(); 
        });  
      }, [props.navigation]);


    async function initProfile(){
        const name = await _retrieveName(); 
        const bio = await _retrieveBio(); 
        const city = await _retrieveCity(); 
        const region = await _retrieveRegion(); 
        const genderInterest = await _retrieveGenderInterest(); 
        const college = await _retrieveCollege(); 
        const instagram = await _retrieveInstagram(); 

        setName(name);
        setBio(bio);
        setCity(city); 
        setRegion(region); 
        setGenderInterest(genderInterest); 
        setCollege(college); 
        setInstagram(instagram); 
    }

    function goToEditName(){
        props.navigation.navigate('Name', {name});
    }

    function goToLocation(){
        props.navigation.navigate('Location', {city, region}); 
    }

    function goToGenderInterest(){
        props.navigation.navigate('Gender Preferences', {genderInterest}); 
    }

    function goToCollege(){
        props.navigation.navigate('College', {college}); 
    }

    function goToInstagram(){
        props.navigation.navigate('Instagram', { instagram }); 
    }

    function NameText(){
        if(name == ''){
            return (
                <Text style={{ color: colors.secondaryGray, fontSize: 16  }}>Add name to your profile</Text>
            )
        } else {
            return (
                <Text style={{ color: colors.secondaryGray, fontSize: 16  }}>{name}</Text>
            )

        }
    }

    function BioText(){
        if(bio == ''){
            return (
                <Text style={{ color: colors.secondaryGray, fontSize: 16 }}>Add a bio to your profile</Text>
            )
        } else {
            return (
                <Text style={{ color: colors.secondaryGray, fontSize: 16 }}>{bio}</Text>
            )
        }
    }

    function LocationText(){
        if(city == '' || region == ''){
            return (
                <Text style={{ color: colors.secondaryGray, fontSize: 16 }}>Set your location</Text>
            )
        } else if (city && region) {
            return (
                <Text style={{ color: colors.secondaryGray, fontSize: 16 }}>{city}, {region}</Text>
            )
        } else {
            return null; 
        }
    }

    function GenderInterestText(){
        if(genderInterest == null){
            return null; 
        } else {
            return (
                <Text style={{ color: colors.secondaryGray, fontSize: 16 }}>{genderInterest}</Text>
            )
        }
    }

    function CollegeText(){
        if(college == ''){
            return (
                <Text style={{ color: colors.secondaryGray, fontSize: 16 }}>Add a college to your profile</Text>
            )

        } else {
            return (
                <Text style={{ color: colors.secondaryGray, fontSize: 16 }}>{college}</Text>
            )
        }
    }

    function InstagramText(){
        if(instagram == ''){
            return (
                <Text style={{ color: colors.secondaryGray, fontSize: 16 }}>Add your Instagram handle</Text>
            )

        } else {
            if(instagram.includes('@')){
                return (
                    <Text style={{ color: colors.secondaryGray, fontSize: 16 }}>{instagram}</Text>
                )    
            } else {
                return (
                    <Text style={{ color: colors.secondaryGray, fontSize: 16 }}>@{instagram}</Text>
                )    
            }
        }
    }

    async function sendFeedback () {
        const { result } = await SMS.sendSMSAsync(
          ['9496146745'],
          'Text feedback here :)'
        );
    };



    return (
        <View style={{ backgroundColor: colors.primaryBlack, flex: 1 }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingLeft: 15, paddingTop: 15}}>
                <Text style={{ fontSize: 16, color: colors.secondaryWhite }}>Name</Text>
                <TouchableOpacity onPress={goToEditName} style={{ flexDirection: 'row', padding: 15}}>
                    <NameText />
                    <MaterialIcons name="navigate-next" color={colors.secondaryGray} size={20}/>  
                </TouchableOpacity>
            </View>

            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingLeft: 15, paddingTop: 15}}>
                <Text style={{ fontSize: 16, color: colors.secondaryWhite }}>Location</Text>
                <TouchableOpacity onPress={goToLocation} style={{ flexDirection: 'row', padding: 15}}>
                    <LocationText />
                    <MaterialIcons name="navigate-next" color={colors.secondaryGray} size={20}/>  
                </TouchableOpacity>
            </View>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingLeft: 15, paddingTop: 15}}>
                <Text style={{ fontSize: 16, color: colors.secondaryWhite }}>I'm interested in</Text>
                <TouchableOpacity onPress={goToGenderInterest} style={{ flexDirection: 'row', padding: 15}}>
                    <GenderInterestText />
                    <MaterialIcons name="navigate-next" color={colors.secondaryGray} size={20}/>  
                </TouchableOpacity>
            </View>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingLeft: 15, paddingTop: 15}}>
                <Text style={{ fontSize: 16, color: colors.secondaryWhite }}>College</Text>
                <TouchableOpacity onPress={goToCollege} style={{ flexDirection: 'row', padding: 15}}>
                    <CollegeText />
                    <MaterialIcons name="navigate-next" color={colors.secondaryGray} size={20}/>  
                </TouchableOpacity>
            </View>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingLeft: 15, paddingTop: 15}}>
                <Text style={{ fontSize: 16, color: colors.secondaryWhite }}>Instagram</Text>
                <TouchableOpacity onPress={goToInstagram} style={{ flexDirection: 'row', padding: 15}}>
                    <InstagramText />
                    <MaterialIcons name="navigate-next" color={colors.secondaryGray} size={20}/>  
                </TouchableOpacity>
            </View>
            <TouchableOpacity onPress={sendFeedback} style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingLeft: 15, paddingTop: 15}}>
                <Text style={{ fontSize: 16, color: colors.secondaryWhite }}>Help Center via SMS</Text>
            </TouchableOpacity>
        </View>
    )
    
}