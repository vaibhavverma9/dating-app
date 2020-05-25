import { View, Modal, Text } from 'react-native';
import React from 'react'; 
import { TouchableWithoutFeedback, TouchableOpacity } from 'react-native-gesture-handler';
import { colors } from '../../styles/colors';
import { useDoormanUser } from 'react-native-doorman'
import { _clearDoormanUid, _clearOnboarded, _clearUserId, _clearBio, _clearName } from '../../utils/asyncStorage'; 
import { Linking } from 'expo';
import * as SMS from 'expo-sms';

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
          'Hi Vaibhav from the Reeltalk team! I have some feedback :)'
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
                    <View style={{ height: '70%', width: '100%'}}>
                    </View>
                </TouchableWithoutFeedback>
                <View style={{ backgroundColor: colors.secondaryBlack, padding: 20, height: '30%', justifyContent: 'space-around', alignItems:'flex-start', borderRadius: 5}}>
                    <TouchableOpacity onPress={sendFeedback}>
                        <Text style={{ color: colors.secondaryWhite, fontSize: 17, fontWeight: '500' }}>Send feedback via SMS</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={privacyPolicyLink}>
                        <Text style={{ color: colors.secondaryWhite, fontSize: 17, fontWeight: '500' }}>Privacy Policy</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={termsLink}>
                        <Text style={{ color: colors.secondaryWhite, fontSize: 17, fontWeight: '500' }}>Terms (EULA)</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={pressSignOut}>
                        <Text style={{ color: colors.secondaryWhite, fontSize: 17, fontWeight: '500' }}>Sign out</Text>
                    </TouchableOpacity>
                    <Text style={{ color: colors.secondaryWhite, fontSize: 14, fontWeight: '500' }}>Email at vaibhav@reeltalk.io</Text>
                 </View>
            </View> 
        </Modal>
    );
}