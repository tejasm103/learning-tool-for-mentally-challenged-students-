import json
from datetime import datetime
from flask import Blueprint, jsonify, request, session
from backend.models.db import get_db
from backend.models import Video, StudentActivity, User

videos_bp = Blueprint('videos_bp', __name__)

@videos_bp.route('/api/videos', methods=['GET'])
def list_videos():
    db = get_db()
    video_type = request.args.get('type')  # 'standard' or 'short'
    subject = request.args.get('subject')
    review_status = request.args.get('review_status')
    state = request.args.get('state')
    search = request.args.get('search', '').strip().lower()
    language = request.args.get('language')

    query = db.query(Video)

    if video_type:
        query = query.filter_by(video_type=video_type)
    if subject and subject.lower() != 'all':
        query = query.filter(Video.subject.ilike(f"%{subject}%"))
    if review_status and review_status.lower() != 'all':
        query = query.filter_by(review_status=review_status)
    if state and state.lower() != 'all':
        query = query.filter_by(state=state)
    if language and language.lower() != 'all':
        query = query.filter(Video.language.ilike(f"%{language}%"))

    videos = query.order_by(Video.id.asc()).all()

    if search:
        videos = [
            v for v in videos
            if search in v.title.lower() or search in v.description.lower() or search in v.topic.lower()
        ]

    return jsonify({
        'count': len(videos),
        'videos': [v.to_dict() for v in videos]
    })

@videos_bp.route('/api/videos/<video_id>', methods=['GET'])
def get_video_detail(video_id):
    db = get_db()
    video = db.query(Video).filter_by(video_id=video_id).first()
    if not video:
        return jsonify({'error': 'Video resource not found.'}), 404
    return jsonify(video.to_dict())

@videos_bp.route('/api/videos/<video_id>/review', methods=['POST'])
def review_video(video_id):
    user_id = session.get('user_id')
    user_role = session.get('role')
    db = get_db()

    # Educators and admins are authorized to review videos
    if not user_id or user_role not in ['teacher', 'admin']:
        # Fallback for demo session
        demo_t = db.query(User).filter_by(username='teacher').first()
        if not demo_t:
            return jsonify({'error': 'Unauthorized educator access required.'}), 403

    video = db.query(Video).filter_by(video_id=video_id).first()
    if not video:
        return jsonify({'error': 'Video not found.'}), 404

    data = request.get_json() or {}
    if 'review_status' in data:
        video.review_status = data['review_status']
    if 'subject' in data:
        video.subject = data['subject']
    if 'topic' in data:
        video.topic = data['topic']
    if 'intended_level' in data:
        video.intended_level = data['intended_level']
    if 'state' in data:
        video.state = data['state']
    if 'description' in data:
        video.description = data['description']

    db.commit()
    return jsonify({
        'message': f'Video {video_id} review updated successfully.',
        'video': video.to_dict()
    })

@videos_bp.route('/api/videos/<video_id>/submit-activity', methods=['POST'])
def submit_video_activity(video_id):
    """
    Submits student responses for an assigned video activity.
    Backend validates responses against the real answer key (integrity rule).
    """
    user_id = session.get('user_id')
    db = get_db()

    if not user_id:
        demo_stu = db.query(User).filter_by(username='aarav').first()
        user_id = demo_stu.id if demo_stu else None

    if not user_id:
        return jsonify({'error': 'Student login required.'}), 401

    video = db.query(Video).filter_by(video_id=video_id).first()
    if not video:
        return jsonify({'error': 'Video not found.'}), 404

    data = request.get_json() or {}
    submitted_answers = data.get('answers', [])  # list of { id: "q1", selected_answer: "..." }
    notes = data.get('reflection', '').strip()
    time_spent = int(data.get('time_spent_seconds', 120))

    # Backend validates answers against verified answer key
    questions = []
    try:
        questions = json.loads(video.questions_json) if video.questions_json else []
    except Exception:
        questions = []

    q_map = {q['id']: q for q in questions}
    total_q = len(questions)
    correct_count = 0
    validated_answers = []

    for item in submitted_answers:
        q_id = item.get('id')
        user_ans = item.get('selected_answer')
        q_def = q_map.get(q_id)

        is_correct = False
        if q_def and user_ans:
            is_correct = (user_ans.strip().lower() == q_def.get('correct_answer', '').strip().lower())
            if is_correct:
                correct_count += 1

        validated_answers.append({
            'question_id': q_id,
            'question_text': q_def.get('question') if q_def else '',
            'selected_answer': user_ans,
            'is_correct': is_correct,
            'explanation': q_def.get('explanation') if q_def else ''
        })

    score_pct = (correct_count / total_q * 100.0) if total_q > 0 else 100.0

    # Locate existing assigned activity or create a new student submission
    activity = db.query(StudentActivity).filter(
        StudentActivity.student_id == user_id,
        StudentActivity.reference_id == video_id,
        StudentActivity.activity_type == 'video_activity'
    ).first()

    status = 'awaiting_review' if score_pct < 100 or notes else 'submitted'

    if not activity:
        teacher = db.query(User).filter_by(role='teacher').first()
        activity = StudentActivity(
            student_id=user_id,
            assigned_by_id=teacher.id if teacher else None,
            activity_type='video_activity',
            title=f"{video.title} Activity",
            subject=video.subject,
            reference_id=video_id,
            instructions=f"Watch '{video.title}' and answer comprehension questions.",
            status=status,
            submitted_date=datetime.utcnow(),
            submission_data=json.dumps({
                'answers': validated_answers,
                'reflection': notes,
                'time_spent_seconds': time_spent,
                'correct_count': correct_count,
                'total_questions': total_q
            }),
            score=round(score_pct, 1),
            max_score=100.0,
            attempts=1,
            requires_teacher_review=True
        )
        db.add(activity)
    else:
        activity.attempts += 1
        activity.status = status
        activity.submitted_date = datetime.utcnow()
        activity.score = round(score_pct, 1)
        activity.submission_data = json.dumps({
            'answers': validated_answers,
            'reflection': notes,
            'time_spent_seconds': time_spent,
            'correct_count': correct_count,
            'total_questions': total_q
        })

    db.commit()

    return jsonify({
        'message': 'Activity submitted successfully and logged for teacher review.',
        'activity_id': activity.id,
        'score': round(score_pct, 1),
        'total_questions': total_q,
        'correct_count': correct_count,
        'validated_answers': validated_answers,
        'status': activity.status
    })
