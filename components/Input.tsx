import { TextInput, StyleSheet, TextInputProps } from 'react-native';
import { colors } from '@/styles/colors';

type Props = TextInputProps;

// Wiederverwendbares Texteingabefeld
export default function Input(props: Props) {
  return <TextInput style={[styles.input, props.style]} {...props} />;
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
