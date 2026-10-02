import sqlite3

db_path = r'C:\xampp\htdocs\BCS\pdl145t\births\backend\data\pdl145t.db'
conn = sqlite3.connect(db_path)
cursor = conn.cursor()

# Get all tables
cursor.execute("SELECT name, sql FROM sqlite_master WHERE type='table'")
tables = cursor.fetchall()

print("--- TABLES ---")
for table_name, schema in tables:
    print(f"Table: {table_name}")
    print(f"Schema: {schema}\n")

# Get indices
cursor.execute("SELECT name, tbl_name, sql FROM sqlite_master WHERE type='index'")
indices = cursor.fetchall()

print("--- INDICES ---")
for index_name, table_name, schema in indices:
    print(f"Index: {index_name} on {table_name}")
    if schema:
        print(f"Schema: {schema}\n")
    else:
        print("Schema: (Auto-generated)\n")

conn.close()
