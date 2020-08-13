import React, { useState, useContext, useEffect } from 'react';
import * as Location from 'expo-location';
import { Text, View, StyleSheet, TouchableWithoutFeedback, TouchableOpacity, Keyboard, TextInput } from 'react-native';
import { FontAwesome5, Ionicons } from '@expo/vector-icons';
import TabStack from '../../stacks/TabStack';
import { UserIdContext } from '../../utils/context/UserIdContext'
import { useMutation } from '@apollo/client';
import { UPDATE_GENDER, UPDATE_GENDER_INTEREST, UPDATE_SHOW_TO_PEOPLE } from '../../utils/graphql/GraphqlClient';
import GenderInterestOnboarding from './GenderInterestOnboarding';
import { colors } from '../../styles/colors';
import * as Segment from 'expo-analytics-segment';
import { _storeGender } from '../../utils/asyncStorage'; 
import NameOnboarding from './NameOnboarding';

export default function GenderOnboarding(props) {

    const [userId, setUserId] = useContext(UserIdContext);
    const [updateGender, { updateGenderData }] = useMutation(UPDATE_GENDER);
    const [updateShowToPeople, { updateShowToPeopleData }] = useMutation(UPDATE_SHOW_TO_PEOPLE);
    const [genderSubmitted, setGenderSubmitted] = useState(false); 
    const [moreGenders, setMoreGenders] = useState(false); 
    const [genderText, setGenderText] = useState(''); 
    const [gender, setGender] = useState(0); 

    const genderMan = () => {
        updateGender({ variables: { userId, gender: 'Man' }});
        setGenderSubmitted(true); 
        setGender(1); 
        _storeGender('Man'); 
        props.navigation.navigate("GenderInterestOnboarding", { gender: 1});
    };

    const genderWoman = () => {
        updateGender({ variables: { userId, gender: 'Woman' }});
        setGenderSubmitted(true); 
        setGender(2); 
        _storeGender('Woman'); 
        props.navigation.navigate("GenderInterestOnboarding", { gender: 2});
    };

    const genderMore = () => {
        setMoreGenders(true); 
    }; 

    const submitGender = () => {
        updateGender({ variables: { userId, gender: genderText }});
        setGenderSubmitted(true); 
    };

    const moreMenInterest = () => {
        updateShowToPeople({ variables: { userId, showToPeopleLookingFor: 'Men'}});
        setGender(1); 
        _storeGender('Man'); 
        setMoreGenders(false); 
        props.navigation.navigate("GenderInterestOnboarding", { gender: 1});
    };

    const moreWomenInterest = () => {
        updateShowToPeople({ variables: { userId, showToPeopleLookingFor: 'Women'}});
        setGender(2); 
        _storeGender('Woman'); 
        setMoreGenders(false); 
        props.navigation.navigate("GenderInterestOnboarding", { gender: 2});
    }

    if(moreGenders) {
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
                                onFocus={() => setGenderText('')}
                                onChangeText={text => setGenderText(text)}
                                value={genderText}
                            />
                            <View style={{ paddingTop: '12%' }}>
                                <TouchableOpacity onPress={submitGender} style={styles.genderContainer}>
                                    <Text style={styles.genderText}>Submit</Text>
                                </TouchableOpacity>
                            </View>
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
            <View>
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
