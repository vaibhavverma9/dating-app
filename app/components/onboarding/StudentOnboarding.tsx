import React, { useState, useContext } from 'react';
import { Text, View, StyleSheet } from 'react-native';
import { TouchableOpacity, TouchableWithoutFeedback } from 'react-native-gesture-handler';
import { Ionicons } from '@expo/vector-icons';
import { UserIdContext } from '../../utils/context/UserIdContext'
import { useMutation } from '@apollo/client';
import { UPDATE_GENDER_INTEREST } from '../../utils/graphql/GraphqlClient';
import { _storeGenderInterest } from '../../utils/asyncStorage'; 
import LocationOnboarding from './LocationOnboarding';
import CollegeOnboarding from './CollegeOnboarding'; 
import { colors } from '../../styles/colors';

export default function GenderInterestOnboarding() {

    const [student, setStudent] = useState(null); 

    function yesStudent(){
        setStudent(true); 
    }

    function noStudent(){
        setStudent(false); 
    }

    if(student == true) {
        return (
            <CollegeOnboarding />
        )
    } else if(student == false) {
        return (
            <LocationOnboarding />
        )
    } else {
            return (
                <View style={{ height: '100%', justifyContent: 'center', alignItems: 'center', backgroundColor: primaryColor }}>
                    <View style={{ height: '40%', width: '85%', backgroundColor: secondaryColor, borderRadius: 5, padding: 10, alignItems: 'center' }}>
                        <View style={{ paddingTop: '10%', height: '25%'}}>
                            <Ionicons name="md-person" size={45} color={primaryColor} />
                        </View>        
                        <Text style={{ fontSize: 25, fontWeight: 'bold', paddingTop: 15, textAlign: 'center', color: primaryColor }}>Are you a student?</Text>
                        <View style={{ justifyContent: 'space-evenly', height: '60%'}}>
                            <TouchableOpacity onPress={yesStudent} style={styles.genderContainer}>
                                <Text style={styles.genderText}>Yes</Text>
                            </TouchableOpacity>
                            <TouchableOpacity onPress={noStudent} style={styles.genderContainer}>
                                <Text style={styles.genderText}>No</Text>
                            </TouchableOpacity>
                            <TouchableWithoutFeedback style={styles.emptyContainer}>
                            </TouchableWithoutFeedback>
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
    emptyContainer: {
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
