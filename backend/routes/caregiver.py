from flask import Blueprint, jsonify, request, session
from backend.models.db import get_db
from backend.models import User
from backend.services.progress_service import ProgressService

caregiver_bp = Blueprint('caregiver_bp', __name__)

@caregiver_bp.route('/api/caregiver/overview', methods=['GET'])
def get_caregiver_overview():
    db = get_db()
    # Find student aarav or first student
    student = db.query(User).filter_by(username='aarav').first()
    if not student:
        student = db.query(User).filter_by(role='student').first()

    if not student:
        return jsonify({'error': 'No student records available.'}), 404

    summary = ProgressService.get_student_summary(db, student.id)
    profile = student.student_profile.to_dict() if student.student_profile else {}

    home_activities = [
        {'title': 'Alphabet Scavenger Hunt', 'desc': 'Find 3 objects around the kitchen that start with the letter A or B.'},
        {'title': 'Counting Daily Objects', 'desc': 'Count 5 spoons or 10 colorful buttons together at snack time.'},
        {'title': 'Feelings Check-in', 'desc': 'Use emotion cards to ask: How was your energy today? Share a happy moment.'},
        {'title': 'Zebra Crossing Walk', 'desc': 'Practice looking Left-Right-Left together on the sidewalk before crossing.'}
    ]

    routine_tips = [
        'Keep a visual daily schedule on the wall or tablet.',
        'Offer 5-minute transition warnings before switching activities.',
        'Encourage deep calming breaths when feeling overwhelmed.',
        'Celebrate small steps of persistence and kindness.'
    ]

    return jsonify({
        'student': student.to_dict(),
        'profile': profile,
        'summary': summary,
        'home_activities': home_activities,
        'routine_tips': routine_tips
    })
