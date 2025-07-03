import { View, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { colors } from '@/styles/colors';

type Props = {
  initialRating?: number;
  onRate: (rating: number) => void;
};

export default function StarRatingInput({ initialRating = 0, onRate }: Props) {
  const [rating, setRating] = useState(initialRating);

  const handlePress = (value: number) => {
    setRating(value);
    onRate(value);
  };

  return (
    <View style={{ flexDirection: 'row', marginVertical: 8 }}>
      {[1, 2, 3, 4, 5].map((value) => (
        <TouchableOpacity key={value} onPress={() => handlePress(value)}>
          <Ionicons
            name={value <= rating ? 'star' : 'star-outline'}
            size={30}
            color={colors.primary}
            style={{ marginHorizontal: 4 }}
          />
        </TouchableOpacity>
      ))}
    </View>
  );
}
