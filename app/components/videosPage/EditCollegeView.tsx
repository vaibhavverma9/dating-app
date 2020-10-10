import React, { useState, useContext, useEffect } from 'react';
import { View, Text, TextInput, TouchableWithoutFeedback, TouchableOpacity, Keyboard, StyleSheet } from 'react-native';
import { _storeCollege, _storeCollegeLatitude, _storeCollegeLongitude  } from '../../utils/asyncStorage';
import { useMutation, useLazyQuery } from '@apollo/client';
import { UPDATE_COLLEGE, GET_COLLEGES } from '../../utils/graphql/GraphqlClient';
import { UserIdContext } from '../../utils/context/UserIdContext'
import { colors } from '../../styles/colors';
import Autocomplete from 'react-native-autocomplete-input';

export default function EditNameView(props) {

    const [userId, setUserId] = useContext(UserIdContext);
    const [college, setCollege] = useState(props.route.params.college); 
    const [updateCollege, { updateCollegeData }] = useMutation(UPDATE_COLLEGE);
    const [submitHidden, setSubmitHidden] = useState(true); 
    const [colleges, setColleges] = useState(null); 
    const [filteredColleges, setFilteredColleges] = useState(null); 
    const [hideResults, setHideResults] = useState(true); 
    const [collegeId, setCollegeId] = useState(null); 
    const [collegeLatitude, setCollegeLatitude] = useState(null); 
    const [collegeLongitude, setCollegeLongitude] = useState(null); 

    const [getColleges, { data: collegeData }] = useLazyQuery(GET_COLLEGES, 
        { 
          onCompleted: (collegeData) => { processColleges(collegeData) } 
    }); 

    useEffect(() => {
        getColleges(); 
    }, []);

    useEffect(() => {
        props.navigation.addListener('focus', () => {
            getColleges(); 
        });  
      }, [props.navigation]);

    function processColleges(collegeData){
        setColleges(collegeData.colleges); 
        setFilteredColleges(collegeData.colleges);
    }


    function onSubmit(){
        _storeCollege(college); 
        _storeCollegeLatitude(collegeLatitude);
        _storeCollegeLongitude(collegeLongitude);  
        updateCollege({ variables: { userId, college, collegeId: collegeId }});
        props.navigation.goBack(); 
    }

    function handleSelectItem(item){
        setCollege(item.name); 
        setCollegeId(item.id); 
        setCollegeLatitude(item.latitude);
        setCollegeLongitude(item.longitude); 
        setHideResults(true); 
        setSubmitHidden(false); 
    }

    function handleChangeText(item){
        setCollege(item); 
        setHideResults(false);
        setSubmitHidden(true); 
        const filteredColleges = colleges.filter(college => {
            return college.name.toLowerCase().match( item.toLowerCase() ) || college.nickname.toLowerCase().match( item.toLowerCase() );
        });
        setFilteredColleges(filteredColleges); 
    }

    function SubmitButton(){
        if(submitHidden){
            return null;
        } else {
            return (
                <View style={{ paddingTop: '5%' }}>
                    <TouchableOpacity onPress={onSubmit} style={styles.submitContainer}>
                        <Text style={styles.submitText}>Submit</Text>
                    </TouchableOpacity>
                </View>
            )
        }
    }

    if(filteredColleges) {
        return (
            <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                <View style={{ backgroundColor: colors.primaryBlack, flex: 1, alignItems: 'center', paddingTop: 30 }}>
                    <Autocomplete
                        data={filteredColleges}
                        defaultValue={college}
                        onChangeText={item => handleChangeText(item)}
                        hideResults={hideResults}
                        renderItem={({ item }) => (
                            <TouchableOpacity 
                                delayPressIn={0}
                                onPress={() => handleSelectItem(item)}
                                style={{ height: 40, justifyContent: 'center'}}
                            >
                                <Text style={{ color: primaryColor, fontSize: 14}}>{item.name} ({item.nickname})</Text>
                            </TouchableOpacity>
                        )}
                        containerStyle={{ width: '100%'}}
                        keyExtractor={(item) => item.id.toString()}
                    />
                    <SubmitButton />
                </View> 
            </TouchableWithoutFeedback>
        )
    } else {
        return (
            <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                <View style={{ backgroundColor: colors.primaryBlack, flex: 1, alignItems: 'center', paddingTop: 30 }}>
                    <TextInput
                        style={{ 
                            borderWidth: 1,
                            width: '100%',
                            borderRadius: 2,
                            height: '6%',
                            color: colors.primaryBlack,  
                            borderColor: colors.secondaryWhite,
                            backgroundColor: colors.secondaryWhite, 
                            fontSize: 14,
                            paddingLeft: 5
                        }}
                        autoFocus={true}
                        onChangeText={text => setCollege(text)}
                        value={college}
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
}

const primaryColor = colors.primaryPurple;
const secondaryColor = colors.secondaryWhite; 

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