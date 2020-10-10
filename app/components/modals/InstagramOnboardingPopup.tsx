import { View, Modal, Text, StyleSheet, TextInput, TouchableWithoutFeedback, Keyboard } from 'react-native';
import React, { useState, useContext, useEffect } from 'react'; 
import { colors } from '../../styles/colors';
import { TouchableOpacity } from 'react-native';
import { UPDATE_INSTAGRAM_ONBOARDING } from '../../utils/graphql/GraphqlClient';
import { useMutation } from '@apollo/client';
import { UserIdContext } from '../../utils/context/UserIdContext'
import { Feather } from '@expo/vector-icons'
import { _storeInstagram } from '../../utils/asyncStorage'; 

export default function InstagramOnboardingPopup(props) {

    const [userId, setUserId] = useContext(UserIdContext);
    const [updateInstagramOnboarding, { updateInstagramOnboardingData }] = useMutation(UPDATE_INSTAGRAM_ONBOARDING);
    const [stage, setStage] = useState(0);
    const [onboardingCopy, setOnboardingCopy] = useState("Tapping on any user sends you to their Instagram."); 
    const [buttonCopy, setButtonCopy] = useState("Okay!"); 

    function submit(){
        setStage(stage + 1); 
    }

    useEffect(() => {
        if(stage == 1){
            setOnboardingCopy("If you like someone, shoot your shot by sending them a DM.");
            setButtonCopy("Sounds good!");
        } else if(stage == 2){
            updateInstagramOnboarding({ variables: { userId, instagramOnboarding: true }})
            props.setVisible(false); 
        }
    }, [stage]);
 
    return (
        <Modal
        animationType="slide"
        transparent={true}
        visible={props.visible}>
            <View style={{ flex: 1, justifyContent: 'flex-end', backgroundColor: '#00000090'}}>
                <TouchableWithoutFeedback>
                    <View style={{ height: '72%', width: '100%'}}>
                    </View>
                </TouchableWithoutFeedback>

                <View style={{ backgroundColor: colors.primaryPurple, height: '28%', justifyContent: 'space-evenly', alignItems:'center', borderRadius: 5}}>
                    <Feather name="instagram" size={45} color={colors.primaryWhite} />
                    <Text style={{ color: colors.secondaryWhite, width: '85%', textAlign: 'center', fontSize: 18, fontWeight: '500'}}>
                        {onboardingCopy}
                    </Text>
                    <View style={{ paddingBottom: 10 }}>
                        <TouchableOpacity onPress={submit} style={styles.facebookContainer}>
                            <Text style={styles.facebookText}>{buttonCopy}</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View> 
            {/* <View style={{ height: '100%', justifyContent: 'center', alignItems: 'center', backgroundColor: colors.primaryPurple }}> */}
                {/* <View style={{ height: '40%', width: '100%', backgroundColor: colors.primaryWhite, borderRadius: 5, alignItems: 'center', justifyContent: 'center' }}>
                    <Feather name="instagram" size={45} color={colors.primaryPurple} />
                    <Text style={{ textAlign: 'center', fontSize: 20, fontWeight: '500', padding: 5, paddingBottom: 10, color: colors.primaryPurple }}>On Realtalk, we connect each user to their Instagram.</Text>
                </View> */}
            {/* </View> */}

        </Modal>
    );
}

const styles = StyleSheet.create({
    facebookContainer: { 
        backgroundColor: colors.primaryPurple, 
        borderRadius: 5,
        borderColor: colors.primaryWhite,
        borderWidth: 1,
        width: 150,
        height: 40, 
        justifyContent: 'center', 
        alignItems: 'center'
    }, 
    facebookText: {
        fontSize: 17,
        color: colors.primaryWhite,
        fontWeight: 'bold'
    },

})
