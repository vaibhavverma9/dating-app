import React from 'react';
import { View, Button, Text } from 'react-native';
import { Linking } from 'expo';
import * as SMS from 'expo-sms';

export default function FeedbackView() {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#E6E6FA' }}>
          <Button title="Send feedback via SMS" onPress={sendFeedback} />
          <Text onPress={privacyPolicyLink}>Privacy Policy</Text>
      </View>
    );
}
  
const privacyPolicyLink = () => {
    Linking.openURL('http://reeltalk.me/privacypolicy'); 
};
  
async function sendFeedback () {
    const { result } = await SMS.sendSMSAsync(
      ['9496146745'],
      'Hi Vaibhav from the Reeltalk team! I have some feedback :)'
    );
};