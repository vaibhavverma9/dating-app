import React, { useState, useContext } from 'react';
import { View, Text, TextInput, TouchableWithoutFeedback, TouchableOpacity, Keyboard, StyleSheet } from 'react-native';
import { _storeName } from '../../utils/asyncStorage';
import { useMutation } from '@apollo/client';
import { UPDATE_NAME } from '../../utils/graphql/GraphqlClient';
import { UserIdContext } from '../../utils/context/UserIdContext'
import { colors } from '../../styles/colors';

export default function EditNameView(props) {

    const [userId, setUserId] = useContext(UserIdContext);
    const [name, setName] = useState(props.route.params.name); 
    const [updateName, { updateNameData }] = useMutation(UPDATE_NAME);

    function onSubmit(){
        _storeName(name); 
        updateName({ variables: { userId, firstName: name }});
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
                    autoFocus={true}
                    onChangeText={text => setName(text)}
                    value={name}
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