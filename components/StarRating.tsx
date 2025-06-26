// components/StarRating.tsx
import { View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '@/styles/colors'
import { sharedStyles } from '@/styles/sharedStyles'
import React from 'react';

type StarRatingProps = {
  rating: number;
};

export default function StarRating({ rating }: StarRatingProps) {
  return (
    <View style={{ flexDirection: 'row', marginTop: 6 }}>
      {Array.from({ length: 5 }).map((_, i) => (
        <Ionicons
          key={i}
          name={i < rating ? 'star' : 'star-outline'}
          size={18}
          color={colors.primary}
        />
      ))}
    </View>
  );
}
