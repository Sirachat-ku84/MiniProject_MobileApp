import { ScrollView, Text, View } from 'react-native';
import Button from '../components/Button';
import { styles } from '../theme';

export default function BillScreen({ orders, onCloseBill, onChangePage }) {
  const rounds = [...new Set(orders.map((item) => item.round))];
  const total = orders.reduce((sum, item) => sum + item.price * item.quantity, 0);

  return (
    <View style={styles.body}>
      <ScrollView contentContainerStyle={styles.list}>
        {rounds.length === 0 && <Text style={styles.empty}>ยังไม่มีรายการในบิล</Text>}
        {rounds.map((round) => (
          <View key={round} style={styles.card}>
            <Text style={styles.roundTitle}>รอบที่ {round}</Text>
            {orders.filter((item) => item.round === round).map((item) => (
              <View key={item.id} style={styles.billRow}>
                <Text style={styles.billName}>
                  {item.name} × {item.quantity}{'\n'}{item.price} บาท / จาน{item.note ? `\n${item.note}` : ''}
                </Text>
                <Text style={styles.amount}>{item.price * item.quantity} บาท</Text>
              </View>
            ))}
          </View>
        ))}
      </ScrollView>
      <View style={styles.footer}>
        <View style={styles.row}><Text style={styles.totalLabel}>ยอดรวมทั้งบิล</Text><Text style={styles.total}>{total} บาท</Text></View>
        <Button title="สั่งอาหารเพิ่ม" onPress={() => onChangePage('menu')} />
        {orders.length > 0 && <Button title="ปิดบิล" secondary onPress={onCloseBill} />}
      </View>
    </View>
  );
}
