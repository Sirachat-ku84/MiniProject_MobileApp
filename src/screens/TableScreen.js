import { FlatList, Image, Text, TouchableOpacity, View } from 'react-native';
import { tableConfig } from '../data';
import { styles } from '../theme';

export default function TableScreen({ tables, openTables, onSelectTable }) {
  return (
    <View style={styles.body}>
      <View style={styles.legend}>
        <Text style={styles.legendText}>● ว่าง</Text>
        <Text style={[styles.legendText, styles.busyText]}>● มีบิลอยู่</Text>
      </View>
      <FlatList
        data={tables}
        numColumns={3}
        keyExtractor={(item) => String(item.id)}
        contentContainerStyle={styles.tableList}
        renderItem={({ item }) => {
          const busy = openTables.includes(item.id);
          return (
            <TouchableOpacity style={[styles.table, busy && styles.busyTable]} onPress={() => onSelectTable(item.id)}>
              <Image source={{ uri: tableConfig.uri }} style={styles.tableImage} />
              <Text style={styles.tableName}>โต๊ะ {String(item.id).padStart(2, '0')}</Text>
              <Text style={[styles.tableStatus, busy && styles.busyText]}>{busy ? 'มีบิลอยู่' : 'ว่าง'}</Text>
            </TouchableOpacity>
          );
        }}
      />
    </View>
  );
}