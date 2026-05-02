// =============================================
// Database Layer - SQL via sql.js (WebAssembly)
// Persistent storage using IndexedDB
// =============================================

const DB_NAME = 'restaurant_menu_db';
const DB_VERSION = 1;
let db = null;
let SQL = null;

async function initDatabase() {
    try {
        SQL = await initSqlJs({ locateFile: file => `https://cdnjs.cloudflare.com/ajax/libs/sql.js/1.10.2/${file}` });
        await loadOrCreateDatabase();
        return true;
    } catch (e) {
        console.error('DB init error:', e);
        return false;
    }
}

async function loadOrCreateDatabase() {
    const stored = await getFromIndexedDB('restaurant_db');
    if (stored) {
        db = new SQL.Database(stored);
    } else {
        db = new SQL.Database();
        runSchema();
    }
    window.db = db;
}

function runSchema() {
    db.run(`
    CREATE TABLE IF NOT EXISTS categories (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name_ar TEXT NOT NULL, name_en TEXT, icon TEXT,
        sort_order INTEGER DEFAULT 0, is_active INTEGER DEFAULT 1,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
    CREATE TABLE IF NOT EXISTS products (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        category_id INTEGER NOT NULL, name_ar TEXT NOT NULL, name_en TEXT,
        description_ar TEXT, price REAL NOT NULL, image_url TEXT, video_url TEXT,
        stock INTEGER DEFAULT 100, is_available INTEGER DEFAULT 1,
        is_featured INTEGER DEFAULT 0, sort_order INTEGER DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP, updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
    CREATE TABLE IF NOT EXISTS product_extras (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        product_id INTEGER NOT NULL, name_ar TEXT NOT NULL, name_en TEXT,
        price REAL DEFAULT 0, is_active INTEGER DEFAULT 1
    );
    CREATE TABLE IF NOT EXISTS orders (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        order_number TEXT UNIQUE NOT NULL, table_number INTEGER,
        order_type TEXT DEFAULT 'dine_in', status TEXT DEFAULT 'pending',
        total_amount REAL DEFAULT 0, notes TEXT, customer_name TEXT, customer_phone TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP, updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
    CREATE TABLE IF NOT EXISTS order_items (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        order_id INTEGER NOT NULL, product_id INTEGER NOT NULL,
        product_name TEXT NOT NULL, product_price REAL NOT NULL,
        quantity INTEGER DEFAULT 1, extras TEXT, extras_price REAL DEFAULT 0,
        item_total REAL DEFAULT 0, notes TEXT
    );
    CREATE TABLE IF NOT EXISTS admin_settings (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        key TEXT UNIQUE NOT NULL, value TEXT, updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
    CREATE TABLE IF NOT EXISTS slider_images (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        image_url TEXT NOT NULL, title_ar TEXT, subtitle_ar TEXT,
        link TEXT, sort_order INTEGER DEFAULT 0, is_active INTEGER DEFAULT 1
    );`);
    insertDefaultData();
}

function insertDefaultData() {
    try {
        const check = db.exec("SELECT COUNT(*) as c FROM admin_settings");
        if (check[0] && check[0].values[0][0] > 0) return;
    } catch(e) {}

    db.run(`INSERT OR IGNORE INTO admin_settings (key, value) VALUES
        ('admin_password','1234'),('restaurant_name','مطعم النخبة'),
        ('restaurant_logo',''),('currency','ج.م'),('welcome_message','أهلاً بكم في مطعمنا')`);

    [[1,'المقبلات','Appetizers','🥗',1],[2,'الوجبات الرئيسية','Main Courses','🍽️',2],
     [3,'المشويات','Grills','🔥',3],[4,'البيتزا','Pizza','🍕',4],[5,'البرجر','Burgers','🍔',5],
     [6,'المعكرونة','Pasta','🍝',6],[7,'السلطات','Salads','🥙',7],[8,'الحلويات','Desserts','🍰',8],
     [9,'المشروبات','Beverages','🥤',9]
    ].forEach(c => db.run(`INSERT OR IGNORE INTO categories (id,name_ar,name_en,icon,sort_order) VALUES (?,?,?,?,?)`, c));

    [[1,2,'شيش طاووق','Chicken Shish','دجاج مشوي بالتوابل الشرقية مع خبز وصلصة',85,50,1,'https://images.unsplash.com/photo-1599487488170-d11ec9c172f0?w=400',''],
     [2,2,'كباب مشوي','Grilled Kebab','كباب لحم بالفحم مع أرز وسلطة',95,30,1,'https://images.unsplash.com/photo-1529193591184-b1d58069ecdd?w=400',''],
     [3,5,'برجر كلاسيك','Classic Burger','برجر لحم بقري مع خس وطماطم وجبن',75,40,1,'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400',''],
     [4,4,'بيتزا مارجريتا','Margherita Pizza','بيتزا بصلصة الطماطم والجبن والريحان',90,25,0,'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=400',''],
     [5,6,'مكرونة بولونيز','Bolognese Pasta','مكرونة بصلصة اللحم الإيطالية',70,35,0,'https://images.unsplash.com/photo-1555949258-eb67b1ef0ceb?w=400',''],
     [6,8,'كنافة بالجبن','Knafeh','كنافة نابلسية أصلية بالجبن والعسل',45,20,1,'https://images.unsplash.com/photo-1579954115545-a95591f28bfc?w=400',''],
     [7,9,'عصير مانجو','Mango Juice','عصير مانجو طازج 100%',30,100,0,'https://images.unsplash.com/photo-1546173159-315724a31696?w=400',''],
     [8,1,'سمبوسك','Sambousek','سمبوسك بالجبن واللحم مقلي',35,0,0,'https://images.unsplash.com/photo-1601050690597-df0568f70950?w=400',''],
     [9,3,'دجاج مشوي كامل','Whole Grilled Chicken','دجاجة كاملة مشوية بالأعشاب والتوابل',120,15,1,'https://images.unsplash.com/photo-1598103442097-8b74394b95c8?w=400',''],
     [10,5,'كريسبي برجر','Crispy Burger','برجر دجاج مقرمش مع صلصة خاصة',80,45,0,'https://images.unsplash.com/photo-1606755962773-d324e0a13086?w=400','']
    ].forEach(p => db.run(`INSERT OR IGNORE INTO products (id,category_id,name_ar,name_en,description_ar,price,stock,is_featured,image_url,video_url) VALUES (?,?,?,?,?,?,?,?,?,?)`, p));

    [[1,'إضافة جبن','Add Cheese',10],[1,'إضافة أفوكادو','Add Avocado',15],[1,'حار إضافي','Extra Spicy',0],
     [3,'جبن مزدوج','Double Cheese',15],[3,'لحم مضاعف','Double Meat',25],[3,'بيض مقلي','Fried Egg',10],
     [4,'جبن مضاعف','Extra Cheese',15],[4,'فطر','Mushrooms',10],[4,'زيتون','Olives',8],
     [9,'صلصة ثوم','Garlic Sauce',5],[9,'خبز رقيق','Thin Bread',5]
    ].forEach(e => db.run(`INSERT INTO product_extras (product_id,name_ar,name_en,price) VALUES (?,?,?,?)`, e));

    [['https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=1200','أهلاً بكم في مطعم النخبة','تجربة طعام لا تُنسى',1],
     ['https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=1200','أشهى المأكولات الشرقية','مع أفضل الطهاة المحترفين',2],
     ['https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=1200','عروض خاصة يومية','وجبات طازجة بأسعار مميزة',3]
    ].forEach(s => db.run(`INSERT INTO slider_images (image_url,title_ar,subtitle_ar,sort_order) VALUES (?,?,?,?)`, s));

    saveDatabase();
}

function getFromIndexedDB(key) {
    return new Promise((resolve) => {
        try {
            const req = indexedDB.open(DB_NAME, DB_VERSION);
            req.onupgradeneeded = e => e.target.result.createObjectStore('data');
            req.onsuccess = e => {
                try {
                    const tx = e.target.result.transaction('data','readonly');
                    const g = tx.objectStore('data').get(key);
                    g.onsuccess = () => resolve(g.result||null);
                    g.onerror = () => resolve(null);
                } catch(e) { resolve(null); }
            };
            req.onerror = () => resolve(null);
        } catch(e) { resolve(null); }
    });
}

function saveToIndexedDB(key, value) {
    return new Promise((resolve) => {
        try {
            const req = indexedDB.open(DB_NAME, DB_VERSION);
            req.onupgradeneeded = e => e.target.result.createObjectStore('data');
            req.onsuccess = e => {
                try {
                    const tx = e.target.result.transaction('data','readwrite');
                    tx.objectStore('data').put(value, key);
                    tx.oncomplete = () => resolve(true);
                    tx.onerror = () => resolve(false);
                } catch(e) { resolve(false); }
            };
            req.onerror = () => resolve(false);
        } catch(e) { resolve(false); }
    });
}

let saveTimer = null;
async function saveDatabase() {
    if (!db) return;
    clearTimeout(saveTimer);
    saveTimer = setTimeout(async () => {
        try { await saveToIndexedDB('restaurant_db', db.export()); } catch(e) {}
    }, 300);
}

function query(sql, params=[]) {
    try {
        const r = db.exec(sql, params);
        if (!r.length) return [];
        return r[0].values.map(row => {
            const obj = {};
            r[0].columns.forEach((c,i) => obj[c] = row[i]);
            return obj;
        });
    } catch(e) { console.error('Query:', e, sql); return []; }
}

function run(sql, params=[]) {
    try { db.run(sql, params); saveDatabase(); return db.getRowsModified(); }
    catch(e) { console.error('Run:', e, sql); return 0; }
}

function lastId() {
    try { return db.exec("SELECT last_insert_rowid() as id")[0]?.values[0][0]||null; }
    catch(e) { return null; }
}

// =============================================
// DB API
// =============================================
const DB = {
    getSetting: k => query("SELECT value FROM admin_settings WHERE key=?", [k])[0]?.value || '',
    updateSetting: (k,v) => run("INSERT OR REPLACE INTO admin_settings(key,value,updated_at) VALUES(?,?,CURRENT_TIMESTAMP)", [k,v]),
    getCategories: () => query("SELECT * FROM categories WHERE is_active=1 ORDER BY sort_order"),
    getAllCategories: () => query("SELECT * FROM categories ORDER BY sort_order"),
    addCategory: d => { run("INSERT INTO categories(name_ar,name_en,icon,sort_order) VALUES(?,?,?,?)", [d.name_ar,d.name_en||'',d.icon||'🍽️',d.sort_order||0]); return lastId(); },
    updateCategory: (id,d) => run("UPDATE categories SET name_ar=?,name_en=?,icon=?,sort_order=?,is_active=? WHERE id=?", [d.name_ar,d.name_en||'',d.icon||'🍽️',d.sort_order||0,d.is_active??1,id]),
    deleteCategory: id => run("DELETE FROM categories WHERE id=?", [id]),
    getProducts: catId => catId
        ? query("SELECT p.*,c.name_ar as cat_name FROM products p JOIN categories c ON p.category_id=c.id WHERE p.category_id=? ORDER BY p.sort_order,p.id",[catId])
        : query("SELECT p.*,c.name_ar as cat_name FROM products p JOIN categories c ON p.category_id=c.id ORDER BY c.sort_order,p.sort_order,p.id"),
    getFeaturedProducts: () => query("SELECT * FROM products WHERE is_featured=1 AND is_available=1 ORDER BY sort_order LIMIT 10"),
    getProduct: id => query("SELECT p.*,c.name_ar as cat_name FROM products p JOIN categories c ON p.category_id=c.id WHERE p.id=?",[id])[0],
    addProduct: d => {
        run("INSERT INTO products(category_id,name_ar,name_en,description_ar,price,image_url,video_url,stock,is_available,is_featured,sort_order) VALUES(?,?,?,?,?,?,?,?,?,?,?)",
            [d.category_id,d.name_ar,d.name_en||'',d.description_ar||'',d.price,d.image_url||'',d.video_url||'',d.stock??100,d.is_available??1,d.is_featured??0,d.sort_order??0]);
        return lastId();
    },
    updateProduct: (id,d) => run("UPDATE products SET category_id=?,name_ar=?,name_en=?,description_ar=?,price=?,image_url=?,video_url=?,stock=?,is_available=?,is_featured=?,sort_order=?,updated_at=CURRENT_TIMESTAMP WHERE id=?",
        [d.category_id,d.name_ar,d.name_en||'',d.description_ar||'',d.price,d.image_url||'',d.video_url||'',d.stock??100,d.is_available??1,d.is_featured??0,d.sort_order??0,id]),
    updateStock: (id,stock) => run("UPDATE products SET stock=?,is_available=?,updated_at=CURRENT_TIMESTAMP WHERE id=?", [stock,stock>0?1:0,id]),
    deleteProduct: id => { run("DELETE FROM product_extras WHERE product_id=?",[id]); run("DELETE FROM products WHERE id=?",[id]); },
    getExtras: pid => query("SELECT * FROM product_extras WHERE product_id=? AND is_active=1",[pid]),
    addExtra: d => run("INSERT INTO product_extras(product_id,name_ar,name_en,price) VALUES(?,?,?,?)",[d.product_id,d.name_ar,d.name_en||'',d.price||0]),
    deleteExtra: id => run("DELETE FROM product_extras WHERE id=?",[id]),
    getSliders: () => query("SELECT * FROM slider_images WHERE is_active=1 ORDER BY sort_order"),
    getAllSliders: () => query("SELECT * FROM slider_images ORDER BY sort_order"),
    addSlider: d => run("INSERT INTO slider_images(image_url,title_ar,subtitle_ar,sort_order) VALUES(?,?,?,?)",[d.image_url,d.title_ar||'',d.subtitle_ar||'',d.sort_order||0]),
    deleteSlider: id => run("DELETE FROM slider_images WHERE id=?",[id]),
    getOrders: (status=null) => status
        ? query("SELECT * FROM orders WHERE status=? ORDER BY created_at DESC",[status])
        : query("SELECT * FROM orders ORDER BY created_at DESC"),
    getOrder: id => query("SELECT * FROM orders WHERE id=?",[id])[0],
    getOrderItems: oid => query("SELECT * FROM order_items WHERE order_id=?",[oid]),
    createOrder: data => {
        const num = 'ORD-'+Date.now();
        run("INSERT INTO orders(order_number,table_number,order_type,status,total_amount,notes,customer_name,customer_phone) VALUES(?,?,?,?,?,?,?,?)",
            [num,data.table_number||null,data.order_type||'dine_in','pending',data.total_amount,data.notes||'',data.customer_name||'',data.customer_phone||'']);
        const oid = lastId();
        data.items.forEach(it => {
            run("INSERT INTO order_items(order_id,product_id,product_name,product_price,quantity,extras,extras_price,item_total,notes) VALUES(?,?,?,?,?,?,?,?,?)",
                [oid,it.product_id,it.product_name,it.product_price,it.quantity,JSON.stringify(it.extras||[]),it.extras_price||0,it.item_total,it.notes||'']);
            run("UPDATE products SET stock=MAX(0,stock-?) WHERE id=?",[it.quantity,it.product_id]);
            run("UPDATE products SET is_available=0,updated_at=CURRENT_TIMESTAMP WHERE id=? AND stock<=0",[it.product_id]);
        });
        return { orderId: oid, orderNum: num };
    },
    updateOrderStatus: (id,status) => run("UPDATE orders SET status=?,updated_at=CURRENT_TIMESTAMP WHERE id=?",[status,id]),
    deleteOrder: id => { run("DELETE FROM order_items WHERE order_id=?",[id]); run("DELETE FROM orders WHERE id=?",[id]); },
    getTodayStats: () => {
        const today = new Date().toISOString().split('T')[0];
        const r = query(`SELECT COUNT(*) as total, COALESCE(SUM(total_amount),0) as revenue FROM orders WHERE date(created_at)=? AND status!='cancelled'`,[today]);
        const p = query(`SELECT COUNT(*) as c FROM orders WHERE status='pending'`);
        return { total:r[0]?.total||0, revenue:r[0]?.revenue||0, pending:p[0]?.c||0 };
    },
    run, query
};

window.DB = DB;
window.initDatabase = initDatabase;
window.run = run;
window.query = query;
