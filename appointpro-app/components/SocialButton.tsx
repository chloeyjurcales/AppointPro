import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import { FontAwesome, MaterialCommunityIcons } from '@expo/vector-icons';
import { colors } from '../theme';

type SocialButtonProps = {
  provider: 'google' | 'microsoft';
  onPress?: () => void;
};

export default function SocialButton({ provider, onPress }: SocialButtonProps) {
  return (
    <TouchableOpacity style={styles.button} onPress={onPress} activeOpacity={0.7}>
      {provider === 'google' ? (
        <FontAwesome name="google" size={16} color="#EA4335" />
      ) : (
        <MaterialCommunityIcons name="microsoft" size={16} color="#00A4EF" />
      )}
      <Text style={styles.text}>
        Sign in with {provider === 'google' ? 'Google' : 'Microsoft'}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 10,
    height: 44,
    gap: 8,
  },
  text: {
    fontSize: 13,
    color: colors.textDark,
    fontWeight: '500',
  },
});