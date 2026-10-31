import os
import json
from datetime import datetime
from sqlalchemy import Column, Integer, String, Text, Float, Boolean, DateTime, ForeignKey
from sqlalchemy.orm import declarative_base, relationship
from werkzeug.security import generate_password_hash, check_password_hash

Base = declarative_base()

class User(Base):
    __tablename__ = 'users'

    id = Column(Integer, primary_key=True)
    username = Column(String(80), unique=True, nullable=False, index=True)
    display_name = Column(String(120), nullable=False)
    password_hash = Column(String(255), nullable=False)
    role = Column(String(20), nullable=False, default='student')  # student, teacher, caregiver, admin
    student_id = Column(String(40), unique=True, nullable=True, index=True)
    assigned_teacher_id = Column(Integer, ForeignKey('users.id'), nullable=True)
    grade_level = Column(String(30), default='Inclusive Primary')
    created_at = Column(DateTime, default=datetime.utcnow)
    is_active = Column(Boolean, default=True)

    student_profile = relationship('StudentProfile', back_populates='user', uselist=False, cascade='all, delete-orphan')
    progress_records = relationship('LessonProgress', back_populates='student', cascade='all, delete-orphan')
    assessment_attempts = relationship('AssessmentAttempt', back_populates='student', cascade='all, delete-orphan')
    game_results = relationship('GameResult', back_populates='student', cascade='all, delete-orphan')
    assignments = relationship('TeacherAssignment', foreign_keys='TeacherAssignment.student_id', back_populates='student', cascade='all, delete-orphan')
    feedback_received = relationship('TeacherFeedback', foreign_keys='TeacherFeedback.student_id', back_populates='student', cascade='all, delete-orphan')
    
    activities = relationship('StudentActivity', foreign_keys='StudentActivity.student_id', back_populates='student', cascade='all, delete-orphan')
    assigned_activities = relationship('StudentActivity', foreign_keys='StudentActivity.assigned_by_id', back_populates='assigned_by')
    reviewed_activities = relationship('StudentActivity', foreign_keys='StudentActivity.reviewed_by_id', back_populates='reviewed_by')

    def set_password(self, password):
        self.password_hash = generate_password_hash(password)

    def check_password(self, password):
        return check_password_hash(self.password_hash, password)

    def to_dict(self):
        return {
            'id': self.id,
            'username': self.username,
            'display_name': self.display_name,
            'role': self.role,
            'student_id': self.student_id,
            'grade_level': self.grade_level,
            'assigned_teacher_id': self.assigned_teacher_id,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }

class StudentProfile(Base):
    __tablename__ = 'student_profiles'

    id = Column(Integer, primary_key=True)
    user_id = Column(Integer, ForeignKey('users.id'), unique=True, nullable=False)
    text_size = Column(String(20), default='normal')  # small, normal, large, xlarge
    high_contrast = Column(Boolean, default=False)
    dyslexia_font = Column(Boolean, default=False)
    audio_narration = Column(Boolean, default=True)
    speech_rate = Column(Float, default=1.0)
    reduced_motion = Column(Boolean, default=False)
    sensory_calm = Column(Boolean, default=False)
    favorite_subject = Column(String(60), default='Alphabet')
    learning_pace = Column(String(30), default='gentle')
    notes = Column(Text, default='')

    user = relationship('User', back_populates='student_profile')

    def to_dict(self):
        return {
            'text_size': self.text_size,
            'high_contrast': self.high_contrast,
            'dyslexia_font': self.dyslexia_font,
            'audio_narration': self.audio_narration,
            'speech_rate': self.speech_rate,
            'reduced_motion': self.reduced_motion,
            'sensory_calm': self.sensory_calm,
            'favorite_subject': self.favorite_subject,
            'learning_pace': self.learning_pace,
            'notes': self.notes
        }

class Lesson(Base):
    __tablename__ = 'lessons'

    id = Column(Integer, primary_key=True)
    slug = Column(String(100), unique=True, nullable=False, index=True)
    subject = Column(String(60), nullable=False, index=True)
    language = Column(String(30), default='en')
    difficulty = Column(String(20), default='easy')
    title = Column(String(150), nullable=False)
    description = Column(Text, default='')
    content_json = Column(Text, default='{}')
    media_url = Column(String(255), default='')
    is_published = Column(Boolean, default=True)
    order_index = Column(Integer, default=0)

    def to_dict(self):
        return {
            'id': self.id,
            'slug': self.slug,
            'subject': self.subject,
            'language': self.language,
            'difficulty': self.difficulty,
            'title': self.title,
            'description': self.description,
            'media_url': self.media_url,
            'order_index': self.order_index
        }

class LessonProgress(Base):
    __tablename__ = 'lesson_progress'

    id = Column(Integer, primary_key=True)
    student_id = Column(Integer, ForeignKey('users.id'), nullable=False, index=True)
    lesson_id = Column(Integer, ForeignKey('lessons.id'), nullable=False, index=True)
    status = Column(String(20), default='started')  # started, in_progress, completed
    attempts = Column(Integer, default=1)
    score = Column(Float, default=100.0)
    time_spent_seconds = Column(Integer, default=0)
    last_accessed = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    completed_at = Column(DateTime, nullable=True)

    student = relationship('User', back_populates='progress_records')
    lesson = relationship('Lesson')

    def to_dict(self):
        return {
            'id': self.id,
            'lesson_id': self.lesson_id,
            'lesson_title': self.lesson.title if self.lesson else 'Lesson',
            'subject': self.lesson.subject if self.lesson else 'Subject',
            'status': self.status,
            'attempts': self.attempts,
            'score': self.score,
            'time_spent_seconds': self.time_spent_seconds,
            'last_accessed': self.last_accessed.isoformat() if self.last_accessed else None,
            'completed_at': self.completed_at.isoformat() if self.completed_at else None
        }

class AssessmentAttempt(Base):
    __tablename__ = 'assessment_attempts'

    id = Column(Integer, primary_key=True)
    student_id = Column(Integer, ForeignKey('users.id'), nullable=False, index=True)
    subject = Column(String(60), nullable=False)
    quiz_name = Column(String(120), nullable=False)
    total_questions = Column(Integer, default=0)
    correct_count = Column(Integer, default=0)
    score_percentage = Column(Float, default=0.0)
    answers_json = Column(Text, default='[]')
    attempted_at = Column(DateTime, default=datetime.utcnow)

    student = relationship('User', back_populates='assessment_attempts')

    def to_dict(self):
        return {
            'id': self.id,
            'subject': self.subject,
            'quiz_name': self.quiz_name,
            'total_questions': self.total_questions,
            'correct_count': self.correct_count,
            'score_percentage': round(self.score_percentage, 1),
            'attempted_at': self.attempted_at.isoformat() if self.attempted_at else None
        }

class GameResult(Base):
    __tablename__ = 'game_results'

    id = Column(Integer, primary_key=True)
    student_id = Column(Integer, ForeignKey('users.id'), nullable=False, index=True)
    game_id = Column(String(60), nullable=False, index=True)
    game_name = Column(String(100), nullable=False)
    difficulty = Column(String(20), default='easy')
    score = Column(Integer, default=0)
    stars = Column(Integer, default=3)
    time_spent_seconds = Column(Integer, default=0)
    completed = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    student = relationship('User', back_populates='game_results')

    def to_dict(self):
        return {
            'id': self.id,
            'game_id': self.game_id,
            'game_name': self.game_name,
            'difficulty': self.difficulty,
            'score': self.score,
            'stars': self.stars,
            'time_spent_seconds': self.time_spent_seconds,
            'completed': self.completed,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }

class TeacherAssignment(Base):
    __tablename__ = 'teacher_assignments'

    id = Column(Integer, primary_key=True)
    teacher_id = Column(Integer, ForeignKey('users.id'), nullable=False)
    student_id = Column(Integer, ForeignKey('users.id'), nullable=False, index=True)
    lesson_id = Column(Integer, ForeignKey('lessons.id'), nullable=False)
    instructions = Column(Text, default='')
    status = Column(String(20), default='assigned')  # assigned, completed
    created_at = Column(DateTime, default=datetime.utcnow)

    teacher = relationship('User', foreign_keys=[teacher_id])
    student = relationship('User', foreign_keys=[student_id], back_populates='assignments')
    lesson = relationship('Lesson')

    def to_dict(self):
        return {
            'id': self.id,
            'lesson_id': self.lesson_id,
            'lesson_title': self.lesson.title if self.lesson else 'Lesson',
            'subject': self.lesson.subject if self.lesson else 'Subject',
            'instructions': self.instructions,
            'status': self.status,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }

class TeacherFeedback(Base):
    __tablename__ = 'teacher_feedback'

    id = Column(Integer, primary_key=True)
    teacher_id = Column(Integer, ForeignKey('users.id'), nullable=False)
    student_id = Column(Integer, ForeignKey('users.id'), nullable=False, index=True)
    lesson_id = Column(Integer, ForeignKey('lessons.id'), nullable=True)
    feedback_text = Column(Text, nullable=False)
    badge = Column(String(50), default='Star Learner')
    created_at = Column(DateTime, default=datetime.utcnow)

    teacher = relationship('User', foreign_keys=[teacher_id])
    student = relationship('User', foreign_keys=[student_id], back_populates='feedback_received')
    lesson = relationship('Lesson')

    def to_dict(self):
        return {
            'id': self.id,
            'teacher_name': self.teacher.display_name if self.teacher else 'Teacher',
            'feedback_text': self.feedback_text,
            'badge': self.badge,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }

class Video(Base):
    __tablename__ = 'videos'

    id = Column(Integer, primary_key=True)
    video_id = Column(String(50), unique=True, nullable=False, index=True)
    original_url = Column(String(255), nullable=False)
    video_type = Column(String(20), default='standard')  # 'standard', 'short'
    title = Column(String(255), nullable=False)
    description = Column(Text, default='')
    language = Column(String(50), default='en')
    subject = Column(String(100), default='Unassigned')
    topic = Column(String(100), default='General')
    intended_level = Column(String(100), default='Early Primary')
    thumbnail_url = Column(String(255), default='')
    caption_available = Column(Boolean, default=False)
    transcript_available = Column(Boolean, default=False)
    transcript_text = Column(Text, nullable=True)
    review_status = Column(String(30), default='pending_review')  # 'approved', 'pending_review', 'rejected'
    state = Column(String(30), default='active')  # 'active', 'restricted', 'unavailable'
    questions_json = Column(Text, default='[]')
    created_at = Column(DateTime, default=datetime.utcnow)

    def to_dict(self):
        questions = []
        try:
            questions = json.loads(self.questions_json) if self.questions_json else []
        except Exception:
            questions = []
        return {
            'id': self.id,
            'video_id': self.video_id,
            'original_url': self.original_url,
            'video_type': self.video_type,
            'title': self.title,
            'description': self.description,
            'language': self.language,
            'subject': self.subject,
            'topic': self.topic,
            'intended_level': self.intended_level,
            'thumbnail_url': self.thumbnail_url or f"https://img.youtube.com/vi/{self.video_id}/hqdefault.jpg",
            'caption_available': self.caption_available,
            'transcript_available': self.transcript_available,
            'transcript_text': self.transcript_text,
            'review_status': self.review_status,
            'state': self.state,
            'embed_url': f"https://www.youtube-nocookie.com/embed/{self.video_id}?enablejsapi=1&rel=0",
            'questions': questions,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }

class StudentActivity(Base):
    __tablename__ = 'student_activities'

    id = Column(Integer, primary_key=True)
    student_id = Column(Integer, ForeignKey('users.id'), nullable=False, index=True)
    assigned_by_id = Column(Integer, ForeignKey('users.id'), nullable=True)
    activity_type = Column(String(50), nullable=False)  # 'video_activity', 'quiz', 'lesson', 'practice', 'game'
    title = Column(String(200), nullable=False)
    subject = Column(String(80), default='general')
    reference_id = Column(String(100), nullable=True)  # video_id, lesson slug, quiz subject
    instructions = Column(Text, default='')
    status = Column(String(30), default='assigned', index=True)
    # 'assigned', 'in_progress', 'submitted', 'awaiting_review', 'reviewed', 'approved', 'needs_more_practice'
    assigned_date = Column(DateTime, default=datetime.utcnow)
    submitted_date = Column(DateTime, nullable=True)
    submission_data = Column(Text, default='{}')  # JSON: { answers: [], notes: "", time_spent_seconds: 0 }
    score = Column(Float, nullable=True)
    max_score = Column(Float, default=100.0)
    attempts = Column(Integer, default=1)
    requires_teacher_review = Column(Boolean, default=True)
    teacher_feedback = Column(Text, default='')
    review_decision = Column(String(40), nullable=True)  # 'approved', 'needs_more_practice', 'returned_for_revision'
    review_date = Column(DateTime, nullable=True)
    reviewed_by_id = Column(Integer, ForeignKey('users.id'), nullable=True)
    last_activity_time = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    student = relationship('User', foreign_keys=[student_id], back_populates='activities')
    assigned_by = relationship('User', foreign_keys=[assigned_by_id], back_populates='assigned_activities')
    reviewed_by = relationship('User', foreign_keys=[reviewed_by_id], back_populates='reviewed_activities')

    def to_dict(self):
        sub_data = {}
        try:
            sub_data = json.loads(self.submission_data) if self.submission_data else {}
        except Exception:
            sub_data = {}
        return {
            'id': self.id,
            'student_id': self.student_id,
            'student_name': self.student.display_name if self.student else f'Student #{self.student_id}',
            'student_code': self.student.student_id if self.student else None,
            'assigned_by_id': self.assigned_by_id,
            'assigned_by_name': self.assigned_by.display_name if self.assigned_by else 'Educator',
            'activity_type': self.activity_type,
            'title': self.title,
            'subject': self.subject,
            'reference_id': self.reference_id,
            'instructions': self.instructions,
            'status': self.status,
            'assigned_date': self.assigned_date.isoformat() if self.assigned_date else None,
            'submitted_date': self.submitted_date.isoformat() if self.submitted_date else None,
            'submission_data': sub_data,
            'score': round(self.score, 1) if self.score is not None else None,
            'max_score': self.max_score,
            'attempts': self.attempts,
            'requires_teacher_review': self.requires_teacher_review,
            'teacher_feedback': self.teacher_feedback,
            'review_decision': self.review_decision,
            'review_date': self.review_date.isoformat() if self.review_date else None,
            'reviewed_by_name': self.reviewed_by.display_name if self.reviewed_by else None,
            'last_activity_time': self.last_activity_time.isoformat() if self.last_activity_time else None
        }


class PlatformFeedback(Base):
    __tablename__ = 'platform_feedback'

    id = Column(Integer, primary_key=True)
    user_id = Column(Integer, ForeignKey('users.id'), nullable=True)
    user_name = Column(String(120), default='Curious Learner')
    role = Column(String(30), default='visitor')  # student, teacher, caregiver, visitor
    category = Column(String(80), default='General Suggestion')
    # e.g. 'Curriculum & Lessons', 'Sound & Teacher Voice', '3D Classroom & Visuals', 'Games & Quizzes', 'General Ideas'
    what_to_change = Column(Text, nullable=False)
    rating = Column(Integer, default=5)  # 1 to 5 stars
    email = Column(String(150), nullable=True)
    status = Column(String(30), default='received')  # received, reviewed, planned, implemented
    created_at = Column(DateTime, default=datetime.utcnow)

    user = relationship('User', foreign_keys=[user_id])

    def to_dict(self):
        return {
            'id': self.id,
            'user_id': self.user_id,
            'user_name': self.user_name,
            'role': self.role,
            'category': self.category,
            'feedback': self.what_to_change,
            'what_to_change': self.what_to_change,
            'rating': self.rating,
            'email': self.email,
            'status': self.status,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }
