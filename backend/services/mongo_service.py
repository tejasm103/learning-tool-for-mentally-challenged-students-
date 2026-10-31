import os
import logging
from datetime import datetime
from backend.config import Config

logger = logging.getLogger('mindverse.mongo')

_client = None
_db = None
_connection_attempted = False
_is_connected = False

def get_mongo_client():
    """
    Returns a connected MongoClient instance, or None if MongoDB is not configured
    or cannot be reached.
    """
    global _client, _db, _connection_attempted, _is_connected

    if _client is not None and _is_connected:
        return _client

    mongo_uri = os.environ.get('MONGO_URI') or os.environ.get('MONGODB_URI') or getattr(Config, 'MONGO_URI', None)
    if not mongo_uri:
        return None

    try:
        from pymongo import MongoClient
        from pymongo.errors import ConnectionFailure, ServerSelectionTimeoutError

        # Connect with 5-second server selection timeout so startup never hangs
        _client = MongoClient(mongo_uri, serverSelectionTimeoutMS=5000, connect=True)
        # Ping the server
        _client.admin.command('ping')
        
        db_name = os.environ.get('MONGO_DB_NAME') or getattr(Config, 'MONGO_DB_NAME', 'mindverse')
        _db = _client[db_name]
        _is_connected = True
        logger.info(f"[MongoDB] Successfully connected to MongoDB database '{db_name}'!")
        return _client
    except Exception as e:
        logger.warning(f"[MongoDB] Notice: Could not connect to MongoDB ({e}). Running in SQL-only mode.")
        _is_connected = False
        _client = None
        _db = None
        return None

def get_mongo_db():
    """
    Returns the MongoDB database instance if connected, otherwise None.
    """
    global _db
    if _db is not None:
        return _db
    client = get_mongo_client()
    if client:
        return _db
    return None

def is_mongo_connected():
    """
    Quick boolean check if MongoDB is active and reachable.
    """
    db = get_mongo_db()
    return db is not None

def get_status_info():
    """
    Returns a health and status report for MongoDB integration.
    """
    mongo_uri = os.environ.get('MONGO_URI') or os.environ.get('MONGODB_URI') or getattr(Config, 'MONGO_URI', None)
    if not mongo_uri:
        return {
            'enabled': False,
            'connected': False,
            'message': 'No MONGO_URI configured. Using primary SQL database (SQLite/Supabase/PostgreSQL).'
        }

    db = get_mongo_db()
    if db is None:
        return {
            'enabled': True,
            'connected': False,
            'message': 'MONGO_URI configured but connection could not be established.'
        }

    try:
        stats = {
            'enabled': True,
            'connected': True,
            'database': db.name,
            'collections': {
                'feedback': db.feedback.count_documents({}),
                'videos': db.videos.count_documents({}),
                'activities': db.activities.count_documents({})
            }
        }
        return stats
    except Exception as e:
        return {
            'enabled': True,
            'connected': False,
            'error': str(e)
        }

def save_feedback(feedback_data):
    """
    Saves a feedback entry to the MongoDB 'feedback' collection.
    """
    db = get_mongo_db()
    if db is None:
        return None

    try:
        doc = dict(feedback_data)
        if 'created_at' not in doc or not doc['created_at']:
            doc['created_at'] = datetime.utcnow().isoformat()
        elif isinstance(doc['created_at'], datetime):
            doc['created_at'] = doc['created_at'].isoformat()

        res = db.feedback.insert_one(doc)
        logger.info(f"[MongoDB] Saved feedback document with id: {res.inserted_id}")
        return str(res.inserted_id)
    except Exception as e:
        logger.error(f"[MongoDB] Error saving feedback: {e}")
        return None

def get_feedback(filter_query=None, limit=100):
    """
    Retrieves feedback entries from MongoDB 'feedback' collection.
    """
    db = get_mongo_db()
    if db is None:
        return []

    try:
        query = filter_query or {}
        cursor = db.feedback.find(query).sort([('created_at', -1)]).limit(limit)
        results = []
        for doc in cursor:
            doc['_id'] = str(doc['_id'])
            results.append(doc)
        return results
    except Exception as e:
        logger.error(f"[MongoDB] Error retrieving feedback: {e}")
        return []

def update_feedback_status(feedback_id, new_status):
    """
    Updates the status of a feedback document in MongoDB.
    """
    db = get_mongo_db()
    if db is None:
        return False

    try:
        from bson.objectid import ObjectId
        # Try both numeric id (from SQL) and ObjectId
        filter_q = {'$or': [
            {'id': int(feedback_id)} if str(feedback_id).isdigit() else {'id': feedback_id},
            {'_id': ObjectId(feedback_id)} if len(str(feedback_id)) == 24 else {'_id': feedback_id}
        ]}
        res = db.feedback.update_many(filter_q, {'$set': {'status': new_status, 'updated_at': datetime.utcnow().isoformat()}})
        return res.modified_count > 0
    except Exception as e:
        logger.error(f"[MongoDB] Error updating feedback status: {e}")
        return False

def sync_videos(video_list):
    """
    Syncs list of video dictionaries to the MongoDB 'videos' collection.
    """
    db = get_mongo_db()
    if db is None:
        return 0

    try:
        count = 0
        for vid in video_list:
            v_id = vid.get('video_id')
            if not v_id:
                continue
            db.videos.update_one(
                {'video_id': v_id},
                {'$set': vid},
                upsert=True
            )
            count += 1
        return count
    except Exception as e:
        logger.error(f"[MongoDB] Error syncing videos: {e}")
        return 0

def save_user(user_data):
    """
    Saves or mirrors a registered user/student to the MongoDB 'users' collection.
    Ensures registered students persist in the cloud database across deployments!
    """
    db = get_mongo_db()
    if db is None:
        return None

    try:
        doc = dict(user_data)
        if 'created_at' not in doc or not doc['created_at']:
            doc['created_at'] = datetime.utcnow().isoformat()
        elif isinstance(doc['created_at'], datetime):
            doc['created_at'] = doc['created_at'].isoformat()

        username = doc.get('username')
        if username:
            db.users.update_one({'username': username}, {'$set': doc}, upsert=True)
            logger.info(f"[MongoDB] Synced user '{username}' ({doc.get('role', 'student')}) to MongoDB Atlas")
            return username
        else:
            res = db.users.insert_one(doc)
            return str(res.inserted_id)
    except Exception as e:
        logger.error(f"[MongoDB] Error saving user to MongoDB: {e}")
        return None

def get_users(filter_query=None):
    """
    Retrieves users/registered students from MongoDB 'users' collection.
    """
    db = get_mongo_db()
    if db is None:
        return []

    try:
        query = filter_query or {}
        cursor = db.users.find(query)
        results = []
        for doc in cursor:
            doc['_id'] = str(doc['_id'])
            results.append(doc)
        return results
    except Exception as e:
        logger.error(f"[MongoDB] Error retrieving users from MongoDB: {e}")
        return []

