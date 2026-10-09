import { categories, menu } from './data';

async function tableExists(db, tableName) {
  return Boolean(await db.getFirstAsync(
    "SELECT name FROM sqlite_master WHERE type = 'table' AND name = ?",
    tableName,
  ));
}

export async function initializeDatabase(db) {
  if (await tableExists(db, 'categories')) {
    const oldCategoryColumns = await db.getAllAsync('PRAGMA table_info(categories)');
    if (!oldCategoryColumns.some((column) => column.name === 'id_foodcate')) {
      await db.execAsync('ALTER TABLE categories RENAME TO legacy_categories');
    }
  }

  await db.execAsync(`
    PRAGMA journal_mode = WAL;
    PRAGMA foreign_keys = ON;

    CREATE TABLE IF NOT EXISTS Categories (
      id_foodcate TEXT PRIMARY KEY NOT NULL,
      name TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS Menu (
      id_menu TEXT PRIMARY KEY NOT NULL,
      name TEXT NOT NULL,
      price REAL NOT NULL CHECK (price >= 0),
      id_foodcate TEXT NOT NULL REFERENCES Categories(id_foodcate),
      icon TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS Restaurant_tables (
      id_table INTEGER PRIMARY KEY NOT NULL,
      seat INTEGER NOT NULL DEFAULT 4 CHECK (seat > 0)
    );
    CREATE TABLE IF NOT EXISTS Bill (
      id_bill TEXT PRIMARY KEY NOT NULL,
      open_at TEXT NOT NULL,
      close_at TEXT,
      status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'paid')),
      total_price REAL NOT NULL DEFAULT 0 CHECK (total_price >= 0),
      id_table INTEGER NOT NULL REFERENCES Restaurant_tables(id_table)
    );
    CREATE UNIQUE INDEX IF NOT EXISTS bill_one_open_per_table_idx
      ON Bill(id_table) WHERE status = 'open';
    CREATE TABLE IF NOT EXISTS Order_Round (
      id_round TEXT PRIMARY KEY NOT NULL,
      round_number INTEGER NOT NULL CHECK (round_number > 0),
      order_at TEXT NOT NULL,
      id_bill TEXT NOT NULL REFERENCES Bill(id_bill),
      UNIQUE (id_bill, round_number)
    );
    CREATE TABLE IF NOT EXISTS Order_Detail (
      id_detail TEXT PRIMARY KEY NOT NULL,
      quantity INTEGER NOT NULL CHECK (quantity > 0),
      unit_price REAL NOT NULL CHECK (unit_price >= 0),
      status TEXT NOT NULL,
      id_menu TEXT NOT NULL REFERENCES Menu(id_menu),
      id_round TEXT NOT NULL REFERENCES Order_Round(id_round),
      note TEXT NOT NULL DEFAULT ''
    );
    CREATE INDEX IF NOT EXISTS order_detail_round_idx ON Order_Detail(id_round);
    CREATE TABLE IF NOT EXISTS cart_items (
      table_number INTEGER NOT NULL REFERENCES Restaurant_tables(id_table),
      menu_id TEXT NOT NULL REFERENCES Menu(id_menu),
      name TEXT NOT NULL,
      price REAL NOT NULL CHECK (price >= 0),
      icon TEXT NOT NULL,
      quantity INTEGER NOT NULL CHECK (quantity > 0),
      note TEXT NOT NULL DEFAULT '',
      PRIMARY KEY (table_number, menu_id)
    );
  `);

  const billColumns = await db.getAllAsync('PRAGMA table_info(Bill)');
  if (!billColumns.some((column) => column.name === 'total_price')) {
    await db.execAsync('ALTER TABLE Bill ADD COLUMN total_price REAL NOT NULL DEFAULT 0 CHECK (total_price >= 0)');
    await db.runAsync(`
      UPDATE Bill
      SET total_price = COALESCE((
        SELECT SUM(d.quantity * d.unit_price)
        FROM Order_Round r
        JOIN Order_Detail d ON d.id_round = r.id_round
        WHERE r.id_bill = Bill.id_bill
      ), 0)
    `);
  }
  if (billColumns.some((column) => column.name === 'total_food')) {
    await db.execAsync('ALTER TABLE Bill DROP COLUMN total_food');
  }

  const legacyOrderItems = await tableExists(db, 'order_items');
  const legacyMenuItems = await tableExists(db, 'menu_items');
  const legacyCategories = await tableExists(db, 'legacy_categories');
  const oldCartItems = await db.getAllAsync(
    'SELECT table_number, menu_id, name, price, icon, quantity, note FROM cart_items',
  );

  await db.withTransactionAsync(async () => {
    for (let table = 1; table <= 15; table += 1) {
      await db.runAsync('INSERT OR IGNORE INTO Restaurant_tables (id_table, seat) VALUES (?, ?)', table, 4);
    }
    for (const category of categories) {
      await db.runAsync(
        'INSERT OR IGNORE INTO Categories (id_foodcate, name) VALUES (?, ?)',
        category.id, category.name,
      );
    }
    if (legacyCategories) {
      const oldCategories = await db.getAllAsync('SELECT id, name FROM legacy_categories');
      for (const category of oldCategories) {
        await db.runAsync(
          'INSERT OR IGNORE INTO Categories (id_foodcate, name) VALUES (?, ?)',
          category.id, category.name,
        );
      }
    }
    for (const item of menu) {
      await db.runAsync(
        'INSERT OR REPLACE INTO Menu (id_menu, name, price, id_foodcate, icon) VALUES (?, ?, ?, ?, ?)',
        item.id, item.name, item.price, item.category, item.uri,
      );
    }
    if (legacyMenuItems) {
      const oldMenu = await db.getAllAsync('SELECT id, category_id, name, price, icon FROM menu_items');
      for (const item of oldMenu) {
        await db.runAsync(
          'INSERT OR IGNORE INTO Menu (id_menu, name, price, id_foodcate, icon) VALUES (?, ?, ?, ?, ?)',
          item.id, item.name, item.price, item.category_id, item.icon,
        );
      }
    }

    if (legacyOrderItems && legacyMenuItems) {
      const oldOrders = await db.getAllAsync('SELECT * FROM order_items ORDER BY rowid');
      for (const item of oldOrders) {
        await db.runAsync(
          'INSERT OR IGNORE INTO Restaurant_tables (id_table, seat) VALUES (?, ?)',
          item.table_number, 4,
        );
        const billId = `legacy-bill-${item.table_number}`;
        await db.runAsync(
          `INSERT OR IGNORE INTO Bill (id_bill, open_at, status, id_table)
           VALUES (?, ?, 'open', ?)`,
          billId, new Date().toISOString(), item.table_number,
        );
        const roundId = `legacy-round-${item.table_number}-${item.round}`;
        await db.runAsync(
          `INSERT OR IGNORE INTO Order_Round (id_round, round_number, order_at, id_bill)
           VALUES (?, ?, ?, ?)`,
          roundId, item.round, item.time || new Date().toISOString(), billId,
        );
        await db.runAsync(
          `INSERT OR IGNORE INTO Order_Detail
           (id_detail, quantity, unit_price, status, id_menu, id_round, note)
           VALUES (?, ?, ?, ?, ?, ?, ?)`,
          item.id, item.quantity, item.price, item.status, item.menu_id, roundId, item.note || '',
        );
      }
    }
  });

  if (legacyCategories || legacyMenuItems || legacyOrderItems) {
  const cartForeignKeys = await db.getAllAsync('PRAGMA foreign_key_list(cart_items)');
  const cartUsesOldMenu = cartForeignKeys.some((key) => key.table === 'menu_items');
  await db.execAsync('PRAGMA foreign_keys = OFF');
  try {
    await db.execAsync(`
      DROP TABLE IF EXISTS cart_items;
      CREATE TABLE IF NOT EXISTS cart_items (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        table_number TEXT,
        menu_id TEXT,
        name TEXT,
        price REAL,
        icon TEXT,
        quantity INTEGER,
        note TEXT,
        UNIQUE(table_number, menu_id)
      );
    `);
    for (const item of oldCartItems) {
      await db.runAsync(
        `INSERT OR REPLACE INTO cart_items
        (table_number, menu_id, name, price, icon, quantity, note)
        VALUES (?, ?, ?, ?, ?, ?, ?)`,
        item.table_number, item.menu_id, item.name, item.price,
        item.icon, item.quantity, item.note || '',
      );
    }
    await db.execAsync('DROP TABLE legacy_cart_items');
    await db.execAsync('DROP TABLE IF EXISTS order_items');
    await db.execAsync('DROP TABLE IF EXISTS menu_items');
    await db.execAsync('DROP TABLE IF EXISTS legacy_categories');
  } catch (error) {
    console.error('Migration error:', error);
  } finally {
    await db.execAsync('PRAGMA foreign_keys = ON');
  }
  }
}
