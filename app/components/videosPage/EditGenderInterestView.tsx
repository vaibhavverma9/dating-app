import React, { useEffect, useState, useContext }  from 'react';
import { View, Text } from 'react-native';
import { colors } from '../../styles/colors';
import { _storeGenderInterest } from '../../utils/asyncStorage'; 
import { useMutation } from '@apollo/client';
import { UserIdContext } from '../../utils/context/UserIdContext'
import { TouchableOpacity } from 'react-native-gesture-handler';
import { UPDATE_GENDER_INTEREST } from '../../utils/graphql/GraphqlClient';

export default function EditGenderInterestView(props) {

    const [userId, setUserId] = useContext(UserIdContext);
    const [updateGenderInterest, { updateGenderInterestData }] = useMutation(UPDATE_GENDER_INTEREST);

    const interestMan = () => {
        updateGenderInterest({ variables: { userId, genderInterest: 'Men' }});
        _storeGenderInterest('Men'); 
        props.navigation.goBack(); 
    };

    const interestWoman = () => {
        updateGenderInterest({ variables: { userId, genderInterest: 'Women' }});
        _storeGenderInterest('Women');
        props.navigation.goBack(); 
    };

    const interestEveryone = () => {
        updateGenderInterest({ variables: { userId, genderInterest: 'Everyone' }});
        _storeGenderInterest('Everyone');
        props.navigation.goBack(); 
    }; 

    return (
        <View style={{ backgroundColor: colors.primaryBlack, flex: 1, paddingTop: '15%', alignItems: 'center'}}>
            <Text style={{ color: colors.primaryWhite, fontSize: 22, fontWeight: '300' }}>I'm interested in</Text>
            <View style={{ height: '40%', paddingTop: 35, justifyContent: 'space-evenly'}}>
                <TouchableOpacity onPress={interestMan} style={{ padding: 10, width: 200, borderWidth: 1, borderColor: colors.primaryWhite, borderRadius: 3 }}>
                    <Text style={{ color: colors.primaryWhite, fontSize: 18, fontWeight: '200', alignSelf: 'center' }}>Men</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={interestWoman} style={{ padding: 10, width: 200, borderWidth: 1, borderColor: colors.primaryWhite, borderRadius: 3 }}>
                    <Text style={{ color: colors.primaryWhite, fontSize: 18, fontWeight: '200', alignSelf: 'center' }}>Women</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={interestEveryone} style={{ padding: 10, width: 200, borderWidth: 1, borderColor: colors.primaryWhite, borderRadius: 3 }}>
                    <Text style={{ color: colors.primaryWhite, fontSize: 18, fontWeight: '200', alignSelf: 'center' }}>Everyone</Text>
                </TouchableOpacity>
            </View>
        </View>
    )
}