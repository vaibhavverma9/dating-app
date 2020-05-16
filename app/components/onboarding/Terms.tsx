import React, { useState, useContext } from 'react';
import { Text, View, StyleSheet } from 'react-native';
import { TouchableOpacity } from 'react-native-gesture-handler';
import { Ionicons } from '@expo/vector-icons';
import TabStack from '../../stacks/TabStack';
import { _storeOnboarded } from '../../utils/asyncStorage'; 
import { UPDATE_ONBOARDED } from '../../utils/graphql/GraphqlClient';
import { useMutation } from '@apollo/client';
import { UserIdContext } from '../../utils/context/UserIdContext'
import { Linking } from 'expo';

export default function Terms() {

    const [accepted, setAccepted] = useState(false); 
    const [updateOnboarded, { updateOnboardedData }] = useMutation(UPDATE_ONBOARDED);
    const [onboarded, setOnboarded] = useState(false); 
    const [userId, setUserId] = useContext(UserIdContext);

    const acceptTerms = () => {
        setAccepted(true); 
        setOnboarded(true); 
        _storeOnboarded(true); 
        updateOnboarded({ variables: { userId, onboarded: true }}); 
    }

    const termsLink = () => {
        Linking.openURL('https://reeltalk.me/terms-and-conditions'); 
      }
      

    if(accepted){
        return (
            <TabStack />
        ) 
    } else {
        return (
            <View style={{ height: '100%', justifyContent: 'center', alignItems: 'center', backgroundColor: primaryColor }}>
                <View style={{ height: '40%', width: '85%', backgroundColor: secondaryColor, borderRadius: 5, padding: 10, alignItems: 'center' }}>
                    <View style={{ paddingTop: '10%', height: '25%'}}>
                        <Ionicons name="ios-paper" size={45} color={primaryColor} />
                    </View>        
                    <Text onPress={termsLink} style={{ fontSize: 25, fontWeight: 'bold', padding: 15, color: primaryColor }}>Terms and conditions</Text>
                    <Text onPress={termsLink} style={{ textAlign: 'center', fontSize: 18, padding: 15, color: primaryColor, textDecorationLine: 'underline'}}>Please read and approve terms here.</Text>
                    <View style={{ paddingTop: '12%' }}>
                        <TouchableOpacity onPress={acceptTerms} style={styles.acceptContainer}>
                            <Text style={styles.acceptText}>Accept Terms</Text>
                        </TouchableOpacity>
                    </View>
                </View>
                <View style={{ height: '25%', justifyContent: 'center'}}>
                </View>

            </View>
        );
    }
}

const primaryColor = "#E6E6FA";
const secondaryColor = "#734f96"; 

const styles = StyleSheet.create({
    acceptContainer: { 
        backgroundColor: primaryColor, 
        borderRadius: 5,
        width: 250,
        height: 50, 
        justifyContent: 'center', 
        alignItems: 'center'
    }, 
    acceptText: {
        fontSize: 17,
        color: secondaryColor,
        fontWeight: 'bold'
    }
})
