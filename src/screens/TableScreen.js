import { FlatList, Text, TouchableOpacity, View } from 'react-native';
import Button from '../components/Button';
import { styles } from '../theme';

export default function TableScreen({ tables, openTables, onSelectTable, onViewHistory, onViewReports, onResetDatabase }) {
  return (
    <View style={styles.body}>
      <View style={{ paddingHorizontal: 21, marginBottom: 12 }}>
        <Button title="ดูประวัติบิลเก่า" secondary onPress={onViewHistory} />
        <View style={{ height: 6 }} />
        <Button title="รายงานยอดขาย" secondary onPress={onViewReports} />
        <View style={{ height: 6 }} />
        <Button title="รีเซ็ตฐานข้อมูล" secondary onPress={onResetDatabase} />
      </View>
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
              <Text style={styles.tableIcon}>⌂</Text>
              <Text style={styles.tableName}>โต๊ะ {String(item.id).padStart(2, '0')}</Text>
              <Text style={[styles.tableStatus, busy && styles.busyText]}>{busy ? 'มีบิลอยู่' : 'ว่าง'}</Text>
            </TouchableOpacity>
          );
        }}
      />
    </View>
  );
}
