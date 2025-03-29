class Config:
    # Secret key for sessions and CSRF protection
    SECRET_KEY = 'your-secret-key'
    # SQLite database URI; the database file will be created in the app folder
    SQLALCHEMY_DATABASE_URI = 'sqlite:///database.db'
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    DATABASE = 'database.db'