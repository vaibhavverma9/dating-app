import React, { useState, useContext, useEffect } from 'react';
import * as Location from 'expo-location';
import { Text, View, StyleSheet, TextInput, Keyboard } from 'react-native';
import { TouchableOpacity, TouchableWithoutFeedback } from 'react-native-gesture-handler';
import { Ionicons } from '@expo/vector-icons';
import { UserIdContext } from '../../utils/context/UserIdContext'
import { useMutation, useLazyQuery } from '@apollo/client';
import { UPDATE_COLLEGE, GET_COLLEGES } from '../../utils/graphql/GraphqlClient';
import { _storeLatitude, _storeLongitude, _storeCollege } from '../../utils/asyncStorage'; 
import { colors } from '../../styles/colors';
import LocationOnboarding from './LocationOnboarding';
import Autocomplete from 'react-native-autocomplete-input';

export default function CollegeOnboarding() {

    const [userId, setUserId] = useContext(UserIdContext);
    const [updateCollege, { updateCollegeData }] = useMutation(UPDATE_COLLEGE);
    const [collegeSubmitted, setCollegeSubmitted] = useState(false); 
    const [college, setCollege] = useState(''); 
    const [submitHidden, setSubmitHidden] = useState(true); 
    const [colleges, setColleges] = useState(null); 
    const [filteredColleges, setFilteredColleges] = useState(null); 
    const [hideResults, setHideResults] = useState(true); 
    const [collegeId, setCollegeId] = useState(null); 

    const [getColleges, { data: collegeData }] = useLazyQuery(GET_COLLEGES, 
        { 
          onCompleted: (collegeData) => { processColleges(collegeData) } 
    }); 

    useEffect(() => {
        getColleges(); 
    }, []);

    function processColleges(collegeData){
        setColleges(collegeData.colleges); 
        setFilteredColleges(collegeData.colleges);
    }

    const submitCollege = () => {
        _storeCollege(college); 
         updateCollege({ variables: { userId, college: college, collegeId: collegeId }});
         setCollegeSubmitted(true); 
    }

    function handleSelectItem(item){
        setCollege(item.name); 
        setCollegeId(item.id); 
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
                <View style={{ paddingTop: '12%' }}>
                    <TouchableOpacity onPress={submitCollege} style={styles.locationsContainer}>
                        <Text style={styles.locationsText}>Submit</Text>
                    </TouchableOpacity>
                </View>
            )    
        }
    }
    
    if(collegeSubmitted) {
        return (
            <LocationOnboarding />
        )
    } else if(filteredColleges) {
        return (
            <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                <View style={{ height: '100%', justifyContent: 'center', alignItems: 'center', backgroundColor: primaryColor }}>
                    <View style={{ height: '40%', width: '85%', backgroundColor: secondaryColor, borderRadius: 5, padding: 10, alignItems: 'center' }}>
                        <View style={{ paddingTop: '10%', height: '25%'}}>
                            <Ionicons name="md-person" size={45} color={primaryColor} />
                        </View>        
                        <Text style={{ fontSize: 25, fontWeight: 'bold', padding: 15, height: '25%', color: primaryColor }}>Choose a college</Text>

                        <View style={{ 
                            height: '15%',
                            width: '100%', 
                            alignItems: 'center', 
                        }}>

                        <Autocomplete
                            data={filteredColleges}
                            defaultValue={college}
                            onChangeText={item => handleChangeText(item)}
                            hideResults={hideResults}
                            renderItem={({ item }) => (
                                <TouchableOpacity 
                                    onPress={() => handleSelectItem(item)}
                                    style={{ height: 40, justifyContent: 'center'}}
                                >
                                  <Text style={{ color: primaryColor, fontSize: 14}}>{item.name} ({item.nickname})</Text>
                                </TouchableOpacity>
                            )}
                            containerStyle={{ width: '100%'}}
                            keyExtractor={(item) => item.id.toString()}
                        />
                        </View>
                        <SubmitButton />
                    </View>
                    <View style={{ height: '25%', justifyContent: 'center'}}>
                    </View>
                </View>
            </TouchableWithoutFeedback>
        );
    } else {
        return(
            <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
            <View style={{ height: '100%', justifyContent: 'center', alignItems: 'center', backgroundColor: primaryColor }}>
                <View style={{ height: '40%', width: '85%', backgroundColor: secondaryColor, borderRadius: 5, padding: 10, alignItems: 'center' }}>
                    <View style={{ paddingTop: '10%', height: '25%'}}>
                        <Ionicons name="md-person" size={45} color={primaryColor} />
                    </View>        
                    <Text style={{ fontSize: 25, fontWeight: 'bold', padding: 15, height: '25%', color: primaryColor }}>Choose a college</Text>
                    <View style={{ 
                            height: '15%',
                            width: '100%', 
                            alignItems: 'center', 
                        }}>
                    </View>    
                    <SubmitButton />
                </View>
                <View style={{ height: '25%', justifyContent: 'center'}}>
                </View>
            </View>
        </TouchableWithoutFeedback>
        )
    }
}

const primaryColor = colors.primaryPurple;
const secondaryColor = colors.secondaryWhite; 

const styles = StyleSheet.create({
    locationsContainer: { 
        backgroundColor: primaryColor, 
        borderRadius: 5,
        width: 250,
        height: 50, 
        justifyContent: 'center', 
        alignItems: 'center'
    }, 
    locationsText: {
        fontSize: 17,
        color: secondaryColor,
        fontWeight: 'bold'
    }
});
