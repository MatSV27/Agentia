-- Eliminar tablas en orden correcto para evitar errores de restricciones
DROP TABLE IF EXISTS habit_completions;
DROP TABLE IF EXISTS habits;
DROP TABLE IF EXISTS habit_categories;
DROP TABLE IF EXISTS transactions;
DROP TABLE IF EXISTS savings_goals;
DROP TABLE IF EXISTS categories;
DROP TABLE IF EXISTS users;
DROP TABLE IF EXISTS event_categories;
DROP TABLE IF EXISTS events;

-- Crear tabla de usuarios
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL
);

-- Crear tabla de categorías financieras
CREATE TABLE categories (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    name VARCHAR(100) NOT NULL,
    budget DECIMAL(10, 2) DEFAULT 0,
    color VARCHAR(50) DEFAULT 'green'
);

-- Crear tabla de transacciones
CREATE TABLE transactions (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    category_id INTEGER REFERENCES categories(id),
    amount DECIMAL(10, 2) NOT NULL,
    description VARCHAR(255),
    type VARCHAR(20) NOT NULL,  -- 'ingreso' o 'gasto'
    date TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Crear tabla de metas de ahorro
CREATE TABLE savings_goals (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    name VARCHAR(100) NOT NULL,
    target_amount DECIMAL(10, 2) NOT NULL,
    current_amount DECIMAL(10, 2) DEFAULT 0,
    target_date DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Crear tabla de categorías de hábitos
CREATE TABLE habit_categories (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    color VARCHAR(50) DEFAULT 'green'
);

-- Crear tabla de hábitos
CREATE TABLE habits (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    name VARCHAR(100) NOT NULL,
    category_id INTEGER REFERENCES habit_categories(id),
    frequency VARCHAR(20) NOT NULL, -- 'daily', 'weekly', 'monthly'
    days_of_week VARCHAR(50), -- 'Mon,Wed,Fri' o NULL
    days_of_month VARCHAR(100), -- '1,15,30' o NULL
    start_date DATE NOT NULL,
    end_date DATE, -- NULL si es continuo
    start_time TIME DEFAULT '00:00:00', -- hora de inicio
    end_time TIME DEFAULT '23:59:59', -- hora de fin
    current_streak INTEGER DEFAULT 0,
    status VARCHAR(20) DEFAULT 'active', -- 'active', 'archived'
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Crear tabla de completado de hábitos
CREATE TABLE habit_completions (
    id SERIAL PRIMARY KEY,
    habit_id INTEGER REFERENCES habits(id),
    completion_date DATE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(habit_id, completion_date) -- Evitar múltiples completados el mismo día
);

-- Crear tabla de categorías de eventos
CREATE TABLE event_categories (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    color VARCHAR(50) NOT NULL,
    is_default BOOLEAN DEFAULT false
);

-- Crear tabla de eventos
CREATE TABLE events (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    title VARCHAR(255) NOT NULL,
    description TEXT,
    category_id INTEGER REFERENCES event_categories(id),
    start_datetime TIMESTAMP NOT NULL,
    end_datetime TIMESTAMP NOT NULL,
    location VARCHAR(255),
    is_all_day BOOLEAN DEFAULT false,
    google_event_id VARCHAR(255), -- ID en Google Calendar
    status VARCHAR(50) DEFAULT 'active', -- 'active', 'cancelled'
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Categorías financieras predefinidas exactamente como en la imagen con los montos exactos
INSERT INTO categories (name, budget, color) VALUES 
('Comida', 500, 'green'),         -- $500 como en la imagen
('Transporte', 300, 'blue'),      -- $300 como en la imagen
('Entretenimiento', 200, 'purple'), -- $200 como en la imagen
('Ahorro', 300, 'teal');          -- $300 como en la imagen

-- Categorías de hábitos predefinidas
INSERT INTO habit_categories (name, color) VALUES
('Bienestar', 'green'),
('Aprendizaje', 'blue'),
('Relajación', 'purple'),
('Reflexión', 'teal'),
('Hobby', 'orange'),
('Recreación', 'indigo');

-- Categorías de eventos predefinidas
INSERT INTO event_categories (name, color, is_default) VALUES
('Trabajo', 'blue', true),
('Estudio', 'indigo', true),
('Bienestar', 'purple', true),
('Finanzas', 'amber', true),
('Hábitos', 'green', true),
('Bloques libres', 'gray', true);
