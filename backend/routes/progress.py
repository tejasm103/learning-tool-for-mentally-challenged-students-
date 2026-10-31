import json
from flask import Blueprint, jsonify, request, session
from backend.models.db import get_db
from backend.models import User, Lesson
from backend.services.progress_service import ProgressService, RecommendationService, ReportingService

progress_bp = Blueprint('progress_bp', __name__)

def _get_active_student_id():
    user_id = session.get('user_id')
    db = get_db()
    if user_id:
        u = db.query(User).filter_by(id=user_id).first()
        if u and u.role == 'student':
            return u.id
    # Default fallback to demo student for interactive preview
    demo = db.query(User).filter_by(username='aarav').first()
    return demo.id if demo else None

@progress_bp.route('/api/progress/summary', methods=['GET'])
def get_summary():
    student_id = request.args.get('student_id', type=int) or _get_active_student_id()
    if not student_id:
        return jsonify({'error': 'No student selected.'}), 400

    db = get_db()
    summary = ProgressService.get_student_summary(db, student_id)
    if not summary:
        return jsonify({'error': 'Student not found.'}), 404

    return jsonify(summary)

@progress_bp.route('/api/progress/lesson/complete', methods=['POST'])
def complete_lesson():
    data = request.get_json() or {}
    slug = data.get('slug')
    score = float(data.get('score', 100.0))
    time_spent = int(data.get('time_spent_seconds', 60))

    student_id = _get_active_student_id()
    if not student_id:
        return jsonify({'error': 'Student login required.'}), 401

    db = get_db()
    lesson = db.query(Lesson).filter_by(slug=slug).first()
    if not lesson:
        # Create or find default lesson
        lesson = Lesson(slug=slug, subject=data.get('subject', 'general'), title=slug.replace('-', ' ').title())
        db.add(lesson)
        db.flush()

    res = ProgressService.record_lesson_progress(
        session=db,
        student_id=student_id,
        lesson_id=lesson.id,
        status='completed',
        score=score,
        time_spent=time_spent
    )

    return jsonify({
        'message': 'Lesson marked as completed!',
        'progress': res
    })

@progress_bp.route('/api/progress/quiz/submit', methods=['POST'])
def submit_quiz():
    data = request.get_json() or {}
    subject = data.get('subject', 'general')
    quiz_name = data.get('quiz_name', 'General Assessment')
    total_q = int(data.get('total_questions', 5))
    correct_q = int(data.get('correct_count', 5))
    answers = data.get('answers', [])

    student_id = _get_active_student_id()
    if not student_id:
        return jsonify({'error': 'Student login required.'}), 401

    db = get_db()
    res = ProgressService.record_quiz_attempt(
        session=db,
        student_id=student_id,
        subject=subject,
        quiz_name=quiz_name,
        total_q=total_q,
        correct_q=correct_q,
        answers_json=json.dumps(answers)
    )

    return jsonify({
        'message': 'Assessment recorded successfully!',
        'attempt': res
    })

@progress_bp.route('/api/progress/report-card', methods=['GET'])
def get_report_card():
    student_id = request.args.get('student_id', type=int) or _get_active_student_id()
    if not student_id:
        return jsonify({'error': 'No student selected.'}), 400

    db = get_db()
    report = ReportingService.generate_report_card(db, student_id)
    if not report:
        return jsonify({'error': 'Unable to generate report card.'}), 404

    return jsonify(report)

@progress_bp.route('/api/progress/recommendations', methods=['GET'])
def get_recommendations():
    student_id = request.args.get('student_id', type=int) or _get_active_student_id()
    if not student_id:
        return jsonify({'recommendations': []})

    db = get_db()
    recs = RecommendationService.get_recommendations(db, student_id)
    return jsonify({'recommendations': recs})
