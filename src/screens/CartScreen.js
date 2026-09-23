import { ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';
import Button from '../components/Button';
import { styles } from '../theme';

export default function CartScreen({ cart, onChangeQuantity, onChangeNote, onSendOrder, onChangePage }) {
  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  return (
    <View style={styles.body}>
      <ScrollView contentContainerStyle={styles.list} keyboardShouldPersistTaps="handled">
        {cart.length === 0 && <Text style={styles.empty}>ยังไม่มีอาหารในตะกร้า</Text>}
        {cart.map((item) => (
          <View key={item.menuId} style={styles.card}>
            <View style={styles.row}>
              <Text style={styles.itemName}>{item.icon}  {item.name}</Text>
              <Text style={styles.amount}>{item.price * item.quantity} บาท</Text>
            </View>
            <View style={styles.quantityRow}>
              <TouchableOpacity style={styles.quantityButton} onPress={() => onChangeQuantity(item.menuId, -1)}>
                <Text style={styles.quantitySymbol}>−</Text>
              </TouchableOpacity>
              <Text style={styles.quantity}>{item.quantity}</Text>
              <TouchableOpacity style={styles.quantityButton} onPress={() => onChangeQuantity(item.menuId, 1)}>
                <Text style={styles.quantitySymbol}>+</Text>
              </TouchableOpacity>
              <Text style={styles.unitPrice}>{item.price} บาท / จาน</Text>
            </View>
            <TextInput
              style={styles.input}
              placeholder="หมายเหตุ เช่น ไม่ใส่ผักชี"
              placeholderTextColor="#9B9187"
              value={item.note}
              onChangeText={(text) => onChangeNote(item.menuId, text)}
            />
          </View>
        ))}
      </ScrollView>
      <View style={styles.footer}>
        <View style={styles.row}><Text style={styles.totalLabel}>รวมในตะกร้า</Text><Text style={styles.total}>{total} บาท</Text></View>
        <Button title="ยืนยันและส่งเข้าครัว" onPress={onSendOrder} disabled={cart.length === 0} />
        <Button title="เลือกอาหารเพิ่ม" secondary onPress={() => onChangePage('menu')} />
      </View>
    </View>
  );
}
