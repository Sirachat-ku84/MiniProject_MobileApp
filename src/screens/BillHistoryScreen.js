import { FlatList, Text, TouchableOpacity, View } from 'react-native';
import { styles } from '../theme';

function formatDate(value) {
  if (!value) return '-';
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? value : date.toLocaleString('th-TH');
}

export default function BillHistoryScreen({ bills, onSelectBill }) {
  return (
    <View style={styles.body}>
      <FlatList
        data={bills}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        ListEmptyComponent={<Text style={styles.empty}>ยังไม่มีประวัติบิลที่ปิดแล้ว</Text>}
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.card} onPress={() => onSelectBill(item)}>
            <View style={styles.row}>
              <Text style={styles.itemName}>โต๊ะ {item.table}</Text>
              <Text style={styles.amount}>{Number(item.total).toFixed(2)} บาท</Text>
            </View>
            <Text style={styles.historyMeta}>ปิดบิล: {formatDate(item.closedAt)}</Text>
            <Text style={styles.historyMeta}>{item.itemCount} รายการ · แตะเพื่อดูรายละเอียด</Text>
          </TouchableOpacity>
        )}
      />
    </View>
  );
}