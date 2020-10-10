import React, { useState, useEffect, useContext } from 'react'; 
import AuctionOnboarding from './AuctionOnboarding';
import { useQuery, useLazyQuery } from '@apollo/client';
import { GET_QUESTIONS, GET_NUMBER_VIDEOS, GET_FIRST_QUESTIONS } from '../../utils/graphql/GraphqlClient';
import { View, ActivityIndicator } from 'react-native';
import { UserIdContext } from '../../utils/context/UserIdContext'

export default function AuctionView({ route, navigation }) {

    const [profileVideoCount, setProfileVideoCount] = useState(null); 
    const [userId, setUserId] = useContext(UserIdContext);

    const [getNumberVideos, { data: numberVideos }] = useLazyQuery(GET_NUMBER_VIDEOS,
        {
          onCompleted: (numberVideos) => {
            const count = numberVideos.videos_aggregate.aggregate.count;
            setProfileVideoCount(count); 
          }
        });

    useEffect(() => {
        getNumberVideos({variables: { userId }}); 
    }, [])

    function FirstQuestions(){
        let { loading, error, data } = useQuery(GET_FIRST_QUESTIONS);

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
                <AuctionOnboarding 
                    route={route}
                    navigation={navigation}
                    data={data}
                    firstVideo={true}
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

    function RegularQuestions(){
        let { loading, error, data } = useQuery(GET_QUESTIONS);

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
                <AuctionOnboarding 
                    route={route}
                    navigation={navigation}
                    data={data}
                    firstVideo={false}
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

    if(profileVideoCount == null){
        return (
            <View style={{ backgroundColor: '#000', justifyContent: 'center', alignItems: 'center', flex: 1}}>
                <ActivityIndicator size="small" color="#eee" />
            </View>  
        )
    } else if(profileVideoCount == 0){
        return <FirstQuestions />
    } else {
        return <RegularQuestions /> 
    }   
}