import React, { useState, useContext, useEffect } from 'react';
import * as Location from 'expo-location';
import { Text, View, StyleSheet, TextInput, Keyboard } from 'react-native';
import { TouchableOpacity, TouchableWithoutFeedback } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { UserIdContext } from '../../utils/context/UserIdContext'
import { useMutation } from '@apollo/client';
import { UPDATE_NAME } from '../../utils/graphql/GraphqlClient';
import { _storeName } from '../../utils/asyncStorage'; 
import GenderOnboarding from './GenderOnboarding';
import { colors } from '../../styles/colors';
import * as Segment from 'expo-analytics-segment';

export default function NameOnboarding(props) {

    const [userId, setUserId] = useContext(UserIdContext);
    const [updateName, { updateNameData }] = useMutation(UPDATE_NAME);
    const [nameSubmitted, setNameSubmitted] = useState(false); 
    const [name, setName] = useState('Ex: Kevin, Angela'); 

    const submitName = () => {
         _storeName(name); 
         updateName({ variables: { userId, firstName: name }});
        //  setNameSubmitted(true); 
         Segment.track('Onboarding - Submit Name'); 
        props.navigation.navigate("LocationSelectOnboarding"); 
    }

    return (
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
            <View style={{ height: '100%', justifyContent: 'center', alignItems: 'center', backgroundColor: primaryColor }}>
                <View style={{ height: '50%', width: '85%', backgroundColor: secondaryColor, borderRadius: 5, padding: 10, alignItems: 'center' }}>
                    <View style={{ paddingTop: '10%', height: '25%'}}>
                        <Ionicons name="md-person" size={45} color={primaryColor} />
                    </View>        
                    <Text style={{ fontSize: 22, fontWeight: 'bold', padding: 15, height: '25%', color: primaryColor }}>What's your first name?</Text>
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
                        onFocus={() => setName('')}
                        onChangeText={text => setName(text)}
                        value={name}
                    />
                    <View style={{ paddingTop: '12%' }}>
                        <TouchableOpacity onPress={submitName} style={styles.locationsContainer}>
                            <Text style={styles.locationsText}>Submit Name</Text>
                        </TouchableOpacity>
                    </View>
                </View>
                <View style={{ height: '25%', justifyContent: 'center'}}>
                </View>
            </View>
        </TouchableWithoutFeedback>
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
});
