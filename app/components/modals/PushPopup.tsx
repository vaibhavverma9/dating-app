import { View, Modal, Text, TouchableHighlight, StyleSheet } from 'react-native';
import React from 'react'; 
import { TouchableWithoutFeedback } from 'react-native-gesture-handler';
import { colors } from '../../styles/colors';

export default function PushPopup(props) {

    function onScreenPress(){
        props.setVisible(false); 
    }   

    function pushPopup() {
        props.registerForPushNotificationsAsync(); 
        props.setVisible(false); 
    }

    return (
        <Modal
        animationType="slide"
        transparent={true}
        visible={props.visible}>

            <View style={{ flex: 1, justifyContent: 'flex-end', backgroundColor: '#00000090'}}>
                {/* <TouchableWithoutFeedback onPress={onScreenPress}>
                    <View style={{ height: '80%', width: '100%'}}>
                    </View>
                </TouchableWithoutFeedback> */}
                <View style={{ backgroundColor: colors.primaryPurple, padding: 16, height: '25%', justifyContent: 'space-evenly', alignItems:'center', borderRadius: 4}}>
                    <Text style={{ fontSize: 20, fontWeight: 'bold', textAlign: 'center', color: colors.secondaryWhite }}>
                        Would you like to be notified when users like you back?
                    </Text>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-around', width: '100%'}}>
                        <TouchableHighlight onPress={props.setVisible} style={styles.pushOptionsContainer}>
                            <Text style={styles.pushOptionsText}>No</Text>
                        </TouchableHighlight>
                        <TouchableHighlight onPress={pushPopup} style={styles.pushOptionsContainer}>
                            <Text style={styles.pushOptionsText}>Yes</Text>
                        </TouchableHighlight>
                    </View>
                </View>
            </View> 
        </Modal>
    );
}

const styles = StyleSheet.create({
    pushOptionsContainer: { 
        backgroundColor: colors.primaryWhite, 
        borderRadius: 5,
        width: 150,
        height: 50, 
        justifyContent: 'center', 
        alignItems: 'center'
    }, 
    pushOptionsText: {
        fontSize: 18,
        color: colors.primaryPurple,
        fontWeight: '400'
    }
})
