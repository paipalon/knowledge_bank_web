
import sqlite3

def init_db():
    conn = sqlite3.connect("osaamiset.db")
    cur = conn.cursor()

    cur.execute("""
    CREATE TABLE IF NOT EXISTS henkilot (
        id INTEGER PRIMARY KEY,
        nimi TEXT NOT NULL,
        email TEXT NOT NULL UNIQUE,
        linkedin TEXT
    )
    """)

    cur.execute("""
    CREATE TABLE IF NOT EXISTS top3 (
        id INTEGER PRIMARY KEY,
        top_1 TEXT,
        top_2 TEXT,
        top_3 TEXT,
        lisatiedot TEXT
    )
    """)

    cur.execute("""
    CREATE TABLE IF NOT EXISTS taidot(
        id INTEGER PRIMARY KEY,
        taito TEXT
    )
    """)

    conn.commit()
    conn.close()
