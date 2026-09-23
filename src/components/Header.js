import { Text, View } from 'react-native';
import { styles } from '../theme';

export default function Header({ title, subtitle }) {
  return (
    <View style={styles.header}>
      <Text style={styles.brand}>บ้านอุ่น · RESTAURANT</Text>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.subtitle}>{subtitle}</Text>
    </View>
  );
}
