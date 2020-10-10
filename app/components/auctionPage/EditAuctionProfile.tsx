import React, { useState, useEffect, useContext } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { colors } from '../../styles/colors';
import { UserIdContext } from '../../utils/context/UserIdContext'
import * as SMS from 'expo-sms';

export default function EditAuctionView(props) {
    
    const [userId, setUserId] = useContext(UserIdContext);
    const [name, setName] = useState(props.route.params.name);
    const [city, setCity] = useState(null);
    const [region, setRegion] = useState(null); 
    const [gender, setGender] = useState(null); 
    const [genderInterest, setGenderInterest] = useState(null); 
    const [college, setCollege] = useState(''); 
    const [instagram, setInstagram] = useState(''); 

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

    function goToName(){

    };

    function goToLocation(){

    }; 

    function goToGenderInterest(){

    };

    function goToCollege(){

    };

    function goToInstagram(){

    }; 

    return (
        <View style={{ backgroundColor: colors.primaryBlack, flex: 1 }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingLeft: 15, paddingTop: 15}}>
                <Text style={{ fontSize: 16, color: colors.secondaryWhite }}>Name</Text>
                <TouchableOpacity onPress={goToName} style={{ flexDirection: 'row', padding: 15}}>
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
        </View>
    )
    
}