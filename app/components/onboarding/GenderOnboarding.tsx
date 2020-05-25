import React, { useState, useContext, useEffect } from 'react';
import * as Location from 'expo-location';
import { Text, View, StyleSheet, TouchableWithoutFeedback, Keyboard, TextInput } from 'react-native';
import { TouchableOpacity } from 'react-native-gesture-handler';
import { FontAwesome5, Ionicons } from '@expo/vector-icons';
import TabStack from '../../stacks/TabStack';
import { UserIdContext } from '../../utils/context/UserIdContext'
import { useMutation } from '@apollo/client';
import { UPDATE_GENDER, UPDATE_GENDER_INTEREST, UPDATE_SHOW_TO_PEOPLE } from '../../utils/graphql/GraphqlClient';
import { _storeLatitude, _storeLongitude } from '../../utils/asyncStorage'; 
import GenderInterestOnboarding from './GenderInterestOnboarding';
import { colors } from '../../styles/colors';

export default function GenderOnboarding() {

    const [userId, setUserId] = useContext(UserIdContext);
    const [updateGender, { updateGenderData }] = useMutation(UPDATE_GENDER);
    const [updateShowToPeople, { updateShowToPeopleData }] = useMutation(UPDATE_SHOW_TO_PEOPLE);
    const [genderSubmitted, setGenderSubmitted] = useState(false); 
    const [moreGenders, setMoreGenders] = useState(false); 
    const [gender, setGender] = useState(''); 

    const genderMan = () => {
        updateGender({ variables: { userId, gender: 'Man' }});
        setGenderSubmitted(true); 
    };

    const genderWoman = () => {
        updateGender({ variables: { userId, gender: 'Woman' }});
        setGenderSubmitted(true); 
    };

    const genderMore = () => {
        setMoreGenders(true); 
    }; 

    const submitGender = () => {
        updateGender({ variables: { userId, gender: gender }});
        setGenderSubmitted(true); 
    };

    const moreMenInterest = () => {
        console.log("moreMenInterest");
        updateShowToPeople({ variables: { userId, showToPeopleLookingFor: 'Men'}})
        setMoreGenders(false); 
    };

    const moreWomenInterest = () => {
        console.log("moreWomenInterest");
        updateShowToPeople({ variables: { userId, showToPeopleLookingFor: 'Women'}})
        setMoreGenders(false); 
    }

    if(!moreGenders && genderSubmitted) {
        return (
            <GenderInterestOnboarding />
        )
    } else if(moreGenders) {
        if (!genderSubmitted){
            return (
                <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                    <View style={{ height: '100%', justifyContent: 'center', alignItems: 'center', backgroundColor: primaryColor }}>
                        <View style={{ height: '40%', width: '85%', backgroundColor: secondaryColor, borderRadius: 5, padding: 10, alignItems: 'center' }}>
                            <View style={{ paddingTop: '10%', height: '25%'}}>
                                <Ionicons name="md-person" size={45} color={primaryColor} />
                            </View>        
                            <Text style={{ fontSize: 25, fontWeight: 'bold', padding: 15, height: '25%', color: primaryColor }}>What's your gender?</Text>
                            <TextInput 
                                style={{ textAlign: 'center', 
                                        fontSize: 18, 
                                        padding: 15, 
                                        color: primaryColor,  
                                        borderColor: primaryColor,
                                        borderWidth: 1,
                                        width: '75%',
                                        borderRadius: 5
                                    }}
                                onFocus={() => setGender('')}
                                onChangeText={text => setGender(text)}
                                value={gender}
                            />
                            <View style={{ paddingTop: '12%' }}>
                                <TouchableOpacity onPress={submitGender} style={styles.genderContainer}>
                                    <Text style={styles.genderText}>Submit</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                        <View style={{ height: '25%', justifyContent: 'center'}}>
                        </View>
                    </View>
                </TouchableWithoutFeedback>
            );
        } else {
            return (
                <View style={{ height: '100%', justifyContent: 'center', alignItems: 'center', backgroundColor: primaryColor }}>
                    <View style={{ height: '40%', width: '85%', backgroundColor: secondaryColor, borderRadius: 5, padding: 10, alignItems: 'center' }}>
                        <View style={{ paddingTop: '10%', height: '25%'}}>
                            <Ionicons name="md-person" size={45} color={primaryColor} />
                        </View>        
                        <Text style={{ fontSize: 25, fontWeight: 'bold', paddingTop: 15, textAlign: 'center', color: primaryColor }}>Show me to people looking for</Text>
                        <View style={{ justifyContent: 'space-evenly', height: '50%'}}>
                            <TouchableOpacity onPress={moreWomenInterest} style={styles.genderContainer}>
                                <Text style={styles.genderText}>Women</Text>
                            </TouchableOpacity>
                            <TouchableOpacity onPress={moreMenInterest} style={styles.genderContainer}>
                                <Text style={styles.genderText}>Men</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                    <TouchableOpacity style={{ height: '25%', justifyContent: 'center'}}>
                        <Text style={{ fontWeight: 'bold', color: secondaryColor, fontSize: 14 }}></Text>
                    </TouchableOpacity>
                </View>
            );
        }
    } else {
        return (
            <View style={{ height: '100%', justifyContent: 'center', alignItems: 'center', backgroundColor: primaryColor }}>
                <View style={{ height: '40%', width: '85%', backgroundColor: secondaryColor, borderRadius: 5, padding: 10, alignItems: 'center' }}>
                    <View style={{ paddingTop: '10%', height: '25%'}}>
                        <Ionicons name="md-person" size={45} color={primaryColor} />
                    </View>        
                    <Text style={{ fontSize: 25, fontWeight: 'bold', paddingTop: 15, color: primaryColor }}>What's your gender?</Text>
                    <View style={{ justifyContent: 'space-evenly', height: '60%'}}>
                        <TouchableOpacity onPress={genderWoman} style={styles.genderContainer}>
                            <Text style={styles.genderText}>Woman</Text>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={genderMan} style={styles.genderContainer}>
                            <Text style={styles.genderText}>Man</Text>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={genderMore} style={styles.genderContainer}>
                            <Text style={styles.genderText}>More</Text>
                        </TouchableOpacity>
                    </View>
                </View>
                <TouchableOpacity style={{ height: '25%', justifyContent: 'center'}}>
                    <Text style={{ fontWeight: 'bold', color: secondaryColor, fontSize: 14 }}></Text>
                </TouchableOpacity>
            </View>
        );
    } 
}

const primaryColor = colors.primaryPurple;
const secondaryColor = colors.secondaryWhite; 

const styles = StyleSheet.create({
    genderContainer: { 
        backgroundColor: primaryColor, 
        borderRadius: 5,
        width: 250,
        height: 40, 
        alignItems: 'center',
        justifyContent: 'center'
    }, 
    genderText: {
        fontSize: 17,
        color: secondaryColor,
        fontWeight: 'bold'
    }
})
