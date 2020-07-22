import React, { useState, useEffect } from 'react';
import { Text, View, StyleSheet, TouchableOpacity } from 'react-native';

import { Ionicons } from '@expo/vector-icons';
import { _storeLatitude, _storeLongitude } from '../../utils/asyncStorage'; 
import GenderOnboarding from './GenderOnboarding';
import { colors } from '../../styles/colors';
import { GET_QUESTIONS, client } from '../../utils/graphql/GraphqlClient';
import ViewAllPopup from '../modals/ViewAllPopup';
import AddCameraOnboarding from './AddCameraOnboarding'; 
import { useLazyQuery } from '@apollo/client';

export default function QuestionOnboarding() {

    const [questionSelected, setQuestionSelected] = useState(false); 
    const [index, setIndex] = useState(1);
    const [questionData, setQuestionData] = useState([]);
    const [initialized, setInitialized] = useState(false); 
    const [viewAllVisible, setViewAllVisible] = useState(false); 
    const [skipped, setSkipped] = useState(false); 

    const [getQuestions, { data: questions }] = useLazyQuery(GET_QUESTIONS, 
        {
            onCompleted: (questions) => {
                const date = new Date(); 
                const day = date.getDate(); 
        
                setQuestionData(questions.questions);             
                setIndex(Math.floor(day / 31 * questions.questions.length)); 
                setInitialized(true);     
            }
    }); 


    useEffect(() => {
        getQuestions(); 
    }, []); 

    // tapping back arrow 
    const goBack = () => {
        const rem = (index - 1) % questionData.length;
        if (rem < 0) { setIndex(rem + questionData.length)}
        else { setIndex(rem) }
    }

    // tapping forward arrow
    const goForward = () => {
        setIndex((index + 1) % questionData.length);
    }

    function Question(){
        if(initialized){
            return(
                <View style={{ width: '80%', justifyContent: 'center', alignContent: 'center', paddingHorizontal: 10}}>
                    <Text style={{ fontSize: 18, textAlign: 'center', paddingBottom: 5 }}>{questionData[index].questionText}</Text>
                </View>
            )
        } else {
            return(
                <View style={{ width: '80%', justifyContent: 'center', alignContent: 'center', paddingHorizontal: 10}}>
                    <Text style={{ fontSize: 18, textAlign: 'center', paddingBottom: 5}}>Loading...</Text>
                </View>
            )
        }
    }

    function viewAll(){
        setViewAllVisible(true); 
    }

    function skip(){
        setSkipped(true); 
    }
    
    function answer(){
        setQuestionSelected(true); 
    }


    if(questionSelected) {
        return (
            <AddCameraOnboarding 
                index={index}
                questionData={questionData}
            />
        )
    } else if (skipped){
        return (
            <GenderOnboarding />
        )
    } else {
        return (
            <View style={{ height: '100%', justifyContent: 'center', alignItems: 'center', backgroundColor: primaryColor }}>
                 <View style={{ height: '40%', width: '85%', backgroundColor: secondaryColor, borderRadius: 5, padding: 10, alignItems: 'center', justifyContent: 'space-around' }}>
                    <Text style={{ fontSize: 25, fontWeight: 'bold', paddingTop: 15, paddingBottom: 15, color: primaryColor }}>Select a prompt</Text>
                   <TouchableOpacity style={{ alignSelf: 'center'}} onPress={viewAll}>
                       <Text>View All</Text>
                   </TouchableOpacity>
                    <View style={{ flexDirection: 'row', paddingTop: 10 }}>
                        <Ionicons name="ios-arrow-round-back" color={colors.primaryBlack} onPress={goBack} size={45} />
                        <Question />
                        <Ionicons name="ios-arrow-round-forward"  color={colors.primaryBlack} onPress={goForward} size={45}/>
                    </View>
                    <View>
                        <TouchableOpacity style={styles.genderContainer} onPress={answer}>
                            <Text style={styles.answerText}>Answer</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={{  paddingTop: 8 }} onPress={skip}>
                            <Text style={{ alignSelf: 'center'}}>Skip</Text>
                        </TouchableOpacity>
                    </View>
                </View>
                <TouchableOpacity style={{ height: '25%', justifyContent: 'center'}}>
                    <Text style={{ fontWeight: 'bold', color: secondaryColor, fontSize: 14 }}></Text>
                </TouchableOpacity> 
                <ViewAllPopup 
                        visible={viewAllVisible} 
                        setVisible={setViewAllVisible} 
                        questionData={questionData}
                        setIndex={setIndex}
                    />
            </View>
        );
    } 
}

const primaryColor = colors.primaryPurple;
const secondaryColor = colors.secondaryWhite; 

const styles = StyleSheet.create({
    genderContainer: { 
        backgroundColor: primaryColor, 
        borderRadius: 5,
        width: 250,
        height: 40, 
        alignItems: 'center',
        justifyContent: 'center',
    }, 
    answerText: {
        fontSize: 17,
        color: secondaryColor,
        fontWeight: 'bold',
    }
})
