import { Image, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { styles } from '../theme';

const statuses = ['รอทำ', 'กำลังทำ', 'เสิร์ฟแล้ว'];

export default function KitchenScreen({ orders, onUpdateStatus }) {
  return (
    <ScrollView contentContainerStyle={styles.list} style={styles.body}>
      {orders.length === 0 && <Text style={styles.empty}>ยังไม่มีรายการที่ส่งเข้าครัว</Text>}
      {orders.map((item) => (
        <View key={item.id} style={styles.card}>
          <Text style={styles.kitchenMeta}>โต๊ะ {item.table} · รอบที่ {item.round} · {item.time}</Text>
          <View style={[styles.row, { alignItems: 'center', marginTop: 6 }]}>
            <Image source={{ uri: item.uri }} style={styles.foodImage} />
            <View style={{ flex: 1, marginLeft: 10 }}>
              <Text style={styles.kitchenName}>{item.name} × {item.quantity}</Text>
              {item.note ? <Text style={styles.note}>หมายเหตุ: {item.note}</Text> : null}
            </View>
          </View>
          <View style={styles.statusRow}>
            {statuses.map((status) => (
              <TouchableOpacity key={status} style={[styles.statusChip, item.status === status && styles.activeStatus]} onPress={() => onUpdateStatus(item.id, status)}>
                <Text style={[styles.statusText, item.status === status && styles.activeStatusText]}>{status}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      ))}
    </ScrollView>
  );
}