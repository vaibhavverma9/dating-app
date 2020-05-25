import React, { useState, useContext } from 'react';
import { View, Text, TextInput, TouchableWithoutFeedback, TouchableOpacity, Keyboard, StyleSheet } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { _storeBio } from '../../utils/asyncStorage';
import { useMutation } from '@apollo/client';
import { UPDATE_BIO } from '../../utils/graphql/GraphqlClient';
import { UserIdContext } from '../../utils/context/UserIdContext'
import { colors } from '../../styles/colors';

export default function EditBioView(props) {

    const [userId, setUserId] = useContext(UserIdContext);
    const [bio, setBio] = useState(props.route.params.bio); 
    const [updateBio, { updateBioData }] = useMutation(UPDATE_BIO);

    function onSubmit(){
        _storeBio(bio); 
        updateBio({ variables: { userId, bio }})
        props.navigation.goBack(); 
    }

    return (
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
            <View style={{ backgroundColor: colors.primaryBlack, flex: 1, alignItems: 'center', paddingTop: 30}}>
                <TextInput style={{
                    borderWidth: 1,
                    width: '90%',
                    borderRadius: 5,
                    color: colors.secondaryWhite,  
                    borderColor: colors.secondaryWhite,
                    fontSize: 15,
                    textAlign: 'left',
                    padding: 10
                    }}
                    autoFocus={true}
                    onChangeText={text => setBio(text)}
                    value={bio}
                    autoCapitalize={"sentences"}
                    autoCorrect={true}
                    multiline={true}
                    maxLength={80}
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
        width: 150,
        height: 40, 
        borderColor: colors.primaryWhite,
        justifyContent: 'center', 
        alignItems: 'center'
    }, 
    submitText: {
        fontSize: 14,
        color: colors.secondaryBlack,
        fontWeight: 'bold'
    }
});