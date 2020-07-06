import React, { useContext } from 'react'; 
import AddCameraContents from './AddCameraContents';
import { useQuery } from '@apollo/client';
import { GET_QUESTIONS } from '../../utils/graphql/GraphqlClient';
import { UserIdContext } from '../../utils/context/UserIdContext'
import { View, ActivityIndicator } from 'react-native';

export default function AddCameraView({ route, navigation }) {

    const [userId, setUserId] = useContext(UserIdContext);

    const { loading, error, data } = useQuery(GET_QUESTIONS)

    if(loading){
        return (
            <View style={{ backgroundColor: '#000', justifyContent: 'center', alignItems: 'center', flex: 1}}>
                <ActivityIndicator size="small" color="#eee" />
            </View>  
        )
    } else if(error){
        return (
            <View style={{ backgroundColor: '#000', justifyContent: 'center', alignItems: 'center', flex: 1}}>
                <ActivityIndicator size="small" color="#eee" />
            </View>  
        )
    } else if(data){
        return (
            <AddCameraContents 
                route={route}
                navigation={navigation}
                data={data}
            />
        )
    } else {
        return (
            <View style={{ backgroundColor: '#000', justifyContent: 'center', alignItems: 'center', flex: 1}}>
                <ActivityIndicator size="small" color="#eee" />
            </View>  
        )
    }
}