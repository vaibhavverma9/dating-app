import { View, Modal, Text, TouchableHighlight, StyleSheet } from 'react-native';
import React from 'react'; 
import { TouchableWithoutFeedback } from 'react-native-gesture-handler';

export default function AddVideoPopup(props) {

    function onScreenPress(){
        console.log("onScreenPress"); 
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
                <View style={{ backgroundColor: '#fff', padding: 20, height: '20%', justifyContent: 'space-evenly', alignItems:'center'}}>
                    <TouchableHighlight onPress={props.goToAddVideo} style={styles.facebookContainer}>
                        <Text style={styles.facebookText}>Add Video</Text>
                    </TouchableHighlight>
                    <Text>
                        Users won't see your likes until you add a video!
                    </Text>
                </View>
            </View> 
        </Modal>
    );
}

const styles = StyleSheet.create({
    facebookContainer: { 
        backgroundColor: '#734f96', 
        borderRadius: 5,
        width: 300,
        height: 50, 
        justifyContent: 
        'center', 
        alignItems: 'center'
    }, 
    facebookText: {
        fontSize: 17,
        color: '#fff'
    }
})
