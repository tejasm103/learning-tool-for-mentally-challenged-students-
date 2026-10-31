import os

try:
    from dotenv import load_dotenv
    load_dotenv()
except ImportError:
    pass

BASE_DIR = os.path.abspath(os.path.dirname(__file__))

# Serverless environment detection (Vercel / AWS Lambda have read-only filesystems except /tmp)
if os.environ.get('VERCEL') or os.environ.get('AWS_LAMBDA_FUNCTION_NAME'):
    INSTANCE_DIR = '/tmp/instance'
else:
    INSTANCE_DIR = os.path.join(BASE_DIR, 'instance')

DATA_DIR = os.path.join(BASE_DIR, 'data')
try:
    os.makedirs(INSTANCE_DIR, exist_ok=True)
except OSError:
    INSTANCE_DIR = '/tmp'
os.makedirs(DATA_DIR, exist_ok=True)

# Supabase or PostgreSQL Connection URL normalization
raw_db_url = os.environ.get('DATABASE_URL') or os.environ.get('SUPABASE_DB_URL')

if raw_db_url:
    # Supabase & Heroku / Render provide postgres:// or postgresql://
    if raw_db_url.startswith('postgres://'):
        database_uri = raw_db_url.replace('postgres://', 'postgresql+psycopg2://', 1)
    elif raw_db_url.startswith('postgresql://'):
        database_uri = raw_db_url.replace('postgresql://', 'postgresql+psycopg2://', 1)
    else:
        database_uri = raw_db_url
else:
    database_uri = f"sqlite:///{os.path.join(INSTANCE_DIR, 'mindverse.db')}"

class Config:
    SECRET_KEY = os.environ.get('SECRET_KEY', 'mindverse-secret-key-2026-inclusive-learning')
    SQLALCHEMY_DATABASE_URI = database_uri
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    SQLALCHEMY_ECHO = False
    SQLALCHEMY_ENGINE_OPTIONS = {
        'pool_recycle': 280,
        'pool_pre_ping': True
    }
    SESSION_COOKIE_HTTPONLY = True
    SESSION_COOKIE_SAMESITE = 'Lax'
    JSON_AS_ASCII = False
    TEMPLATES_AUTO_RELOAD = True
    DATA_DIR = DATA_DIR

    # MongoDB Atlas ("mango db") Support
    MONGO_URI = os.environ.get('MONGO_URI') or os.environ.get('MONGODB_URI')
    MONGO_DB_NAME = os.environ.get('MONGO_DB_NAME', 'mindverse')

class TestConfig(Config):
    TESTING = True
    SQLALCHEMY_DATABASE_URI = 'sqlite:///:memory:'
    WTF_CSRF_ENABLED = False
