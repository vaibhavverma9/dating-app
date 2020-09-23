import React, { useState, useContext, useEffect } from 'react';
import * as Location from 'expo-location';
import { Text, View, StyleSheet, TextInput, Keyboard } from 'react-native';
import { TouchableOpacity, TouchableWithoutFeedback } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { UserIdContext } from '../../utils/context/UserIdContext'
import { useMutation } from '@apollo/client';
import { UPDATE_BIRTHDAY } from '../../utils/graphql/GraphqlClient';
import { colors } from '../../styles/colors';
import * as Segment from 'expo-analytics-segment';
import DateTimePicker from '@react-native-community/datetimepicker';

export default function NameOnboarding(props) {

    const [userId, setUserId] = useContext(UserIdContext);
    const [updateBirthday, { updateBirthdayData }] = useMutation(UPDATE_BIRTHDAY);

    const initDate = new Date(Date.now() - 21 * 365.3 * 86400000); 
    const [date, setDate] = useState(initDate);


    const maxDate = new Date(Date.now() - 18 * 365.3 * 86400000); 

    const onChange = (event, selectedDate) => {
        const currentDate = selectedDate || date;
        setDate(currentDate);
    };

    function submitBirthday(){
        console.log("submitBirthday");
        updateBirthday({ variables: { userId, birthday: date }});
        props.navigation.navigate("CollegeOnboarding"); 
        Segment.track('Onboarding - Submit Age'); 
    }

    return (
        // <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
            // <View style={{ height: '100%', justifyContent: 'center', alignItems: 'center', backgroundColor: primaryColor }}>
            <View style={{  backgroundColor: primaryColor, height: '100%'}}>
                <View style={{ height: '25%', justifyContent: 'flex-end', alignItems: 'center' }}>
                    <Text style={{ fontSize: 25, fontWeight: 'bold', color: secondaryColor }}>What's your birthday?</Text>
                </View>        

                <View style={{  backgroundColor: primaryColor, height: '25%', justifyContent: 'flex-start'}}>
                    <DateTimePicker
                        testID="dateTimePicker"
                        value={date}
                        mode={'date'}
                        display="calendar"
                        onChange={onChange}
                        textColor={secondaryColor}
                        maximumDate={maxDate}
                    />
                </View>
                <View style={{ height: '25%', paddingTop: '3%', justifyContent: 'flex-start', alignItems: 'center'}}>
                    <TouchableOpacity onPress={submitBirthday} style={{        
                        borderRadius: 5,
                        width: 250,
                        height: 50, 
                        borderWidth: 1,
                        justifyContent: 'center', 
                        alignItems: 'center',
                        borderColor: '#eee'
                    }}>
                       <Text style={{ fontSize: 17, fontWeight: 'bold', color: secondaryColor }}>Submit</Text>
                    </TouchableOpacity>
                </View>
            </View>
        // {/* </TouchableWithoutFeedback> */}
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
