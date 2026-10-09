import { useEffect, useState } from 'react';
import { SQLiteProvider, useSQLiteContext } from 'expo-sqlite';
import { StatusBar } from 'expo-status-bar';
import { ActivityIndicator, Alert, Text, View } from 'react-native';
import BottomTabs from './src/components/BottomTabs';
import Header from './src/components/Header';
import BillScreen from './src/screens/BillScreen';
import BillHistoryScreen from './src/screens/BillHistoryScreen';
import CartScreen from './src/screens/CartScreen';
import KitchenScreen from './src/screens/KitchenScreen';
import MenuScreen from './src/screens/MenuScreen';
import ReportsScreen from './src/screens/ReportsScreen';
import TableScreen from './src/screens/TableScreen';
import { colors, styles } from './src/theme';
import { initializeDatabase } from './src/database';
import { menu as staticMenu } from './src/data';

function RestaurantApp() {
  const db = useSQLiteContext();
  const [page, setPage] = useState('tables');
  const [selectedTable, setSelectedTable] = useState(null);
  const [category, setCategory] = useState(null);
  const [cart, setCart] = useState([]);
  const [orders, setOrders] = useState([]);
  const [historicalOrders, setHistoricalOrders] = useState([]);
  const [billHistory, setBillHistory] = useState([]);
  const [viewedBill, setViewedBill] = useState(null);
  const [tableRows, setTableRows] = useState([]);
  const [openTables, setOpenTables] = useState([]);
  const [menuItems, setMenuItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [databaseReady, setDatabaseReady] = useState(false);
  const [databaseError, setDatabaseError] = useState(null);

  useEffect(() => {
    let mounted = true;
    async function loadDatabase() {
      try {
        const [savedOrders, savedMenu, savedCategories, savedCart, savedBills, savedTables, savedHistory] = await Promise.all([
          db.getAllAsync(`
            SELECT d.id_detail AS id, b.id_table AS "table", d.id_menu AS menuId,
              m.name, d.unit_price AS price, m.icon AS uri, d.quantity, d.note,
              r.round_number AS round, d.status, d.id_round AS roundId,
              CASE WHEN length(r.order_at) >= 16 THEN substr(r.order_at, 12, 5) ELSE r.order_at END AS time
            FROM Order_Detail d
            JOIN Menu m ON m.id_menu = d.id_menu
            JOIN Order_Round r ON r.id_round = d.id_round
            JOIN Bill b ON b.id_bill = r.id_bill
            WHERE b.status = 'open'
            ORDER BY r.order_at, d.rowid
          `),
          db.getAllAsync('SELECT id_menu AS id, id_foodcate AS category, name, price, icon AS uri FROM Menu ORDER BY rowid'),
          db.getAllAsync('SELECT id_foodcate AS id, name FROM Categories ORDER BY rowid'),
          db.getAllAsync('SELECT table_number AS "table", menu_id AS menuId, name, price, icon AS uri, quantity, note FROM cart_items ORDER BY table_number, rowid'),
          db.getAllAsync("SELECT id_table AS table_number FROM Bill WHERE status = 'open' ORDER BY id_table"),
          db.getAllAsync('SELECT id_table AS id, seat FROM Restaurant_tables ORDER BY id_table'),
          db.getAllAsync(`
            SELECT b.id_bill AS id, b.id_table AS "table", b.open_at AS openedAt,
              b.close_at AS closedAt, COALESCE(SUM(d.quantity), 0) AS itemCount,
              COALESCE(SUM(d.quantity * d.unit_price), 0) AS total
            FROM Bill b
            LEFT JOIN Order_Round r ON r.id_bill = b.id_bill
            LEFT JOIN Order_Detail d ON d.id_round = r.id_round
            WHERE b.status = 'paid'
            GROUP BY b.id_bill
            ORDER BY b.close_at DESC, b.open_at DESC
          `),
        ]);
        if (!mounted) return;
        setOrders(savedOrders);
        setOpenTables(savedBills.map((item) => item.table_number));
        setBillHistory(savedHistory);
        setTableRows(savedTables);
        setMenuItems(savedMenu.map((item) => ({ ...item, price: Number(item.price) })));
        setCategories(savedCategories);
        setCategory(savedCategories[0]?.id ?? null);
        setCart(savedCart.map((item) => ({ ...item, price: Number(item.price) })));
        setDatabaseReady(true);
      } catch (error) {
        console.error('Failed to load local SQLite database', error);
        if (mounted) {
          setDatabaseError(error.message);
          setDatabaseReady(true);
        }
      }
    }
    loadDatabase();
    return () => { mounted = false; };
  }, [db]);

  const tableCart = cart.filter((item) => item.table === selectedTable);
  const tableOrders = orders.filter((item) => item.table === selectedTable);

  function selectTable(number) {
    setSelectedTable(number);
    setCategory(categories[0]?.id ?? null);
    setPage('menu');
  }

  async function addFood(food) {
    // รวมจำนวนเดิมที่มีอยู่ในตะกร้าของโต๊ะนี้และเมนูนี้
    const existingItems = cart.filter((item) => item.table === selectedTable && item.menuId === food.id);
    const currentTotalQty = existingItems.reduce((sum, i) => sum + i.quantity, 0);
    const newQty = currentTotalQty + 1;

    try {
      // ลบข้อมูลเก่าที่ซ้ำกันของโต๊ะนี้และเมนูนี้ใน SQLite ออกให้หมดก่อน
      await db.runAsync(
        'DELETE FROM cart_items WHERE table_number = ? AND menu_id = ?',
        selectedTable, food.id
      );

      // บันทึกรายการใหม่ลงไปเพียง 1 แถวด้วยจำนวนที่ถูกต้อง
      await db.runAsync(
        `INSERT INTO cart_items (table_number, menu_id, name, price, icon, quantity, note)
        VALUES (?, ?, ?, ?, ?, ?, '')`,
        selectedTable, food.id, food.name, food.price, food.uri, newQty
      );

      // อัปเดต State ในหน้าจอไม่ให้มีรายการซ้ำซ้อน
      setCart((old) => [
        ...old.filter((item) => !(item.table === selectedTable && item.menuId === food.id)),
        { table: selectedTable, menuId: food.id, name: food.name, price: food.price, uri: food.uri, quantity: newQty, note: '' }
      ]);
    } catch (error) {
      console.error('Failed to add cart item', error);
      Alert.alert('เพิ่มรายการไม่สำเร็จ', 'บันทึกรายการลงฐานข้อมูลไม่ได้');
    }
  }
  
  async function changeQuantity(menuId, difference) {
    const item = tableCart.find((entry) => entry.menuId === menuId);
    if (!item) return;
    const quantity = item.quantity + difference;
    try {
      if (quantity > 0) {
        await db.runAsync('UPDATE cart_items SET quantity = ? WHERE table_number = ? AND menu_id = ?', quantity, selectedTable, menuId);
      } else {
        await db.runAsync('DELETE FROM cart_items WHERE table_number = ? AND menu_id = ?', selectedTable, menuId);
      }
      setCart((old) => quantity > 0
        ? old.map((entry) => entry.table === selectedTable && entry.menuId === menuId ? { ...entry, quantity } : entry)
        : old.filter((entry) => !(entry.table === selectedTable && entry.menuId === menuId)));
    } catch (error) {
      console.error('Failed to update cart quantity', error);
      Alert.alert('แก้จำนวนไม่สำเร็จ', 'บันทึกการเปลี่ยนแปลงไม่ได้');
    }
  }

  async function changeNote(menuId, note) {
    try {
      await db.runAsync('UPDATE cart_items SET note = ? WHERE table_number = ? AND menu_id = ?', note, selectedTable, menuId);
      setCart((old) => old.map((item) =>
        item.table === selectedTable && item.menuId === menuId ? { ...item, note } : item
      ));
    } catch (error) {
      console.error('Failed to save cart note', error);
      Alert.alert('บันทึกหมายเหตุไม่สำเร็จ', 'ลองกรอกหมายเหตุอีกครั้ง');
    }
  }

  async function sendOrder() {
    if (tableCart.length === 0) return;
    const orderAt = new Date().toISOString();
    const requestId = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    const newItems = tableCart.map((item, index) => ({
      ...item, id: `detail-${requestId}-${index}`, round: 1,
      time: new Date().toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' }),
      status: 'รอทำ',
    }));
    let submittedRound = 1;
    try {
      await db.withTransactionAsync(async () => {
        let bill = await db.getFirstAsync("SELECT id_bill FROM Bill WHERE id_table = ? AND status = 'open' LIMIT 1", selectedTable);
        if (!bill) {
          const billId = `bill-${selectedTable}-${requestId}`;
          await db.runAsync(
            "INSERT INTO Bill (id_bill, open_at, status, id_table) VALUES (?, ?, 'open', ?)",
            billId, orderAt, selectedTable,
          );
          bill = { id_bill: billId };
        }
        const maxRound = await db.getFirstAsync(
          'SELECT COALESCE(MAX(round_number), 0) AS round_number FROM Order_Round WHERE id_bill = ?', bill.id_bill,
        );
        submittedRound = maxRound.round_number + 1;
        const roundId = `round-${bill.id_bill}-${submittedRound}`;
        await db.runAsync(
          'INSERT INTO Order_Round (id_round, round_number, order_at, id_bill) VALUES (?, ?, ?, ?)',
          roundId, submittedRound, orderAt, bill.id_bill,
        );
        for (const item of newItems) {
          await db.runAsync(
            `INSERT INTO Order_Detail (id_detail, quantity, unit_price, status, id_menu, id_round, note)
             VALUES (?, ?, ?, ?, ?, ?, ?)`,
            item.id, item.quantity, item.price, item.status, item.menuId, roundId, item.note,
          );
          item.round = submittedRound;
          item.roundId = roundId;
        }
        await db.runAsync('DELETE FROM cart_items WHERE table_number = ?', selectedTable);
      });
    } catch (error) {
      console.error('Failed to save order', error);
      Alert.alert('ส่งรายการไม่สำเร็จ', 'บันทึกออเดอร์ลงฐานข้อมูลไม่ได้');
      return;
    }
    setOrders((old) => [...old, ...newItems]);
    setOpenTables((old) => old.includes(selectedTable) ? old : [...old, selectedTable]);
    setCart((old) => old.filter((item) => item.table !== selectedTable));
    setPage('bill');
    Alert.alert('ส่งเข้าครัวแล้ว', `โต๊ะ ${selectedTable} · รอบที่ ${submittedRound}`);
  }

  async function updateStatus(id, status) {
    try {
      await db.runAsync('UPDATE Order_Detail SET status = ? WHERE id_detail = ?', status, id);
      setOrders((old) => old.map((item) => item.id === id ? { ...item, status } : item));
    } catch (error) {
      console.error('Failed to update order status', error);
      Alert.alert('อัปเดตสถานะไม่สำเร็จ', 'บันทึกสถานะลงฐานข้อมูลไม่ได้');
    }
  }

  async function openHistoricalBill(bill) {
    try {
      const savedOrders = await db.getAllAsync(`
        SELECT d.id_detail AS id, b.id_table AS "table", d.id_menu AS menuId,
          m.name, d.unit_price AS price, m.icon, d.quantity, d.note,
          r.round_number AS round, d.status, d.id_round AS roundId,
          CASE WHEN length(r.order_at) >= 16 THEN substr(r.order_at, 12, 5) ELSE r.order_at END AS time
        FROM Order_Detail d
        JOIN Menu m ON m.id_menu = d.id_menu
        JOIN Order_Round r ON r.id_round = d.id_round
        JOIN Bill b ON b.id_bill = r.id_bill
        WHERE b.id_bill = ?
        ORDER BY r.order_at, d.rowid
      `, bill.id);
      setViewedBill(bill);
      setHistoricalOrders(savedOrders);
      setPage('history-bill');
    } catch (error) {
      console.error('Failed to load historical bill', error);
      Alert.alert('เปิดประวัติบิลไม่สำเร็จ', 'อ่านรายละเอียดบิลจากฐานข้อมูลไม่ได้');
    }
  }

  function resetDatabase() {
    Alert.alert(
      'รีเซ็ตฐานข้อมูล',
      'ข้อมูลบิล ออเดอร์ และตะกร้าทั้งหมดจะถูกลบ ส่วนเมนู หมวดหมู่ และโต๊ะจะยังอยู่ ต้องการดำเนินการต่อหรือไม่?',
      [
        { text: 'ยกเลิก', style: 'cancel' },
        { text: 'รีเซ็ต', style: 'destructive', onPress: async () => {
          try {
            await db.withTransactionAsync(async () => {
              await db.runAsync('DELETE FROM cart_items');
              await db.runAsync('DELETE FROM Order_Detail');
              await db.runAsync('DELETE FROM Order_Round');
              await db.runAsync('DELETE FROM Bill');
            });
            setOrders([]);
            setHistoricalOrders([]);
            setBillHistory([]);
            setViewedBill(null);
            setCart([]);
            setOpenTables([]);
            setSelectedTable(null);
            setPage('tables');
            Alert.alert('รีเซ็ตสำเร็จ', 'ล้างข้อมูลบิล ออเดอร์ และตะกร้าแล้ว');
          } catch (error) {
            console.error('Failed to reset local database', error);
            Alert.alert('รีเซ็ตไม่สำเร็จ', 'ลบข้อมูลจากฐานข้อมูลไม่ได้');
          }
        } },
      ],
    );
  }

  function closeBill() {
    const total = tableOrders.reduce((sum, item) => sum + item.price * item.quantity, 0);
    Alert.alert(`ปิดบิลโต๊ะ ${selectedTable}`, `ยอดรวม ${total.toFixed(2)} บาท`, [
      { text: 'ยกเลิก', style: 'cancel' },
      { text: 'ยืนยัน', onPress: async () => {
        let paidBill;
        try {
          await db.withTransactionAsync(async () => {
            const bill = await db.getFirstAsync(
              "SELECT id_bill FROM Bill WHERE id_table = ? AND status = 'open' LIMIT 1", selectedTable,
            );
            if (bill) {
              const closedAt = new Date().toISOString();
              await db.runAsync("UPDATE Bill SET status = 'paid', close_at = ? WHERE id_bill = ?", closedAt, bill.id_bill);
              paidBill = {
                id: bill.id_bill, table: selectedTable, closedAt,
                itemCount: tableOrders.reduce((sum, item) => sum + item.quantity, 0),
                total,
              };
            }
            await db.runAsync('DELETE FROM cart_items WHERE table_number = ?', selectedTable);
          });
          setOrders((old) => old.filter((item) => item.table !== selectedTable));
          setCart((old) => old.filter((item) => item.table !== selectedTable));
          setOpenTables((old) => old.filter((number) => number !== selectedTable));
          if (paidBill) setBillHistory((old) => [paidBill, ...old.filter((bill) => bill.id !== paidBill.id)]);
          setSelectedTable(null);
          setPage('tables');
        } catch (error) {
          console.error('Failed to close bill', error);
          Alert.alert('ปิดบิลไม่สำเร็จ', 'อัปเดตสถานะบิลในฐานข้อมูลไม่ได้');
        }
      } },
    ]);
  }

  const title = page === 'tables' ? 'เลือกโต๊ะของคุณ'
    : page === 'menu' ? `เมนูโต๊ะ ${selectedTable}`
    : page === 'cart' ? `ตะกร้าโต๊ะ ${selectedTable}`
    : page === 'bill' ? `บิลโต๊ะ ${selectedTable}`
    : page === 'history-bill' ? `บิลโต๊ะ ${viewedBill?.table ?? ''}`
    : page === 'history' ? 'ประวัติบิล'
    : page === 'reports' ? 'รายงานยอดขาย' : 'รายการเข้าครัว';
  const subtitle = page === 'tables' ? 'เลือกโต๊ะเพื่อเริ่มสั่งอาหาร'
    : page === 'menu' ? 'อาหารอร่อย ๆ สำหรับมื้อนี้'
    : page === 'cart' ? 'ตรวจรายการก่อนส่งเข้าครัว'
    : page === 'bill' ? 'รายการที่สั่งแล้ว แยกตามรอบ'
    : page === 'history-bill' ? `ปิดบิลเมื่อ ${viewedBill?.closedAt ?? '-'}`
    : page === 'history' ? 'เลือกบิลที่ชำระแล้วเพื่อดูรายละเอียด'
    : page === 'reports' ? 'สรุปยอดขายและเมนูขายดีจากบิลที่ชำระแล้ว' : 'รายการที่ส่งมาก่อนจะแสดงก่อน';

  if (!databaseReady) return <View style={styles.root}><ActivityIndicator color={colors.green} /></View>;
  if (databaseError) {
    return <View style={styles.root}><Header title="เปิดฐานข้อมูลไม่สำเร็จ" subtitle="ตรวจสอบ SQLite ในเครื่อง" />
      <Text style={styles.empty}>{databaseError}</Text>
    </View>;
  }

  return (
    <View style={styles.root}>
      <StatusBar style="dark" backgroundColor={colors.bg} />
      <Header title={title} subtitle={subtitle} />
      {page === 'tables' && <TableScreen tables={tableRows} openTables={openTables} onSelectTable={selectTable} onViewHistory={() => setPage('history')} onViewReports={() => setPage('reports')} onResetDatabase={resetDatabase} />}
      {page === 'menu' && (
        <MenuScreen categories={categories} category={category} onChangeCategory={setCategory}
          cart={tableCart} orders={tableOrders} menuItems={menuItems}
          onAddFood={addFood} onChangePage={setPage} />
      )}
      {page === 'cart' && (
        <CartScreen cart={tableCart} onChangeQuantity={changeQuantity}
          onChangeNote={changeNote} onSendOrder={sendOrder} onChangePage={setPage} />
      )}
      {page === 'bill' && <BillScreen orders={tableOrders} onCloseBill={closeBill} onChangePage={setPage} />}
      {page === 'history' && <BillHistoryScreen bills={billHistory} onSelectBill={openHistoricalBill} />}
      {page === 'history-bill' && <BillScreen orders={historicalOrders} readOnly onBack={() => setPage('history')} />}
      {page === 'reports' && <ReportsScreen />}
      {page === 'kitchen' && <KitchenScreen orders={orders} onUpdateStatus={updateStatus} />}
      <BottomTabs page={page} selectedTable={selectedTable} onChangePage={setPage} />
    </View>
  );
}

export default function App() {
  return <SQLiteProvider databaseName="restaurant.db" onInit={initializeDatabase}><RestaurantApp /></SQLiteProvider>;
}