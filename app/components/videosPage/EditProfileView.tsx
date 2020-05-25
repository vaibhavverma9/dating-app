import React, { useState, useEffect } from 'react';
import { View, Text } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { TouchableOpacity } from 'react-native-gesture-handler';
import { _retrieveName, _retrieveBio } from '../../utils/asyncStorage'; 
import { colors } from '../../styles/colors';

export default function EditProfileView(props) {
    
    console.log(props); 

    const [name, setName] = useState(props.route.params.name);
    const [bio, setBio] = useState(props.route.params.bio);

    useEffect(() => {
        props.navigation.addListener('focus', () => {
            initProfile(); 
        });  
      }, [props.navigation]);

    async function initProfile(){
        const name = await _retrieveName(); 
        const bio = await _retrieveBio(); 
        setName(name);
        setBio(bio);
    }

    function goToEditName(){
        props.navigation.navigate('Name', {name});
    }

    function goToEditBio(){
        props.navigation.navigate('Bio', {bio}); 
    }

    function NameText(){
        if(name == ''){
            return (
                <Text style={{ color: colors.secondaryGray, fontSize: 16  }}>Add name to your profile</Text>
            )
        } else {
            return (
                <Text style={{ color: colors.secondaryGray, fontSize: 16  }}>{name}</Text>
            )

        }
    }

    function BioText(){
        if(bio == ''){
            return (
                <Text style={{ color: colors.secondaryGray, fontSize: 16 }}>Add a bio to your profile</Text>
            )
        } else {
            return (
                <Text style={{ color: colors.secondaryGray, fontSize: 16 }}>{bio}</Text>
            )
        }
    }


    return (
        <View style={{ backgroundColor: colors.primaryBlack, flex: 1 }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingLeft: 15, paddingTop: 15}}>
                <Text style={{ fontSize: 16, color: colors.secondaryWhite }}>Name</Text>
                <TouchableOpacity onPress={goToEditName} style={{ flexDirection: 'row', padding: 15}}>
                    <NameText />
                    <MaterialIcons name="navigate-next" color={colors.secondaryGray} size={20}/>  
                </TouchableOpacity>
            </View>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingLeft: 15, paddingTop: 15}}>
                <Text style={{ fontSize: 16, color: colors.secondaryWhite }}>Bio</Text>
                <TouchableOpacity onPress={goToEditBio} style={{ flexDirection: 'row', padding: 15}}>
                    <BioText />
                    <MaterialIcons name="navigate-next" color={colors.secondaryGray} size={20}/>  
                </TouchableOpacity>
            </View>
        </View>
    )
    
}