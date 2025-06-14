import { TouchableOpacity, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { colors } from '@/styles/colors';

type Props = {
  title: string;
  onPress: () => void;
  disabled?: boolean;
  loading?: boolean;
};

export default function Button({ title, onPress, disabled, loading }: Props) {
  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled || loading}
      style={[styles.button, disabled && styles.disabled]}
    >
      {loading ? (
        <ActivityIndicator color="#fff" />
      ) : (
        <Text style={styles.text}>{title}</Text>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    backgroundColor: colors.primary,
    padding: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  disabled: {
    backgroundColor: colors.disabled,
  },
  text: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
});
