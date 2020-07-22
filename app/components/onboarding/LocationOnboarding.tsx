import React, { useState, useContext, useEffect } from 'react';
import * as Location from 'expo-location';
import { Text, View, StyleSheet, TouchableOpacity } from 'react-native';
import { FontAwesome5 } from '@expo/vector-icons';
import TabStack from '../../stacks/TabStack';
import { UserIdContext } from '../../utils/context/UserIdContext'
import { useMutation } from '@apollo/client';
import { UPDATE_LATITUDE_LONGITUDE, UPDATE_CITY, UPDATE_REGION, UPDATE_ONBOARDED } from '../../utils/graphql/GraphqlClient';
import { _storeLatitude, _storeLongitude, _storeCity, _storeRegion, _storeOnboarded } from '../../utils/asyncStorage'; 
import TermsOnboarding from './TermsOnboarding';
import { colors } from '../../styles/colors';
import * as Segment from 'expo-analytics-segment';

export default function LocationOnboarding() {

    const [errorMsg, setErrorMsg] = useState(null);
    const [userId, setUserId] = useContext(UserIdContext);
    // const [updateLatitudeLongitude, { updateLatitudeLongitudeData }] = useMutation(UPDATE_LATITUDE_LONGITUDE);
    const [updateCity, { updateCityData }] = useMutation(UPDATE_CITY);
    const [updateRegion, { updateRegionData }] = useMutation(UPDATE_REGION);
    const [locationServices, setLocationServices] = useState(false); 
    const [updateOnboarded, { updateOnboardedData }] = useMutation(UPDATE_ONBOARDED);
    const [onboarded, setOnboarded] = useState(false); 

    const enableLocation = () => {
        (async () => {
            let { status } = await Location.requestPermissionsAsync();
            if (status !== 'granted') {
                setErrorMsg('Permission to access location was denied');
            }

            setLocationServices(true); 

            let location = await Location.getCurrentPositionAsync({});

            const latitude = location.coords.latitude; 
            const longitude = location.coords.longitude; 

            _storeLatitude(latitude); 
            _storeLongitude(longitude); 

            const point = {
                "type" : "Point", 
                properties: {
                    name: "EPSG:4326"
                  },
                "coordinates": [longitude, latitude]
            }; 

            // updateLatitudeLongitude({ variables: { userId, point }});

            let postalAddress = await Location.reverseGeocodeAsync({ latitude, longitude });

            const city = postalAddress[0].city; 
            const region = postalAddress[0].region; 

            _storeCity(city);
            _storeRegion(region); 

            updateCity({ variables: { userId, city }}); 
            updateRegion({ variables: { userId, region }}); 
            Segment.track("Onboarding - Enable Location");
            completeOnboarding(); 
        })();
    }

    const skipForNow = () => {
        setLocationServices(true); 
        Segment.track("Onboarding - Skip Location");
        completeOnboarding(); 
    }

    function completeOnboarding(){
        setOnboarded(true); 
        _storeOnboarded(true); 
        updateOnboarded({ variables: { userId, onboarded: true }}); 
        Segment.track("Onboarding - Complete Onboarding");
    }

    if(locationServices) {
        return (
            <TermsOnboarding />
        )
    } else {
        return (
            <View style={{ height: '100%', justifyContent: 'center', alignItems: 'center', backgroundColor: primaryColor }}>
                <View style={{ height: '40%', width: '85%', backgroundColor: secondaryColor, borderRadius: 5, padding: 10, alignItems: 'center' }}>
                    <View style={{ paddingTop: '10%', height: '25%'}}>
                        <FontAwesome5 name="city" size={45} color={primaryColor} />
                    </View>        
                    <Text style={{ fontSize: 25, textAlign: 'center', padding: 15, color: primaryColor }}>Get matches near you</Text>
                    <Text style={{ textAlign: 'center', fontSize: 14, padding: 15, color: primaryColor}}>This app uses your location to find matches near you.</Text>
                    <View style={{ paddingTop: '12%' }}>
                        <TouchableOpacity onPress={enableLocation} style={styles.locationsContainer}>
                            <Text style={styles.locationsText}>Enable Location</Text>
                        </TouchableOpacity>
                    </View>
                </View>
                <TouchableOpacity onPress={skipForNow} style={{ height: '25%', justifyContent: 'center'}}>
                    <Text style={{ fontWeight: 'bold', color: secondaryColor, fontSize: 14 }}>Skip for now</Text>
                </TouchableOpacity>
            </View>
        );
    } 
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
