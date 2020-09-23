import { View, Modal, Text, StyleSheet, TextInput, TouchableWithoutFeedback, Keyboard } from 'react-native';
import React, { useState, useContext } from 'react'; 
import { colors } from '../../styles/colors';
import { TouchableOpacity } from 'react-native';
import { UPDATE_INSTAGRAM } from '../../utils/graphql/GraphqlClient';
import { useMutation } from '@apollo/client';
import { UserIdContext } from '../../utils/context/UserIdContext'
import { Feather } from '@expo/vector-icons'
import { _storeInstagram } from '../../utils/asyncStorage'; 

export default function AddVideoPopup(props) {

    const [userId, setUserId] = useContext(UserIdContext);
    const [instagram, setInstagram] = useState('');
    const [updateInstagram, { updateInstagramData }] = useMutation(UPDATE_INSTAGRAM);

    function skip(){
        props.setVisible(false); 
    }

    function submit(){
        updateInstagram({ variables: { userId, instagram }});
        _storeInstagram(instagram); 
        props.setVisible(false); 
    }
 
    return (
        <Modal
        animationType="slide"
        transparent={true}
        visible={props.visible}>
            <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
            <View style={{ height: '100%', justifyContent: 'center', alignItems: 'center', backgroundColor: colors.primaryPurple }}>
                <View style={{ height: '40%', width: '85%', backgroundColor: colors.primaryWhite, borderRadius: 5, alignItems: 'center', justifyContent: 'center' }}>
                    <View style={{ paddingTop: '2%' }}>
                        <Feather name="instagram" size={45} color={colors.primaryPurple} />
                    </View>        

                    <Text style={{ textAlign: 'center', fontSize: 20, fontWeight: '500', padding: 5, paddingBottom: 10, color: colors.primaryPurple }}>Add your Instagram handle to connect with people!</Text>
                    <TextInput 
                            style={{ textAlign: 'center', 
                                    fontSize: 18, 
                                    padding: 15, 
                                    color: colors.primaryPurple,  
                                    borderColor: colors.primaryPurple,
                                    borderWidth: 1,
                                    width: '75%',
                                    borderRadius: 5
                                }}
                            onFocus={() => setInstagram('@')}
                            onChangeText={text => setInstagram(text)}
                            value={instagram}
                        />
                    <View style={{ paddingTop: '7%' }}>
                        <TouchableOpacity onPress={submit} style={styles.facebookContainer}>
                            <Text style={styles.facebookText}>Submit</Text>
                        </TouchableOpacity>
                    </View>
                    <TouchableOpacity onPress={skip}>
                        <Text style={{ fontSize: 14, fontWeight: '500', paddingTop: '4%', color: colors.primaryPurple}}>Skip</Text>
                    </TouchableOpacity>
                </View>
                <View style={{ height: '15%', justifyContent: 'center'}}>
                </View>

            </View>
            </TouchableWithoutFeedback>

        </Modal>
    );
}

const styles = StyleSheet.create({
    facebookContainer: { 
        backgroundColor: colors.primaryPurple, 
        borderRadius: 5,
        width: 250,
        height: 50, 
        justifyContent: 'center', 
        alignItems: 'center'
    }, 
    facebookText: {
        fontSize: 17,
        color: colors.primaryWhite,
        fontWeight: 'bold'
    },

})
