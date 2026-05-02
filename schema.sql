-- =============================================
-- Restaurant Menu Database Schema
-- =============================================

CREATE TABLE IF NOT EXISTS categories (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name_ar TEXT NOT NULL,
    name_en TEXT,
    icon TEXT,
    sort_order INTEGER DEFAULT 0,
    is_active INTEGER DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS products (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    category_id INTEGER NOT NULL,
    name_ar TEXT NOT NULL,
    name_en TEXT,
    description_ar TEXT,
    description_en TEXT,
    price REAL NOT NULL,
    image_url TEXT,
    video_url TEXT,
    stock INTEGER DEFAULT 100,
    is_available INTEGER DEFAULT 1,
    is_featured INTEGER DEFAULT 0,
    sort_order INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (category_id) REFERENCES categories(id)
);

CREATE TABLE IF NOT EXISTS product_extras (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    product_id INTEGER NOT NULL,
    name_ar TEXT NOT NULL,
    name_en TEXT,
    price REAL DEFAULT 0,
    is_active INTEGER DEFAULT 1,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS tables (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    table_number INTEGER UNIQUE NOT NULL,
    name TEXT,
    is_active INTEGER DEFAULT 1
);

CREATE TABLE IF NOT EXISTS orders (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    order_number TEXT UNIQUE NOT NULL,
    table_number INTEGER,
    order_type TEXT DEFAULT 'dine_in', -- dine_in, takeaway
    status TEXT DEFAULT 'pending', -- pending, confirmed, preparing, ready, delivered, cancelled
    total_amount REAL DEFAULT 0,
    notes TEXT,
    customer_name TEXT,
    customer_phone TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS order_items (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    order_id INTEGER NOT NULL,
    product_id INTEGER NOT NULL,
    product_name TEXT NOT NULL,
    product_price REAL NOT NULL,
    quantity INTEGER DEFAULT 1,
    extras TEXT, -- JSON string of selected extras
    extras_price REAL DEFAULT 0,
    item_total REAL DEFAULT 0,
    notes TEXT,
    FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS admin_settings (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    key TEXT UNIQUE NOT NULL,
    value TEXT,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS slider_images (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    image_url TEXT NOT NULL,
    title_ar TEXT,
    subtitle_ar TEXT,
    link TEXT,
    sort_order INTEGER DEFAULT 0,
    is_active INTEGER DEFAULT 1
);

-- =============================================
-- Default Data
-- =============================================

INSERT OR IGNORE INTO admin_settings (key, value) VALUES
    ('admin_password', '1234'),
    ('restaurant_name', 'مطعم النخبة'),
    ('restaurant_logo', ''),
    ('currency', 'ج.م'),
    ('welcome_message', 'أهلاً بكم في مطعمنا');

INSERT OR IGNORE INTO tables (table_number, name) VALUES
    (1, 'طاولة 1'), (2, 'طاولة 2'), (3, 'طاولة 3'), (4, 'طاولة 4'),
    (5, 'طاولة 5'), (6, 'طاولة 6'), (7, 'طاولة 7'), (8, 'طاولة 8'),
    (9, 'طاولة 9'), (10, 'طاولة 10'), (11, 'طاولة 11'), (12, 'طاولة 12');

INSERT OR IGNORE INTO categories (id, name_ar, name_en, icon, sort_order) VALUES
    (1, 'المقبلات', 'Appetizers', '🥗', 1),
    (2, 'الوجبات الرئيسية', 'Main Courses', '🍽️', 2),
    (3, 'المشويات', 'Grills', '🔥', 3),
    (4, 'البيتزا', 'Pizza', '🍕', 4),
    (5, 'البرجر', 'Burgers', '🍔', 5),
    (6, 'المعكرونة', 'Pasta', '🍝', 6),
    (7, 'السلطات', 'Salads', '🥙', 7),
    (8, 'الحلويات', 'Desserts', '🍰', 8),
    (9, 'المشروبات', 'Beverages', '🥤', 9);

INSERT OR IGNORE INTO products (id, category_id, name_ar, name_en, description_ar, price, stock, is_featured, image_url) VALUES
    (1, 2, 'شيش طاووق', 'Chicken Shish', 'دجاج مشوي بالتوابل الشرقية مع خبز وصلصة', 85, 50, 1, 'https://images.unsplash.com/photo-1599487488170-d11ec9c172f0?w=400'),
    (2, 2, 'كباب مشوي', 'Grilled Kebab', 'كباب لحم بالفحم مع أرز وسلطة', 95, 30, 1, 'https://images.unsplash.com/photo-1529193591184-b1d58069ecdd?w=400'),
    (3, 5, 'برجر كلاسيك', 'Classic Burger', 'برجر لحم بقري مع خس وطماطم وجبن', 75, 40, 1, 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400'),
    (4, 4, 'بيتزا مارجريتا', 'Margherita Pizza', 'بيتزا بصلصة الطماطم والجبن والريحان', 90, 25, 0, 'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=400'),
    (5, 6, 'مكرونة بولونيز', 'Bolognese Pasta', 'مكرونة بصلصة اللحم الإيطالية', 70, 35, 0, 'https://images.unsplash.com/photo-1555949258-eb67b1ef0ceb?w=400'),
    (6, 8, 'كنافة بالجبن', 'Knafeh', 'كنافة نابلسية أصلية بالجبن والعسل', 45, 20, 1, 'https://images.unsplash.com/photo-1579954115545-a95591f28bfc?w=400'),
    (7, 9, 'عصير مانجو', 'Mango Juice', 'عصير مانجو طازج 100%', 30, 100, 0, 'https://images.unsplash.com/photo-1546173159-315724a31696?w=400'),
    (8, 1, 'سمبوسك', 'Sambousek', 'سمبوسك بالجبن واللحم مقلي', 35, 0, 0, 'https://images.unsplash.com/photo-1601050690597-df0568f70950?w=400'),
    (9, 3, 'دجاج مشوي كامل', 'Whole Grilled Chicken', 'دجاجة كاملة مشوية بالأعشاب والتوابل', 120, 15, 1, 'https://images.unsplash.com/photo-1598103442097-8b74394b95c8?w=400'),
    (10, 5, 'كريسبي برجر', 'Crispy Burger', 'برجر دجاج مقرمش مع صلصة خاصة', 80, 45, 0, 'https://images.unsplash.com/photo-1606755962773-d324e0a13086?w=400');

INSERT OR IGNORE INTO product_extras (product_id, name_ar, name_en, price) VALUES
    (1, 'إضافة جبن', 'Add Cheese', 10),
    (1, 'إضافة أفوكادو', 'Add Avocado', 15),
    (1, 'حار إضافي', 'Extra Spicy', 0),
    (3, 'جبن مزدوج', 'Double Cheese', 15),
    (3, 'لحم مضاعف', 'Double Meat', 25),
    (3, 'بيض مقلي', 'Fried Egg', 10),
    (4, 'جبن مضاعف', 'Extra Cheese', 15),
    (4, 'فطر', 'Mushrooms', 10),
    (4, 'زيتون', 'Olives', 8),
    (9, 'صلصة ثوم', 'Garlic Sauce', 5),
    (9, 'خبز رقيق', 'Thin Bread', 5);

INSERT OR IGNORE INTO slider_images (image_url, title_ar, subtitle_ar, sort_order, is_active) VALUES
    ('https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=1200', 'أهلاً بكم في مطعم النخبة', 'تجربة طعام لا تُنسى', 1, 1),
    ('https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=1200', 'أشهى المأكولات الشرقية', 'مع أفضل الطهاة المحترفين', 2, 1),
    ('https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=1200', 'عروض خاصة يومية', 'وجبات طازجة بأسعار مميزة', 3, 1);
