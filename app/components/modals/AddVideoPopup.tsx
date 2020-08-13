import { View, Modal, Text, TouchableHighlight, StyleSheet } from 'react-native';
import React from 'react'; 
import { TouchableWithoutFeedback } from 'react-native-gesture-handler';
import { colors } from '../../styles/colors';
import { TouchableOpacity } from 'react-native';

export default function AddVideoPopup(props) {

    function remindLater(){
        props.registerForPushNotificationsAsync(); 
        props.setVisible(false); 
    }   

    function skip(){
        props.setVisible(false); 
    }

    return (
        <Modal
        animationType="slide"
        transparent={true}
        visible={props.visible}>
            <View style={{ flex: 1, justifyContent: 'flex-end', backgroundColor: '#00000090'}}>
                <View style={{ backgroundColor: colors.primaryPurple, height: '30%', justifyContent: 'space-evenly', alignItems:'center', borderRadius: 5}}>
                    <Text style={{ color: colors.secondaryWhite, fontSize: 16}}>
                        You won't get likes until you add a video!
                    </Text>
                    <View style={{ height: '60%', justifyContent: 'space-evenly'}}>
                        <TouchableOpacity onPress={props.goToAddVideo} style={styles.facebookContainer}>
                            <Text style={styles.facebookText}>Add Video</Text>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={remindLater} style={styles.facebookContainer}>
                            <Text style={styles.facebookText}>
                                Remind you later?
                            </Text>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={skip} style={styles.facebookContainer}>
                            <Text style={styles.facebookText}>
                                Skip
                            </Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View> 
        </Modal>
    );
}

const styles = StyleSheet.create({
    facebookContainer: { 
        backgroundColor: colors.secondaryWhite, 
        borderRadius: 5,
        width: 225,
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
