import { useState } from 'react';
import { Alert, ScrollView, Text, TextInput, View } from 'react-native';
import { useSQLiteContext } from 'expo-sqlite';
import Button from '../components/Button';
import { styles } from '../theme';

function localDateString(date = new Date()) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export default function ReportsScreen() {
  const db = useSQLiteContext();
  const today = localDateString();
  const [startDate, setStartDate] = useState(today);
  const [endDate, setEndDate] = useState(today);
  const [dailySales, setDailySales] = useState([]);
  const [topMenus, setTopMenus] = useState([]);
  const [loaded, setLoaded] = useState(false);

  async function loadReports() {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(startDate) || !/^\d{4}-\d{2}-\d{2}$/.test(endDate) || startDate > endDate) {
      Alert.alert('วันที่ไม่ถูกต้อง', 'กรอกวันที่รูปแบบ YYYY-MM-DD และให้วันเริ่มต้นไม่เกินวันสิ้นสุด');
      return;
    }
    try {
      const [sales, menus] = await Promise.all([
        db.getAllAsync(`
          SELECT date(b.close_at, 'localtime') AS sale_date,
            c.id_foodcate AS category_id, c.name AS category,
            m.id_menu AS menu_id, m.name AS menu_name,
            SUM(d.quantity * d.unit_price) AS total, SUM(d.quantity) AS quantity
          FROM Bill b
          JOIN Order_Round r ON r.id_bill = b.id_bill
          JOIN Order_Detail d ON d.id_round = r.id_round
          JOIN Menu m ON m.id_menu = d.id_menu
          JOIN Categories c ON c.id_foodcate = m.id_foodcate
          WHERE b.status = 'paid' AND date(b.close_at, 'localtime') BETWEEN ? AND ?
          GROUP BY date(b.close_at, 'localtime'), c.id_foodcate, c.name, m.id_menu, m.name
          ORDER BY sale_date DESC, c.name, m.name
        `, startDate, endDate),
        db.getAllAsync(`
          SELECT m.id_menu AS id, m.name, c.name AS category,
            SUM(d.quantity) AS quantity,
            SUM(d.quantity * d.unit_price) AS total
          FROM Bill b
          JOIN Order_Round r ON r.id_bill = b.id_bill
          JOIN Order_Detail d ON d.id_round = r.id_round
          JOIN Menu m ON m.id_menu = d.id_menu
          JOIN Categories c ON c.id_foodcate = m.id_foodcate
          WHERE b.status = 'paid' AND date(b.close_at, 'localtime') BETWEEN ? AND ?
          GROUP BY m.id_menu, m.name, c.name
          ORDER BY quantity DESC, total DESC, m.name
          LIMIT 10
        `, startDate, endDate),
      ]);
      setDailySales(sales);
      setTopMenus(menus);
      setLoaded(true);
    } catch (error) {
      console.error('Failed to load sales reports', error);
      Alert.alert('เปิดรายงานไม่สำเร็จ', 'อ่านข้อมูลยอดขายจากฐานข้อมูลไม่ได้');
    }
  }

  const salesByCategory = dailySales.reduce((groups, item) => {
    const key = `${item.sale_date}-${item.category_id}`;
    let group = groups.find((entry) => entry.key === key);
    if (!group) {
      group = { key, date: item.sale_date, category: item.category, quantity: 0, total: 0, items: [] };
      groups.push(group);
    }
    group.quantity += Number(item.quantity);
    group.total += Number(item.total);
    group.items.push(item);
    return groups;
  }, []);

  return (
    <View style={styles.body}>
      <ScrollView contentContainerStyle={styles.list}>
        <View style={styles.card}>
          <Text style={styles.itemName}>ช่วงวันที่ (YYYY-MM-DD)</Text>
          <View style={styles.row}>
            <TextInput style={[styles.input, { flex: 1 }]} value={startDate} onChangeText={setStartDate}
              placeholder="วันเริ่มต้น" keyboardType="numbers-and-punctuation" />
            <TextInput style={[styles.input, { flex: 1 }]} value={endDate} onChangeText={setEndDate}
              placeholder="วันสิ้นสุด" keyboardType="numbers-and-punctuation" />
          </View>
          <Button title="แสดงรายงาน" onPress={loadReports} />
          
        </View>

        <View style={styles.card}>
          <Text style={styles.roundTitle}>ยอดขายรายวันแยกตามหมวด</Text>
          {!loaded && <Text style={styles.historyMeta}>เลือกช่วงวันที่แล้วกดแสดงรายงาน</Text>}
          {loaded && dailySales.length === 0 && <Text style={styles.historyMeta}>ไม่พบยอดขายในช่วงวันที่นี้</Text>}
          {salesByCategory.map((group) => (
            <View key={group.key} style={{ paddingVertical: 7 }}>
              <View style={styles.row}>
                <Text style={styles.itemName}>{group.date} · {group.category} รวม {group.quantity} จาน</Text>
                <Text style={styles.amount}>{group.total.toFixed(2)} บาท</Text>
              </View>
              {group.items.map((item) => (
                <View key={item.menu_id} style={[styles.row, { paddingLeft: 12, paddingTop: 5 }]}>
                  <Text style={styles.billName}>• {item.menu_name} × {item.quantity}</Text>
                  <Text style={styles.historyMeta}>{Number(item.total).toFixed(2)} บาท</Text>
                </View>
              ))}
            </View>
          ))}
        </View>

        <View style={styles.card}>
          <Text style={styles.roundTitle}>10 เมนูขายดี</Text>
          {loaded && topMenus.length === 0 && <Text style={styles.historyMeta}>ไม่พบยอดขายในช่วงวันที่นี้</Text>}
          {topMenus.map((item, index) => (
            <View key={item.id} style={[styles.row, { paddingVertical: 7 }]}>
              <Text style={styles.billName}>{index + 1}. {item.name} · {item.category} ({item.quantity} จาน)</Text>
              <Text style={styles.amount}>{Number(item.total).toFixed(2)} บาท</Text>
            </View>
          ))}
        </View>

      </ScrollView>
    </View>
  );
}