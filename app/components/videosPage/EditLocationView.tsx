import React, { useEffect, useState, useContext }  from 'react';
import { View, Text, TouchableOpacity} from 'react-native';
import { colors } from '../../styles/colors';
import * as Location from 'expo-location';
import { _storeLatitude, _storeLongitude, _storeCity, _storeRegion } from '../../utils/asyncStorage'; 
import { UPDATE_LATITUDE_LONGITUDE, UPDATE_CITY, UPDATE_REGION } from '../../utils/graphql/GraphqlClient';
import { useMutation } from '@apollo/client';
import { UserIdContext } from '../../utils/context/UserIdContext'

export default function EditLocationView(props) {

    const [locationServices, setLocationServices] = useState(false); 
    const [city, setCity] = useState(props.route.params.city); 
    const [region, setRegion] = useState(props.route.params.region); 
    // const [updateLatitudeLongitude, { updateLatitudeLongitudeData }] = useMutation(UPDATE_LATITUDE_LONGITUDE);
    const [updateCity, { updateCityData }] = useMutation(UPDATE_CITY);
    const [updateRegion, { updateRegionData }] = useMutation(UPDATE_REGION);
    const [userId, setUserId] = useContext(UserIdContext);
    const [buttonText, setButtonText] = useState('Set your location'); 

    useEffect(() => {
        checkLocation();
    }, []);

    async function checkLocation(){
        (async () => { 
            let { status } = await Location.getPermissionsAsync(); 
            if (status !== 'granted'){
                setLocationServices(false); 
                setButtonText('Set your location');
            } else {
                setLocationServices(true); 
                setButtonText('Update current location');
            }
        }); 
        if(city && region && city != '' && region != ''){
            setLocationServices(true); 
            setButtonText('Update current location');
        }
    }

    const enableLocation = () => {
        (async () => {
            let { status } = await Location.requestPermissionsAsync();
            if (status == 'granted') {
                setLocationServices(true); 
                setButtonText('Updated to current location'); 

                let location = await Location.getCurrentPositionAsync({});
                const latitude = location.coords.latitude; 
                const longitude = location.coords.longitude; 

                let postalAddress = await Location.reverseGeocodeAsync({ latitude, longitude });

                const city = postalAddress[0].city; 
                const region = postalAddress[0].region;  
   
                setCity(city);
                setRegion(region); 

                _storeCity(city);
                _storeRegion(region); 

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
                updateCity({ variables: { userId, city }}); 
                updateRegion({ variables: { userId, region }}); 
            }
        })();
    }

    function LocationHeader(){
        if(locationServices){
            return (
                <Text style={{ color: colors.primaryWhite, fontSize: 20, fontWeight: '600', paddingBottom: 20 }}>{city}, {region}</Text>
            )
        } else {
            return (
                <Text style={{ color: colors.primaryWhite, fontSize: 20, fontWeight: '600', paddingBottom: 20 }}>No location found</Text>
            )
        }
    }

    return (
        <View style={{ backgroundColor: colors.primaryBlack, flex: 1, paddingTop: '15%', alignItems: 'center'}}>
            <LocationHeader />
            <TouchableOpacity onPress={enableLocation} style={{ padding: 10, borderWidth: 1, borderColor: colors.primaryWhite, borderRadius: 3 }}>
                    <Text style={{ color: colors.primaryWhite, fontSize: 18, fontWeight: '200' }}>{buttonText}</Text>
            </TouchableOpacity>
        </View>
    )
}