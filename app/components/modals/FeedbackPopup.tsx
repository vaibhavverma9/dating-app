import { View, Modal, Text, TouchableHighlight, StyleSheet, Image } from 'react-native';
import React, { useState, useContext } from 'react'; 
import { colors } from '../../styles/colors';
import { TouchableOpacity } from 'react-native-gesture-handler';
import * as StoreReview from 'expo-store-review';
import { INSERT_NPS, INSERT_NPS_FEEDBACK } from '../../utils/graphql/GraphqlClient';
import { useMutation } from '@apollo/client';
import { UserIdContext } from '../../utils/context/UserIdContext';
import * as SMS from 'expo-sms';

export default function FeedbackPopup(props) {

    const [givingFeedback, setGivingFeedback] = useState(false); 
    const [insertNps, { insertNpsData }] = useMutation(INSERT_NPS); 
    const [userId, setUserId] = useContext(UserIdContext);

    async function submitNps(score){

        insertNps({ variables: { userId, nps: score}})
        if(score > 8){
            StoreReview.requestReview();
            props.setVisible(false); 
        } else {
            setGivingFeedback(true); 
        }
    }

    async function sendFeedback () {
        props.setVisible(false); 
        const { result } = await SMS.sendSMSAsync(
          ['9496146745'],
          'Text feedback here :)'
        );
    };


    if(givingFeedback){
        return (
            <Modal
            animationType="slide"
            transparent={true}
            visible={props.visible}>
    
                <View style={{ flex: 1, justifyContent: 'flex-end', backgroundColor: '#00000090'}}>
                    <View style={{ backgroundColor: colors.primaryPurple, padding: 12, height: '25%', justifyContent: 'space-evenly', alignItems:'center', borderRadius: 4}}>
                        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center',  width: '100%'}}>
                            <View >
                                <TouchableOpacity onPress={sendFeedback} style={{ borderColor: colors.secondaryWhite, paddingVertical: 5, paddingHorizontal: 10, borderRadius: 4, borderWidth: 1}}>
                                    <Text style={{ fontSize: 20, fontWeight: '500', textAlign: 'center', color: colors.secondaryWhite }}>
                                        Send feedback via SMS
                                    </Text>
                                </TouchableOpacity>
                                <TouchableOpacity onPress={() => props.setVisible(false)}>
                                    <Text style={{ fontSize: 15, paddingTop: 10, fontWeight: '500', textAlign: 'center', color: colors.secondaryWhite }}>
                                        Skip
                                    </Text>
                                </TouchableOpacity>
                            </View>
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
                    <View style={{ backgroundColor: colors.primaryPurple, padding: 12, height: '25%', justifyContent: 'space-evenly', alignItems:'center', borderRadius: 4}}>
                        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center',  width: '100%'}}>
                            <View style={{ width: '90%'}}>
                                <Text style={{ fontSize: 20, fontWeight: '500', textAlign: 'center', color: colors.secondaryWhite }}>
                                    How likely are you to recommend Realtalk to a friend?
                                </Text>
                            </View>
                        </View>                
    
                        <View style={{ flexDirection: 'row', justifyContent: 'space-around', width: '100%'}}>
                            <TouchableOpacity onPress={() => {submitNps(1)}} style={{ borderColor: colors.secondaryWhite, paddingVertical: 5, paddingHorizontal: 10,  borderRadius: 3, borderWidth: 1}}>
                                <Text style={{ fontSize: 15, color: colors.secondaryWhite }}>1</Text>
                            </TouchableOpacity>
                            <TouchableOpacity onPress={() => {submitNps(2)}} style={{ borderColor: colors.secondaryWhite, paddingVertical: 5, paddingHorizontal: 10,  borderRadius: 3, borderWidth: 1}}>
                                <Text style={{ fontSize: 15, color: colors.secondaryWhite }}>2</Text>
                            </TouchableOpacity>
                            <TouchableOpacity onPress={() => {submitNps(3)}} style={{ borderColor: colors.secondaryWhite, paddingVertical: 5, paddingHorizontal: 10,  borderRadius: 3, borderWidth: 1}}>
                                <Text style={{ fontSize: 15, color: colors.secondaryWhite }}>3</Text>
                            </TouchableOpacity>
                            <TouchableOpacity onPress={() => {submitNps(4)}} style={{ borderColor: colors.secondaryWhite, paddingVertical: 5, paddingHorizontal: 10,  borderRadius: 3, borderWidth: 1}}>
                                <Text style={{ fontSize: 15, color: colors.secondaryWhite }}>4</Text>
                            </TouchableOpacity>
                            <TouchableOpacity onPress={() => {submitNps(5)}} style={{ borderColor: colors.secondaryWhite, paddingVertical: 5, paddingHorizontal: 10,  borderRadius: 3, borderWidth: 1}}>
                                <Text style={{ fontSize: 15, color: colors.secondaryWhite }}>5</Text>
                            </TouchableOpacity>
                            <TouchableOpacity onPress={() => {submitNps(6)}} style={{ borderColor: colors.secondaryWhite, paddingVertical: 5, paddingHorizontal: 10,  borderRadius: 3, borderWidth: 1}}>
                                <Text style={{ fontSize: 15, color: colors.secondaryWhite }}>6</Text>
                            </TouchableOpacity>
                            <TouchableOpacity onPress={() => {submitNps(7)}} style={{ borderColor: colors.secondaryWhite, paddingVertical: 5, paddingHorizontal: 10,  borderRadius: 3, borderWidth: 1}}>
                                <Text style={{ fontSize: 15, color: colors.secondaryWhite }}>7</Text>
                            </TouchableOpacity>
                            <TouchableOpacity onPress={() => {submitNps(8)}} style={{ borderColor: colors.secondaryWhite, paddingVertical: 5, paddingHorizontal: 10,  borderRadius: 3, borderWidth: 1}}>
                                <Text style={{ fontSize: 15, color: colors.secondaryWhite }}>8</Text>
                            </TouchableOpacity>
                            <TouchableOpacity onPress={() => {submitNps(9)}} style={{ borderColor: colors.secondaryWhite, paddingVertical: 5, paddingHorizontal: 10,  borderRadius: 3, borderWidth: 1}}>
                                <Text style={{ fontSize: 15, color: colors.secondaryWhite }}>9</Text>
                            </TouchableOpacity>
                            <TouchableOpacity onPress={() => {submitNps(10)}} style={{ borderColor: colors.secondaryWhite, paddingVertical: 5, paddingHorizontal: 10,  borderRadius: 3, borderWidth: 1}}>
                                <Text style={{ fontSize: 15, color: colors.secondaryWhite }}>10</Text>
                            </TouchableOpacity>
    
                        </View>
                    </View>
                </View> 
            </Modal>
        );
    }
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
