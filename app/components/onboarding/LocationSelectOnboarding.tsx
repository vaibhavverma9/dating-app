import React, { useState, useContext } from 'react';
import { Text, View, StyleSheet } from 'react-native';
import { TouchableOpacity } from 'react-native';
import { FontAwesome5 } from '@expo/vector-icons';
import { UserIdContext } from '../../utils/context/UserIdContext'
import { useMutation } from '@apollo/client';
import { _storeGenderInterest, _storeGenderGroup } from '../../utils/asyncStorage'; 
import { colors } from '../../styles/colors';
import * as Segment from 'expo-analytics-segment';
import { _storeCity, _storeRegion, _storeOnboarded } from '../../utils/asyncStorage'; 
import { UPDATE_CITY, UPDATE_REGION, UPDATE_ONBOARDED } from '../../utils/graphql/GraphqlClient';

export default function LocationSelectOnboarding(props) {

    const [userId, setUserId] = useContext(UserIdContext);
    const [updateCity, { updateCityData }] = useMutation(UPDATE_CITY);
    const [updateRegion, { updateRegionData }] = useMutation(UPDATE_REGION);

    function locationSelected( city, region ){
        _storeCity(city);
        _storeRegion(region); 

        updateCity({ variables: { userId, city }}); 
        updateRegion({ variables: { userId, region }}); 
        Segment.track("Onboarding - Enable Location");
        props.navigation.navigate("GenderOnboarding");
    }


    function moreOptions(){
        props.navigation.navigate("LocationOnboarding");
    }

    return (
        <View style={{ height: '100%', justifyContent: 'center', alignItems: 'center', backgroundColor: primaryColor }}>
            <View style={{ height: '50%', width: '85%', backgroundColor: secondaryColor, borderRadius: 5, padding: 10, alignItems: 'center' }}>
                <View style={{ paddingTop: '10%', height: '25%'}}>
                    <FontAwesome5 name="city" size={45} color={primaryColor} />
                </View>        
                <Text style={{ fontSize: 25, fontWeight: 'bold', paddingVertical: 15, textAlign: 'center', color: primaryColor }}>Choose a nearby city</Text>
                <View style={{ justifyContent: 'space-evenly', height: '50%'}}>
                    <TouchableOpacity onPress={() => {locationSelected('New York', 'NY')}} style={styles.genderContainer}>
                        <Text style={styles.genderText}>New York, NY</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => {locationSelected('Chicago', 'IL')}} style={styles.genderContainer}>
                        <Text style={styles.genderText}>Chicago, IL</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => {locationSelected('Los Angeles', 'CA')}} style={styles.genderContainer}>
                        <Text style={styles.genderText}>Los Angeles, CA</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => {locationSelected('San Francisco', 'CA')}} style={styles.genderContainer}>
                        <Text style={styles.genderText}>San Francisco, CA</Text>
                    </TouchableOpacity>
                </View>
            </View>
            <TouchableOpacity onPress={moreOptions} style={{ height: '25%'}}>
                <Text style={{ fontWeight: 'bold', color: secondaryColor, fontSize: 14, paddingTop: '3%' }}>I don't live near these cities</Text>
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
