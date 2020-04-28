import React from 'react';
import AddContents from './AddContents';
import { GET_QUESTIONS } from '../graphql/GraphqlClient';
import { useQuery } from '@apollo/client';
import { Text } from 'react-native';

export default function AddView ({ navigation }) {

    const { data, error, loading} = useQuery(GET_QUESTIONS);
    if (loading) return null;
    if (error) console.log(`Error!: ${error}`);    

    return (<AddContents 
        data={data} 
        navigation={navigation}
    />);
}