import React, { useState, useContext } from 'react';
import { Text, View, StyleSheet } from 'react-native';
import { TouchableOpacity } from 'react-native-gesture-handler';
import { Ionicons } from '@expo/vector-icons';
import { UserIdContext } from '../../utils/context/UserIdContext'
import { useMutation } from '@apollo/client';
import { UPDATE_GENDER_INTEREST } from '../../utils/graphql/GraphqlClient';
import { _storeGenderInterest } from '../../utils/asyncStorage'; 
import LocationOnboarding from './LocationOnboarding';
import { colors } from '../../styles/colors';

export default function GenderInterestOnboarding() {

    const [userId, setUserId] = useContext(UserIdContext);
    const [genderInterestSubmitted, setGenderInterestSubmitted] = useState(false); 
    const [updateGenderInterest, { updateGenderInterestData }] = useMutation(UPDATE_GENDER_INTEREST);

    const interestMan = () => {
        updateGenderInterest({ variables: { userId, genderInterest: 'Men' }});
        _storeGenderInterest('Men'); 
        setGenderInterestSubmitted(true); 
    };

    const interestWoman = () => {
        updateGenderInterest({ variables: { userId, genderInterest: 'Women' }});
        _storeGenderInterest('Women');
        setGenderInterestSubmitted(true); 
    };

    const interestEveryone = () => {
        updateGenderInterest({ variables: { userId, genderInterest: 'Everyone' }});
        _storeGenderInterest('Everyone');
        setGenderInterestSubmitted(true); 
    }; 

    if(genderInterestSubmitted) {
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
                        <Text style={{ fontSize: 25, fontWeight: 'bold', paddingTop: 15, textAlign: 'center', color: primaryColor }}>I'm looking to date</Text>
                        <View style={{ justifyContent: 'space-evenly', height: '60%'}}>
                            <TouchableOpacity onPress={interestWoman} style={styles.genderContainer}>
                                <Text style={styles.genderText}>Women</Text>
                            </TouchableOpacity>
                            <TouchableOpacity onPress={interestMan} style={styles.genderContainer}>
                                <Text style={styles.genderText}>Men</Text>
                            </TouchableOpacity>
                            <TouchableOpacity onPress={interestEveryone} style={styles.genderContainer}>
                                <Text style={styles.genderText}>Everyone</Text>
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
