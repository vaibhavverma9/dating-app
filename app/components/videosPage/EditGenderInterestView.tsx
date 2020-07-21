import React, { useEffect, useState, useContext }  from 'react';
import { View, Text } from 'react-native';
import { colors } from '../../styles/colors';
import { _storeGenderInterest, _storeGenderGroup, _retrieveGender, _storeGender } from '../../utils/asyncStorage'; 
import { useMutation, useLazyQuery } from '@apollo/client';
import { UserIdContext } from '../../utils/context/UserIdContext'
import { TouchableOpacity } from 'react-native-gesture-handler';
import { UPDATE_GENDER_INTEREST, UPDATE_GENDER_GROUP, GET_GENDER_INTEREST } from '../../utils/graphql/GraphqlClient';

export default function EditGenderInterestView(props) {

    const [userId, setUserId] = useContext(UserIdContext);
    const [updateGenderInterest, { updateGenderInterestData }] = useMutation(UPDATE_GENDER_INTEREST);
    const [updateGenderGroup, { updateGenderGroupData }] = useMutation(UPDATE_GENDER_GROUP);
    const [gender, setGender] = useState(''); 

    const [getGender, { data: genderData }] = useLazyQuery(GET_GENDER_INTEREST, 
    { 
        onCompleted: (genderData) => { 
            let gender = genderData.users[0].gender; 
            setGender(gender); 
            _storeGender(gender); 
        } 
    }); 

    useEffect(() => {
        initializeGender(); 
    }, []);

    async function initializeGender(){
        let gender = await _retrieveGender(); 
        if(gender == ''){
            getGender({ variables: { userId }}); 
        } else {
            setGender(gender); 
        }
    }

    const interestMan = async () => {
        updateGenderInterest({ variables: { userId, genderInterest: 'Men' }});
        _storeGenderInterest('Men'); 

        if(gender == 'Man'){
            _storeGenderGroup(4); 
            updateGenderGroup({ variables: { userId, group: 4}});
        } else if(gender == 'Woman'){
            _storeGenderGroup(2); 
            updateGenderGroup({ variables: { userId, group: 2}});
        }

        props.navigation.goBack(); 
    };

    const interestWoman = async () => {
        updateGenderInterest({ variables: { userId, genderInterest: 'Women' }});
        _storeGenderInterest('Women');

        if(gender == 'Man'){
            _storeGenderGroup(1); 
            updateGenderGroup({ variables: { userId, group: 1}});
            props.navigation.goBack(); 
        } else if(gender == 'Woman'){
            _storeGenderGroup(5); 
            updateGenderGroup({ variables: { userId, group: 5}});
            props.navigation.goBack(); 
        }

    };

    const interestEveryone = async () => {
        updateGenderInterest({ variables: { userId, genderInterest: 'Everyone' }});
        _storeGenderInterest('Everyone');
        if(gender == 'Man'){
            _storeGenderGroup(3); 
            updateGenderGroup({ variables: { userId, group: 3}});
        } else if(gender == 'Woman'){
            _storeGenderGroup(6); 
            updateGenderGroup({ variables: { userId, group: 6}});            
        }

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