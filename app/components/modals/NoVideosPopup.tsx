import { View, Modal, Text, TouchableHighlight, StyleSheet } from 'react-native';
import React, { useState } from 'react'; 
import { TouchableWithoutFeedback } from 'react-native-gesture-handler';
import { colors } from '../../styles/colors';
import { TouchableOpacity } from 'react-native';
import * as Segment from 'expo-analytics-segment';
import axios from 'axios';

export default function NoVideosPopup(props) {

    const [notifyingUser, setNotifyingUser] = useState(false); 

    function onScreenPress(){
        props.setVisible(false); 
        setNotifyingUser(false); 
    }

    function notifyUser(){ 
        setNotifyingUser(true);
        sendVideoRequest(props.requestedId, props.requesterName);
        Segment.track("Likes Page - Request Video")
    }

    async function sendVideoRequest(requestedId, requesterName) {
        let res = await axios({
          method: 'post', 
          url: 'https://gentle-brook-91508.herokuapp.com/videoRequest',
          data: { "requestedId" : requestedId, "requesterName" : requesterName }
        }); 
    }

    if(notifyingUser){
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
    
                    <View style={{ backgroundColor: colors.primaryPurple, height: '20%', justifyContent: 'center', alignItems:'center', borderRadius: 5}}>
                        <Text style={{ color: colors.secondaryWhite, width: '85%', textAlign: 'center', fontSize: 16, fontWeight: '500', paddingBottom: 20}}>
                            Cool! We just asked {props.name} to post a video!
                        </Text>
                        <View style={{ flexDirection: 'row', justifyContent: 'space-evenly', width: '85%'}}>
                            <TouchableOpacity onPress={onScreenPress} style={styles.containerLong}>
                                <Text style={styles.facebookText}>Ok</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View> 
            </Modal>
        );
    } else {
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
    
                    <View style={{ backgroundColor: colors.primaryPurple, height: '20%', justifyContent: 'center', alignItems:'center', borderRadius: 5}}>
                        <Text style={{ color: colors.secondaryWhite, width: '85%', textAlign: 'center', fontSize: 16, fontWeight: '500', paddingBottom: 20}}>
                            {props.name} has not posted any videos yet. Do you want to ask {props.name} to post a video?
                        </Text>
                        <View style={{ flexDirection: 'row', justifyContent: 'space-evenly', width: '85%'}}>
                            <TouchableOpacity onPress={onScreenPress} style={styles.facebookContainer}>
                                <Text style={styles.facebookText}>No</Text>
                            </TouchableOpacity>
                            <TouchableOpacity onPress={notifyUser} style={styles.facebookContainer}>
                                <Text style={styles.facebookText}>Yes</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View> 
            </Modal>
        );
    }
}

const styles = StyleSheet.create({
    facebookContainer: { 
        backgroundColor: colors.secondaryWhite, 
        borderRadius: 5,
        width: 100,
        height: 40, 
        justifyContent: 
        'center', 
        alignItems: 'center'
    }, 
    containerLong: { 
        backgroundColor: colors.secondaryWhite, 
        borderRadius: 5,
        width: 200,
        height: 40, 
        justifyContent: 
        'center', 
        alignItems: 'center'
    }, 
    facebookText: {
        fontSize: 17,
        color: colors.primaryBlack
    }
})
