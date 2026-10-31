from functools import wraps
from flask import Blueprint, request, jsonify, session
from backend.models.db import get_db
from backend.models import User, StudentProfile

auth_bp = Blueprint('auth_bp', __name__)

def login_required(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        if 'user_id' not in session:
            return jsonify({'error': 'Authentication required. Please log in.'}), 401
        return f(*args, **kwargs)
    return decorated_function

def role_required(allowed_roles):
    def decorator(f):
        @wraps(f)
        def decorated_function(*args, **kwargs):
            if 'user_id' not in session:
                return jsonify({'error': 'Authentication required. Please log in.'}), 401
            current_role = session.get('role', 'student')
            if current_role not in allowed_roles:
                return jsonify({'error': f"Access forbidden for role '{current_role}'."}), 403
            return f(*args, **kwargs)
        return decorated_function
    return decorator

@auth_bp.route('/api/auth/register', methods=['POST'])
def register():
    data = request.get_json() or {}
    username = data.get('username', '').strip().lower()
    password = data.get('password', '').strip()
    display_name = data.get('display_name', '').strip()
    role = data.get('role', 'student').lower()

    if role not in ['student', 'teacher', 'caregiver', 'admin']:
        return jsonify({'error': 'Invalid role specified.'}), 400

    if not username or len(username) < 3:
        return jsonify({'error': 'Username must be at least 3 characters.'}), 400

    if not password or len(password) < 6:
        return jsonify({'error': 'Password must be at least 6 characters.'}), 400

    if not display_name:
        return jsonify({'error': 'Display name is required.'}), 400

    db = get_db()
    existing = db.query(User).filter_by(username=username).first()
    if existing:
        return jsonify({'error': 'Username already taken.'}), 409

    student_id = None
    if role == 'student':
        count = db.query(User).filter_by(role='student').count()
        student_id = f'MV-STU-{100 + count + 1}'

    user = User(
        username=username,
        display_name=display_name,
        role=role,
        student_id=student_id,
        grade_level=data.get('grade_level', 'Primary')
    )
    user.set_password(password)
    db.add(user)
    db.flush()

    if role == 'student':
        profile = StudentProfile(user_id=user.id)
        db.add(profile)

    db.commit()

    # Mirror registered student to MongoDB Atlas if enabled
    from backend.services import mongo_service
    mongo_user_data = user.to_dict()
    mongo_user_data['password_hash'] = user.password_hash
    mongo_id = mongo_service.save_user(mongo_user_data)

    session['user_id'] = user.id
    session['role'] = user.role
    session['display_name'] = user.display_name

    return jsonify({
        'message': 'Registration successful.',
        'user': user.to_dict(),
        'mongo_synced': mongo_id is not None
    }), 201

@auth_bp.route('/api/auth/login', methods=['POST'])
def login():
    data = request.get_json() or {}
    username = data.get('username', '').strip().lower()
    password = data.get('password', '').strip()

    if not username or not password:
        return jsonify({'error': 'Username and password are required.'}), 400

    db = get_db()
    user = db.query(User).filter_by(username=username).first()

    # If user not found in local SQL DB, check MongoDB Atlas and restore
    if not user:
        from backend.services import mongo_service
        mongo_users = mongo_service.get_users({'username': username})
        if mongo_users:
            m_user = mongo_users[0]
            user = User(
                username=m_user['username'],
                display_name=m_user.get('display_name', m_user['username']),
                role=m_user.get('role', 'student'),
                student_id=m_user.get('student_id'),
                grade_level=m_user.get('grade_level', 'Primary')
            )
            user.password_hash = m_user.get('password_hash')
            db.add(user)
            db.commit()
            if user.role == 'student':
                db.add(StudentProfile(user_id=user.id))
                db.commit()

    if not user or not user.check_password(password):
        return jsonify({'error': 'Invalid username or password.'}), 401

    if not user.is_active:
        return jsonify({'error': 'Account is deactivated. Please contact administration.'}), 403

    session['user_id'] = user.id
    session['role'] = user.role
    session['display_name'] = user.display_name

    profile_data = user.student_profile.to_dict() if user.student_profile else {}

    return jsonify({
        'message': 'Login successful.',
        'user': user.to_dict(),
        'profile': profile_data
    })

@auth_bp.route('/api/auth/demo-login', methods=['POST'])
def demo_login():
    data = request.get_json() or {}
    role = data.get('role', 'student').lower()

    db = get_db()
    role_map = {
        'student': 'aarav',
        'teacher': 'teacher',
        'caregiver': 'caregiver',
        'admin': 'admin'
    }
    target_username = role_map.get(role, 'aarav')
    user = db.query(User).filter_by(username=target_username).first()

    if not user:
        return jsonify({'error': f"Demo user for role '{role}' not found."}), 404

    session['user_id'] = user.id
    session['role'] = user.role
    session['display_name'] = user.display_name

    profile_data = user.student_profile.to_dict() if user.student_profile else {}

    return jsonify({
        'message': f'Logged in as demo {role}.',
        'user': user.to_dict(),
        'profile': profile_data
    })

@auth_bp.route('/api/auth/logout', methods=['POST'])
def logout():
    session.clear()
    return jsonify({'message': 'Logged out successfully.'})

@auth_bp.route('/api/auth/me', methods=['GET'])
def get_current_user():
    user_id = session.get('user_id')
    if not user_id:
        return jsonify({'user': None, 'logged_in': False})

    db = get_db()
    user = db.query(User).filter_by(id=user_id).first()
    if not user:
        session.clear()
        return jsonify({'user': None, 'logged_in': False})

    profile_data = user.student_profile.to_dict() if user.student_profile else {}

    return jsonify({
        'user': user.to_dict(),
        'profile': profile_data,
        'logged_in': True
    })

@auth_bp.route('/api/auth/preferences', methods=['GET', 'POST'])
def preferences():
    user_id = session.get('user_id')
    db = get_db()

    user = None
    if user_id:
        user = db.query(User).filter_by(id=user_id).first()

    if request.method == 'POST':
        data = request.get_json() or {}
        if user and user.student_profile:
            profile = user.student_profile
            profile.text_size = data.get('text_size', profile.text_size)
            profile.high_contrast = bool(data.get('high_contrast', profile.high_contrast))
            profile.dyslexia_font = bool(data.get('dyslexia_font', profile.dyslexia_font))
            profile.audio_narration = bool(data.get('audio_narration', profile.audio_narration))
            profile.speech_rate = float(data.get('speech_rate', profile.speech_rate))
            profile.reduced_motion = bool(data.get('reduced_motion', profile.reduced_motion))
            profile.sensory_calm = bool(data.get('sensory_calm', profile.sensory_calm))
            db.commit()
            return jsonify({'message': 'Preferences saved.', 'profile': profile.to_dict()})
        return jsonify({'message': 'Client preferences noted.', 'data': data})

    # GET
    if user and user.student_profile:
        return jsonify({'profile': user.student_profile.to_dict()})
    return jsonify({
        'profile': {
            'text_size': 'normal',
            'high_contrast': False,
            'dyslexia_font': False,
            'audio_narration': True,
            'speech_rate': 1.0,
            'reduced_motion': False,
            'sensory_calm': False
        }
    })
