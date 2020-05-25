import React, { useEffect } from 'react';
import { View, Button, Text } from 'react-native';
import { Linking } from 'expo';
import * as SMS from 'expo-sms';
import * as Segment from 'expo-analytics-segment';
import { TouchableOpacity } from 'react-native-gesture-handler';
import { useDoormanUser } from 'react-native-doorman'
import { _clearDoormanUid, _clearOnboarded, _clearUserId, _clearBio, _clearName } from '../../utils/asyncStorage'; 

export default function FeedbackView() {

  const { signOut } = useDoormanUser();

  const pressSignOut = async () => {
    await _clearDoormanUid();
    await _clearOnboarded(); 
    await _clearUserId();  
    await _clearBio();
    await _clearName(); 
    signOut();
  }
  

  useEffect(() => {
    Segment.screen('Feedback'); 
  }, [])
  
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#E6E6FA' }}>
          <Button title="Send feedback via SMS" onPress={sendFeedback} />
          <Text onPress={privacyPolicyLink} style={{padding: '1%'}}>Privacy Policy</Text>
          <Text onPress={termsLink} style={{padding: '1%'}}>Terms (EULA)</Text>
          <Text style={{padding: '1%'}}>Email: vaibhav@reeltalk.io </Text>

          <TouchableOpacity style={{padding: '2%'}} onPress={pressSignOut}>
            <Text>Sign out!</Text>
          </TouchableOpacity>

      </View>
    );
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