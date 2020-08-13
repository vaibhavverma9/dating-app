import React, { useState, useContext } from 'react';
import { Text, View, StyleSheet } from 'react-native';
import { TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { UserIdContext } from '../../utils/context/UserIdContext'
import { useMutation } from '@apollo/client';
import { UPDATE_GENDER_INTEREST, UPDATE_GENDER_GROUP } from '../../utils/graphql/GraphqlClient';
import { _storeGenderInterest, _storeGenderGroup } from '../../utils/asyncStorage'; 
import { colors } from '../../styles/colors';
import * as Segment from 'expo-analytics-segment';

export default function GenderInterestOnboarding(props) {

    const [userId, setUserId] = useContext(UserIdContext);
    const [genderInterestSubmitted, setGenderInterestSubmitted] = useState(false); 
    const [updateGenderInterest, { updateGenderInterestData }] = useMutation(UPDATE_GENDER_INTEREST);
    const [updateGenderGroup, { updateGenderGroupData }] = useMutation(UPDATE_GENDER_GROUP);

    const interestMan = () => {
        updateGenderInterest({ variables: { userId, genderInterest: 'Men' }});
        if(props.route.params.gender == 1){
            // user identifies as a man
            _storeGenderGroup(4); 
            updateGenderGroup({ variables: { userId, group: 4}});
        } else if(props.route.params.gender == 2){
            // user identifies as a woman
            _storeGenderGroup(2); 
            updateGenderGroup({ variables: { userId, group: 2}});
        } else {
            console.log("error, gender integer not set in genderOnboarding"); 
        }


        _storeGenderInterest('Men'); 
        setGenderInterestSubmitted(true); 
        Segment.track("Onboarding - Submit Gender");
        props.navigation.navigate("AgeOnboarding");
    };

    const interestWoman = () => {
        updateGenderInterest({ variables: { userId, genderInterest: 'Women' }});
        if(props.route.params.gender == 1){
            // user identifies as a man
            _storeGenderGroup(1); 
            updateGenderGroup({ variables: { userId, group: 1}});
        } else if(props.route.params.gender == 2){
            // user identifies as a woman
            _storeGenderGroup(5); 
            updateGenderGroup({ variables: { userId, group: 5}});
        } else {
            console.log("error, gender integer not set in genderOnboarding"); 
        }

        _storeGenderInterest('Women');
        setGenderInterestSubmitted(true); 
        Segment.track("Onboarding - Submit Gender");
        props.navigation.navigate("AgeOnboarding");
    };

    const interestEveryone = () => {
        updateGenderInterest({ variables: { userId, genderInterest: 'Everyone' }});
        if(props.route.params.gender == 1){
            // user identifies as a man
            _storeGenderGroup(3); 
            updateGenderGroup({ variables: { userId, group: 3}});
        } else if(props.route.params.gender == 2){
            // user identifies as a woman
            _storeGenderGroup(6); 
            updateGenderGroup({ variables: { userId, group: 6}});
        } else {
            console.log("error, gender integer not set in genderOnboarding"); 
        }

        _storeGenderInterest('Everyone');
        setGenderInterestSubmitted(true); 
        Segment.track("Onboarding - Submit Gender");
        props.navigation.navigate("AgeOnboarding");
    }; 

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
