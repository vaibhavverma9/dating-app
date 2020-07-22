import React from 'react'
import { useExpoOta } from '../hooks/use-expo-ota'
import { View, Text, ActivityIndicator } from 'react-native';
import { colors } from '../../app/styles/colors';

export function withOta<P = {}>(Component: React.ComponentType<P>) {
  return function WithOta(props: P) {
    const { updating } = useExpoOta()
    if (updating) {
        return (
            <View style={{ flex: 1, backgroundColor: colors.primaryPurple, justifyContent: 'center', alignItems: 'center' }}>
                <Text style={{ color: '#eee'}}>App is updating, just a sec...</Text>
             </View>    
        )
    }

    return <Component {...props} />
  }
}