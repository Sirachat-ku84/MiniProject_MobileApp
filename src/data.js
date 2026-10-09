export const categories = [
  { id: 'rice', name: 'จานข้าว' },
  { id: 'noodle', name: 'เส้น' },
  { id: 'soup', name: 'ต้ม / แกง' },
  { id: 'side', name: 'กินเล่น' },
  { id: 'drink', name: 'เครื่องดื่ม' },
];
export const tableConfig = {
  uri: 'https://png.pngtree.com/png-clipart/20190924/original/pngtree-tableware-icon-for-your-project-png-image_4820186.jpg', 
};

export const menu = [
  { id: 'r1', category: 'rice', name: 'ข้าวกะเพราหมูสับ', price: 65, uri: 'https://www.absoluteplant.com/wp-content/uploads/2022/09/%E0%B8%81%E0%B8%B0%E0%B9%80%E0%B8%9E%E0%B8%A3%E0%B8%B23-2-700x700.jpg' },
  { id: 'r2', category: 'rice', name: 'ข้าวผัดกุ้ง', price: 75, uri: 'https://img.wongnai.com/p/1920x0/2020/03/06/d34e8f779cd94f18ac43aeab11a5239f.jpg' },
  { id: 'r3', category: 'rice', name: 'ข้าวมันไก่', price: 60, uri: 'https://img.wongnai.com/p/400x0/2017/06/22/bbf899f7ab4341dea4aec6330c2afafd.jpg' },
  { id: 'r4', category: 'rice', name: 'ข้าวหมูทอดกระเทียม', price: 65, uri: 'https://static.thairath.co.th/media/dFQROr7oWzulq5Fa6rpMP0IwcTkY7Nk2F3IyFKD0yKg6lqZeUbBLmw4CO8n7O7eRDtY.jpg' },
  { id: 'r5', category: 'rice', name: 'ข้าวไข่ข้น', price: 55, uri: 'https://s359.kapook.com/pagebuilder/e2deef80-e2a4-46d3-8097-4dd480c365c0.jpg' },
  
  { id: 'n1', category: 'noodle', name: 'ผัดไทยกุ้งสด', price: 80, uri: 'https://img.wongnai.com/p/1920x0/2019/05/04/15a588ebc226426f8ae18e2a6bc955f8.jpg' },
  { id: 'n2', category: 'noodle', name: 'ก๋วยเตี๋ยวหมูน้ำใส', price: 60, uri: 'https://s359.kapook.com/pagebuilder/1590c321-a52f-4fba-8dbe-fafdadb81038.jpg' },
  { id: 'n3', category: 'noodle', name: 'ราดหน้าหมู', price: 65, uri: 'https://img.wongnai.com/p/1920x0/2021/11/04/16e27b0cd535457b906185077b5369e7.jpg' },
  { id: 'n4', category: 'noodle', name: 'ผัดซีอิ๊วไก่', price: 65, uri: 'https://img.wongnai.com/p/1920x0/2019/04/17/998894b9210947dfaafb59c21cad48dc.jpg' },
  { id: 'n5', category: 'noodle', name: 'สปาเกตตีขี้เมา', price: 85, uri: 'https://www.ajinomoto.co.th/storage/photos/shares/Recipe/Menu/01spaghetti/614b180e9a009.jpg' },

  { id: 's1', category: 'soup', name: 'ต้มยำกุ้ง', price: 120, uri: 'https://img.wongnai.com/p/1920x0/2017/10/19/75678af28e394fbfb473fa1b417a62fc.jpg' },
  { id: 's2', category: 'soup', name: 'ต้มข่าไก่', price: 95, uri: 'https://s359.kapook.com/pagebuilder/f103aacb-cbd7-4e82-9e73-c134b2551aef.jpg' },
  { id: 's3', category: 'soup', name: 'แกงเขียวหวานไก่', price: 100, uri: 'https://static.thairath.co.th/media/dFQROr7oWzulq5Fa6rjAoVzo6w5As8O2Ufy8ntnjD6u2AbjENB83cuVgGXC9UNuVu7z.jpg' },
  { id: 's4', category: 'soup', name: 'แกงจืดเต้าหู้หมูสับ', price: 85, uri: 'https://img.wongnai.com/p/1920x0/2019/03/25/16be129786034c1185c4cc0768f61356.jpg' },
  { id: 's5', category: 'soup', name: 'พะแนงหมู', price: 105, uri: 'https://img.wongnai.com/p/1920x0/2020/09/01/2bdae2f5174f4cecb5d4239fc6f582c3.jpg' },

  { id: 'a1', category: 'side', name: 'ปีกไก่ทอด', price: 75, uri: 'https://img.wongnai.com/p/1920x0/2020/09/02/48f63da8a1734ba89ac9a689f19aed1a.jpg' },
  { id: 'a2', category: 'side', name: 'เฟรนช์ฟรายส์', price: 65, uri: 'https://s359.kapook.com/pagebuilder/f6558105-e6e7-419b-a04d-edb108647bb1.jpg' },
  { id: 'a3', category: 'side', name: 'ทอดมันปลา', price: 80, uri: 'https://img.wongnai.com/p/1968x0/2019/03/24/03eca72140ef425f95655aed1af68c86.jpg' },
  { id: 'a4', category: 'side', name: 'ส้มตำไทย', price: 60, uri: 'https://www.unileverfoodsolutions.co.th/th/chef-inspiration/simple-tips-for-great-flavour/somtum-green-papaya-salad-recipes/jcr:content/parsys/content-aside-footer/tipsandadvice/image.img.jpg/1695118621402.jpg' },
  { id: 'a5', category: 'side', name: 'ยำวุ้นเส้น', price: 85, uri: 'https://img.wongnai.com/p/1920x0/2019/12/02/a27a981c24ba4d2a8c8a7e827e5837cf.jpg' },

  { id: 'd1', category: 'drink', name: 'น้ำเปล่า', price: 15, uri: 'https://primebeverage.co.th/wp-content/uploads/2023/11/VDB-KL600B-01.jpg' },
  { id: 'd2', category: 'drink', name: 'ชาไทยเย็น', price: 45, uri: 'https://cms.dmpcdn.com/food/2021/05/05/00a9fe30-ad7d-11eb-a73b-c395e0dfc07b_original.jpg' },
  { id: 'd3', category: 'drink', name: 'กาแฟเย็น', price: 50, uri: 'https://image.makewebeasy.net/makeweb/m_1920x0/SfjcR5Jud/blog/still_2607270_960_720.jpg' },
  { id: 'd4', category: 'drink', name: 'น้ำมะนาว', price: 45, uri: 'https://yayoirestaurants.com/productimages/8858_880x800_3.jpg' },
  { id: 'd5', category: 'drink', name: 'โกโก้เย็น', price: 50, uri: 'https://www.falconforprofessional.com/wp-content/uploads/2023/10/91.jpg' },
];