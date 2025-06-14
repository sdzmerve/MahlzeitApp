import { TextInput, StyleSheet } from 'react-native';
import { colors } from '@/styles/colors';

type Props = {
  value: string;
  onChangeText: (text: string) => void;
  placeholder: string;
  secureTextEntry?: boolean;
  keyboardType?: 'default' | 'email-address';
};

export default function Input(props: Props) {
  return <TextInput style={styles.input} {...props} />;
}

const styles = StyleSheet.create({
  input: {
    backgroundColor: colors.inputBackground,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: 10,
    padding: 14,
    marginBottom: 16,
    fontSize: 16,
    color: colors.text,
  },
});
