import sqlite3
conn = sqlite3.connect(r'C:\xampp\htdocs\BCS\pdl145t\births\backend\data\pdl145t.db')
c = conn.cursor()
c.execute("SELECT * FROM territoire WHERE territoire_id = '0f637e0e-2373-4689-8c41-2686573ac35c'")
print('territoire:', c.fetchall())
