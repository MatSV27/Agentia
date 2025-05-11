from flask import Flask, request, jsonify
from flask_cors import CORS
import psycopg2
import bcrypt
import jwt
from datetime import datetime, timedelta, date
from functools import wraps
import os
import json



from werkzeug.security import generate_password_hash, check_password_hash
import re

app = Flask(__name__)
CORS(app, 
     resources={r"/api/*": {"origins": "*"}},  # O pon el dominio de tu frontend en vez de "*"
     supports_credentials=True,
     methods=["GET", "HEAD", "POST", "OPTIONS", "PUT", "PATCH", "DELETE"],
     allow_headers=["Content-Type", "Authorization", "Access-Control-Allow-Origin", 
                    "Access-Control-Allow-Headers", "X-Requested-With"])

# Manejador global para OPTIONS que responde automáticamente
@app.route('/api/<path:path>', methods=['OPTIONS'])
def handle_options(path):
    response = jsonify({'status': 'OK'})
    response.headers.add('Access-Control-Allow-Origin', '*')
    response.headers.add('Access-Control-Allow-Headers', 'Content-Type,Authorization')
    response.headers.add('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS')
    return response

# Añadir cabeceras CORS a todas las respuestas
@app.after_request
def add_cors_headers(response):
    response.headers.add('Access-Control-Allow-Origin', '*')
    response.headers.add('Access-Control-Allow-Headers', 'Content-Type,Authorization')
    response.headers.add('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS')
    return response
# Configuración de la base de datos
DB_NAME = os.getenv('DB_NAME')
DB_USER = os.getenv('DB_USER')
DB_PASSWORD = os.getenv('DB_PASSWORD')
DB_HOST = os.getenv('DB_HOST')
DB_PORT = os.getenv('DB_PORT')


# Clave secreta para JWT
JWT_SECRET = 'tu_secreto_jwt'  # En producción, usar una clave segura desde variable de entorno

# Categorías predefinidas para todos los usuarios exactamente como en el mockup
DEFAULT_CATEGORIES = [
    ('Comida', 500, 'green'),       # Presupuesto como en el mockup: $500
    ('Transporte', 300, 'blue'),    # Presupuesto como en el mockup: $300
    ('Entretenimiento', 200, 'purple'), # Presupuesto como en el mockup: $200 
    ('Ahorro', 300, 'teal'),        # Presupuesto como en el mockup: $300
]

# Función para conectar a la base de datos
def get_db_connection():
    try:
        return psycopg2.connect(
            dbname=DB_NAME,
            user=DB_USER,
            password=DB_PASSWORD,
            host=DB_HOST,
            port=DB_PORT
        )
    except psycopg2.Error as e:
        print(f"Error al conectar a la base de datos: {e}")
        return None

# Decorador para verificar token JWT
def token_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        token = None
        if 'Authorization' in request.headers:
            token = request.headers['Authorization'].split(" ")[1]
        
        if not token:
            return jsonify({'message': 'Token es requerido'}), 401
        
        try:
            data = jwt.decode(token, JWT_SECRET, algorithms=["HS256"])
            user_id = data['id']
        except:
            return jsonify({'message': 'Token inválido'}), 401
        
        return f(user_id, *args, **kwargs)
    
    return decorated

# Endpoint de registro
@app.route('/api/register', methods=['POST'])
def register():
    data = request.get_json()
    name = data.get('name')
    email = data.get('email')
    password = data.get('password')
    
    if not name or not email or not password:
        return jsonify({'message': 'Faltan datos obligatorios'}), 400
    
    hashed_password = generate_password_hash(password)
    
    conn = get_db_connection()
    if conn is None:
        return jsonify({'message': 'Error de conexión a la base de datos'}), 500
    
    cur = conn.cursor()
    try:
        # Verificar si el email ya existe
        cur.execute('SELECT id FROM users WHERE email = %s', (email,))
        if cur.fetchone():
            return jsonify({'message': 'El email ya está registrado'}), 400
        
        # Insertar nuevo usuario
        cur.execute(
            'INSERT INTO users (name, email, password) VALUES (%s, %s, %s) RETURNING id',
            (name, email, hashed_password)
        )
        user_id = cur.fetchone()[0]
        
        # Crear categorías financieras predefinidas para el usuario
        cur.execute(
            '''INSERT INTO categories (user_id, name, budget, color) 
               VALUES (%s, 'Comida', 500, 'green'),
                      (%s, 'Transporte', 300, 'blue'),
                      (%s, 'Entretenimiento', 200, 'purple'),
                      (%s, 'Ahorro', 300, 'teal')''',
            (user_id, user_id, user_id, user_id)
        )
        
        # Crear categorías de hábitos para el usuario
        # Obtener todas las categorías de hábitos predefinidas
        cur.execute('SELECT id, name, color FROM habit_categories')
        habit_categories = cur.fetchall()
        
        # Crear hábito predeterminado de ejemplo (opcional)
        if habit_categories:
            # Tomar la primera categoría (Bienestar) para crear un hábito predeterminado
            bienestar_id = next((cat[0] for cat in habit_categories if cat[1] == 'Bienestar'), None)
            if bienestar_id:
                # Crear un hábito predeterminado: "Beber agua" (diario)
                cur.execute(
                    '''INSERT INTO habits 
                        (user_id, name, category_id, frequency, start_date, status) 
                       VALUES (%s, %s, %s, %s, %s, %s)''',
                    (user_id, 'Beber 2 litros de agua', bienestar_id, 'daily', date.today(), 'active')
                )
        
        conn.commit()
        
        # Generar token
        token = jwt.encode({'id': user_id}, JWT_SECRET, algorithm='HS256')
        
        return jsonify({
            'message': 'Usuario registrado correctamente',
            'token': token,
            'name': name
        }), 201
    except Exception as e:
        conn.rollback()
        print(f"Error: {e}")
        return jsonify({'message': f'Error al registrar usuario: {e}'}), 500
    finally:
        cur.close()
        conn.close()

# Endpoint de login
@app.route('/api/login', methods=['POST'])
def login():
    data = request.get_json()
    email = data.get('email')
    password = data.get('password')
    conn = get_db_connection()
    if conn is None:
        return jsonify({'message': 'Error de conexión a la base de datos'}), 500
    cur = conn.cursor()
    try:
        cur.execute('SELECT * FROM users WHERE email = %s', (email,))
        user = cur.fetchone()
        if not user:
            return jsonify({'message': 'Usuario no encontrado'}), 400
        
        # Imprimir información de depuración
        print(f"Contraseña proporcionada: {password}")
        print(f"Hash almacenado: {user[3]}")
        
        try:
            # Usar check_password_hash de Werkzeug para verificar la contraseña
            # ya que generate_password_hash se usó para crear el hash en el registro
            if not check_password_hash(user[3], password):
                return jsonify({'message': 'Contraseña incorrecta'}), 400
        except ValueError as e:
            print(f"Error al verificar la contraseña: {e}")
            return jsonify({'message': f'Error al verificar la contraseña: {e}'}), 500
        
        token = jwt.encode({'id': user[0]}, JWT_SECRET, algorithm='HS256')
        return jsonify({'token': token, 'name': user[1]}), 200
    except psycopg2.Error as e:
        print(f"Error al iniciar sesión: {e}")  # Imprime el error en la consola
        return jsonify({'message': f'Error al iniciar sesión: {e}'}), 500
    finally:
        cur.close()
        conn.close()

# Endpoint para obtener categorías de presupuesto
@app.route('/api/categories', methods=['GET'])
@token_required
def get_categories(user_id):
    conn = get_db_connection()
    if conn is None:
        return jsonify({'message': 'Error de conexión a la base de datos'}), 500
    cur = conn.cursor()
    try:
        # Verificar si el usuario tiene categorías
        cur.execute('SELECT COUNT(*) FROM categories WHERE user_id = %s', (user_id,))
        count = cur.fetchone()[0]
        
        # Si no tiene categorías, crear las categorías por defecto
        if count == 0:
            for cat in DEFAULT_CATEGORIES:
                cur.execute(
                    'INSERT INTO categories (user_id, name, budget, color) VALUES (%s, %s, %s, %s)',
                    (user_id, cat[0], cat[1], cat[2])
                )
            conn.commit()
        
        # Obtener las categorías del usuario
        cur.execute('SELECT id, name, budget, color FROM categories WHERE user_id = %s', (user_id,))
        categories = cur.fetchall()
        result = []
        for cat in categories:
            result.append({
                'id': cat[0],
                'name': cat[1],
                'budget': float(cat[2]),
                'color': cat[3]
            })
        return jsonify(result)
    except psycopg2.Error as e:
        conn.rollback()
        print(f"Error al obtener categorías: {e}")
        return jsonify({'message': f'Error al obtener categorías: {e}'}), 500
    finally:
        cur.close()
        conn.close()

# Endpoint para crear una nueva categoría
@app.route('/api/categories', methods=['POST'])
@token_required
def create_category(user_id):
    data = request.get_json()
    name = data.get('name')
    budget = data.get('budget', 0)
    color = data.get('color', 'green')
    
    conn = get_db_connection()
    if conn is None:
        return jsonify({'message': 'Error de conexión a la base de datos'}), 500
    cur = conn.cursor()
    try:
        cur.execute(
            'INSERT INTO categories (user_id, name, budget, color) VALUES (%s, %s, %s, %s) RETURNING id',
            (user_id, name, budget, color)
        )
        category_id = cur.fetchone()[0]
        conn.commit()
        return jsonify({'id': category_id, 'name': name, 'budget': float(budget), 'color': color}), 201
    except psycopg2.Error as e:
        conn.rollback()
        print(f"Error al crear categoría: {e}")
        return jsonify({'message': f'Error al crear categoría: {e}'}), 500
    finally:
        cur.close()
        conn.close()

# Endpoint para registrar una transacción
@app.route('/api/transactions', methods=['POST'])
@token_required
def create_transaction(user_id):
    data = request.get_json()
    category_id = data.get('category_id')
    amount = data.get('amount')
    description = data.get('description', '')
    transaction_type = data.get('type')  # 'ingreso' o 'gasto'
    transaction_date = data.get('date', datetime.now().strftime('%Y-%m-%d %H:%M:%S'))
    
    conn = get_db_connection()
    if conn is None:
        return jsonify({'message': 'Error de conexión a la base de datos'}), 500
    cur = conn.cursor()
    try:
        cur.execute(
            'INSERT INTO transactions (user_id, category_id, amount, description, type, date) VALUES (%s, %s, %s, %s, %s, %s) RETURNING id',
            (user_id, category_id, amount, description, transaction_type, transaction_date)
        )
        transaction_id = cur.fetchone()[0]
        conn.commit()
        return jsonify({
            'id': transaction_id,
            'category_id': category_id,
            'amount': float(amount),
            'description': description,
            'type': transaction_type,
            'date': transaction_date
        }), 201
    except psycopg2.Error as e:
        conn.rollback()
        print(f"Error al crear transacción: {e}")
        return jsonify({'message': f'Error al crear transacción: {e}'}), 500
    finally:
        cur.close()
        conn.close()

# Endpoint para obtener transacciones recientes
@app.route('/api/transactions/recent', methods=['GET'])
@token_required
def get_recent_transactions(user_id):
    conn = get_db_connection()
    if conn is None:
        return jsonify({'message': 'Error de conexión a la base de datos'}), 500
    cur = conn.cursor()
    try:
        cur.execute('''
            SELECT t.id, t.amount, t.description, t.type, t.date, c.name as category_name
            FROM transactions t
            JOIN categories c ON t.category_id = c.id
            WHERE t.user_id = %s
            ORDER BY t.date DESC
            LIMIT 10
        ''', (user_id,))
        transactions = cur.fetchall()
        result = []
        for t in transactions:
            result.append({
                'id': t[0],
                'amount': float(t[1]),
                'description': t[2],
                'type': t[3],
                'date': t[4].strftime('%Y-%m-%d %H:%M:%S'),
                'category_name': t[5]
            })
        return jsonify(result)
    except psycopg2.Error as e:
        print(f"Error al obtener transacciones: {e}")
        return jsonify({'message': f'Error al obtener transacciones: {e}'}), 500
    finally:
        cur.close()
        conn.close()

# Endpoint para obtener resumen financiero
@app.route('/api/finance/summary', methods=['GET'])
@token_required
def get_finance_summary(user_id):
    # Obtener mes actual y mes anterior
    today = date.today()
    first_day_current_month = date(today.year, today.month, 1)
    last_month = today.replace(day=1) - timedelta(days=1)
    first_day_last_month = date(last_month.year, last_month.month, 1)
    
    conn = get_db_connection()
    if conn is None:
        return jsonify({'message': 'Error de conexión a la base de datos'}), 500
    cur = conn.cursor()
    try:
        # Obtener gastos del mes actual
        cur.execute('''
            SELECT COALESCE(SUM(amount), 0) 
            FROM transactions 
            WHERE user_id = %s AND type = 'gasto' AND date >= %s
        ''', (user_id, first_day_current_month))
        current_month_expenses = cur.fetchone()[0]
        
        # Obtener gastos del mes anterior
        cur.execute('''
            SELECT COALESCE(SUM(amount), 0) 
            FROM transactions 
            WHERE user_id = %s AND type = 'gasto' AND date >= %s AND date < %s
        ''', (user_id, first_day_last_month, first_day_current_month))
        last_month_expenses = cur.fetchone()[0]
        
        # Obtener ingresos del mes actual
        cur.execute('''
            SELECT COALESCE(SUM(amount), 0) 
            FROM transactions 
            WHERE user_id = %s AND type = 'ingreso' AND date >= %s
        ''', (user_id, first_day_current_month))
        current_month_income = cur.fetchone()[0]
        
        # Obtener ingresos del mes anterior
        cur.execute('''
            SELECT COALESCE(SUM(amount), 0) 
            FROM transactions 
            WHERE user_id = %s AND type = 'ingreso' AND date >= %s AND date < %s
        ''', (user_id, first_day_last_month, first_day_current_month))
        last_month_income = cur.fetchone()[0]
        
        # Calcular balance total (todos los ingresos - todos los gastos)
        cur.execute('''
            SELECT 
                COALESCE(SUM(CASE WHEN type = 'ingreso' THEN amount ELSE 0 END), 0) - 
                COALESCE(SUM(CASE WHEN type = 'gasto' THEN amount ELSE 0 END), 0) 
            FROM transactions 
            WHERE user_id = %s
        ''', (user_id,))
        total_balance = cur.fetchone()[0]
        
        # Obtener progreso por categoría
        cur.execute('''
            SELECT c.id, c.name, c.budget, 
            COALESCE(SUM(CASE WHEN t.type = 'ingreso' THEN t.amount ELSE 0 END), 0) as income,
            COALESCE(SUM(CASE WHEN t.type = 'gasto' THEN t.amount ELSE 0 END), 0) as expense
            FROM categories c
            LEFT JOIN transactions t ON c.id = t.category_id AND t.date >= %s
            WHERE c.user_id = %s
            GROUP BY c.id, c.name, c.budget
        ''', (first_day_current_month, user_id))
        
        categories_progress = []
        for cat in cur.fetchall():
            # Para las categorías: los ingresos suman, los gastos restan
            income = float(cat[3])
            expense = float(cat[4])
            
            # Si es una categoría normal, los gastos consumen el presupuesto
            # El "spent" representa cuánto has gastado del presupuesto
            spent = expense
            
            categories_progress.append({
                'id': cat[0],
                'name': cat[1],
                'budget': float(cat[2]),
                'spent': spent,
                'income': income,  # Añadir ingresos por separado
                'color': getCategoryColor(cat[1])
            })
        
        # Obtener metas de ahorro
        cur.execute('''
            SELECT id, name, target_amount, current_amount, target_date
            FROM savings_goals
            WHERE user_id = %s
        ''', (user_id,))
        
        savings_goals = []
        for goal in cur.fetchall():
            savings_goals.append({
                'id': goal[0],
                'name': goal[1],
                'target_amount': float(goal[2]),
                'current_amount': float(goal[3]),
                'target_date': goal[4].strftime('%Y-%m-%d') if goal[4] else None
            })
        
        # Calcular variación porcentual de gastos e ingresos
        expense_variation = 0
        if last_month_expenses > 0:
            expense_variation = ((current_month_expenses - last_month_expenses) / last_month_expenses) * 100
        
        income_variation = 0
        if last_month_income > 0:
            income_variation = ((current_month_income - last_month_income) / last_month_income) * 100
        
        return jsonify({
            'balance_total': float(total_balance),
            'gastos_mes': float(current_month_expenses),
            'ingresos_mes': float(current_month_income),
            'variacion_gastos': float(expense_variation),
            'variacion_ingresos': float(income_variation),
            'categorias': categories_progress,
            'metas_ahorro': savings_goals
        })
    except psycopg2.Error as e:
        print(f"Error al obtener resumen financiero: {e}")
        return jsonify({'message': f'Error al obtener resumen financiero: {e}'}), 500
    finally:
        cur.close()
        conn.close()

# Endpoint para crear o actualizar una meta de ahorro
@app.route('/api/savings/goals', methods=['POST'])
@token_required
def create_savings_goal(user_id):
    data = request.get_json()
    name = data.get('name')
    target_amount = data.get('target_amount')
    current_amount = data.get('current_amount', 0)
    target_date = data.get('target_date')
    
    conn = get_db_connection()
    if conn is None:
        return jsonify({'message': 'Error de conexión a la base de datos'}), 500
    cur = conn.cursor()
    try:
        cur.execute(
            'INSERT INTO savings_goals (user_id, name, target_amount, current_amount, target_date) VALUES (%s, %s, %s, %s, %s) RETURNING id',
            (user_id, name, target_amount, current_amount, target_date)
        )
        goal_id = cur.fetchone()[0]
        conn.commit()
        return jsonify({
            'id': goal_id,
            'name': name,
            'target_amount': float(target_amount),
            'current_amount': float(current_amount),
            'target_date': target_date
        }), 201
    except psycopg2.Error as e:
        conn.rollback()
        print(f"Error al crear meta de ahorro: {e}")
        return jsonify({'message': f'Error al crear meta de ahorro: {e}'}), 500
    finally:
        cur.close()
        conn.close()

# Endpoint para actualizar una meta de ahorro
@app.route('/api/savings/goals/<int:goal_id>', methods=['PUT'])
@token_required
def update_savings_goal(user_id, goal_id):
    data = request.get_json()
    current_amount = data.get('current_amount')
    
    conn = get_db_connection()
    if conn is None:
        return jsonify({'message': 'Error de conexión a la base de datos'}), 500
    cur = conn.cursor()
    try:
        cur.execute(
            'UPDATE savings_goals SET current_amount = %s WHERE id = %s AND user_id = %s RETURNING id, name, target_amount, current_amount, target_date',
            (current_amount, goal_id, user_id)
        )
        goal = cur.fetchone()
        if not goal:
            return jsonify({'message': 'Meta de ahorro no encontrada'}), 404
            
        conn.commit()
        return jsonify({
            'id': goal[0],
            'name': goal[1],
            'target_amount': float(goal[2]),
            'current_amount': float(goal[3]),
            'target_date': goal[4].strftime('%Y-%m-%d') if goal[4] else None
        })
    except psycopg2.Error as e:
        conn.rollback()
        print(f"Error al actualizar meta de ahorro: {e}")
        return jsonify({'message': f'Error al actualizar meta de ahorro: {e}'}), 500
    finally:
        cur.close()
        conn.close()

# Endpoint para asegurar que el usuario tenga categoría de ingreso
@app.route('/api/categories/ensure-income', methods=['POST'])
@token_required
def ensure_income_category(user_id):
    conn = get_db_connection()
    if conn is None:
        return jsonify({'message': 'Error de conexión a la base de datos'}), 500
    cur = conn.cursor()
    try:
        # Verificar si el usuario tiene categorías
        cur.execute('SELECT COUNT(*) FROM categories WHERE user_id = %s', (user_id,))
        count = cur.fetchone()[0]
        
        # Si no tiene categorías, crear las categorías predefinidas
        if count == 0:
            for cat in DEFAULT_CATEGORIES:
                cur.execute(
                    'INSERT INTO categories (user_id, name, budget, color) VALUES (%s, %s, %s, %s)',
                    (user_id, cat[0], cat[1], cat[2])
                )
            conn.commit()
        
        # Devolver la primera categoría como predeterminada
        cur.execute('SELECT id FROM categories WHERE user_id = %s LIMIT 1', (user_id,))
        category_id = cur.fetchone()[0]
        return jsonify({'id': category_id})
        
    except psycopg2.Error as e:
        conn.rollback()
        print(f"Error al asegurar categorías: {e}")
        return jsonify({'message': f'Error: {e}'}), 500
    finally:
        cur.close()
        conn.close()

# Endpoint para obtener categorías por tipo (ingresos o gastos)
@app.route('/api/categories/by-type/<string:type_name>', methods=['GET'])
@token_required
def get_categories_by_type(user_id, type_name):
    conn = get_db_connection()
    if conn is None:
        return jsonify({'message': 'Error de conexión a la base de datos'}), 500
    cur = conn.cursor()
    try:
        # Para ambos tipos (ingreso y gasto) devolver todas las categorías principales
        cur.execute('SELECT id, name, budget, color FROM categories WHERE user_id = %s', (user_id,))
        categories = cur.fetchall()
        result = []
        for cat in categories:
            result.append({
                'id': cat[0],
                'name': cat[1],
                'budget': float(cat[2]),
                'color': cat[3]
            })
        return jsonify(result)
    except psycopg2.Error as e:
        print(f"Error al obtener categorías por tipo: {e}")
        return jsonify({'message': f'Error: {e}'}), 500
    finally:
        cur.close()
        conn.close()

# Endpoint para actualizar el presupuesto de una categoría (solo el presupuesto, no el nombre)
@app.route('/api/categories/<int:category_id>', methods=['PUT'])
@token_required
def update_category(user_id, category_id):
    data = request.get_json()
    budget = data.get('budget')
    
    if budget is None:
        return jsonify({'message': 'No hay datos de presupuesto para actualizar'}), 400
    
    conn = get_db_connection()
    if conn is None:
        return jsonify({'message': 'Error de conexión a la base de datos'}), 500
    cur = conn.cursor()
    try:
        # Solo se permite actualizar el presupuesto, no el nombre
        cur.execute(
            'UPDATE categories SET budget = %s WHERE id = %s AND user_id = %s RETURNING id, name, budget, color',
            (budget, category_id, user_id)
        )
        category = cur.fetchone()
        if not category:
            return jsonify({'message': 'Categoría no encontrada o no pertenece al usuario'}), 404
            
        conn.commit()
        return jsonify({
            'id': category[0],
            'name': category[1],
            'budget': float(category[2]),
            'color': category[3]
        })
    except psycopg2.Error as e:
        conn.rollback()
        print(f"Error al actualizar categoría: {e}")
        return jsonify({'message': f'Error al actualizar categoría: {e}'}), 500
    finally:
        cur.close()
        conn.close()

# Endpoint para obtener transacciones con detalles completos
@app.route('/api/transactions', methods=['GET'])
@token_required
def get_transactions_with_details(user_id):
    limit = request.args.get('limit', default=10, type=int)
    offset = request.args.get('offset', default=0, type=int)
    
    conn = get_db_connection()
    if conn is None:
        return jsonify({'message': 'Error de conexión a la base de datos'}), 500
    cur = conn.cursor()
    try:
        # Obtener el total de transacciones para paginación
        cur.execute('SELECT COUNT(*) FROM transactions WHERE user_id = %s', (user_id,))
        total = cur.fetchone()[0]
        
        # Obtener transacciones con detalles de categoría
        cur.execute('''
            SELECT 
                t.id, 
                t.amount, 
                t.description, 
                t.type, 
                t.date, 
                c.name as category_name,
                c.id as category_id,
                c.color as category_color
            FROM transactions t
            JOIN categories c ON t.category_id = c.id
            WHERE t.user_id = %s
            ORDER BY t.date DESC
            LIMIT %s OFFSET %s
        ''', (user_id, limit, offset))
        
        transactions = cur.fetchall()
        result = []
        
        for t in transactions:
            # Formatear fecha en un formato más amigable
            date_obj = t[4]
            formatted_date = date_obj.strftime('%d %B') if date_obj else None
            
            result.append({
                'id': t[0],
                'amount': float(t[1]),
                'description': t[2],
                'type': t[3],
                'date': t[4].strftime('%Y-%m-%d %H:%M:%S'),
                'formatted_date': formatted_date,
                'category_name': t[5],
                'category_id': t[6],
                'category_color': t[7] or getCategoryColor(t[5])
            })
        
        return jsonify({
            'transactions': result,
            'total': total,
            'limit': limit,
            'offset': offset
        })
    except psycopg2.Error as e:
        print(f"Error al obtener transacciones: {e}")
        return jsonify({'message': f'Error al obtener transacciones: {e}'}), 500
    finally:
        cur.close()
        conn.close()

# Función para obtener el color predeterminado de una categoría
def getCategoryColor(category_name):
    category_colors = {
        'Comida': 'green',
        'Transporte': 'blue',
        'Entretenimiento': 'purple',
        'Ahorro': 'teal'
    }
    return category_colors.get(category_name, 'gray')

# ===== ENDPOINTS PARA EL MÓDULO DE HÁBITOS ===== #

# Endpoint para obtener categorías de hábitos
@app.route('/api/habits/categories', methods=['GET'])
@token_required
def get_habit_categories(user_id):
    conn = get_db_connection()
    if conn is None:
        return jsonify({'message': 'Error de conexión a la base de datos'}), 500
    cur = conn.cursor()
    try:
        cur.execute('SELECT id, name, color FROM habit_categories')
        categories = cur.fetchall()
        result = []
        for cat in categories:
            result.append({
                'id': cat[0],
                'name': cat[1],
                'color': cat[2]
            })
        return jsonify(result)
    except psycopg2.Error as e:
        print(f"Error al obtener categorías de hábitos: {e}")
        return jsonify({'message': f'Error: {e}'}), 500
    finally:
        cur.close()
        conn.close()

# Endpoint para obtener hábitos por estado (activos, archivados)
@app.route('/api/habits', methods=['GET'])
@token_required
def get_habits(user_id):
    status = request.args.get('status', default='active')
    
    conn = get_db_connection()
    if conn is None:
        return jsonify({'message': 'Error de conexión a la base de datos'}), 500
    cur = conn.cursor()
    try:
        # Obtener hábitos del usuario con detalles de categoría
        cur.execute('''
            SELECT h.id, h.name, h.frequency, h.days_of_week, h.days_of_month, 
                   h.start_date, h.end_date, h.current_streak, h.status,
                   c.id as category_id, c.name as category_name, c.color as category_color,
                   h.start_time, h.end_time
            FROM habits h
            JOIN habit_categories c ON h.category_id = c.id
            WHERE h.user_id = %s AND h.status = %s
            ORDER BY h.created_at DESC
        ''', (user_id, status))
        
        habits = cur.fetchall()
        result = []
        
        today = date.today()
        
        for h in habits:
            # Verificar si el hábito está programado para hoy
            scheduled_today = is_habit_scheduled_for_date(h[2], h[3], h[4], today)
            
            # Verificar si ya se completó hoy
            cur.execute('''
                SELECT COUNT(*) FROM habit_completions 
                WHERE habit_id = %s AND completion_date = %s
            ''', (h[0], today))
            completed_today = cur.fetchone()[0] > 0
            
            # Obtener las últimas 7 completaciones para mostrar la racha semanal
            cur.execute('''
                SELECT completion_date FROM habit_completions 
                WHERE habit_id = %s
                ORDER BY completion_date DESC
                LIMIT 7
            ''', (h[0],))
            recent_completions = [completion[0] for completion in cur.fetchall()]
            
            # Calcular progreso semanal (cuántos días completó de los últimos 7 días programados)
            week_progress = []
            for i in range(7):
                check_date = today - timedelta(days=i)
                day_scheduled = is_habit_scheduled_for_date(h[2], h[3], h[4], check_date)
                day_completed = check_date in recent_completions
                if day_scheduled:
                    week_progress.append(day_completed)
                
            result.append({
                'id': h[0],
                'name': h[1],
                'frequency': h[2],
                'days_of_week': h[3].split(',') if h[3] else None,
                'days_of_month': h[4].split(',') if h[4] else None,
                'start_date': h[5].strftime('%Y-%m-%d'),
                'end_date': h[6].strftime('%Y-%m-%d') if h[6] else None,
                'current_streak': h[7],
                'status': h[8],
                'category': {
                    'id': h[9],
                    'name': h[10],
                    'color': h[11]
                },
                'start_time': h[12].strftime('%H:%M') if h[12] else '00:00',
                'end_time': h[13].strftime('%H:%M') if h[13] else '23:59',
                'scheduled_today': scheduled_today,
                'completed_today': completed_today,
                'week_progress': week_progress
            })
            
        return jsonify(result)
    except psycopg2.Error as e:
        print(f"Error al obtener hábitos: {e}")
        return jsonify({'message': f'Error: {e}'}), 500
    finally:
        cur.close()
        conn.close()

# Endpoint para obtener hábitos programados para hoy
@app.route('/api/habits/today', methods=['GET'])
@token_required
def get_habits_for_today(user_id):
    conn = get_db_connection()
    if conn is None:
        return jsonify({'message': 'Error de conexión a la base de datos'}), 500
    cur = conn.cursor()
    try:
        # Obtener todos los hábitos activos del usuario
        cur.execute('''
            SELECT h.id, h.name, h.frequency, h.days_of_week, h.days_of_month, 
                   h.current_streak, h.status,
                   c.id as category_id, c.name as category_name, c.color as category_color,
                   h.start_time, h.end_time
            FROM habits h
            JOIN habit_categories c ON h.category_id = c.id
            WHERE h.user_id = %s AND h.status = 'active'
            ORDER BY h.created_at DESC
        ''', (user_id,))
        
        habits = cur.fetchall()
        result = []
        
        today = date.today()
        
        for h in habits:
            # Verificar si el hábito está programado para hoy
            scheduled_today = is_habit_scheduled_for_date(h[2], h[3], h[4], today)
            
            if not scheduled_today:
                continue  # Saltar hábitos no programados para hoy
            
            # Verificar si ya se completó hoy
            cur.execute('''
                SELECT COUNT(*) FROM habit_completions 
                WHERE habit_id = %s AND completion_date = %s
            ''', (h[0], today))
            completed_today = cur.fetchone()[0] > 0
            
            result.append({
                'id': h[0],
                'name': h[1],
                'frequency': h[2],
                'days_of_week': h[3].split(',') if h[3] else None,
                'days_of_month': h[4].split(',') if h[4] else None,
                'current_streak': h[5],
                'status': h[6],
                'category': {
                    'id': h[7],
                    'name': h[8],
                    'color': h[9]
                },
                'start_time': h[10].strftime('%H:%M') if h[10] else '00:00',
                'end_time': h[11].strftime('%H:%M') if h[11] else '23:59',
                'completed_today': completed_today
            })
            
        return jsonify(result)
    except psycopg2.Error as e:
        print(f"Error al obtener hábitos para hoy: {e}")
        return jsonify({'message': f'Error: {e}'}), 500
    finally:
        cur.close()
        conn.close()

# Endpoint para crear un nuevo hábito
@app.route('/api/habits', methods=['POST'])
@token_required
def create_habit(user_id):
    data = request.get_json()
    name = data.get('name')
    category_id = data.get('category_id')
    frequency = data.get('frequency')
    days_of_week = ','.join(data.get('days_of_week', [])) if data.get('days_of_week') else None
    days_of_month = ','.join(map(str, data.get('days_of_month', []))) if data.get('days_of_month') else None
    start_date = data.get('start_date', date.today().strftime('%Y-%m-%d'))
    end_date = data.get('end_date')
    start_time = data.get('start_time', '00:00')
    end_time = data.get('end_time', '23:59')
    
    conn = get_db_connection()
    if conn is None:
        return jsonify({'message': 'Error de conexión a la base de datos'}), 500
    cur = conn.cursor()
    try:
        cur.execute(
            '''INSERT INTO habits 
                (user_id, name, category_id, frequency, days_of_week, days_of_month, start_date, end_date, start_time, end_time) 
               VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s) 
               RETURNING id''',
            (user_id, name, category_id, frequency, days_of_week, days_of_month, start_date, end_date, start_time, end_time)
        )
        habit_id = cur.fetchone()[0]
        conn.commit()
        
        return jsonify({
            'id': habit_id,
            'name': name,
            'category_id': category_id,
            'frequency': frequency,
            'days_of_week': days_of_week.split(',') if days_of_week else None,
            'days_of_month': days_of_month.split(',') if days_of_month else None,
            'start_date': start_date,
            'end_date': end_date,
            'start_time': start_time,
            'end_time': end_time,
            'current_streak': 0,
            'status': 'active'
        }), 201
    except psycopg2.Error as e:
        conn.rollback()
        print(f"Error al crear hábito: {e}")
        return jsonify({'message': f'Error al crear hábito: {e}'}), 500
    finally:
        cur.close()
        conn.close()

# Endpoint para marcar un hábito como completado
@app.route('/api/habits/<int:habit_id>/complete', methods=['POST'])
@token_required
def complete_habit(user_id, habit_id):
    data = request.get_json()
    completion_date = data.get('completion_date', date.today().strftime('%Y-%m-%d'))
    
    conn = get_db_connection()
    if conn is None:
        return jsonify({'message': 'Error de conexión a la base de datos'}), 500
    cur = conn.cursor()
    
    try:
        # Verificar que el hábito pertenece al usuario
        cur.execute('SELECT id, frequency, days_of_week, days_of_month, current_streak FROM habits WHERE id = %s AND user_id = %s', (habit_id, user_id))
        habit = cur.fetchone()
        
        if not habit:
            return jsonify({'message': 'Hábito no encontrado o no pertenece al usuario'}), 404
        
        # Verificar si el hábito ya fue completado en esa fecha
        cur.execute('SELECT id FROM habit_completions WHERE habit_id = %s AND completion_date = %s', (habit_id, completion_date))
        existing = cur.fetchone()
        
        if existing:
            return jsonify({'message': 'El hábito ya fue completado en esta fecha'}), 400
        
        # Registrar la completación
        cur.execute(
            'INSERT INTO habit_completions (habit_id, completion_date) VALUES (%s, %s) RETURNING id',
            (habit_id, completion_date)
        )
        completion_id = cur.fetchone()[0]
        
        # Actualizar la racha (streak)
        current_streak = habit[4]
        
        # Verificar si se mantuvo la racha o se debe incrementar
        completion_date_obj = datetime.strptime(completion_date, '%Y-%m-%d').date()
        yesterday = completion_date_obj - timedelta(days=1)
        
        # Verificar si había completado el hábito el día anterior (si estaba programado)
        if is_habit_scheduled_for_date(habit[1], habit[2], habit[3], yesterday):
            cur.execute('SELECT id FROM habit_completions WHERE habit_id = %s AND completion_date = %s', (habit_id, yesterday))
            completed_yesterday = cur.fetchone() is not None
            
            if completed_yesterday:
                # Incrementar la racha
                current_streak += 1
            else:
                # Reiniciar la racha si estaba programado ayer y no se completó
                current_streak = 1
        else:
            # Si el hábito no estaba programado ayer, simplemente incrementamos
            current_streak += 1
        
        # Actualizar la racha en la base de datos
        cur.execute('UPDATE habits SET current_streak = %s WHERE id = %s', (current_streak, habit_id))
        
        conn.commit()
        
        return jsonify({
            'id': completion_id,
            'habit_id': habit_id,
            'completion_date': completion_date,
            'current_streak': current_streak
        })
    except psycopg2.Error as e:
        conn.rollback()
        print(f"Error al completar hábito: {e}")
        return jsonify({'message': f'Error al completar hábito: {e}'}), 500
    finally:
        cur.close()
        conn.close()

# Endpoint para desmarcar un hábito como completado
@app.route('/api/habits/<int:habit_id>/uncomplete', methods=['POST'])
@token_required
def uncomplete_habit(user_id, habit_id):
    data = request.get_json()
    completion_date = data.get('completion_date', date.today().strftime('%Y-%m-%d'))
    
    conn = get_db_connection()
    if conn is None:
        return jsonify({'message': 'Error de conexión a la base de datos'}), 500
    cur = conn.cursor()
    
    try:
        # Verificar que el hábito pertenece al usuario
        cur.execute('SELECT id FROM habits WHERE id = %s AND user_id = %s', (habit_id, user_id))
        habit = cur.fetchone()
        
        if not habit:
            return jsonify({'message': 'Hábito no encontrado o no pertenece al usuario'}), 404
        
        # Eliminar la completación
        cur.execute('DELETE FROM habit_completions WHERE habit_id = %s AND completion_date = %s RETURNING id', (habit_id, completion_date))
        deleted = cur.fetchone()
        
        if not deleted:
            return jsonify({'message': 'No se encontró completación para esta fecha'}), 404
        
        # Recalcular la racha actual
        recalculate_streak(cur, habit_id)
        
        conn.commit()
        
        # Obtener la racha actualizada
        cur.execute('SELECT current_streak FROM habits WHERE id = %s', (habit_id,))
        current_streak = cur.fetchone()[0]
        
        return jsonify({
            'habit_id': habit_id,
            'current_streak': current_streak,
            'message': 'Completación eliminada correctamente'
        })
    except psycopg2.Error as e:
        conn.rollback()
        print(f"Error al desmarcar hábito: {e}")
        return jsonify({'message': f'Error al desmarcar hábito: {e}'}), 500
    finally:
        cur.close()
        conn.close()

# Endpoint para archivar o desarchivar un hábito
@app.route('/api/habits/<int:habit_id>/status', methods=['PUT'])
@token_required
def update_habit_status(user_id, habit_id):
    data = request.get_json()
    status = data.get('status')  # 'active' o 'archived'
    
    if status not in ['active', 'archived']:
        return jsonify({'message': 'Estado no válido. Debe ser "active" o "archived"'}), 400
    
    conn = get_db_connection()
    if conn is None:
        return jsonify({'message': 'Error de conexión a la base de datos'}), 500
    cur = conn.cursor()
    
    try:
        # Verificar que el hábito pertenece al usuario
        cur.execute('SELECT id FROM habits WHERE id = %s AND user_id = %s', (habit_id, user_id))
        habit = cur.fetchone()
        
        if not habit:
            return jsonify({'message': 'Hábito no encontrado o no pertenece al usuario'}), 404
        
        # Actualizar el estado
        cur.execute('UPDATE habits SET status = %s WHERE id = %s RETURNING id, name, status', (status, habit_id))
        updated = cur.fetchone()
        
        conn.commit()
        
        return jsonify({
            'id': updated[0],
            'name': updated[1],
            'status': updated[2],
            'message': f'Hábito {"archivado" if status == "archived" else "activado"} correctamente'
        })
    except psycopg2.Error as e:
        conn.rollback()
        print(f"Error al actualizar estado del hábito: {e}")
        return jsonify({'message': f'Error al actualizar estado: {e}'}), 500
    finally:
        cur.close()
        conn.close()

# Endpoint para actualizar un hábito existente
@app.route('/api/habits/<int:habit_id>', methods=['PUT'])
@token_required
def update_habit(user_id, habit_id):
    data = request.get_json()
    name = data.get('name')
    category_id = data.get('category_id')
    frequency = data.get('frequency')
    days_of_week = ','.join(data.get('days_of_week', [])) if data.get('days_of_week') else None
    days_of_month = ','.join(map(str, data.get('days_of_month', []))) if data.get('days_of_month') else None
    start_date = data.get('start_date', date.today().strftime('%Y-%m-%d'))
    end_date = data.get('end_date')
    start_time = data.get('start_time', '00:00')
    end_time = data.get('end_time', '23:59')
    
    conn = get_db_connection()
    if conn is None:
        return jsonify({'message': 'Error de conexión a la base de datos'}), 500
    cur = conn.cursor()
    try:
        # Verificar que el hábito pertenece al usuario
        cur.execute('SELECT id FROM habits WHERE id = %s AND user_id = %s', (habit_id, user_id))
        habit = cur.fetchone()
        
        if not habit:
            return jsonify({'message': 'Hábito no encontrado o no pertenece al usuario'}), 404
        
        # Actualizar el hábito
        cur.execute(
            '''UPDATE habits 
               SET name = %s, category_id = %s, frequency = %s, 
                   days_of_week = %s, days_of_month = %s, 
                   start_date = %s, end_date = %s,
                   start_time = %s, end_time = %s
               WHERE id = %s AND user_id = %s
               RETURNING id''',
            (name, category_id, frequency, days_of_week, days_of_month, 
             start_date, end_date, start_time, end_time, habit_id, user_id)
        )
        updated = cur.fetchone()
        conn.commit()
        
        return jsonify({
            'id': updated[0],
            'name': name,
            'category_id': category_id,
            'frequency': frequency,
            'days_of_week': days_of_week.split(',') if days_of_week else None,
            'days_of_month': days_of_month.split(',') if days_of_month else None,
            'start_date': start_date,
            'end_date': end_date,
            'start_time': start_time,
            'end_time': end_time,
            'message': 'Hábito actualizado correctamente'
        })
    except psycopg2.Error as e:
        conn.rollback()
        print(f"Error al actualizar hábito: {e}")
        return jsonify({'message': f'Error al actualizar hábito: {e}'}), 500
    finally:
        cur.close()
        conn.close()

# Endpoint para eliminar un hábito
@app.route('/api/habits/<int:habit_id>', methods=['DELETE'])
@token_required
def delete_habit(user_id, habit_id):
    conn = get_db_connection()
    if conn is None:
        return jsonify({'message': 'Error de conexión a la base de datos'}), 500
    cur = conn.cursor()
    try:
        # Verificar que el hábito pertenece al usuario
        cur.execute('SELECT id, name FROM habits WHERE id = %s AND user_id = %s', (habit_id, user_id))
        habit = cur.fetchone()
        
        if not habit:
            return jsonify({'message': 'Hábito no encontrado o no pertenece al usuario'}), 404
        
        # Primero eliminar completaciones relacionadas (debido a restricciones de clave externa)
        cur.execute('DELETE FROM habit_completions WHERE habit_id = %s', (habit_id,))
        
        # Luego eliminar el hábito
        cur.execute('DELETE FROM habits WHERE id = %s AND user_id = %s', (habit_id, user_id))
        
        conn.commit()
        
        return jsonify({
            'id': habit_id,
            'name': habit[1],
            'message': 'Hábito eliminado correctamente'
        })
    except psycopg2.Error as e:
        conn.rollback()
        print(f"Error al eliminar hábito: {e}")
        return jsonify({'message': f'Error al eliminar hábito: {e}'}), 500
    finally:
        cur.close()
        conn.close()

# ===== FUNCIONES AUXILIARES PARA HÁBITOS ===== #

# Función para verificar si un hábito está programado para una fecha específica
def is_habit_scheduled_for_date(frequency, days_of_week, days_of_month, check_date):
    if frequency == 'daily':
        return True
    
    if frequency == 'weekly' and days_of_week:
        # Convertir el día de la semana a formato abreviado (Mon, Tue, etc.)
        day_name = check_date.strftime('%a')
        return day_name in days_of_week.split(',')
    
    if frequency == 'monthly' and days_of_month:
        # Verificar si el día del mes está en la lista
        day_of_month = str(check_date.day)
        return day_of_month in days_of_month.split(',')
    
    return False

# Función para recalcular la racha de un hábito
def recalculate_streak(cur, habit_id):
    # Obtener información del hábito
    cur.execute('SELECT frequency, days_of_week, days_of_month FROM habits WHERE id = %s', (habit_id,))
    habit = cur.fetchone()
    
    if not habit:
        return
    
    frequency, days_of_week, days_of_month = habit
    
    # Obtener todas las completaciones ordenadas por fecha (más reciente primero)
    cur.execute('SELECT completion_date FROM habit_completions WHERE habit_id = %s ORDER BY completion_date DESC', (habit_id,))
    completions = [c[0] for c in cur.fetchall()]
    
    if not completions:
        # No hay completaciones, racha es 0
        cur.execute('UPDATE habits SET current_streak = 0 WHERE id = %s', (habit_id,))
        return
    
    # La fecha de completación más reciente
    last_completion = completions[0]
    
    # Inicializar racha y contador
    streak = 1
    current_date = last_completion
    
    # Iterar hacia atrás desde la completación más reciente
    while True:
        # Verificar el día anterior
        previous_date = current_date - timedelta(days=1)
        
        # Si el hábito estaba programado para el día anterior
        if is_habit_scheduled_for_date(frequency, days_of_week, days_of_month, previous_date):
            # Verificar si se completó
            if previous_date in completions:
                streak += 1
                current_date = previous_date
            else:
                # Se rompió la racha
                break
        else:
            # Si el hábito no estaba programado para ese día, seguimos hacia atrás
            current_date = previous_date
    
    # Actualizar la racha en la base de datos
    cur.execute('UPDATE habits SET current_streak = %s WHERE id = %s', (streak, habit_id))

# ===== ENDPOINTS PARA EL MÓDULO DE CALENDARIO ===== #

# Endpoint para obtener categorías de eventos
@app.route('/api/events/categories', methods=['GET'])
@token_required
def get_event_categories(user_id):
    conn = get_db_connection()
    if conn is None:
        return jsonify({'message': 'Error de conexión a la base de datos'}), 500
    cur = conn.cursor()
    try:
        cur.execute('SELECT id, name, color FROM event_categories')
        categories = cur.fetchall()
        result = []
        for cat in categories:
            result.append({
                'id': cat[0],
                'name': cat[1],
                'color': cat[2]
            })
        return jsonify(result)
    except psycopg2.Error as e:
        print(f"Error al obtener categorías de eventos: {e}")
        return jsonify({'message': f'Error: {e}'}), 500
    finally:
        cur.close()
        conn.close()

# Endpoint para crear un nuevo evento
@app.route('/api/events', methods=['POST'])
@token_required
def create_event(user_id):
    data = request.get_json()
    title = data.get('title')
    description = data.get('description', '')
    category_id = data.get('category_id')
    start_datetime = data.get('start_datetime')
    end_datetime = data.get('end_datetime')
    location = data.get('location', '')
    is_all_day = data.get('is_all_day', False)
    google_event_id = data.get('google_event_id', None)
    
    if not title or not start_datetime or not end_datetime or not category_id:
        return jsonify({'message': 'Faltan campos obligatorios'}), 400
    
    conn = get_db_connection()
    if conn is None:
        return jsonify({'message': 'Error de conexión a la base de datos'}), 500
    cur = conn.cursor()
    try:
        cur.execute(
            '''INSERT INTO events 
                (user_id, title, description, category_id, start_datetime, end_datetime, 
                location, is_all_day, google_event_id) 
               VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s) 
               RETURNING id''',
            (user_id, title, description, category_id, start_datetime, end_datetime, 
             location, is_all_day, google_event_id)
        )
        event_id = cur.fetchone()[0]
        conn.commit()
        
        return jsonify({
            'id': event_id,
            'title': title,
            'description': description,
            'category_id': category_id,
            'start_datetime': start_datetime,
            'end_datetime': end_datetime,
            'location': location,
            'is_all_day': is_all_day,
            'google_event_id': google_event_id,
            'message': 'Evento creado correctamente'
        }), 201
    except psycopg2.Error as e:
        conn.rollback()
        print(f"Error al crear evento: {e}")
        return jsonify({'message': f'Error al crear evento: {e}'}), 500
    finally:
        cur.close()
        conn.close()

# Endpoint para obtener eventos de un usuario
@app.route('/api/events', methods=['GET'])
@token_required
def get_events(user_id):
    # Parámetros opcionales para filtrar
    start_date = request.args.get('start_date')
    end_date = request.args.get('end_date')
    category_id = request.args.get('category_id')
    
    conn = get_db_connection()
    if conn is None:
        return jsonify({'message': 'Error de conexión a la base de datos'}), 500
    cur = conn.cursor()
    
    try:
        query = '''
            SELECT e.id, e.title, e.description, e.category_id, e.start_datetime, 
                   e.end_datetime, e.location, e.is_all_day, e.google_event_id, 
                   e.status, c.name as category_name, c.color as category_color
            FROM events e
            JOIN event_categories c ON e.category_id = c.id
            WHERE e.user_id = %s
        '''
        params = [user_id]
        
        # Agregar filtros si se proporcionaron
        if start_date:
            query += " AND e.start_datetime >= %s"
            params.append(start_date)
        
        if end_date:
            query += " AND e.end_datetime <= %s"
            params.append(end_date)
        
        if category_id:
            query += " AND e.category_id = %s"
            params.append(category_id)
        
        query += " ORDER BY e.start_datetime"
        
        cur.execute(query, params)
        events = cur.fetchall()
        
        result = []
        for e in events:
            result.append({
                'id': e[0],
                'title': e[1],
                'description': e[2],
                'category_id': e[3],
                'start_datetime': e[4].strftime('%Y-%m-%dT%H:%M:%S'),
                'end_datetime': e[5].strftime('%Y-%m-%dT%H:%M:%S'),
                'location': e[6],
                'is_all_day': e[7],
                'google_event_id': e[8],
                'status': e[9],
                'category': {
                    'name': e[10],
                    'color': e[11]
                }
            })
        
        return jsonify(result)
    except psycopg2.Error as e:
        print(f"Error al obtener eventos: {e}")
        return jsonify({'message': f'Error: {e}'}), 500
    finally:
        cur.close()
        conn.close()

# Endpoint para actualizar un evento
@app.route('/api/events/<int:event_id>', methods=['PUT'])
@token_required
def update_event(user_id, event_id):
    data = request.get_json()
    title = data.get('title')
    description = data.get('description', '')
    category_id = data.get('category_id')
    start_datetime = data.get('start_datetime')
    end_datetime = data.get('end_datetime')
    location = data.get('location', '')
    is_all_day = data.get('is_all_day', False)
    google_event_id = data.get('google_event_id')
    
    if not title or not start_datetime or not end_datetime or not category_id:
        return jsonify({'message': 'Faltan campos obligatorios'}), 400
    
    conn = get_db_connection()
    if conn is None:
        return jsonify({'message': 'Error de conexión a la base de datos'}), 500
    cur = conn.cursor()
    
    try:
        # Verificar que el evento pertenece al usuario
        cur.execute('SELECT id FROM events WHERE id = %s AND user_id = %s', (event_id, user_id))
        event = cur.fetchone()
        
        if not event:
            return jsonify({'message': 'Evento no encontrado o no pertenece al usuario'}), 404
        
        # Actualizar evento
        cur.execute(
            '''UPDATE events 
               SET title = %s, description = %s, category_id = %s, 
                   start_datetime = %s, end_datetime = %s, location = %s, 
                   is_all_day = %s, google_event_id = %s, updated_at = CURRENT_TIMESTAMP
               WHERE id = %s AND user_id = %s
               RETURNING id''',
            (title, description, category_id, start_datetime, end_datetime, 
             location, is_all_day, google_event_id, event_id, user_id)
        )
        
        conn.commit()
        
        return jsonify({
            'id': event_id,
            'title': title,
            'description': description,
            'category_id': category_id,
            'start_datetime': start_datetime,
            'end_datetime': end_datetime,
            'location': location,
            'is_all_day': is_all_day,
            'google_event_id': google_event_id,
            'message': 'Evento actualizado correctamente'
        })
    except psycopg2.Error as e:
        conn.rollback()
        print(f"Error al actualizar evento: {e}")
        return jsonify({'message': f'Error al actualizar evento: {e}'}), 500
    finally:
        cur.close()
        conn.close()

# Endpoint para eliminar un evento
@app.route('/api/events/<int:event_id>', methods=['DELETE'])
@token_required
def delete_event(user_id, event_id):
    conn = get_db_connection()
    if conn is None:
        return jsonify({'message': 'Error de conexión a la base de datos'}), 500
    cur = conn.cursor()
    
    try:
        # Verificar que el evento pertenece al usuario
        cur.execute('SELECT id, title FROM events WHERE id = %s AND user_id = %s', (event_id, user_id))
        event = cur.fetchone()
        
        if not event:
            return jsonify({'message': 'Evento no encontrado o no pertenece al usuario'}), 404
        
        # Eliminar evento
        cur.execute('DELETE FROM events WHERE id = %s AND user_id = %s', (event_id, user_id))
        conn.commit()
        
        return jsonify({
            'id': event_id,
            'title': event[1],
            'message': 'Evento eliminado correctamente'
        })
    except psycopg2.Error as e:
        conn.rollback()
        print(f"Error al eliminar evento: {e}")
        return jsonify({'message': f'Error al eliminar evento: {e}'}), 500
    finally:
        cur.close()
        conn.close()

# Endpoint para obtener eventos para un día específico
@app.route('/api/events/day', methods=['GET'])
@token_required
def get_events_for_day(user_id):
    date_str = request.args.get('date')
    
    if not date_str:
        date_str = date.today().strftime('%Y-%m-%d')
    
    try:
        # Convertir la fecha de string a objeto date
        target_date = datetime.strptime(date_str, '%Y-%m-%d').date()
        
        # Establecer inicio y fin del día
        day_start = datetime.combine(target_date, datetime.min.time())
        day_end = datetime.combine(target_date, datetime.max.time())
        
        conn = get_db_connection()
        if conn is None:
            return jsonify({'message': 'Error de conexión a la base de datos'}), 500
        cur = conn.cursor()
        
        # Obtener eventos del día
        cur.execute('''
            SELECT e.id, e.title, e.description, e.category_id, e.start_datetime, 
                   e.end_datetime, e.location, e.is_all_day, e.google_event_id,
                   c.name as category_name, c.color as category_color
            FROM events e
            JOIN event_categories c ON e.category_id = c.id
            WHERE e.user_id = %s 
            AND (
                (e.start_datetime BETWEEN %s AND %s) OR 
                (e.end_datetime BETWEEN %s AND %s) OR
                (e.start_datetime <= %s AND e.end_datetime >= %s)
            )
            AND e.status = 'active'
            ORDER BY e.start_datetime
        ''', (user_id, day_start, day_end, day_start, day_end, day_start, day_end))
        
        events = cur.fetchall()
        result = []
        
        for e in events:
            result.append({
                'id': e[0],
                'title': e[1],
                'description': e[2],
                'category_id': e[3],
                'start_datetime': e[4].strftime('%Y-%m-%dT%H:%M:%S'),
                'end_datetime': e[5].strftime('%Y-%m-%dT%H:%M:%S'),
                'location': e[6],
                'is_all_day': e[7],
                'google_event_id': e[8],
                'category': {
                    'name': e[9],
                    'color': e[10]
                }
            })
        
        # Obtener hábitos programados para este día
        # Solo incluirlos si tienen hora de inicio y fin
        cur.execute('''
            SELECT h.id, h.name, h.frequency, h.days_of_week, h.days_of_month,
                   h.start_time, h.end_time, h.category_id,
                   c.name as category_name, c.color as category_color
            FROM habits h
            JOIN habit_categories c ON h.category_id = c.id
            WHERE h.user_id = %s AND h.status = 'active'
        ''', (user_id,))
        
        habits = cur.fetchall()
        
        for h in habits:
            # Verificar si el hábito está programado para hoy
            habit_frequency = h[2]
            habit_days_of_week = h[3]
            habit_days_of_month = h[4]
            
            scheduled_today = is_habit_scheduled_for_date(habit_frequency, habit_days_of_week, 
                                                         habit_days_of_month, target_date)
            
            if scheduled_today and h[5] and h[6]:  # Si está programado hoy y tiene hora inicio/fin
                start_time = h[5]
                end_time = h[6]
                
                # Crear fechas completas con la hora
                habit_start = datetime.combine(target_date, start_time)
                habit_end = datetime.combine(target_date, end_time)
                
                result.append({
                    'id': f"habit_{h[0]}",  # Añadir prefijo para distinguir de eventos
                    'title': h[1],
                    'description': f"Hábito: {h[1]}",
                    'category_id': 5,  # Usar la categoría de Hábitos
                    'start_datetime': habit_start.strftime('%Y-%m-%dT%H:%M:%S'),
                    'end_datetime': habit_end.strftime('%Y-%m-%dT%H:%M:%S'),
                    'location': '',
                    'is_all_day': False,
                    'google_event_id': None,
                    'category': {
                        'name': 'Hábitos',
                        'color': 'green'
                    },
                    'is_habit': True,  # Marcar como hábito para UI
                    'completed': False  # Marcar como no completado
                })
        
        # Ordenar por hora de inicio
        result.sort(key=lambda x: x['start_datetime'])
        
        return jsonify(result)
    except Exception as e:
        print(f"Error al obtener eventos del día: {e}")
        return jsonify({'message': f'Error: {e}'}), 500
    finally:
        if 'conn' in locals() and conn:
            cur.close()
            conn.close()

# Endpoint para obtener todos los datos del usuario para el chatbot
@app.route('/api/chatbot/user-data', methods=['GET'])
@token_required
def get_chatbot_user_data(user_id):
    try:
        # Usar la función interna y convertir la respuesta a JSON
        user_data = get_chatbot_user_data_internal(user_id)
        return jsonify(user_data)
    
    except Exception as e:
        print(f"Error al obtener datos del usuario para chatbot: {e}")
        return jsonify({'message': f'Error: {e}'}), 500

@app.route('/api/chatbot/message', methods=['POST'])
@token_required
def send_chatbot_message(user_id):
    try:
        # Validar que la solicitud contiene JSON
        if not request.is_json:
            return jsonify({
                'error': 'La solicitud debe ser JSON',
                'message': 'Content-Type debe ser application/json'
            }), 400

        data = request.get_json()
        
        # Validar campos requeridos
        if 'message' not in data:
            return jsonify({
                'error': 'Campo requerido faltante',
                'message': 'El campo "message" es requerido'
            }), 400
            
        user_message = data.get('message', '')
        conversation_history = data.get('conversation_history', [])
        
        # Validar que el mensaje no esté vacío
        if not user_message.strip():
            return jsonify({
                'error': 'Mensaje inválido',
                'message': 'El mensaje no puede estar vacío'
            }), 400

        # Obtener datos del usuario con mejor manejo de errores
        try:
            user_data = get_chatbot_user_data_internal(user_id)
            if not user_data:
                raise Exception('No se pudieron obtener los datos del usuario')
        except Exception as e:
            print(f"Error al obtener datos del usuario: {str(e)}")
            return jsonify({
                'error': 'Error al obtener datos del usuario',
                'message': 'No se pudieron obtener los datos necesarios para procesar tu mensaje'
            }), 500

        # Detectar patrones de comandos especiales con regex mejorados
        complete_habit_pattern = re.compile(r'(?i)(?:completar|marcar)(?:\s+el)?(?:\s+h[áa]bito)?(?:\s*:)?\s+(.+?)(?:\s+como\s+(?:completado|terminado|hecho))?$')
        habits_today_pattern = re.compile(r'(?i)(?:qu[ée]|cu[áa]les?)?\s+h[áa]bitos?\s+(?:debo|tengo|hay|para|hoy|pendientes?)')
        finance_pattern = re.compile(r'(?i)(?:c[óo]mo|qu[ée]|cu[áa]nto)?\s+(?:van|est[áa]n?|tengo|mis|finanzas|gastos|ingresos|balance|dinero)')
        events_pattern = re.compile(r'(?i)(?:cu[áa]l|qu[ée])?\s+(?:es|son|tengo|hay|mi|mis|pr[óo]ximos?|eventos?|citas?|reuniones?)')
        progress_pattern = re.compile(r'(?i)(?:c[óo]mo|qu[ée])?\s+(?:ha\s+sido|va|es|mi|progreso|avance|desarrollo|evoluci[óo]n)')
        
        # Analizar si el mensaje contiene algún comando especial
        complete_habit_match = complete_habit_pattern.search(user_message)
        
        try:
            # Para hábitos del día
            if habits_today_pattern.search(user_message) and not complete_habit_match:
                return handle_habits_today(user_data, user_message, conversation_history)
            
            # Para finanzas
            elif finance_pattern.search(user_message):
                return handle_finance_query(user_data, user_message, conversation_history)
                
            # Para eventos próximos
            elif events_pattern.search(user_message):
                return handle_events_query(user_data, user_message, conversation_history)
                
            # Para progreso
            elif progress_pattern.search(user_message):
                return handle_progress_query(user_data, user_message, conversation_history)
            
            # Si hay un comando para completar un hábito
            elif complete_habit_match:
                return handle_complete_habit(user_id, complete_habit_match, user_message, conversation_history)
            
            # Si no es un comando especial, usar respuesta genérica
            response = "Entiendo tu mensaje. ¿En qué más puedo ayudarte? Puedes preguntarme sobre tus hábitos, finanzas, eventos o progreso."
            
            return jsonify({
                'response': response,
                'conversation_history': conversation_history + [
                    {"role": "user", "parts": [user_message]},
                    {"role": "model", "parts": [response]}
                ]
            })
            
        except Exception as e:
            print(f"Error al procesar el mensaje: {str(e)}")
            return jsonify({
                'error': 'Error al procesar el mensaje',
                'message': 'Ocurrió un error al procesar tu mensaje. Por favor, intenta de nuevo.'
            }), 500
            
    except Exception as e:
        print(f"Error general en el endpoint del chatbot: {str(e)}")
        return jsonify({
            'error': 'Error interno del servidor',
            'message': 'Ha ocurrido un error inesperado. Por favor, intenta de nuevo más tarde.'
        }), 500

# Funciones auxiliares para manejar diferentes tipos de consultas
def handle_habits_today(user_data, user_message, conversation_history):
    try:
        habits_today = [h for h in user_data['habits'] if h['scheduled_today']]
        
        if habits_today:
            pending_habits = [h for h in habits_today if not h['completed_today']]
            completed_habits = [h for h in habits_today if h['completed_today']]
            
            if pending_habits:
                response = f"Tienes {len(pending_habits)} hábitos pendientes para hoy:\n\n"
                for h in pending_habits:
                    response += f"- {h['name']} (Racha actual: {h['current_streak']} días)\n"
                
                if completed_habits:
                    response += f"\nYa has completado {len(completed_habits)} hábitos hoy:\n"
                    for h in completed_habits:
                        response += f"- {h['name']} ✓\n"
                    
                response += "\nPuedes marcar un hábito como completado escribiendo: \"Completar hábito: [nombre del hábito]\""
            else:
                if completed_habits:
                    response = f"¡Felicidades! Has completado todos tus {len(completed_habits)} hábitos para hoy:\n\n"
                    for h in completed_habits:
                        response += f"- {h['name']} ✓\n"
                else:
                    response = "No tienes hábitos programados para hoy. ¿Quieres crear uno nuevo?"
        else:
            response = "No tienes hábitos programados para hoy. ¿Te gustaría crear alguno nuevo?"
        
        return jsonify({
            'response': response,
            'conversation_history': conversation_history + [
                {"role": "user", "parts": [user_message]},
                {"role": "model", "parts": [response]}
            ]
        })
    except Exception as e:
        print(f"Error al procesar consulta de hábitos: {str(e)}")
        raise

def handle_finance_query(user_data, user_message, conversation_history):
    try:
        finance_data = user_data['finance']
        transactions = user_data['transactions']
        
        if finance_data:
            income = finance_data['current_month_income']
            expenses = finance_data['current_month_expenses']
            balance = finance_data['balance']
            
            response = f"Tu resumen financiero del mes:\n\n"
            response += f"💰 Ingresos: ${income:.2f}\n"
            response += f"💸 Gastos: ${expenses:.2f}\n"
            response += f"📊 Balance: ${balance:.2f}\n\n"
            
            if transactions and len(transactions) > 0:
                response += "Últimas transacciones:\n"
                for i, tx in enumerate(transactions[:5]):
                    tx_type = "+" if tx['type'] == 'ingreso' else "-"
                    response += f"- {tx['description']}: {tx_type}${abs(float(tx['amount'])):.2f}\n"
            
            if balance < 0:
                response += "\n⚠️ Atención: Tu balance es negativo. Te recomiendo revisar tus gastos."
            elif expenses > income * 0.9:
                response += "\n⚠️ Tus gastos están cercanos a tus ingresos. Considera ajustar tu presupuesto."
            elif balance > 0:
                response += "\n✅ ¡Bien hecho! Tu balance es positivo."
        else:
            response = "No tengo información financiera disponible. ¿Te gustaría comenzar a registrar tus finanzas?"
        
        return jsonify({
            'response': response,
            'conversation_history': conversation_history + [
                {"role": "user", "parts": [user_message]},
                {"role": "model", "parts": [response]}
            ]
        })
    except Exception as e:
        print(f"Error al procesar consulta financiera: {str(e)}")
        raise

def handle_events_query(user_data, user_message, conversation_history):
    try:
        events = user_data['events']
        
        if events and len(events) > 0:
            # Ordenar eventos por fecha de inicio
            sorted_events = sorted(events, key=lambda x: x['start_datetime'] if x['start_datetime'] else "")
            
            response = f"Tus próximos eventos para hoy:\n\n"
            for event in sorted_events:
                start_time = ""
                if event['start_datetime']:
                    try:
                        dt = datetime.fromisoformat(event['start_datetime'].replace('Z', '+00:00'))
                        start_time = dt.strftime("%H:%M")
                    except:
                        start_time = "??:??"
                        
                is_habit = event.get('is_habit', False)
                completed = event.get('completed', False)
                
                if is_habit:
                    status = "✅" if completed else "⏲️"
                    response += f"{status} {start_time} - {event['title']} (Hábito)\n"
                else:
                    response += f"📅 {start_time} - {event['title']}\n"
                    if event['description']:
                        response += f"  {event['description']}\n"
        else:
            response = "No tienes eventos programados para hoy. ¡Tu agenda está libre!"
        
        return jsonify({
            'response': response,
            'conversation_history': conversation_history + [
                {"role": "user", "parts": [user_message]},
                {"role": "model", "parts": [response]}
            ]
        })
    except Exception as e:
        print(f"Error al procesar consulta de eventos: {str(e)}")
        raise

def handle_progress_query(user_data, user_message, conversation_history):
    try:
        habits = user_data['habits']
        goals = user_data.get('finance', {}).get('savings_goals', [])
        
        response = "Resumen de tu progreso:\n\n"
        
        if habits:
            active_habits = [h for h in habits if h['status'] == 'active']
            streaks = [h['current_streak'] for h in active_habits]
            
            if streaks:
                avg_streak = sum(streaks) / len(streaks)
                max_streak = max(streaks) if streaks else 0
                
                response += f"🔄 Hábitos activos: {len(active_habits)}\n"
                response += f"🔥 Racha promedio: {avg_streak:.1f} días\n"
                response += f"🏆 Racha máxima: {max_streak} días\n\n"
                
                if max_streak > 0:
                    best_habit = next((h for h in active_habits if h['current_streak'] == max_streak), None)
                    if best_habit:
                        response += f"Tu mejor hábito es '{best_habit['name']}' con {max_streak} días consecutivos.\n\n"
        
        if goals:
            total_goals = len(goals)
            total_progress = sum(g['current_amount'] / g['target_amount'] for g in goals) / total_goals * 100
            
            response += f"💰 Metas de ahorro: {total_goals}\n"
            response += f"📈 Progreso promedio: {total_progress:.1f}%\n\n"
            
            # Encuentra la meta con mayor progreso
            best_goal = max(goals, key=lambda g: g['current_amount'] / g['target_amount'])
            best_progress = best_goal['current_amount'] / best_goal['target_amount'] * 100
            response += f"Tu meta más avanzada es '{best_goal['name']}' con {best_progress:.1f}% de progreso.\n"
        
        if not habits and not goals:
            response = "Aún no tienes suficientes datos para mostrar un análisis de progreso. Comienza creando hábitos o metas de ahorro."
        
        return jsonify({
            'response': response,
            'conversation_history': conversation_history + [
                {"role": "user", "parts": [user_message]},
                {"role": "model", "parts": [response]}
            ]
        })
    except Exception as e:
        print(f"Error al procesar consulta de progreso: {str(e)}")
        raise

def handle_complete_habit(user_id, complete_habit_match, user_message, conversation_history):
    try:
        habit_name = complete_habit_match.group(1).strip()
        
        # Buscar el hábito por nombre
        conn = get_db_connection()
        cur = conn.cursor()
        
        # Buscar hábitos que coincidan con el nombre
        cur.execute('''
            SELECT id, name FROM habits 
            WHERE user_id = %s AND status = 'active' 
            AND LOWER(name) LIKE LOWER(%s)
        ''', (user_id, f"%{habit_name}%"))
        
        matching_habits = cur.fetchall()
        
        if matching_habits:
            # Si hay exactamente una coincidencia, completar ese hábito
            if len(matching_habits) == 1:
                habit_id = matching_habits[0][0]
                exact_habit_name = matching_habits[0][1]
                
                # Verificar si ya está completado
                today = date.today()
                cur.execute('''
                    SELECT COUNT(*) FROM habit_completions 
                    WHERE habit_id = %s AND completion_date = %s
                ''', (habit_id, today))
                
                already_completed = cur.fetchone()[0] > 0
                
                if already_completed:
                    # Respuesta si ya está completado
                    model_response = f"El hábito '{exact_habit_name}' ya fue completado hoy. ¡Buen trabajo! 👍"
                else:
                    # Completar el hábito
                    cur.execute('''
                        INSERT INTO habit_completions (habit_id, user_id, completion_date)
                        VALUES (%s, %s, %s)
                    ''', (habit_id, user_id, today))
                    
                    # Recalcular racha
                    recalculate_streak(cur, habit_id)
                    
                    conn.commit()
                    
                    # Respuesta de confirmación
                    model_response = f"¡Excelente! He marcado '{exact_habit_name}' como completado. ¡Sigue así! 🎉"
            else:
                # Si hay múltiples coincidencias, mostrar opciones
                model_response = "Encontré varios hábitos que coinciden con ese nombre. ¿A cuál te refieres?\n\n"
                for i, (_, h_name) in enumerate(matching_habits):
                    model_response += f"{i+1}. {h_name}\n"
                model_response += "\nPor favor, sé más específico o usa el nombre exacto para completarlo."
        else:
            # Si no hay coincidencias
            model_response = f"No encontré ningún hábito activo que coincida con '{habit_name}'. ¿Está escrito correctamente?"
        
        # Cerrar conexión
        cur.close()
        conn.close()
        
        # Devolver la respuesta
        return jsonify({
            'response': model_response,
            'conversation_history': conversation_history + [
                {"role": "user", "parts": [user_message]},
                {"role": "model", "parts": [model_response]}
            ]
        })
    except Exception as e:
        print(f"Error al procesar comando de completar hábito: {str(e)}")
        raise

# Función auxiliar para formatear datos del usuario para el chatbot
def format_user_data_for_chatbot(user_data):
    try:
        # Formatear datos de usuario
        context = f"INFORMACIÓN DEL USUARIO {user_data['user']['name'].upper()}:\n\n"
        
        # Información de hábitos
        context += "HÁBITOS:\n"
        if user_data['habits']:
            for habit in user_data['habits']:
                context += f"- {habit['name']} ({habit['frequency']}): {habit['completed_today'] and 'Completado hoy' or 'Pendiente'}, "
                context += f"Racha actual: {habit['current_streak']} días\n"
        else:
            context += "No tiene hábitos registrados.\n"
        
        # Información de finanzas
        context += "\nFINANZAS:\n"
        context += f"- Ingresos este mes: ${user_data['finance']['current_month_income']:.2f}\n"
        context += f"- Gastos este mes: ${user_data['finance']['current_month_expenses']:.2f}\n"
        context += f"- Balance actual: ${user_data['finance']['balance']:.2f}\n"
        
        context += "\nTRANSACCIONES RECIENTES:\n"
        if user_data['transactions']:
            for tx in user_data['transactions'][:5]:  # Limitar a 5 transacciones
                tx_date = datetime.strptime(tx['date'], '%Y-%m-%d %H:%M:%S').strftime('%d/%m/%Y')
                context += f"- {tx_date}: {tx['description']}: {tx['type'] == 'ingreso' and '+' or '-'}${tx['amount']:.2f} ({tx['category_name']})\n"
        else:
            context += "No tiene transacciones recientes.\n"
        
        if user_data['finance']['savings_goals']:
            context += "\nMETAS DE AHORRO:\n"
            for goal in user_data['finance']['savings_goals']:
                progress = (goal['current_amount'] / goal['target_amount']) * 100
                context += f"- {goal['name']}: ${goal['current_amount']:.2f} de ${goal['target_amount']:.2f} ({progress:.1f}%)\n"
        
        # Información de calendario
        context += "\nEVENTOS HOY:\n"
        if user_data['events']:
            for event in user_data['events']:
                start = datetime.strptime(event['start_datetime'], '%Y-%m-%dT%H:%M:%S')
                end = datetime.strptime(event['end_datetime'], '%Y-%m-%dT%H:%M:%S')
                start_time = start.strftime('%H:%M')
                end_time = end.strftime('%H:%M')
                
                # Comprobando si es un hábito
                if event.get('is_habit'):
                    status = "✅ Completado" if event.get('completed') else "⏳ Pendiente"
                    context += f"- {start_time}-{end_time}: {event['title']} (Hábito: {status})\n"
                else:
                    context += f"- {start_time}-{end_time}: {event['title']} ({event['category']['name']})\n"
        else:
            context += "No tiene eventos programados para hoy.\n"
        
        # Añadir instrucciones para el modelo sobre cómo debe responder
        context += "\n\nINSTRUCCIONES PARA EL COACH IA:\n"
        context += "1. Actúa como un coach personal amable, motivador y directo. Habla siempre en español.\n"
        context += "2. Cuando el usuario pregunte sobre hábitos pendientes, enfócate en los que aún están sin completar y ofrece motivación.\n"
        context += "3. Para consultas financieras, analiza patrones de gasto y sugiere categorías donde puede reducir gastos.\n"
        context += "4. Presenta la información del calendario destacando eventos importantes y posibles conflictos.\n"
        context += "5. Proporciona respuestas concisas y específicas basadas en la información del usuario.\n"
        context += "6. Cuando el usuario muestre frustración o desánimo, ofrece mensajes motivadores y sugiere pequeños pasos a seguir.\n"
        context += "7. Si te preguntan sobre el progreso, analiza las rachas de hábitos y el cumplimiento de metas financieras.\n"
        context += "8. Personaliza las respuestas usando el nombre del usuario y referencias a sus hábitos o eventos específicos.\n"
        context += "9. Ofrece consejos prácticos y aplicables que se adapten a la situación actual del usuario.\n"
        context += "10. Mantén un tono positivo pero realista.\n"
        
        return context
        
    except Exception as e:
        print(f"Error formateando datos de usuario para chatbot: {e}")
        return f"Error al formatear datos: {e}"

# Función interna para obtener datos del usuario para el chatbot sin usar la respuesta JSON
def get_chatbot_user_data_internal(user_id, conn=None, cur=None):
    close_conn = False
    if conn is None:
        conn = get_db_connection()
        close_conn = True
        if conn is None:
            raise Exception('Error de conexión a la base de datos')
        cur = conn.cursor()
    try:
        # Obtener información básica del usuario
        cur.execute('SELECT name, email FROM users WHERE id = %s', (user_id,))
        user = cur.fetchone()
        if not user:
            raise Exception('Usuario no encontrado')
        user_info = {
            'name': user[0],
            'email': user[1]
        }
        # Obtener hábitos del usuario
        cur.execute('''
            SELECT h.id, h.name, h.frequency, h.days_of_week, h.days_of_month, \
                   h.current_streak, h.status, h.start_time, h.end_time,\
                   c.name as category_name, c.color as category_color\
            FROM habits h\
            JOIN habit_categories c ON h.category_id = c.id\
            WHERE h.user_id = %s AND h.status = 'active'\
        ''', (user_id,))
        habits = []
        today = date.today()
        for h in cur.fetchall():
            habit_frequency = h[2]
            habit_days_of_week = h[3]
            habit_days_of_month = h[4]
            scheduled_today = is_habit_scheduled_for_date(habit_frequency, habit_days_of_week, habit_days_of_month, today)
            cur.execute('''
                SELECT COUNT(*) FROM habit_completions \
                WHERE habit_id = %s AND completion_date = %s\
            ''', (h[0], today))
            completed_today = cur.fetchone()[0] > 0
            habits.append({
                'id': h[0],
                'name': h[1],
                'frequency': h[2],
                'current_streak': h[5],
                'status': h[6],
                'start_time': h[7].strftime('%H:%M') if h[7] else None,
                'end_time': h[8].strftime('%H:%M') if h[8] else None,
                'category': {
                    'name': h[9],
                    'color': h[10]
                },
                'scheduled_today': scheduled_today,
                'completed_today': completed_today
            })
        # Obtener transacciones recientes
        cur.execute('''
            SELECT t.id, t.amount, t.description, t.type, t.date, c.name as category_name, c.color as category_color\
            FROM transactions t\
            JOIN categories c ON t.category_id = c.id\
            WHERE t.user_id = %s\
            ORDER BY t.date DESC\
            LIMIT 10\
        ''', (user_id,))
        transactions = []
        for t in cur.fetchall():
            transactions.append({
                'id': t[0],
                'amount': float(t[1]),
                'description': t[2],
                'type': t[3],
                'date': t[4].strftime('%Y-%m-%d %H:%M:%S') if t[4] else "",
                'category_name': t[5],
                'category_color': t[6]
            })
        # Obtener resumen financiero
        today = date.today()
        first_day_current_month = date(today.year, today.month, 1)
        cur.execute('''
            SELECT \
                COALESCE(SUM(CASE WHEN type = 'ingreso' THEN amount ELSE 0 END), 0) as income,\
                COALESCE(SUM(CASE WHEN type = 'gasto' THEN amount ELSE 0 END), 0) as expenses\
            FROM transactions \
            WHERE user_id = %s AND date >= %s\
        ''', (user_id, first_day_current_month))
        financial_summary = cur.fetchone() or (0, 0)
        current_month_income = float(financial_summary[0])
        current_month_expenses = float(financial_summary[1])
        # Obtener metas de ahorro
        cur.execute('''
            SELECT id, name, target_amount, current_amount, target_date\
            FROM savings_goals\
            WHERE user_id = %s\
        ''', (user_id,))
        savings_goals = []
        for goal in cur.fetchall():
            savings_goals.append({
                'id': goal[0],
                'name': goal[1],
                'target_amount': float(goal[2]),
                'current_amount': float(goal[3]),
                'target_date': goal[4].strftime('%Y-%m-%d') if goal[4] else None
            })
        # Obtener eventos del día actual
        day_start = datetime.combine(today, datetime.min.time())
        day_end = datetime.combine(today, datetime.max.time())
        cur.execute('''
            SELECT e.id, e.title, e.description, e.start_datetime, e.end_datetime, \
                   e.location, e.is_all_day, c.name as category_name, c.color as category_color\
            FROM events e\
            JOIN event_categories c ON e.category_id = c.id\
            WHERE e.user_id = %s \
            AND (\
                (e.start_datetime BETWEEN %s AND %s) OR \
                (e.end_datetime BETWEEN %s AND %s) OR\
                (e.start_datetime <= %s AND e.end_datetime >= %s)\
            )\
            AND e.status = 'active'\
            ORDER BY e.start_datetime\
        ''', (user_id, day_start, day_end, day_start, day_end, day_start, day_end))
        events = []
        for e in cur.fetchall():
            start_dt = e[3].strftime('%Y-%m-%dT%H:%M:%S') if e[3] else ""
            end_dt = e[4].strftime('%Y-%m-%dT%H:%M:%S') if e[4] else ""
            events.append({
                'id': e[0],
                'title': e[1],
                'description': e[2],
                'start_datetime': start_dt,
                'end_datetime': end_dt,
                'location': e[5],
                'is_all_day': e[6],
                'category': {
                    'name': e[7],
                    'color': e[8]
                }
            })
        for h in habits:
            if h['scheduled_today'] and h['start_time'] and h['end_time']:
                try:
                    start_time = datetime.strptime(h['start_time'], '%H:%M').time()
                    end_time = datetime.strptime(h['end_time'], '%H:%M').time()
                    habit_start = datetime.combine(today, start_time)
                    habit_end = datetime.combine(today, end_time)
                    events.append({
                        'id': f"habit_{h['id']}",
                        'title': h['name'],
                        'description': f"Hábito: {h['name']}",
                        'start_datetime': habit_start.strftime('%Y-%m-%dT%H:%M:%S'),
                        'end_datetime': habit_end.strftime('%Y-%m-%dT%H:%M:%S'),
                        'location': '',
                        'is_all_day': False,
                        'google_event_id': None,
                        'category': {
                            'name': 'Hábitos',
                            'color': 'green'
                        },
                        'is_habit': True,
                        'completed': h['completed_today']
                    })
                except Exception:
                    pass
        events.sort(key=lambda x: x['start_datetime'] if x['start_datetime'] else '')
        result = {
            'user': user_info,
            'habits': habits,
            'transactions': transactions,
            'finance': {
                'current_month_income': current_month_income,
                'current_month_expenses': current_month_expenses,
                'balance': current_month_income - current_month_expenses,
                'savings_goals': savings_goals
            },
            'events': events
        }
        return result
    finally:
        if close_conn and conn:
            if 'cur' in locals() and cur:
                cur.close()
            conn.close()

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=int(os.environ.get("PORT", 8080)))
