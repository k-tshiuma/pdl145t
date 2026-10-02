import sqlite3
import codecs

db_path = r'C:\xampp\htdocs\BCS\pdl145t\births\backend\data\pdl145t.db'
conn = sqlite3.connect(db_path)
cursor = conn.cursor()

# Get all tables
cursor.execute("SELECT name, sql FROM sqlite_master WHERE type='table'")
tables = cursor.fetchall()

with codecs.open("schema_output.txt", "w", "utf-8") as f:
    f.write("--- TABLES ---\n")
    for table_name, schema in tables:
        f.write(f"Table: {table_name}\n")
        f.write(f"Schema: {schema}\n\n")

    # Get indices
    cursor.execute("SELECT name, tbl_name, sql FROM sqlite_master WHERE type='index'")
    indices = cursor.fetchall()

    f.write("--- INDICES ---\n")
    for index_name, table_name, schema in indices:
        f.write(f"Index: {index_name} on {table_name}\n")
        if schema:
            f.write(f"Schema: {schema}\n\n")
        else:
            f.write("Schema: (Auto-generated)\n\n")

conn.close()
