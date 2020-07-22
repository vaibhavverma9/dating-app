import { View, Modal, Text, TouchableHighlight, StyleSheet } from 'react-native';
import React from 'react'; 
import { TouchableWithoutFeedback } from 'react-native-gesture-handler';
import { colors } from '../../styles/colors';
import { TouchableOpacity } from 'react-native';

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
                <View style={{ backgroundColor: colors.primaryPurple, height: '25%', justifyContent: 'space-evenly', alignItems:'center', borderRadius: 5}}>
                    <Text style={{ color: colors.secondaryWhite, fontSize: 16}}>
                        Users won't see your likes until you add a video!
                    </Text>
                    <View style={{ alignItems: 'center'}}>
                        <TouchableOpacity onPress={props.goToAddVideo} style={styles.facebookContainer}>
                            <Text style={styles.facebookText}>Add Video</Text>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={onScreenPress} style={{ paddingTop: 10}}>
                            <Text style={{ color: colors.secondaryWhite}}>
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
