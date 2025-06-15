import sqlite3
import os
from typing import List, Dict, Any, Optional, Union
from dataclasses import dataclass
from tabulate import tabulate
import json
from tabulate import tabulate

@dataclass
class ColumnInfo:
    name: str
    type: str
    notnull: bool
    default: Any
    pk: bool

    def __str__(self):
        return f"{self.name} ({self.type}){' PK' if self.pk else ''}{' NOT NULL' if self.notnull else ''}{f' DEFAULT {self.default}' if self.default is not None else ''}"

class DatabaseManager:
    def __init__(self, db_path: str = 'instance/blog.db'):
        """
        Inicializa el gestor de base de datos.
        :param db_path: Ruta al archivo de base de datos SQLite
        """
        self.db_path = db_path
        self.conn = None
        self.cursor = None
        self.connected = False
        
    def connect(self) -> bool:
        """Establece la conexión con la base de datos."""
        if not os.path.exists(self.db_path):
            print(f"[ERROR] La base de datos {self.db_path} no existe.")
            return False
            
        try:
            self.conn = sqlite3.connect(self.db_path)
            self.conn.row_factory = sqlite3.Row
            self.cursor = self.conn.cursor()
            self.connected = True
            return True
        except sqlite3.Error as e:
            print(f"[ERROR] No se pudo conectar a la base de datos: {e}")
            return False
    
    def disconnect(self):
        """Cierra la conexión con la base de datos."""
        if self.connected:
            self.conn.close()
            self.connected = False
    
    def get_tables(self) -> List[str]:
        """Obtiene la lista de tablas en la base de datos."""
        if not self.connected:
            return []
            
        self.cursor.execute("SELECT name FROM sqlite_master WHERE type='table'")
        return [row['name'] for row in self.cursor.fetchall() if row['name'] != 'sqlite_sequence']
    
    def get_table_schema(self, table_name: str) -> List[ColumnInfo]:
        """Obtiene el esquema de una tabla específica."""
        if not self.connected:
            return []
            
        self.cursor.execute(f"PRAGMA table_info({table_name})")
        return [
            ColumnInfo(
                name=row['name'],
                type=row['type'],
                notnull=bool(row['notnull']),
                default=row['dflt_value'],
                pk=bool(row['pk'])
            ) for row in self.cursor.fetchall()
        ]
    
    def get_table_data(self, table_name: str, limit: int = 10, offset: int = 0) -> List[Dict]:
        """Obtiene datos de una tabla con paginación."""
        if not self.connected:
            return []
            
        try:
            self.cursor.execute(f"SELECT * FROM {table_name} LIMIT ? OFFSET ?", (limit, offset))
            return [dict(row) for row in self.cursor.fetchall()]
        except sqlite3.Error as e:
            print(f"[ERROR] Error al obtener datos de la tabla {table_name}: {e}")
            return []
    
    def get_row_count(self, table_name: str) -> int:
        """Obtiene el número total de filas en una tabla."""
        if not self.connected:
            return 0
            
        try:
            self.cursor.execute(f"SELECT COUNT(*) as count FROM {table_name}")
            return self.cursor.fetchone()['count']
        except sqlite3.Error as e:
            print(f"[ERROR] Error al contar filas en {table_name}: {e}")
            return 0
    
    def execute_query(self, query: str, params: tuple = ()) -> List[Dict]:
        """Ejecuta una consulta SQL personalizada."""
        if not self.connected:
            return []
            
        try:
            self.cursor.execute(query, params)
            return [dict(row) for row in self.cursor.fetchall()]
        except sqlite3.Error as e:
            print(f"[ERROR] Error en la consulta: {e}")
            return []
    
    def export_table_to_json(self, table_name: str, output_file: str) -> bool:
        """Exporta una tabla a un archivo JSON."""
        if not self.connected:
            return False
            
        try:
            data = self.get_table_data(table_name, limit=float('inf'))
            with open(output_file, 'w', encoding='utf-8') as f:
                json.dump(data, f, indent=2, ensure_ascii=False)
            return True
        except Exception as e:
            print(f"[ERROR] Error al exportar la tabla {table_name}: {e}")
            return False

def print_table_schema(columns: List[ColumnInfo]):
    """Muestra el esquema de una tabla de forma formateada."""
    headers = ["Columna", "Tipo", "No Nulo", "Valor por defecto", "Clave Primaria"]
    rows = [
        [col.name, col.type, "Sí" if col.notnull else "No", 
         str(col.default) if col.default is not None else "-", 
         "Sí" if col.pk else "No"] 
        for col in columns
    ]
    print("\nEsquema de la tabla:")
    print(tabulate(rows, headers=headers, tablefmt="grid"))

def print_table_data(rows: List[Dict], title: str = "Datos") -> None:
    """Muestra los datos de una tabla de forma formateada."""
    if not rows:
        print("\nNo hay datos para mostrar.")
        return
        
    # Asegurarse de que todos los campos estén presentes
    all_headers = set()
    for row in rows:
        all_headers.update(row.keys())
    headers = list(all_headers)
    
    # Ordenar los headers poniendo primero id, username, email, password_hash si existen
    preferred_order = ['id', 'username', 'email', 'password_hash']
    headers_sorted = []
    
    # Agregar los campos preferidos en orden si existen
    for field in preferred_order:
        if field in headers:
            headers_sorted.append(field)
    
    # Agregar el resto de campos que no están en preferred_order
    for field in headers:
        if field not in preferred_order:
            headers_sorted.append(field)
    
    # Crear filas con todos los campos, incluso si faltan en alguna fila
    rows_data = []
    for row in rows:
        row_data = []
        for header in headers_sorted:
            # Mostrar valor o cadena vacía si no existe
            value = row.get(header, '')
            # Acortar valores muy largos (como los hashes) para mejor visualización
            if isinstance(value, str) and len(value) > 30:
                value = value[:27] + '...'
            row_data.append(str(value) if value is not None else 'NULL')
        rows_data.append(row_data)
    
    print(f"\n{title} (mostrando {len(rows)} registros):")
    print(tabulate(rows_data, headers=headers_sorted, tablefmt="grid"))

def show_table_selection(db_manager, action="ver") -> str:
    """Muestra un menú de selección de tablas y devuelve la tabla seleccionada."""
    tables = db_manager.get_tables()
    if not tables:
        print("\n[ERROR] No hay tablas disponibles en la base de datos.")
        return None
        
    print(f"\nSeleccione una tabla para {action}:")
    for i, table in enumerate(tables, 1):
        count = db_manager.get_row_count(table)
        print(f"{i}. {table} ({count} registros)")
    
    while True:
        try:
            seleccion = input("\nIngrese el número de la tabla (0 para cancelar): ").strip()
            if seleccion == '0':
                return None
                
            idx = int(seleccion) - 1
            if 0 <= idx < len(tables):
                return tables[idx]
            print("\n[ERROR] Número de tabla inválido. Intente nuevamente.")
        except ValueError:
            print("\n[ERROR] Por favor ingrese un número válido.")

def main():
    db_manager = DatabaseManager()
    
    if not db_manager.connect():
        return
    
    try:
        while True:
            print("\n--- GESTOR DE BASE DE DATOS ---")
            print("1. Listar tablas")
            print("2. Ver esquema de una tabla")
            print("3. Ver datos de una tabla")
            print("4. Ejecutar consulta SQL")
            print("5. Exportar tabla a JSON")
            print("0. Salir")
            
            opcion = input("\nSeleccione una opción: ").strip()
            
            if opcion == '0':
                break
                
            elif opcion == '1':
                tables = db_manager.get_tables()
                print("\nTablas en la base de datos:")
                for i, table in enumerate(tables, 1):
                    count = db_manager.get_row_count(table)
                    print(f"{i}. {table} ({count} registros)")
            
            elif opcion == '2':
                table_name = show_table_selection(db_manager, "ver el esquema")
                if table_name:
                    schema = db_manager.get_table_schema(table_name)
                    print_table_schema(schema)
            
            elif opcion == '3':
                tables = db_manager.get_tables()
                if not tables:
                    print("\n[ERROR] No hay tablas disponibles en la base de datos.")
                    continue
                    
                print("\nSeleccione una tabla:")
                for i, table in enumerate(tables, 1):
                    count = db_manager.get_row_count(table)
                    print(f"{i}. {table} ({count} registros)")
                
                try:
                    seleccion = input("\nIngrese el número de la tabla (0 para cancelar): ").strip()
                    if seleccion == '0':
                        continue
                        
                    idx = int(seleccion) - 1
                    if 0 <= idx < len(tables):
                        table_name = tables[idx]
                        limit = input("Límite de registros a mostrar (10): ").strip()
                        limit = int(limit) if limit.isdigit() else 10
                        
                        data = db_manager.get_table_data(table_name, limit=limit)
                        print_table_data(data, f"Datos de la tabla '{table_name}'")
                    else:
                        print("\n[ERROR] Número de tabla inválido.")
                except ValueError:
                    print("\n[ERROR] Por favor ingrese un número válido.")
            
            elif opcion == '4':
                query = input("\nIngrese la consulta SQL: ").strip()
                if query.lower().startswith('select'):
                    result = db_manager.execute_query(query)
                    print_table_data(result, "Resultado de la consulta")
                else:
                    print("\n[ERROR] Solo se permiten consultas SELECT.")
            
            elif opcion == '5':
                table_name = show_table_selection(db_manager, "exportar")
                if table_name:
                    output_file = f"{table_name}_export.json"
                    if db_manager.export_table_to_json(table_name, output_file):
                        print(f"\n[ÉXITO] Datos exportados a {output_file}")
            
            else:
                print("\n[ERROR] Opción no válida.")
    
    except KeyboardInterrupt:
        print("\n\nSaliendo...")
    finally:
        db_manager.disconnect()

if __name__ == "__main__":
    try:
        from tabulate import tabulate
    except ImportError:
        print("Instalando dependencias necesarias...")
        import subprocess
        import sys
        subprocess.check_call([sys.executable, "-m", "pip", "install", "tabulate"])
        from tabulate import tabulate
        print("Dependencias instaladas correctamente.")
    
    main()
