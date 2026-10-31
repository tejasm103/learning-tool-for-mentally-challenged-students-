import json
from datetime import datetime
from flask import Blueprint, jsonify, request, session
from backend.models.db import get_db
from backend.models import StudentActivity, User, Video, Lesson

activities_bp = Blueprint('activities_bp', __name__)

def _get_current_user_and_role():
    user_id = session.get('user_id')
    role = session.get('role')
    db = get_db()
    if user_id:
        user = db.query(User).filter_by(id=user_id).first()
        if user:
            return user, user.role
    # Fallback to demo student if unauthenticated in preview
    demo = db.query(User).filter_by(username='aarav').first()
    return demo, 'student'

@activities_bp.route('/api/activities', methods=['GET'])
def list_activities():
    current_user, role = _get_current_user_and_role()
    if not current_user:
        return jsonify({'error': 'Login required.'}), 401

    db = get_db()
    target_student_id = request.args.get('student_id', type=int)

    # Authorization check
    if role == 'student':
        # Students can only view their own activities
        query = db.query(StudentActivity).filter_by(student_id=current_user.id)
    elif role in ['teacher', 'admin', 'caregiver']:
        if target_student_id:
            query = db.query(StudentActivity).filter_by(student_id=target_student_id)
        else:
            query = db.query(StudentActivity)
    else:
        query = db.query(StudentActivity).filter_by(student_id=current_user.id)

    status = request.args.get('status')
    if status and status.lower() != 'all':
        query = query.filter_by(status=status)

    activity_type = request.args.get('type')
    if activity_type and activity_type.lower() != 'all':
        query = query.filter_by(activity_type=activity_type)

    activities = query.order_by(StudentActivity.last_activity_time.desc()).all()

    return jsonify({
        'count': len(activities),
        'activities': [a.to_dict() for a in activities]
    })

@activities_bp.route('/api/activities/<int:activity_id>', methods=['GET'])
def get_activity_detail(activity_id):
    current_user, role = _get_current_user_and_role()
    db = get_db()
    activity = db.query(StudentActivity).filter_by(id=activity_id).first()
    if not activity:
        return jsonify({'error': 'Activity not found.'}), 404

    # Security check: Students cannot access other students' records
    if role == 'student' and current_user and activity.student_id != current_user.id:
        return jsonify({'error': 'Forbidden. You cannot view another student’s activity record.'}), 403

    return jsonify(activity.to_dict())

@activities_bp.route('/api/activities/<int:activity_id>/start', methods=['POST'])
def start_activity(activity_id):
    current_user, role = _get_current_user_and_role()
    db = get_db()
    activity = db.query(StudentActivity).filter_by(id=activity_id).first()
    if not activity:
        return jsonify({'error': 'Activity not found.'}), 404

    if role == 'student' and current_user and activity.student_id != current_user.id:
        return jsonify({'error': 'Forbidden.'}), 403

    if activity.status == 'assigned':
        activity.status = 'in_progress'
        activity.last_activity_time = datetime.utcnow()
        db.commit()

    return jsonify({
        'message': 'Activity started.',
        'activity': activity.to_dict()
    })

@activities_bp.route('/api/activities/<int:activity_id>/submit', methods=['POST'])
def submit_activity(activity_id):
    current_user, role = _get_current_user_and_role()
    db = get_db()
    activity = db.query(StudentActivity).filter_by(id=activity_id).first()
    if not activity:
        return jsonify({'error': 'Activity not found.'}), 404

    if role == 'student' and current_user and activity.student_id != current_user.id:
        return jsonify({'error': 'Forbidden.'}), 403

    data = request.get_json() or {}
    answers = data.get('answers', [])
    reflection = data.get('reflection', '').strip()
    time_spent = int(data.get('time_spent_seconds', 120))
    provided_score = data.get('score')

    # If backend can validate objective questions (e.g. from Video questions)
    score_pct = 100.0
    if activity.activity_type == 'video_activity' and activity.reference_id:
        video = db.query(Video).filter_by(video_id=activity.reference_id).first()
        if video and video.questions_json:
            try:
                q_list = json.loads(video.questions_json)
                q_map = {q['id']: q for q in q_list}
                correct_count = 0
                for a in answers:
                    q = q_map.get(a.get('id'))
                    if q and a.get('selected_answer', '').strip().lower() == q.get('correct_answer', '').strip().lower():
                        correct_count += 1
                if q_list:
                    score_pct = (correct_count / len(q_list)) * 100.0
            except Exception:
                pass
    elif provided_score is not None:
        score_pct = float(provided_score)

    activity.submitted_date = datetime.utcnow()
    activity.last_activity_time = datetime.utcnow()
    activity.attempts += 1
    activity.score = round(score_pct, 1)
    activity.status = 'awaiting_review' if activity.requires_teacher_review else 'reviewed'
    activity.submission_data = json.dumps({
        'answers': answers,
        'reflection': reflection,
        'time_spent_seconds': time_spent
    })

    db.commit()

    return jsonify({
        'message': 'Activity submitted successfully!',
        'activity': activity.to_dict()
    })

@activities_bp.route('/api/activities/assign', methods=['POST'])
def assign_activity():
    current_user, role = _get_current_user_and_role()
    db = get_db()

    # Only teachers and administrators can assign activities
    if role not in ['teacher', 'admin']:
        demo_t = db.query(User).filter_by(role='teacher').first()
        teacher_id = demo_t.id if demo_t else 1
    else:
        teacher_id = current_user.id

    data = request.get_json() or {}
    student_id = data.get('student_id')
    activity_type = data.get('activity_type', 'lesson')  # 'video_activity', 'lesson', 'quiz'
    reference_id = data.get('reference_id')
    instructions = data.get('instructions', 'Please complete this individualized activity.').strip()
    title = data.get('title', '')
    subject = data.get('subject', 'general')

    if not student_id:
        return jsonify({'error': 'Student selection is required.'}), 400

    student = db.query(User).filter_by(id=student_id, role='student').first()
    if not student:
        return jsonify({'error': 'Student not found.'}), 404

    # Determine title from reference if not explicitly supplied
    if not title:
        if activity_type == 'video_activity' and reference_id:
            vid = db.query(Video).filter_by(video_id=reference_id).first()
            if vid:
                title = f"{vid.title} (Video Activity)"
                subject = vid.subject
        elif activity_type == 'lesson' and reference_id:
            les = db.query(Lesson).filter_by(slug=reference_id).first()
            if les:
                title = f"{les.title} (Lesson Activity)"
                subject = les.subject
        elif activity_type in ['workplace', 'workspace']:
            title = title or f"{reference_id.replace('_', ' ').title()} ({activity_type.title()})"
            subject = 'Life Skills & Working Places'
        else:
            title = f"{activity_type.replace('_', ' ').title()} Assignment"

    new_act = StudentActivity(
        student_id=student.id,
        assigned_by_id=teacher_id,
        activity_type=activity_type,
        title=title,
        subject=subject,
        reference_id=reference_id,
        instructions=instructions,
        status='assigned',
        requires_teacher_review=True,
        assigned_date=datetime.utcnow()
    )
    db.add(new_act)
    db.commit()

    return jsonify({
        'message': f"Activity assigned to {student.display_name} successfully!",
        'activity': new_act.to_dict()
    }), 201

@activities_bp.route('/api/activities/submit-direct', methods=['POST'])
def submit_direct_activity():
    """
    Allow students to submit self-directed activities, workspace notes,
    drawings, or working place quiz completions directly into the teacher review queue.
    """
    current_user, role = _get_current_user_and_role()
    db = get_db()
    if not current_user:
        demo = db.query(User).filter_by(username='aarav').first()
        current_user = demo

    data = request.get_json() or {}
    title = data.get('title', 'Working Place Desk Reflection').strip()
    activity_type = data.get('activity_type', 'practice')
    subject = data.get('subject', 'Life Skills & Working Places')
    notes = data.get('notes', '').strip()
    score = data.get('score', 100)
    answers = data.get('answers', [])
    reflection = data.get('reflection', notes).strip()

    demo_t = db.query(User).filter_by(role='teacher').first()
    teacher_id = demo_t.id if demo_t else 1

    formatted_answers = []
    if answers:
        for a in answers:
            formatted_answers.append({
                'question_text': a.get('question_text') or a.get('question') or 'Activity Response',
                'selected_answer': a.get('selected_answer') or a.get('answer') or 'Completed',
                'is_correct': a.get('is_correct', True)
            })
    elif notes:
        formatted_answers.append({
            'question_text': 'Student Workspace Notes & Reflection',
            'selected_answer': notes,
            'is_correct': True
        })

    new_act = StudentActivity(
        student_id=current_user.id,
        assigned_by_id=teacher_id,
        activity_type=activity_type,
        title=title,
        subject=subject,
        reference_id=data.get('reference_id', 'workplace_desk'),
        instructions='Self-directed student workspace practice and working place exploration.',
        status='awaiting_review',
        requires_teacher_review=True,
        score=float(score) if score is not None else 100.0,
        max_score=100.0,
        attempts=1,
        assigned_date=datetime.utcnow(),
        submitted_date=datetime.utcnow(),
        last_activity_time=datetime.utcnow(),
        submission_data=json.dumps({
            'answers': formatted_answers,
            'reflection': reflection or notes,
            'time_spent_seconds': int(data.get('time_spent_seconds', 180))
        })
    )
    db.add(new_act)
    db.commit()

    return jsonify({
        'message': 'Activity submitted successfully to educator review queue!',
        'activity': new_act.to_dict()
    }), 201
