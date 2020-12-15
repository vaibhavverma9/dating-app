import React, { useState, useContext } from 'react';
import { Text, View, StyleSheet, TextInput, Keyboard } from 'react-native';
import { TouchableOpacity, TouchableWithoutFeedback } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { UserIdContext } from '../../utils/context/UserIdContext'
import { useMutation } from '@apollo/client';
import { UPDATE_INSTAGRAM } from '../../utils/graphql/GraphqlClient';
import { _storeInstagram } from '../../utils/asyncStorage'; 
import { colors } from '../../styles/colors';

export default function NameOnboarding(props) { 

    const [userId, setUserId] = useContext(UserIdContext);
    const [instagram, setInstagram] = useState('');
    const [updateInstagram, { updateInstagramData }] = useMutation(UPDATE_INSTAGRAM);

    function skip(){
        props.navigation.navigate("ProfilePictureOnboarding");
    }

    function submit(){
        updateInstagram({ variables: { userId, instagram }});
        _storeInstagram(instagram); 
        props.navigation.navigate("ProfilePictureOnboarding");
    }

    return (
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
            <View style={{ height: '100%', justifyContent: 'center', alignItems: 'center', backgroundColor: primaryColor }}>
                <View style={{ height: '50%', width: '85%', backgroundColor: secondaryColor, borderRadius: 5, padding: 10, alignItems: 'center' }}>
                    <View style={{ paddingTop: '10%', height: '25%'}}>
                        <Feather name="instagram" size={45} color={primaryColor} />
                    </View>        
                    <Text style={{ fontSize: 18, fontWeight: 'bold', paddingTop: 15, paddingBottom: 25,  color: primaryColor }}>What's your Instagram handle?</Text>
                    <TextInput 
                        style={{ textAlign: 'center', 
                                fontSize: 18, 
                                padding: 15, 
                                color: primaryColor,  
                                borderColor: primaryColor,
                                borderWidth: 1,
                                width: '75%',
                                borderRadius: 5
                            }}
                        onFocus={() => setInstagram('@')}
                        onChangeText={text => setInstagram(text)}
                        value={instagram}
                    />
                    <View style={{ paddingTop: '11%' }}>
                        <TouchableOpacity onPress={submit} style={styles.locationsContainer}>
                            <Text style={styles.locationsText}>Submit</Text>
                        </TouchableOpacity>
                    </View>
                    <TouchableOpacity onPress={skip}>
                        <Text style={{ paddingTop: '3%', color: primaryColor}}>Skip</Text>
                    </TouchableOpacity>                            
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
