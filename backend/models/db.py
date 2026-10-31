import os
import json
from datetime import datetime
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, scoped_session
from backend.models import (
    Base, User, StudentProfile, Lesson, LessonProgress,
    AssessmentAttempt, GameResult, TeacherAssignment, TeacherFeedback,
    Video, StudentActivity, PlatformFeedback
)

engine = None
db_session = None

def init_db(database_uri):
    global engine, db_session
    engine = create_engine(database_uri, echo=False)
    db_session = scoped_session(sessionmaker(autocommit=False, autoflush=False, bind=engine))
    Base.metadata.create_all(bind=engine)
    seed_database(db_session)
    return db_session

def get_db():
    global db_session
    return db_session

def close_db(e=None):
    global db_session
    if db_session is not None:
        db_session.remove()

def seed_database(session):
    # 1. Seed Core Accounts
    existing_teacher = session.query(User).filter_by(role='teacher').first()
    if not existing_teacher:
        print("[MindVerse Backend] Seeding core accounts...")
        # Teacher account
        teacher = User(
            username='teacher',
            display_name='Ms. Ananya Sharma',
            role='teacher',
            grade_level='Inclusive Special Educator',
            is_active=True
        )
        teacher.set_password('teacher123')
        session.add(teacher)
        session.flush()

        # Student 1: Aarav
        student1 = User(
            username='aarav',
            display_name='Aarav Patel',
            role='student',
            student_id='MV-STU-101',
            assigned_teacher_id=teacher.id,
            grade_level='Primary Grade 2',
            is_active=True
        )
        student1.set_password('student123')
        session.add(student1)
        session.flush()

        profile1 = StudentProfile(
            user_id=student1.id,
            text_size='large',
            high_contrast=False,
            dyslexia_font=False,
            audio_narration=True,
            speech_rate=0.9,
            reduced_motion=False,
            sensory_calm=False,
            favorite_subject='English Alphabet',
            learning_pace='gentle',
            notes='Enjoys 3D animations and audio pronunciation with picture matching.'
        )
        session.add(profile1)

        # Student 2: Diya
        student2 = User(
            username='diya',
            display_name='Diya Rao',
            role='student',
            student_id='MV-STU-102',
            assigned_teacher_id=teacher.id,
            grade_level='Primary Grade 1',
            is_active=True
        )
        student2.set_password('student123')
        session.add(student2)
        session.flush()

        profile2 = StudentProfile(
            user_id=student2.id,
            text_size='normal',
            high_contrast=False,
            dyslexia_font=True,
            audio_narration=True,
            speech_rate=1.0,
            reduced_motion=True,
            sensory_calm=True,
            favorite_subject='Mathematics',
            learning_pace='moderate',
            notes='Benefits from dyslexia-friendly font and untimed practice.'
        )
        session.add(profile2)

        # Caregiver
        caregiver = User(
            username='caregiver',
            display_name='Priya Patel (Parent)',
            role='caregiver',
            is_active=True
        )
        caregiver.set_password('parent123')
        session.add(caregiver)

        # Administrator
        admin = User(
            username='admin',
            display_name='System Administrator',
            role='admin',
            grade_level='Platform Admin',
            is_active=True
        )
        admin.set_password('admin123')
        session.add(admin)

        # Core Lessons
        core_lessons = [
            {'slug': 'english-alphabet', 'subject': 'english', 'title': 'English Alphabet A to Z', 'desc': 'Learn letters with phonetic sounds, picture vocabulary, and interactive matching.', 'difficulty': 'easy', 'order': 1},
            {'slug': 'kannada-varnamala', 'subject': 'kannada', 'title': 'Kannada Varnamala & Kagunita', 'desc': 'Learn Kannada vowels (ಸ್ವರಗಳು), consonants (ವ್ಯಂಜನಗಳು), and combinations (ಕಾಗುಣಿತ).', 'difficulty': 'easy', 'order': 2},
            {'slug': 'hindi-varnamala', 'subject': 'hindi', 'title': 'Hindi Varnamala & Matra Learning', 'desc': 'Explore Hindi vowels (स्वर), consonants (व्यंजन), and matra combinations with audio.', 'difficulty': 'easy', 'order': 3},
            {'slug': 'numbers-math', 'subject': 'math', 'title': 'Mathematics & Numbers Lab', 'desc': 'Count visual objects, learn numbers 0-100, addition, shapes, and place value.', 'difficulty': 'easy', 'order': 4},
            {'slug': 'multiplication-tables', 'subject': 'math', 'title': 'Multiplication Tables 1 to 20', 'desc': 'Interactive tables from 1 to 20 with equations, audio, and missing-number exercises.', 'difficulty': 'medium', 'order': 5},
            {'slug': 'traffic-safety', 'subject': 'traffic', 'title': 'Traffic Rules & Road Safety', 'desc': 'Learn zebra crossings, traffic signals, seat belts, and walking safely.', 'difficulty': 'easy', 'order': 6},
            {'slug': 'emotions-feelings', 'subject': 'emotions', 'title': 'Facial Expressions & Emotions', 'desc': 'Understand feelings with friendly character expressions and respectful communication.', 'difficulty': 'easy', 'order': 7},
            {'slug': 'human-body', 'subject': 'body', 'title': 'Human Body & Health Habits', 'desc': 'Learn body parts, healthy daily habits, and personal boundary safety.', 'difficulty': 'easy', 'order': 8},
            {'slug': 'stories-rhymes', 'subject': 'stories', 'title': 'Short Rhymes & Reading Stories', 'desc': 'Listen to animated stories with synchronized sentence highlighting and comprehension questions.', 'difficulty': 'easy', 'order': 9}
        ]

        for item in core_lessons:
            lesson = Lesson(
                slug=item['slug'],
                subject=item['subject'],
                title=item['title'],
                description=item['desc'],
                difficulty=item['difficulty'],
                order_index=item['order'],
                is_published=True
            )
            session.add(lesson)

        session.flush()

        # Seed Sample Progress for Aarav
        l1 = session.query(Lesson).filter_by(slug='english-alphabet').first()
        if l1:
            prog = LessonProgress(
                student_id=student1.id,
                lesson_id=l1.id,
                status='completed',
                attempts=1,
                score=100.0,
                time_spent_seconds=240,
                completed_at=datetime.utcnow()
            )
            session.add(prog)

            assignment = TeacherAssignment(
                teacher_id=teacher.id,
                student_id=student1.id,
                lesson_id=l1.id,
                instructions='Practice letters A through G with picture matching today.',
                status='completed'
            )
            session.add(assignment)

        # Feedback
        feedback = TeacherFeedback(
            teacher_id=teacher.id,
            student_id=student1.id,
            feedback_text='Excellent work identifying letters A to Z! Your pronunciation was clear and enthusiastic.',
            badge='Super Star'
        )
        session.add(feedback)

        # Initial Game Result
        game_res = GameResult(
            student_id=student1.id,
            game_id='matching',
            game_name='Picture and Word Match',
            difficulty='easy',
            score=150,
            stars=3,
            time_spent_seconds=75,
            completed=True
        )
        session.add(game_res)
        session.commit()

    # 2. Ensure Admin account exists
    admin_user = session.query(User).filter_by(role='admin').first()
    if not admin_user:
        admin = User(
            username='admin',
            display_name='System Administrator',
            role='admin',
            grade_level='Platform Admin',
            is_active=True
        )
        admin.set_password('admin123')
        session.add(admin)
        session.commit()

    # 3. Seed Video Library (39 Videos)
    existing_video_count = session.query(Video).count()
    if existing_video_count < 39:
        print("[MindVerse Backend] Seeding YouTube learning video library...")
        data_path = os.path.join(os.path.dirname(__file__), '..', 'data', 'videos.json')
        if os.path.exists(data_path):
            with open(data_path, 'r', encoding='utf-8') as f:
                videos_data = json.load(f)
                for v in videos_data:
                    vid = session.query(Video).filter_by(video_id=v['video_id']).first()
                    if not vid:
                        vid = Video(
                            video_id=v['video_id'],
                            original_url=v['original_url'],
                            video_type=v.get('video_type', 'standard'),
                            title=v.get('title', 'Educational Video'),
                            description=v.get('description', ''),
                            language=v.get('language', 'en'),
                            subject=v.get('subject', 'Unassigned'),
                            topic=v.get('topic', 'General'),
                            intended_level=v.get('intended_level', 'Early Primary'),
                            thumbnail_url=v.get('thumbnail_url', f"https://img.youtube.com/vi/{v['video_id']}/hqdefault.jpg"),
                            caption_available=v.get('caption_available', False),
                            transcript_available=v.get('transcript_available', False),
                            transcript_text=v.get('transcript_text', None),
                            review_status=v.get('review_status', 'pending_review'),
                            state=v.get('state', 'active'),
                            questions_json=json.dumps(v.get('questions', []))
                        )
                        session.add(vid)
                session.commit()

    # 4. Seed Structured Student Activities (Part 17 & 18 Verification Workflow)
    existing_act = session.query(StudentActivity).first()
    if not existing_act:
        print("[MindVerse Backend] Seeding initial student activity workflows...")
        teacher = session.query(User).filter_by(role='teacher').first()
        student1 = session.query(User).filter_by(username='aarav').first()
        student2 = session.query(User).filter_by(username='diya').first()

        if teacher and student1:
            # 1. Assigned Video Activity (Student needs to complete)
            act1 = StudentActivity(
                student_id=student1.id,
                assigned_by_id=teacher.id,
                activity_type='video_activity',
                title='Good & Bad Habits Video Activity',
                subject='Life Skills & Hygiene',
                reference_id='wjPEvWwwyVM',
                instructions='Watch the video on daily healthy habits and answer the 2 check-in questions.',
                status='assigned',
                requires_teacher_review=True
            )
            session.add(act1)

            # 2. Submitted Activity (In teacher review queue)
            sub_answers = [
                {'id': 'q1', 'question': 'What is the Hindi name for Peacock?', 'selected_answer': 'मोर (Mor)', 'is_correct': True},
                {'id': 'q2', 'question': 'What is the Hindi name for Parrot?', 'selected_answer': 'तोता (Tota)', 'is_correct': True}
            ]
            act2 = StudentActivity(
                student_id=student1.id,
                assigned_by_id=teacher.id,
                activity_type='video_activity',
                title='Bird Names in English & Hindi Comprehension',
                subject='Languages & Science',
                reference_id='E5M60kXHsWM',
                instructions='Identify bird names in both English and Hindi.',
                status='awaiting_review',
                submitted_date=datetime.utcnow(),
                submission_data=json.dumps({'answers': sub_answers, 'reflection': 'Learned that peacock is Mor and parrot is Tota in Hindi!'}),
                score=100.0,
                max_score=100.0,
                attempts=1,
                requires_teacher_review=True
            )
            session.add(act2)

            # 3. Approved Activity (Fully reviewed by teacher)
            act3 = StudentActivity(
                student_id=student1.id,
                assigned_by_id=teacher.id,
                activity_type='lesson',
                title='English Alphabet A-Z Phonics Mastery',
                subject='english',
                reference_id='english-alphabet',
                instructions='Master all 26 letters with phonetic sounds.',
                status='approved',
                submitted_date=datetime.utcnow(),
                submission_data=json.dumps({'completed': True, 'score': 100.0}),
                score=100.0,
                max_score=100.0,
                attempts=1,
                requires_teacher_review=True,
                teacher_feedback='Fantastic work pronouncing vowels and consonants! Kept high enthusiasm.',
                review_decision='approved',
                review_date=datetime.utcnow(),
                reviewed_by_id=teacher.id
            )
            session.add(act3)

        if teacher and student2:
            # 4. Activity requiring more practice
            act4 = StudentActivity(
                student_id=student2.id,
                assigned_by_id=teacher.id,
                activity_type='video_activity',
                title='Types of Geometric Angles Practice',
                subject='Mathematics & Geometry',
                reference_id='2a8SZORjhDI',
                instructions='Review acute, right, and obtuse angles.',
                status='needs_more_practice',
                submitted_date=datetime.utcnow(),
                submission_data=json.dumps({'answers': [{'id': 'q1', 'selected_answer': 'Less than 45 degrees', 'is_correct': False}]}),
                score=50.0,
                max_score=100.0,
                attempts=2,
                requires_teacher_review=True,
                teacher_feedback='Remember: a right angle is exactly 90 degrees like a book corner. Let us review together tomorrow!',
                review_decision='needs_more_practice',
                review_date=datetime.utcnow(),
                reviewed_by_id=teacher.id
            )
            session.add(act4)

        if teacher and student1:
            # 5. Working Place & Student Desk Reflection (Station 16 - In teacher review queue)
            act5 = StudentActivity(
                student_id=student1.id,
                assigned_by_id=teacher.id,
                activity_type='practice',
                title='Working Places & Community Helpers Desk Reflection',
                subject='Life Skills & Working Places',
                reference_id='workplace_desk',
                instructions='Explore community working places and write a reflection on how doctors, firefighters, and teachers help our neighborhood.',
                status='awaiting_review',
                submitted_date=datetime.utcnow(),
                submission_data=json.dumps({
                    'answers': [
                        {'question_text': 'Where does a doctor work and what tools do they use?', 'selected_answer': 'Hospital, with stethoscope, thermometer, and medicine', 'is_correct': True},
                        {'question_text': 'Where does a firefighter work and what equipment is used?', 'selected_answer': 'Fire Station, with fire engine, water hose, and safety ladder', 'is_correct': True}
                    ],
                    'reflection': 'I learned doctors heal sick people in hospitals, and firefighters rescue people from fires using ladders and hoses. At school, teachers help us learn!',
                    'time_spent_seconds': 240
                }),
                score=100.0,
                max_score=100.0,
                attempts=1,
                requires_teacher_review=True
            )
            session.add(act5)

        if teacher and student2:
            # 6. Working Places "Where Is My Working Place?" Quiz
            act6 = StudentActivity(
                student_id=student2.id,
                assigned_by_id=teacher.id,
                activity_type='quiz',
                title='"Where Is My Working Place?" Quiz',
                subject='Life Skills & Working Places',
                reference_id='workplace_quiz',
                instructions='Match community helpers to their correct working place.',
                status='awaiting_review',
                submitted_date=datetime.utcnow(),
                submission_data=json.dumps({
                    'answers': [
                        {'question_text': 'Who works in a bakery baking fresh bread and pastries?', 'selected_answer': 'Baker', 'is_correct': True},
                        {'question_text': 'Where do astronauts and scientists float and conduct microgravity experiments?', 'selected_answer': 'Space Station', 'is_correct': True},
                        {'question_text': 'Who works on a farm caring for animals and harvesting crops?', 'selected_answer': 'Farmer', 'is_correct': True}
                    ],
                    'reflection': 'Scored 100% on the Working Places interactive challenge!'
                }),
                score=100.0,
                max_score=100.0,
                attempts=1,
                requires_teacher_review=True
            )
            session.add(act6)

        session.commit()

    # 4. Seed Platform Feedback & Change Requests
    existing_feedback = session.query(PlatformFeedback).first()
    if not existing_feedback:
        print("[MindVerse Backend] Seeding sample feedback & improvement requests...")
        f1 = PlatformFeedback(
            user_name='Rahul (Grade 2 Student)',
            role='student',
            category='Teaching Sound & Voice Narration',
            what_to_change='Can we make the teacher speak a little bit slower when pronouncing difficult words in the solar system lesson?',
            rating=5,
            email='rahul.family@example.com',
            status='reviewed'
        )
        f2 = PlatformFeedback(
            user_name='Priya Sen (Caregiver)',
            role='caregiver',
            category='Curriculum & Lessons',
            what_to_change='Please add more interactive animal sound quizzes and gentle nature video activities for primary learners.',
            rating=5,
            email='priya.sen@example.com',
            status='planned'
        )
        session.add(f1)
        session.add(f2)
        session.commit()

    print("[MindVerse Backend] Database initialization complete.")
