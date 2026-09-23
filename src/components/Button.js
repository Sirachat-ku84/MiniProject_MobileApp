import { Text, TouchableOpacity } from 'react-native';
import { styles } from '../theme';

export default function Button({ title, onPress, secondary = false, disabled = false }) {
  return (
    <TouchableOpacity
      style={[styles.button, secondary && styles.secondaryButton, disabled && styles.disabled]}
      onPress={onPress}
      disabled={disabled}
    >
      <Text style={[styles.buttonText, secondary && styles.secondaryText]}>{title}</Text>
    </TouchableOpacity>
  );
}
