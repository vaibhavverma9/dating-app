import React, { useEffect, useState, useContext }  from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { colors } from '../../styles/colors';
import { _storeGenderInterest, _storeGenderGroup, _retrieveGender, _storeGender, _retrieveGenderInterest } from '../../utils/asyncStorage'; 
import { useMutation, useLazyQuery } from '@apollo/client';
import { UserIdContext } from '../../utils/context/UserIdContext'
import { UPDATE_GENDER_INTEREST, UPDATE_GENDER_GROUP, GET_GENDER_INTEREST, UPDATE_GENDER } from '../../utils/graphql/GraphqlClient';

export default function EditGenderInterestView(props) {

    const [userId, setUserId] = useContext(UserIdContext);
    const [updateGender, { updateGenderData }] = useMutation(UPDATE_GENDER);
    const [updateGenderGroup, { updateGenderGroupData }] = useMutation(UPDATE_GENDER_GROUP);
    const [gender, setGender] = useState(''); 
    const [genderInterest, setGenderInterest] = useState(''); 

    const [getGender, { data: genderData }] = useLazyQuery(GET_GENDER_INTEREST, 
    { 
        onCompleted: (genderData) => { 
            let gender = genderData.users[0].gender; 
            let genderInterest = genderData.users[0].genderInterest; 
            setGender(gender); 
            _storeGender(gender); 
            setGenderInterest(genderInterest);
            _storeGenderInterest(genderInterest); 
        } 
    }); 

    useEffect(() => {
        initializeGender(); 
        intializeGenderInterest(); 
    }, []);

    async function initializeGender(){
        let gender = await _retrieveGender(); 
        if(gender == ''){
            getGender({ variables: { userId }}); 
        } else {
            setGender(gender); 
        }
    }

    async function intializeGenderInterest(){
        let genderInterest = await _retrieveGenderInterest(); 
        if(genderInterest == ''){
            getGender({ variables: { userId }}); 
        } else {
            setGenderInterest(genderInterest); 
        }
    }

    const man = async () => {
        updateGender({ variables: { userId, gender: 'Man' }}); 
        _storeGender('Man'); 

        if(genderInterest == 'Men'){
            _storeGenderGroup(4);
            updateGenderGroup({ variables: { userId, group: 4}});
        } else if(genderInterest == 'Women'){
            _storeGenderGroup(1);
            updateGenderGroup({ variables: { userId, group: 1}});
        } else if(genderInterest == 'Everyone'){
            _storeGenderGroup(3);
            updateGenderGroup({ variables: { userId, group: 3}});
        }

        props.navigation.goBack(); 
    };

    const woman = async () => {
        updateGender({ variables: { userId, gender: 'Woman' }}); 
        _storeGender('Woman'); 

        if(genderInterest == 'Men'){
            _storeGenderGroup(2);
            updateGenderGroup({ variables: { userId, group: 2}});
        } else if(genderInterest == 'Women'){
            _storeGenderGroup(5);
            updateGenderGroup({ variables: { userId, group: 5}});
        } else if(genderInterest == 'Everyone'){
            _storeGenderGroup(6);
            updateGenderGroup({ variables: { userId, group: 6}});
        }
        props.navigation.goBack(); 

    };

    return (
        <View style={{ backgroundColor: colors.primaryBlack, flex: 1, paddingTop: '15%', alignItems: 'center'}}>
            <Text style={{ color: colors.primaryWhite, fontSize: 22, fontWeight: '300' }}>I am a</Text>
            <View style={{ height: '40%', paddingTop: 35, justifyContent: 'space-evenly'}}>
                <TouchableOpacity onPress={man} style={{ padding: 10, width: 200, borderWidth: 1, borderColor: colors.primaryWhite, borderRadius: 3 }}>
                    <Text style={{ color: colors.primaryWhite, fontSize: 18, fontWeight: '200', alignSelf: 'center' }}>Man</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={woman} style={{ padding: 10, width: 200, borderWidth: 1, borderColor: colors.primaryWhite, borderRadius: 3 }}>
                    <Text style={{ color: colors.primaryWhite, fontSize: 18, fontWeight: '200', alignSelf: 'center' }}>Woman</Text>
                </TouchableOpacity>
            </View>
        </View>
    )
}