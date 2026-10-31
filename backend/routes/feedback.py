import json
from flask import Blueprint, request, jsonify, session
from backend.models.db import get_db
from backend.models import PlatformFeedback, User
from backend.services import mongo_service

feedback_bp = Blueprint('feedback', __name__, url_prefix='/api/feedback')

CATEGORIES = [
    {
        'id': 'teaching_sound',
        'name': 'Teaching Sound & Voice Narration',
        'icon': '🔊',
        'description': 'Suggestions for the teacher\'s voice, volume, pronunciation, speaking pace, or sound effects.'
    },
    {
        'id': 'curriculum',
        'name': 'Curriculum & Lessons',
        'icon': '📚',
        'description': 'New subjects, topics, or lessons you would like us to add or adjust.'
    },
    {
        'id': 'video_library',
        'name': 'YouTube Video Library & Shorts',
        'icon': '🎥',
        'description': 'Videos, shorts, captions, quizzes, or interactive video player enhancements.'
    },
    {
        'id': 'classroom_3d',
        'name': '3D Classroom & Visuals',
        'icon': '🪐',
        'description': '3D models, sensory calm mode, high contrast, colors, and visual animations.'
    },
    {
        'id': 'games_quizzes',
        'name': 'Mini-Games & Interactive Quizzes',
        'icon': '🎮',
        'description': 'New educational games, quiz difficulties, stars, or reward celebration ideas.'
    },
    {
        'id': 'accessibility',
        'name': 'Accessibility & Special Needs',
        'icon': '♿',
        'description': 'Screen-reader, dyslexia font, keyboard navigation, or sensory accommodations.'
    },
    {
        'id': 'general_ideas',
        'name': 'General Feedback & Suggestions',
        'icon': '💡',
        'description': 'Any feature, improvement, or thoughts to make MindVerse even better for all learners!'
    }
]

@feedback_bp.route('/categories', methods=['GET'])
def get_categories():
    """Return available feedback categories and suggestions."""
    return jsonify({
        'categories': CATEGORIES,
        'prompt_question': 'How can we improve MindVerse to help you learn better?',
        'google_form_url': 'https://docs.google.com/forms/d/e/1FAIpQLSfb-2O-TEctAq7829dByeEHdkf_Xn2EbVHKvghs1v46WKe1xA/viewform?usp=publish-editor'
    })

@feedback_bp.route('', methods=['GET'])
def list_feedback():
    """
    List user feedback and improvement requests.
    Supports filtering by category, status, or role.
    """
    db = get_db()
    category = request.args.get('category')
    status = request.args.get('status')
    role = request.args.get('role')
    limit = min(int(request.args.get('limit', 100)), 200)

    query = db.query(PlatformFeedback)
    if category:
        query = query.filter(PlatformFeedback.category == category)
    if status:
        query = query.filter(PlatformFeedback.status == status)
    if role:
        query = query.filter(PlatformFeedback.role == role)

    items = query.order_by(PlatformFeedback.created_at.desc()).limit(limit).all()
    feedback_list = [item.to_dict() for item in items]

    # Calculate summary metrics
    total_count = len(feedback_list)
    avg_rating = round(sum(item['rating'] for item in feedback_list) / max(total_count, 1), 1) if total_count else 5.0
    status_counts = {
        'received': sum(1 for item in feedback_list if item['status'] == 'received'),
        'reviewed': sum(1 for item in feedback_list if item['status'] == 'reviewed'),
        'planned': sum(1 for item in feedback_list if item['status'] == 'planned'),
        'implemented': sum(1 for item in feedback_list if item['status'] == 'implemented')
    }

    return jsonify({
        'feedback': feedback_list,
        'total': total_count,
        'average_rating': avg_rating,
        'status_counts': status_counts,
        'mongo_status': mongo_service.get_status_info()
    })

@feedback_bp.route('', methods=['POST'])
def submit_feedback():
    """
    Submit a new user feedback / change request.
    Stores in primary SQL database (SQLite/PostgreSQL/Supabase)
    and syncs to MongoDB Atlas collection 'feedback' if configured.
    """
    db = get_db()
    data = request.get_json() or {}

    feedback_text = (data.get('feedback') or data.get('what_to_change') or '').strip()
    if not feedback_text or len(feedback_text) < 3:
        return jsonify({'error': 'Please provide your feedback or suggestion (at least 3 characters).'}), 400

    category = data.get('category', 'General Feedback & Suggestions')
    rating = data.get('rating', 5)
    try:
        rating = max(1, min(5, int(rating)))
    except (ValueError, TypeError):
        rating = 5

    user_id = session.get('user_id')
    user_name = data.get('user_name', '').strip()
    role = data.get('role', '').strip()
    email = data.get('email', '').strip() or None

    # Auto-populate from logged in user if available
    if user_id:
        logged_user = db.query(User).filter_by(id=user_id).first()
        if logged_user:
            if not user_name:
                user_name = logged_user.display_name
            if not role:
                role = logged_user.role

    if not user_name:
        user_name = 'Curious Learner'
    if not role:
        role = 'visitor'

    feedback_obj = PlatformFeedback(
        user_id=user_id,
        user_name=user_name,
        role=role,
        category=category,
        what_to_change=feedback_text,
        rating=rating,
        email=email,
        status='received'
    )

    db.add(feedback_obj)
    db.commit()

    fb_dict = feedback_obj.to_dict()

    # Mirror / sync to MongoDB if configured
    mongo_id = mongo_service.save_feedback(fb_dict)
    mongo_synced = mongo_id is not None

    return jsonify({
        'success': True,
        'message': 'Thank you! Your feedback has been received and will guide our next updates.',
        'feedback': fb_dict,
        'mongo_synced': mongo_synced,
        'mongo_id': mongo_id
    }), 201

@feedback_bp.route('/<int:feedback_id>/status', methods=['POST'])
def update_feedback_status(feedback_id):
    """
    Update feedback status (e.g. 'received', 'reviewed', 'planned', 'implemented').
    """
    db = get_db()
    fb = db.query(PlatformFeedback).filter_by(id=feedback_id).first()
    if not fb:
        return jsonify({'error': 'Feedback entry not found'}), 404

    data = request.get_json() or {}
    new_status = data.get('status', '').strip().lower()
    valid_statuses = ['received', 'reviewed', 'planned', 'implemented']
    if new_status not in valid_statuses:
        return jsonify({'error': f"Invalid status. Must be one of: {', '.join(valid_statuses)}"}), 400

    fb.status = new_status
    db.commit()

    # Sync status update to MongoDB
    mongo_service.update_feedback_status(feedback_id, new_status)

    return jsonify({
        'success': True,
        'feedback': fb.to_dict(),
        'message': f"Feedback status updated to '{new_status}'."
    })

@feedback_bp.route('/system/status', methods=['GET'])
def system_database_status():
    """
    Diagnostic endpoint showing status of all supported database engines:
    PostgreSQL/Supabase (SQLAlchemy) and MongoDB Atlas.
    """
    from backend.config import Config
    import os

    db_uri = Config.SQLALCHEMY_DATABASE_URI
    db_type = 'sqlite'
    if 'postgresql' in db_uri or 'postgres' in db_uri:
        db_type = 'postgresql/supabase'

    return jsonify({
        'primary_database': {
            'type': db_type,
            'is_cloud': db_type != 'sqlite',
            'configured': True
        },
        'mongodb': mongo_service.get_status_info(),
        'deployment_targets': {
            'frontend': 'Netlify',
            'backend': 'Render',
            'databases': ['MongoDB Atlas (mango db)', 'Supabase (PostgreSQL)', 'SQLite (Local dev)']
        }
    })

