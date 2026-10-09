-- Schema reference for the restaurant ordering app.
-- Run this against a new SQLite database. Existing app initialization
-- currently creates these objects from src/database.js.

PRAGMA foreign_keys = ON;
PRAGMA journal_mode = WAL;

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
  id_table INTEGER NOT NULL REFERENCES Restaurant_tables(id_table)
);

CREATE UNIQUE INDEX IF NOT EXISTS bill_one_open_per_table_idx
  ON Bill(id_table)
  WHERE status = 'open';

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

CREATE INDEX IF NOT EXISTS order_detail_round_idx
  ON Order_Detail(id_round);

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

-- Initial restaurant tables
INSERT OR IGNORE INTO Restaurant_tables (id_table, seat) VALUES
  (1, 4), (2, 4), (3, 4), (4, 4), (5, 4),
  (6, 4), (7, 4), (8, 4), (9, 4), (10, 4),
  (11, 4), (12, 4), (13, 4), (14, 4), (15, 4);

-- Initial food categories
INSERT OR IGNORE INTO Categories (id_foodcate, name) VALUES
  ('rice', 'จานข้าว'),
  ('noodle', 'เส้น'),
  ('soup', 'ต้ม / แกง'),
  ('side', 'กินเล่น'),
  ('drink', 'เครื่องดื่ม');

-- Initial menu items
INSERT OR IGNORE INTO Menu (id_menu, name, price, id_foodcate, icon) VALUES
  ('r1', 'ข้าวกะเพราหมูสับ', 65, 'rice', '🍛'),
  ('r2', 'ข้าวผัดกุ้ง', 75, 'rice', '🍤'),
  ('r3', 'ข้าวมันไก่', 60, 'rice', '🍚'),
  ('r4', 'ข้าวหมูทอดกระเทียม', 65, 'rice', '🍖'),
  ('r5', 'ข้าวไข่ข้น', 55, 'rice', '🍳'),
  ('n1', 'ผัดไทยกุ้งสด', 80, 'noodle', '🍜'),
  ('n2', 'ก๋วยเตี๋ยวหมูน้ำใส', 60, 'noodle', '🍜'),
  ('n3', 'ราดหน้าหมู', 65, 'noodle', '🍲'),
  ('n4', 'ผัดซีอิ๊วไก่', 65, 'noodle', '🍝'),
  ('n5', 'สปาเกตตีขี้เมา', 85, 'noodle', '🍝'),
  ('s1', 'ต้มยำกุ้ง', 120, 'soup', '🍲'),
  ('s2', 'ต้มข่าไก่', 95, 'soup', '🥣'),
  ('s3', 'แกงเขียวหวานไก่', 100, 'soup', '🍛'),
  ('s4', 'แกงจืดเต้าหู้หมูสับ', 85, 'soup', '🥣'),
  ('s5', 'พะแนงหมู', 105, 'soup', '🍲'),
  ('a1', 'ปีกไก่ทอด', 75, 'side', '🍗'),
  ('a2', 'เฟรนช์ฟรายส์', 65, 'side', '🍟'),
  ('a3', 'ทอดมันปลา', 80, 'side', '🍥'),
  ('a4', 'ส้มตำไทย', 60, 'side', '🥗'),
  ('a5', 'ยำวุ้นเส้น', 85, 'side', '🥗'),
  ('d1', 'น้ำเปล่า', 15, 'drink', '💧'),
  ('d2', 'ชาไทยเย็น', 45, 'drink', '🧋'),
  ('d3', 'กาแฟเย็น', 50, 'drink', '☕'),
  ('d4', 'น้ำมะนาว', 45, 'drink', '🍋'),
  ('d5', 'น้ำอัญชันมะนาว', 50, 'drink', '🍹');
