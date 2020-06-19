import React, { useState, useEffect, useContext } from 'react';
import { View, Text } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { TouchableOpacity } from 'react-native-gesture-handler';
import { _retrieveName, _retrieveBio, _retrieveCity, _retrieveRegion, _retrieveGenderInterest, _retrieveCollege } from '../../utils/asyncStorage'; 
import { colors } from '../../styles/colors';
import { GET_CITY_REGION, client } from '../../utils/graphql/GraphqlClient';
import { UserIdContext } from '../../utils/context/UserIdContext'

export default function EditProfileView(props) {
    
    const [userId, setUserId] = useContext(UserIdContext);
    const [name, setName] = useState(props.route.params.name);
    const [bio, setBio] = useState(props.route.params.bio);
    const [city, setCity] = useState(null);
    const [region, setRegion] = useState(null); 
    const [genderInterest, setGenderInterest] = useState(null); 
    const [college, setCollege] = useState(''); 

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

        setName(name);
        setBio(bio);
        setCity(city); 
        setRegion(region); 
        setGenderInterest(genderInterest); 
        setCollege(college); 
    }

    function goToEditName(){
        props.navigation.navigate('Name', {name});
    }

    function goToEditBio(){
        props.navigation.navigate('Bio', {bio}); 
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
                <Text style={{ fontSize: 16, color: colors.secondaryWhite }}>Bio</Text>
                <TouchableOpacity onPress={goToEditBio} style={{ flexDirection: 'row', padding: 15}}>
                    <BioText />
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
        </View>
    )
    
}