

-- Create tables in order (dependencies first)

-- 1. Users table
CREATE TABLE IF NOT EXISTS users (
    _id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    phone VARCHAR(20),
    address TEXT,
    role VARCHAR(50) DEFAULT 'customer',
    kitchen_id INTEGER,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. Kitchens table
CREATE TABLE IF NOT EXISTS kitchens (
    _id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    address TEXT,
    phone VARCHAR(20),
    email VARCHAR(255),
    owner_id INTEGER REFERENCES users(_id),
    status VARCHAR(50) DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 3. Food items table
CREATE TABLE IF NOT EXISTS food_items (
    _id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    price DECIMAL(10,2) NOT NULL,
    category VARCHAR(100),
    image VARCHAR(500),
    kitchen_id INTEGER REFERENCES kitchens(_id),
    available BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 4. Orders table
CREATE TABLE IF NOT EXISTS orders (
    _id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(_id),
    kitchen_id INTEGER REFERENCES kitchens(_id),
    total_amount DECIMAL(10,2) NOT NULL,
    status VARCHAR(50) DEFAULT 'pending',
    delivery_address TEXT,
    payment_method VARCHAR(50),
    payment_status VARCHAR(50) DEFAULT 'pending',
    delivery_fee DECIMAL(10,2) DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 5. Order items table
CREATE TABLE IF NOT EXISTS order_items (
    _id SERIAL PRIMARY KEY,
    order_id INTEGER REFERENCES orders(_id) ON DELETE CASCADE,
    food_item_id INTEGER REFERENCES food_items(_id),
    quantity INTEGER NOT NULL,
    price DECIMAL(10,2) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 6. Cart table
CREATE TABLE IF NOT EXISTS cart (
    _id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(_id),
    food_item_id INTEGER REFERENCES food_items(_id),
    quantity INTEGER NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, food_item_id)
);

-- 7. Delivery applications table
CREATE TABLE IF NOT EXISTS delivery_applications (
    _id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(_id),
    full_name VARCHAR(255) NOT NULL,
    phone VARCHAR(20) NOT NULL,
    email VARCHAR(255) NOT NULL,
    address TEXT NOT NULL,
    vehicle_type VARCHAR(100) NOT NULL,
    license_number VARCHAR(100),
    experience_years INTEGER,
    status VARCHAR(50) DEFAULT 'pending',
    applied_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    reviewed_at TIMESTAMP,
    reviewed_by INTEGER REFERENCES users(_id)
);

-- 8. Deliveries table
CREATE TABLE IF NOT EXISTS deliveries (
    _id SERIAL PRIMARY KEY,
    order_id INTEGER REFERENCES orders(_id),
    delivery_person_id INTEGER REFERENCES users(_id),
    pickup_address TEXT,
    delivery_address TEXT,
    status VARCHAR(50) DEFAULT 'assigned',
    estimated_time INTEGER,
    actual_time INTEGER,
    delivery_fee DECIMAL(10,2),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 9. Food ratings table
CREATE TABLE IF NOT EXISTS food_ratings (
    _id SERIAL PRIMARY KEY,
    food_item_id INTEGER REFERENCES food_items(_id),
    user_id INTEGER REFERENCES users(_id),
    rating INTEGER CHECK (rating >= 1 AND rating <= 5),
    review TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(food_item_id, user_id)
);

-- 10. Coupons table
CREATE TABLE IF NOT EXISTS coupons (
    _id SERIAL PRIMARY KEY,
    code VARCHAR(50) UNIQUE NOT NULL,
    discount_type VARCHAR(20) NOT NULL, -- 'percentage' or 'fixed'
    discount_value DECIMAL(10,2) NOT NULL,
    min_order_amount DECIMAL(10,2) DEFAULT 0,
    max_discount DECIMAL(10,2),
    kitchen_id INTEGER REFERENCES kitchens(_id),
    usage_limit INTEGER DEFAULT 1,
    used_count INTEGER DEFAULT 0,
    valid_from TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    valid_until TIMESTAMP,
    active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_food_items_kitchen_id ON food_items(kitchen_id);
CREATE INDEX IF NOT EXISTS idx_orders_user_id ON orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_cart_user_id ON cart(user_id);
CREATE INDEX IF NOT EXISTS idx_deliveries_order_id ON deliveries(order_id);
CREATE INDEX IF NOT EXISTS idx_food_ratings_food_item_id ON food_ratings(food_item_id);


COMMIT;
