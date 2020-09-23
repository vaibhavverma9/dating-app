import React, { useContext, useState } from 'react';
import { Text, View, StyleSheet, TouchableOpacity } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { UserIdContext } from '../../utils/context/UserIdContext'
import { colors } from '../../styles/colors';
import * as Segment from 'expo-analytics-segment';
import { _storeOnboarded } from '../../utils/asyncStorage'; 
import { useMutation } from '@apollo/client';
import { UPDATE_ONBOARDED } from '../../utils/graphql/GraphqlClient';

export default function TutorialOnboarding(props) {

    const [userId, setUserId] = useContext(UserIdContext);
    const [onboarded, setOnboarded] = useState(false); 
    const [updateOnboarded, { updateOnboardedData }] = useMutation(UPDATE_ONBOARDED);

    function completeOnboarding(){
        setOnboarded(true); 
        _storeOnboarded(true); 
        updateOnboarded({ variables: { userId, onboarded: true }}); 
        Segment.track("Onboarding - Complete Onboarding");
    }

    return (
        <View style={{ height: '100%', justifyContent: 'center', alignItems: 'center', backgroundColor: primaryColor }}>
            <View style={{ height: '40%', width: '85%', backgroundColor: secondaryColor, borderRadius: 5, padding: 10, alignItems: 'center' }}>
                {/* <View style={{ paddingTop: '10%', height: '25%'}}>
                    <MaterialIcons name="personal-video" size={45} color={primaryColor} />
                </View>         */}
                <Text style={{ fontSize: 25, textAlign: 'center', padding: 10, paddingTop: 15, color: primaryColor }}>Tap for next video</Text>
                {/* <Text style={{ textAlign: 'center', fontSize: 18, padding: 5, color: primaryColor}}>Tap for next video</Text> */}
                {/* <Text style={{ textAlign: 'center', fontSize: 18, padding: 5, color: primaryColor}}>Like or dislike for next user</Text> */}
                <View style={{ paddingTop: '12%' }}>
                    <TouchableOpacity style={styles.locationsContainer}>
                        <Text style={styles.locationsText}>Enable Location</Text>
                    </TouchableOpacity>
                </View>
            </View>
            <TouchableOpacity style={{ height: '25%', justifyContent: 'flex-start'}}>
                {/* <Text style={{ paddingTop: '4%', fontWeight: 'bold', color: secondaryColor, fontSize: 14 }}>Skip for now</Text> */}
            </TouchableOpacity>
        </View>
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
    locationsText: {
        fontSize: 17,
        color: secondaryColor,
        fontWeight: 'bold'
    }
})
