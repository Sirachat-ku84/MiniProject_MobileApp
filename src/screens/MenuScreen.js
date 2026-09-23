import { FlatList, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import Button from '../components/Button';
import { categories, menu } from '../data';
import { styles } from '../theme';

export default function MenuScreen({ category, onChangeCategory, cart, orders, onAddFood, onChangePage }) {
  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <View style={styles.body}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.categories} style={styles.categoryScroll}>
        {categories.map((item) => (
          <TouchableOpacity key={item.id} style={[styles.chip, category === item.id && styles.activeChip]} onPress={() => onChangeCategory(item.id)}>
            <Text style={[styles.chipText, category === item.id && styles.activeChipText]}>{item.name}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
      <FlatList
        data={menu.filter((item) => item.category === category)}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => (
          <View style={styles.menuCard}>
            <Text style={styles.foodIcon}>{item.icon}</Text>
            <View style={styles.foodInfo}>
              <Text style={styles.foodName}>{item.name}</Text>
              <Text style={styles.price}>{item.price} บาท</Text>
            </View>
            <TouchableOpacity style={styles.add} onPress={() => onAddFood(item)}>
              <Text style={styles.addText}>+</Text>
            </TouchableOpacity>
          </View>
        )}
      />
      <View style={styles.footer}>
        <Button title={`ดูตะกร้า${cartCount ? ` (${cartCount})` : ''}`} onPress={() => onChangePage('cart')} />
        {orders.length > 0 && <Button title="ดูบิลที่เปิดอยู่" secondary onPress={() => onChangePage('bill')} />}
      </View>
    </View>
  );
}
