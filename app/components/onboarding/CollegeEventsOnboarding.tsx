import React, { useContext, useState } from 'react';
import { Text, View, StyleSheet, Keyboard } from 'react-native';
import { TouchableOpacity, TouchableWithoutFeedback } from 'react-native-gesture-handler';
import { FontAwesome5 } from '@expo/vector-icons';
import { UserIdContext } from '../../utils/context/UserIdContext'
import { _storeLatitude, _storeLongitude, _storeCollege, _storeCollegeLatitude, _storeCollegeLongitude } from '../../utils/asyncStorage'; 
import { colors } from '../../styles/colors';
import LocationOnboarding from './LocationOnboarding';
import Autocomplete from 'react-native-autocomplete-input';
import { UPDATE_TEXT_PERMISSION } from '../../utils/graphql/GraphqlClient';
import { useMutation } from '@apollo/client';

export default function CollegeEventsOnboarding(props) {

    const [userId, setUserId] = useContext(UserIdContext);
    const [eventSubmitted, setEventSubmitted] = useState(false);
    const [updateTextPermission, { updateTextPermissionData }] = useMutation(UPDATE_TEXT_PERMISSION);

    function yesEvent(){
        updateTextPermission({ variables: { userId, textPermission: true }});
        setEventSubmitted(true); 
    }

    function noEvent(){
        updateTextPermission({ variables: { userId, textPermission: false }});
        setEventSubmitted(true); 
    }


    if(eventSubmitted) {
        return (
            <LocationOnboarding />
        )
    } else {
        return (
            <View style={{ height: '100%', justifyContent: 'center', alignItems: 'center', backgroundColor: primaryColor }}>
                <View style={{ height: '40%', width: '85%', backgroundColor: secondaryColor, borderRadius: 5, padding: 10, alignItems: 'center' }}>
                    <View style={{ paddingTop: '10%', height: '25%'}}>
                        <FontAwesome5 name="school" size={45} color={primaryColor} />
                    </View>        
                    <Text style={{ fontSize: 20, fontWeight: '500', paddingVertical: 15,  textAlign: 'center', color: primaryColor }}>Is it cool if we text you to invite you to events involving {props.nickname}?</Text>
                    <View style={{ justifyContent: 'space-evenly', height: '50%'}}>
                        <TouchableOpacity onPress={yesEvent} style={styles.optionContainer}>
                            <Text style={styles.optionText}>Yes</Text>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={noEvent} style={styles.optionContainer}>
                            <Text style={styles.optionText}>No</Text>
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
    optionContainer: { 
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
    optionText: {
        fontSize: 17,
        color: secondaryColor,
        fontWeight: 'bold'
    }
});
