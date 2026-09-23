import { Text, TouchableOpacity, View } from 'react-native';
import { styles } from '../theme';

const tabs = [
  ['tables', 'โต๊ะ'],
  ['menu', 'เมนู'],
  ['cart', 'ตะกร้า'],
  ['kitchen', 'ครัว'],
];

export default function BottomTabs({ page, selectedTable, onChangePage }) {
  return (
    <View style={styles.tabs}>
      {tabs.map(([target, label]) => (
        <TouchableOpacity
          key={target}
          style={styles.tab}
          onPress={() => {
            if ((target === 'menu' || target === 'cart') && !selectedTable) {
              onChangePage('tables');
            } else {
              onChangePage(target);
            }
          }}
        >
          <Text style={[styles.tabText, page === target && styles.activeTab]}>{label}</Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}
