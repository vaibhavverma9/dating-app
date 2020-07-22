import { View, Modal, Text } from 'react-native';
import React, { useEffect } from 'react'; 
import { colors } from '../../styles/colors';
import { useDoormanUser } from 'react-native-doorman'
import { _clearDoormanUid, _clearOnboarded, _clearUserId, _clearBio, _clearName } from '../../utils/asyncStorage'; 
import { Linking } from 'expo';
import * as SMS from 'expo-sms';
import Constants from 'expo-constants';
import { TouchableWithoutFeedback, TouchableOpacity } from 'react-native';

export default function SettingsPopup(props) {

    const { signOut } = useDoormanUser();

    const pressSignOut = async () => {
        await _clearDoormanUid();
        await _clearOnboarded(); 
        await _clearUserId();  
        await _clearBio();
        await _clearName(); 
        signOut();
    }

    const privacyPolicyLink = () => {
        Linking.openURL('http://reeltalk.me/privacypolicy'); 
    };
    
    const termsLink = () => {
      Linking.openURL('https://reeltalk.me/terms-and-conditions'); 
    }
      
    async function sendFeedback () {
        const { result } = await SMS.sendSMSAsync(
          ['9496146745'],
          'Text feedback here :)'
        );
    };
      

    function onScreenPress(){
        props.setVisible(false); 
    }   

    return (
        <Modal
        animationType="slide"
        transparent={true}
        visible={props.visible}>

            <View style={{ flex: 1, justifyContent: 'flex-end', backgroundColor: '#00000090'}}>
                <TouchableWithoutFeedback onPress={onScreenPress}>
                    <View style={{ height: '80%', width: '100%'}}>
                    </View>
                </TouchableWithoutFeedback>
                <View style={{ backgroundColor: colors.secondaryBlack, padding: 20, height: '20%', justifyContent: 'space-around', alignItems:'flex-start', borderRadius: 5}}>
                    <TouchableOpacity onPress={sendFeedback}>
                        <Text style={{ color: colors.secondaryWhite, fontSize: 17, fontWeight: '500' }}>Help Center via SMS</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={pressSignOut}>
                        <Text style={{ color: colors.secondaryWhite, fontSize: 17, fontWeight: '500' }}>Sign out</Text>
                    </TouchableOpacity>
                    <View>
                        <Text style={{ color: colors.secondaryWhite, fontSize: 14, fontWeight: '500' }}>Email vaibhav@realtalkapp.co</Text>
                        <Text style={{ color: colors.secondaryWhite, fontSize: 8, fontWeight: '500' }}>Version {Constants.manifest.ios.buildNumber}</Text>
                    </View>
                 </View>
            </View> 
        </Modal>
    );
}