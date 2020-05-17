import React, { useState, useContext, useEffect } from 'react';
import * as Location from 'expo-location';
import { Text, View, StyleSheet } from 'react-native';
import { TouchableOpacity } from 'react-native-gesture-handler';
import { FontAwesome5 } from '@expo/vector-icons';
import TabStack from '../../stacks/TabStack';
import { UserIdContext } from '../../utils/context/UserIdContext'
import { useMutation } from '@apollo/client';
import { UPDATE_LATITUDE_LONGITUDE } from '../../utils/graphql/GraphqlClient';
import { _storeLatitude, _storeLongitude } from '../../utils/asyncStorage'; 
import TermsOnboarding from './TermsOnboarding';

export default function LocationOnboarding() {

    const [errorMsg, setErrorMsg] = useState(null);
    const [userId, setUserId] = useContext(UserIdContext);
    const [updateLatitudeLongitude, { updateLatitudeLongitudeData }] = useMutation(UPDATE_LATITUDE_LONGITUDE);
    const [locationServices, setLocationServices] = useState(false); 

    const enableLocation = () => {
        (async () => {
            let { status } = await Location.requestPermissionsAsync();
            if (status !== 'granted') {
                setErrorMsg('Permission to access location was denied');
            }

            let location = await Location.getCurrentPositionAsync({});

            setLocationServices(true); 
            _storeLatitude(location.coords.latitude); 
            _storeLongitude(location.coords.longitude); 

            const point = {
                "type" : "Point", 
                properties: {
                    name: "EPSG:4326"
                  },
                "coordinates": [location.coords.longitude, location.coords.latitude]
            }; 

            console.log(point); 

            updateLatitudeLongitude({ variables: { userId, point }});
        })();
    }

    const skipForNow = () => {
        setLocationServices(true); 
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
                    <Text style={{ fontSize: 25, fontWeight: 'bold', padding: 15, color: primaryColor }}>Get matches near you</Text>
                    <Text style={{ textAlign: 'center', fontSize: 18, padding: 15, color: primaryColor}}>This app uses your location to find matches near you.</Text>
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

const primaryColor = "#E6E6FA";
const secondaryColor = "#734f96"; 

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
