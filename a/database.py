import sqlite3
from flask import current_app, g
from flask_sqlalchemy import SQLAlchemy

db = SQLAlchemy()

def get_db():
    if 'db' not in g:
        g.db = sqlite3.connect(
            current_app.config['DATABASE'],
            detect_types=sqlite3.PARSE_DECLTYPES
        )
        g.db.row_factory = sqlite3.Row
    return g.db

def get_db_cursor():
    return get_db().cursor()

def close_db(e=None):
    db = g.pop('db', None)
    if db is not None:
        db.close()

def init_tables():
    db_conn = get_db()
    with db_conn:
        db_conn.execute("""
            CREATE TABLE IF NOT EXISTS candidates (
                candidate_id INTEGER PRIMARY KEY AUTOINCREMENT,
                first_name TEXT NOT NULL,
                last_name TEXT NOT NULL,
                email TEXT UNIQUE NOT NULL,
                password TEXT NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        """)
        db_conn.execute("""
            CREATE TABLE IF NOT EXISTS companies (
                company_id INTEGER PRIMARY KEY AUTOINCREMENT,
                company_name TEXT NOT NULL,
                contact_email TEXT UNIQUE NOT NULL,
                password TEXT NOT NULL,
                contact_number TEXT,
                industry_type TEXT,
                logo_filename TEXT,
                company_description TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        """)
        print("Tables initialized or verified.")

# Function to insert a candidate record
def insert_candidate(first_name, last_name, email, password):
    db_conn = get_db()
    with db_conn:
        db_conn.execute(
            "INSERT INTO candidates (first_name, last_name, email, password) VALUES (?, ?, ?, ?)",
            (first_name, last_name, email, password)
        )
    print("Candidate inserted:", email)

# Function to retrieve a candidate by email
def get_candidate_by_email(email):
    db_conn = get_db()
    return db_conn.execute(
        "SELECT * FROM candidates WHERE email = ?",
        (email,)
    ).fetchone()

# Function to insert a company record
def insert_company(company_name, contact_email, password, contact_number, industry_type, logo_filename, company_description):
    try:
        db = get_db()
        cursor = db.cursor()
        cursor.execute(
            """
            INSERT INTO companies (company_name, contact_email, password, contact_number, industry_type, logo_filename, company_description)
            VALUES (?, ?, ?, ?, ?, ?, ?)
            """,
            (company_name, contact_email, password, contact_number, industry_type, logo_filename, company_description)
        )
        db.commit()
        cursor.close()
        print(f"Company inserted successfully: {company_name}, {contact_email}")
    except sqlite3.Error as e:
        print(f"Error inserting company: {e}")
        raise

# Function to retrieve a company by email
def get_company_by_email(contact_email):
    db_conn = get_db()
    return db_conn.execute(
        "SELECT * FROM companies WHERE contact_email = ?",
        (contact_email,)
    ).fetchone()

if __name__ == "__main__":
    from flask import Flask
    import os
    app = Flask(__name__)
    # Use the current working directory for the database file
    database_path = os.path.join(os.getcwd(), "database.db")
    print("Using database path:", database_path)
    app.config.from_mapping(
        DATABASE=database_path
    )
    with app.app_context():
        init_tables()
        print("Tables initialized.")