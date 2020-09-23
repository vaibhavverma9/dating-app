import { View, Modal, Text, TouchableHighlight, TouchableWithoutFeedback, StyleSheet } from 'react-native';
import React from 'react'; 
import { colors } from '../../styles/colors';

export default function LikeDislikeExplanation(props) {


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
                    <View style={{ height: '75%', width: '100%'}}>
                    </View>
                </TouchableWithoutFeedback>
                <View style={{ backgroundColor: colors.primaryPurple, padding: 16, height: '25%', justifyContent: 'space-evenly', alignItems:'center', borderRadius: 4}}>
                    <View style={{ height: '30%', justifyContent: 'space-around'}}>
                        <Text style={{ fontSize: 20, fontWeight: '400', textAlign: 'center', color: colors.secondaryWhite }}>
                            Tap to see next video
                        </Text>
                        <Text style={{ fontSize: 20, fontWeight: '400', textAlign: 'center', color: colors.secondaryWhite }}>
                            Like or dislike to see next user
                        </Text>
                    </View>
                    <TouchableHighlight style={styles.pushOptionsContainer}>
                        <Text style={styles.pushOptionsText}>Got it!</Text>
                    </TouchableHighlight>
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
        height: 40, 
        justifyContent: 'center', 
        alignItems: 'center'
    }, 
    pushOptionsText: {
        fontSize: 18,
        color: colors.primaryPurple,
        fontWeight: '400'
    }
})
