import psycopg2

# Configuración de la base de datos
DB_NAME = 'AgentIA'
DB_USER = 'postgres'
DB_PASSWORD = '123'
DB_HOST = 'localhost'
DB_PORT = '5432'

# Intentar conectar a la base de datos
try:
    conn = psycopg2.connect(
        dbname=DB_NAME,
        user=DB_USER,
        password=DB_PASSWORD,
        host=DB_HOST,
        port=DB_PORT
    )
    print("Conexión exitosa a la base de datos.")
    conn.close()
except psycopg2.Error as e:
    print(f"Error al conectar a la base de datos: {e}") 