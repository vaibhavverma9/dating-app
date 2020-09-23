import React, { useState, useContext } from 'react';
import { View, Text, TextInput, TouchableWithoutFeedback, TouchableOpacity, Keyboard, StyleSheet } from 'react-native';
import { _storeName, _storeInstagram } from '../../utils/asyncStorage';
import { useMutation } from '@apollo/client';
import { UPDATE_INSTAGRAM } from '../../utils/graphql/GraphqlClient';
import { UserIdContext } from '../../utils/context/UserIdContext'
import { colors } from '../../styles/colors';

export default function EditInstagramView(props) {

    const [userId, setUserId] = useContext(UserIdContext);
    const [instagram, setInstagram] = useState(props.route.params.instagram); 
    const [updateInstagram, { updateInstagramData }] = useMutation(UPDATE_INSTAGRAM);

    function onSubmit(){
        _storeInstagram(instagram); 
        updateInstagram({ variables: { userId, instagram }});
        props.navigation.goBack(); 
    }

    return (
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
            <View style={{ backgroundColor: colors.primaryBlack, flex: 1, alignItems: 'center', paddingTop: 30 }}>
                <TextInput style={{
                    borderWidth: 1,
                    width: '75%',
                    borderRadius: 5,
                    height: '8%',
                    color: colors.secondaryWhite,  
                    borderColor: colors.secondaryWhite,
                    fontSize: 20,
                    textAlign: 'center'      
                    }}
                    onFocus={() => setInstagram('@')}
                    onChangeText={text => setInstagram(text)}
                    value={instagram}
                />
                <View style={{ paddingTop: '5%' }}>
                    <TouchableOpacity onPress={onSubmit} style={styles.submitContainer}>
                        <Text style={styles.submitText}>Submit</Text>
                    </TouchableOpacity>
                </View>
            </View> 
        </TouchableWithoutFeedback>
    )
}

const styles = StyleSheet.create({
    submitContainer: { 
        backgroundColor: colors.primaryWhite, 
        borderRadius: 5,
        borderWidth: 1,
        borderColor: colors.primaryWhite,
        width: 150,
        height: 40, 
        justifyContent: 'center', 
        alignItems: 'center'
    }, 
    submitText: {
        fontSize: 14,
        color: colors.secondaryBlack,
        fontWeight: 'bold'
    }
});