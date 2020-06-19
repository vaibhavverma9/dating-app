import { View, Modal, Text, TouchableHighlight, StyleSheet } from 'react-native';
import React from 'react'; 
import { TouchableWithoutFeedback } from 'react-native-gesture-handler';
import { colors } from '../../styles/colors';

export default function AddVideoPopup(props) {

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
                <View style={{ backgroundColor: colors.primaryPurple, padding: 20, height: '20%', justifyContent: 'space-evenly', alignItems:'center', borderRadius: 5}}>
                    <TouchableHighlight onPress={props.goToAddVideo} style={styles.facebookContainer}>
                        <Text style={styles.facebookText}>Add Video</Text>
                    </TouchableHighlight>
                    <Text style={{ color: colors.secondaryWhite}}>
                        Users won't see your likes until you add a video!
                    </Text>
                </View>
            </View> 
        </Modal>
    );
}

const styles = StyleSheet.create({
    facebookContainer: { 
        backgroundColor: colors.secondaryWhite, 
        borderRadius: 5,
        width: 300,
        height: 50, 
        justifyContent: 
        'center', 
        alignItems: 'center'
    }, 
    facebookText: {
        fontSize: 17,
        color: colors.primaryBlack
    }
})
