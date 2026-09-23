import { FlatList, Text, TouchableOpacity, View } from 'react-native';
import { styles } from '../theme';

const tables = Array.from({ length: 15 }, (_, index) => index + 1);

export default function TableScreen({ openTables, onSelectTable }) {
  return (
    <View style={styles.body}>
      <View style={styles.legend}>
        <Text style={styles.legendText}>● ว่าง</Text>
        <Text style={[styles.legendText, styles.busyText]}>● มีบิลอยู่</Text>
      </View>
      <FlatList
        data={tables}
        numColumns={3}
        keyExtractor={String}
        contentContainerStyle={styles.tableList}
        renderItem={({ item }) => {
          const busy = openTables.includes(item);
          return (
            <TouchableOpacity style={[styles.table, busy && styles.busyTable]} onPress={() => onSelectTable(item)}>
              <Text style={styles.tableIcon}>⌂</Text>
              <Text style={styles.tableName}>โต๊ะ {String(item).padStart(2, '0')}</Text>
              <Text style={[styles.tableStatus, busy && styles.busyText]}>{busy ? 'มีบิลอยู่' : 'ว่าง'}</Text>
            </TouchableOpacity>
          );
        }}
      />
    </View>
  );
}
