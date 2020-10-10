import React, { useState, useContext, useEffect } from 'react';
import * as Location from 'expo-location';
import { Text, View, StyleSheet, TextInput, Keyboard } from 'react-native';
import { TouchableOpacity, TouchableWithoutFeedback } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { UserIdContext } from '../../utils/context/UserIdContext'
import { useMutation, useLazyQuery } from '@apollo/client';
import { UPDATE_COLLEGE, GET_COLLEGES } from '../../utils/graphql/GraphqlClient';
import { _storeLatitude, _storeLongitude, _storeCollege, _storeCollegeLatitude, _storeCollegeLongitude } from '../../utils/asyncStorage'; 
import { colors } from '../../styles/colors';
import Autocomplete from 'react-native-autocomplete-input';
import * as Segment from 'expo-analytics-segment';

export default function CollegeOnboarding(props) {

    const [userId, setUserId] = useContext(UserIdContext);
    const [updateCollege, { updateCollegeData }] = useMutation(UPDATE_COLLEGE);
    const [college, setCollege] = useState(''); 
    const [nickname, setNickname] = useState('');
    const [submitHidden, setSubmitHidden] = useState(true); 
    const [colleges, setColleges] = useState([]); 
    const [filteredColleges, setFilteredColleges] = useState([]); 
    const [hideResults, setHideResults] = useState(true); 
    const [collegeId, setCollegeId] = useState(null); 
    const [collegeLatitude, setCollegeLatitude] = useState(null); 
    const [collegeLongitude, setCollegeLongitude] = useState(null); 
    const [sendBack, setSendBack] = useState(false);


    const [getColleges, { data: collegeData }] = useLazyQuery(GET_COLLEGES, 
        { 
          onCompleted: (collegeData) => { processColleges(collegeData) } 
    }); 

    useEffect(() => {
        getColleges(); 
        Segment.track("Onboarding - Submit College");
    }, []);

    function processColleges(collegeData){
        setColleges(collegeData.colleges); 
        setFilteredColleges(collegeData.colleges);
    }

    const submitCollege = () => {
        _storeCollege(college); 
        _storeCollegeLatitude(collegeLatitude);
        _storeCollegeLongitude(collegeLongitude);  

        updateCollege({ variables: { userId, college: college, collegeId: collegeId }});
        props.navigation.navigate("InstagramOnboarding")
    }

    function handleSelectItem(item){
        setCollege(item.name); 
        setCollegeId(item.id); 
        setCollegeLatitude(item.latitude);
        setCollegeLongitude(item.longitude); 
        setNickname(item.nickname); 
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
            return (
                <View style={{ paddingTop: '6%' }}>
                </View>    
            )
        } else {
            return (
                <View style={{ paddingTop: '6%' }}>
                    <TouchableOpacity onPress={submitCollege} style={styles.locationsContainer}>
                        <Text style={styles.locationsText}>Submit</Text>
                    </TouchableOpacity>
                </View>
            )    
        }
    }

    function SkipButton(){
        if(!hideResults && filteredColleges.length > 0){
            return null; 
        } else {
            return (
                <TouchableOpacity delayPresonPress={() => {props.navigation.navigate("InstagramOnboarding")}}>
                    <Text style={{ paddingTop: '3%', color: primaryColor}}>Skip</Text>
                </TouchableOpacity>
            )
        }
    }
    
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
                    <SkipButton />
                </View>
                <View style={{ height: '25%', justifyContent: 'center'}}>
                </View>
            </View>
        </TouchableWithoutFeedback>
    );
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
