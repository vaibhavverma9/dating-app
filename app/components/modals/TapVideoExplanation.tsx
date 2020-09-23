import { View, Modal, Text, TouchableHighlight, TouchableWithoutFeedback, StyleSheet } from 'react-native';
import React from 'react'; 
import { colors } from '../../styles/colors';

export default function TapVideoExplanation(props) {

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
                    <View style={{ height: '87%', width: '100%'}}>
                    </View>
                </TouchableWithoutFeedback>
                <View style={{ backgroundColor: colors.primaryPurple, padding: 16, height: '13%', justifyContent: 'space-evenly', alignItems:'center', borderRadius: 4}}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center',  width: '100%'}}>
                        <View style={{ width: '80%'}}>
                            <Text style={{ fontSize: 20, fontWeight: '400', textAlign: 'center', color: colors.secondaryWhite }}>
                                Tap current video to see next video!
                            </Text>
                        </View>
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
