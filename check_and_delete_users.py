import sqlite3
import os

def check_and_delete_users():
    # Verificar si el archivo de base de datos existe
    db_path = 'instance/blog.db'
    if not os.path.exists(db_path):
        print(f"La base de datos {db_path} no existe.")
        return
    
    # Conectar a la base de datos
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    
    # Verificar si la tabla 'user' existe
    cursor.execute("SELECT name FROM sqlite_master WHERE type='table' AND name='user';")
    if not cursor.fetchone():
        print("La tabla 'user' no existe en la base de datos.")
        conn.close()
        return
    
    # Obtener todos los usuarios
    cursor.execute("SELECT id, username, email FROM user")
    users = cursor.fetchall()
    
    if not users:
        print("No hay usuarios registrados en la base de datos.")
    else:
        print(f"Se encontraron {len(users)} usuarios:")
        for user in users:
            print(f"ID: {user[0]}, Usuario: {user[1]}, Email: {user[2]}")
        
        # Eliminar todos los usuarios
        cursor.execute("DELETE FROM user")
        conn.commit()
        print("\nTodos los usuarios han sido eliminados.")
    
    # Cerrar la conexión
    conn.close()

if __name__ == "__main__":
    check_and_delete_users()