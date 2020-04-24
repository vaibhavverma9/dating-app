import React from 'react';
import AddContents from './AddContents';
import { GET_QUESTIONS } from '../../graphql/GraphqlClient';
import { useQuery } from '@apollo/client';

export default function AddView () {

    const { data, error, loading} = useQuery(GET_QUESTIONS)
    if (loading) return null;
    if (error) return `Error!: ${error}`;    

    return (
        <AddContents data={data} />
    );
}