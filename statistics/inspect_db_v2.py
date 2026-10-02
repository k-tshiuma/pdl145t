import sqlite3
import codecs

db_path = r'C:\xampp\htdocs\BCS\pdl145t\births\backend\data\pdl145t_v2.db'
conn = sqlite3.connect(db_path)
cursor = conn.cursor()

# Get all tables
cursor.execute("SELECT name, sql FROM sqlite_master WHERE type='table'")
tables = cursor.fetchall()

with codecs.open("schema_output_v2.txt", "w", "utf-8") as f:
    f.write("--- TABLES ---\n")
    for table_name, schema in tables:
        f.write(f"Table: {table_name}\n")
        f.write(f"Schema: {schema}\n\n")

conn.close()
