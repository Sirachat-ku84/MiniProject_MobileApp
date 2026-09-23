import { useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { Alert, SafeAreaView } from 'react-native';
import BottomTabs from './src/components/BottomTabs';
import Header from './src/components/Header';
import { categories } from './src/data';
import BillScreen from './src/screens/BillScreen';
import CartScreen from './src/screens/CartScreen';
import KitchenScreen from './src/screens/KitchenScreen';
import MenuScreen from './src/screens/MenuScreen';
import TableScreen from './src/screens/TableScreen';
import { colors, styles } from './src/theme';

export default function App() {
  const [page, setPage] = useState('tables');
  const [selectedTable, setSelectedTable] = useState(null);
  const [category, setCategory] = useState(categories[0].id);
  const [cart, setCart] = useState([]);
  const [orders, setOrders] = useState([]);
  const [openTables, setOpenTables] = useState([]);

  const tableCart = cart.filter((item) => item.table === selectedTable);
  const tableOrders = orders.filter((item) => item.table === selectedTable);

  function selectTable(number) {
    setSelectedTable(number);
    setCategory(categories[0].id);
    setPage('menu');
  }

  function addFood(food) {
    setCart((old) => {
      const found = old.find((item) => item.table === selectedTable && item.menuId === food.id);
      if (found) {
        return old.map((item) => item === found ? { ...item, quantity: item.quantity + 1 } : item);
      }
      return [...old, {
        table: selectedTable, menuId: food.id, name: food.name,
        price: food.price, icon: food.icon, quantity: 1, note: '',
      }];
    });
  }

  function changeQuantity(menuId, difference) {
    setCart((old) => old.map((item) =>
      item.table === selectedTable && item.menuId === menuId
        ? { ...item, quantity: item.quantity + difference } : item
    ).filter((item) => item.quantity > 0));
  }

  function changeNote(menuId, note) {
    setCart((old) => old.map((item) =>
      item.table === selectedTable && item.menuId === menuId ? { ...item, note } : item
    ));
  }

  function sendOrder() {
    if (tableCart.length === 0) return;
    const round = [...new Set(tableOrders.map((item) => item.round))].length + 1;
    const time = new Date().toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' });
    const newItems = tableCart.map((item, index) => ({
      ...item, id: `${Date.now()}-${index}`, round, time, status: 'รอทำ',
    }));
    setOrders((old) => [...old, ...newItems]);
    setOpenTables((old) => old.includes(selectedTable) ? old : [...old, selectedTable]);
    setCart((old) => old.filter((item) => item.table !== selectedTable));
    setPage('bill');
    Alert.alert('ส่งเข้าครัวแล้ว', `โต๊ะ ${selectedTable} · รอบที่ ${round}`);
  }

  function updateStatus(id, status) {
    setOrders((old) => old.map((item) => item.id === id ? { ...item, status } : item));
  }

  function closeBill() {
    const total = tableOrders.reduce((sum, item) => sum + item.price * item.quantity, 0);
    Alert.alert(`ปิดบิลโต๊ะ ${selectedTable}`, `ยอดรวม ${total} บาท`, [
      { text: 'ยกเลิก', style: 'cancel' },
      { text: 'ยืนยัน', onPress: () => {
        setOrders((old) => old.filter((item) => item.table !== selectedTable));
        setOpenTables((old) => old.filter((number) => number !== selectedTable));
        setSelectedTable(null);
        setPage('tables');
      } },
    ]);
  }

  const title = page === 'tables' ? 'เลือกโต๊ะของคุณ'
    : page === 'menu' ? `เมนูโต๊ะ ${selectedTable}`
    : page === 'cart' ? `ตะกร้าโต๊ะ ${selectedTable}`
    : page === 'bill' ? `บิลโต๊ะ ${selectedTable}` : 'รายการเข้าครัว';
  const subtitle = page === 'tables' ? 'เลือกโต๊ะเพื่อเริ่มสั่งอาหาร'
    : page === 'menu' ? 'อาหารอร่อย ๆ สำหรับมื้อนี้'
    : page === 'cart' ? 'ตรวจรายการก่อนส่งเข้าครัว'
    : page === 'bill' ? 'รายการที่สั่งแล้ว แยกตามรอบ' : 'รายการที่ส่งมาก่อนจะแสดงก่อน';

  return (
    <SafeAreaView style={styles.root}>
      <StatusBar style="dark" backgroundColor={colors.bg} />
      <Header title={title} subtitle={subtitle} />

      {page === 'tables' && <TableScreen openTables={openTables} onSelectTable={selectTable} />}
      {page === 'menu' && (
        <MenuScreen
          category={category} onChangeCategory={setCategory}
          cart={tableCart} orders={tableOrders}
          onAddFood={addFood} onChangePage={setPage}
        />
      )}
      {page === 'cart' && (
        <CartScreen
          cart={tableCart} onChangeQuantity={changeQuantity}
          onChangeNote={changeNote} onSendOrder={sendOrder} onChangePage={setPage}
        />
      )}
      {page === 'bill' && (
        <BillScreen orders={tableOrders} onCloseBill={closeBill} onChangePage={setPage} />
      )}
      {page === 'kitchen' && <KitchenScreen orders={orders} onUpdateStatus={updateStatus} />}

      <BottomTabs page={page} selectedTable={selectedTable} onChangePage={setPage} />
    </SafeAreaView>
  );
}
