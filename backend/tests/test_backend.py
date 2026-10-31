import pytest
import os
import json
from backend.app import create_app
from backend.config import Config

class TestConfig(Config):
    TESTING = True
    SQLALCHEMY_DATABASE_URI = 'sqlite:///:memory:'
    SECRET_KEY = 'test-secret-key'

@pytest.fixture
def client():
    app = create_app(TestConfig)
    with app.test_client() as client:
        with app.app_context():
            yield client

def test_health(client):
    res = client.get('/api/health')
    assert res.status_code == 200
    data = res.get_json()
    assert data['status'] == 'healthy'
    assert 'MindVerse' in data['platform']

def test_demo_logins(client):
    for role in ['student', 'teacher', 'caregiver']:
        res = client.post('/api/auth/demo-login', json={'role': role})
        assert res.status_code == 200
        data = res.get_json()
        assert data['user']['role'] == role
        assert 'display_name' in data['user']

def test_register_and_login(client):
    # Register new student
    reg_data = {
        'username': 'test_student_1',
        'password': 'Password123!',
        'display_name': 'Test Student',
        'role': 'student',
        'grade_level': 'Primary'
    }
    reg_res = client.post('/api/auth/register', json=reg_data)
    assert reg_res.status_code == 201
    user = reg_res.get_json()['user']
    assert user['username'] == 'test_student_1'

    # Login
    login_res = client.post('/api/auth/login', json={
        'username': 'test_student_1',
        'password': 'Password123!'
    })
    assert login_res.status_code == 200
    assert login_res.get_json()['user']['display_name'] == 'Test Student'

def test_curriculum_endpoints(client):
    # English Alphabet
    eng_res = client.get('/api/curriculum/english')
    assert eng_res.status_code == 200
    eng_data = eng_res.get_json()
    assert isinstance(eng_data, list)
    assert len(eng_data) >= 26

    # Single letter lookup
    letter_a = client.get('/api/curriculum/english?letter=A')
    assert letter_a.status_code == 200
    assert letter_a.get_json()['letter'] == 'A'

    # Kannada
    kan_res = client.get('/api/curriculum/kannada')
    assert kan_res.status_code == 200
    assert 'vowels' in kan_res.get_json()

    # Hindi
    hin_res = client.get('/api/curriculum/hindi')
    assert hin_res.status_code == 200
    assert 'vowels' in hin_res.get_json()

    # Math
    math_res = client.get('/api/curriculum/math')
    assert math_res.status_code == 200

    # Traffic
    traffic_res = client.get('/api/curriculum/traffic')
    assert traffic_res.status_code == 200

    # Emotions
    emotions_res = client.get('/api/curriculum/emotions')
    assert emotions_res.status_code == 200

    # Body Parts
    body_res = client.get('/api/curriculum/body-parts')
    assert body_res.status_code == 200
    assert 'parts' in body_res.get_json()

    # Stories
    stories_res = client.get('/api/curriculum/stories')
    assert stories_res.status_code == 200
    stories_data = stories_res.get_json()
    assert isinstance(stories_data, list)

    # Working Places (Station 16)
    workplace_res = client.get('/api/curriculum/workplaces')
    assert workplace_res.status_code == 200
    wp_data = workplace_res.get_json()
    assert 'modules' in wp_data
    assert len(wp_data['modules']) >= 4
    assert len(stories_data) > 0

def test_multiplication_tables(client):
    res = client.get('/api/curriculum/multiplication/5')
    assert res.status_code == 200
    table = res.get_json()
    assert table['number'] == 5

    bad_res = client.get('/api/curriculum/multiplication/99')
    assert bad_res.status_code == 400

def test_games_endpoints(client):
    res = client.get('/api/games')
    assert res.status_code == 200
    games = res.get_json()['games']
    assert len(games) == 30
    assert games[0]['id'] == 'alphabet_adventure'
    assert games[29]['id'] == 'my_learning_adventure'

    # Demo student login to record game score
    client.post('/api/auth/demo-login', json={'role': 'student'})
    result_res = client.post('/api/games/alphabet_adventure/result', json={
        'score': 100,
        'stars': 3,
        'time_spent_seconds': 45,
        'difficulty': 'easy'
    })
    assert result_res.status_code == 201

def test_progress_and_completion(client):
    # Log in as demo student
    client.post('/api/auth/demo-login', json={'role': 'student'})

    # Get summary
    sum_res = client.get('/api/progress/summary')
    assert sum_res.status_code == 200

    # Complete a lesson
    comp_res = client.post('/api/progress/lesson/complete', json={
        'slug': 'english-alphabet',
        'score': 100.0,
        'time_spent_seconds': 120
    })
    assert comp_res.status_code == 200

    # Submit quiz
    quiz_res = client.post('/api/progress/quiz/submit', json={
        'subject': 'english',
        'quiz_name': 'Alphabet Phonics Test',
        'total_questions': 5,
        'correct_count': 5,
        'answers': []
    })
    assert quiz_res.status_code == 200

    # Recommendations
    recs_res = client.get('/api/progress/recommendations')
    assert recs_res.status_code == 200

def test_teacher_endpoints(client):
    client.post('/api/auth/demo-login', json={'role': 'teacher'})
    res = client.get('/api/teacher/students')
    assert res.status_code == 200
    students = res.get_json()['students']
    assert len(students) >= 1

    s_id = students[0]['id']
    detail_res = client.get(f'/api/teacher/students/{s_id}')
    assert detail_res.status_code == 200

    # Feedback
    fb_res = client.post('/api/teacher/feedback', json={
        'student_id': s_id,
        'feedback_text': 'Great progress today!',
        'badge': 'Star Learner'
    })
    assert fb_res.status_code == 201

def test_caregiver_overview(client):
    res = client.get('/api/caregiver/overview')
    assert res.status_code == 200
    data = res.get_json()
    assert 'student' in data
    assert 'home_activities' in data
    assert len(data['home_activities']) > 0

def test_mindbot_chat(client):
    # Empty message greeting
    greet = client.post('/api/mindbot/chat', json={})
    assert greet.status_code == 200
    assert 'MindBot' in greet.get_json()['reply']

    # Letter query
    letter_q = client.post('/api/mindbot/chat', json={'message': 'what is the letter B'})
    assert letter_q.status_code == 200
    assert 'letter B' in letter_q.get_json()['reply']

    # Kannada query
    kan_q = client.post('/api/mindbot/chat', json={'message': 'tell me about kannada'})
    assert kan_q.status_code == 200
    assert 'Kannada' in kan_q.get_json()['reply']

    # Road safety query
    traffic_q = client.post('/api/mindbot/chat', json={'message': 'what does red light mean'})
    assert traffic_q.status_code == 200

def test_quizzes_endpoint(client):
    # Fetch all 115 questions
    res = client.get('/api/curriculum/quizzes')
    assert res.status_code == 200
    quizzes = res.get_json()
    assert isinstance(quizzes, list)
    assert len(quizzes) == 115

    # Test subject filtering
    expected_counts = {
        'english': 20,
        'kannada': 20,
        'hindi': 20,
        'math': 20,
        'trivia': 5,
        'traffic': 30
    }
    for subj, count in expected_counts.items():
        s_res = client.get(f'/api/curriculum/quizzes?subject={subj}')
        assert s_res.status_code == 200
        items = s_res.get_json()
        assert len(items) == count, f"Subject {subj} expected {count}, got {len(items)}"

def test_frontend_pages_served(client):
    pages = [
        '/',
        '/index.html',
        '/classroom_3d.html',
        '/alphabet.html',
        '/kannada.html',
        '/hindi.html',
        '/math.html',
        '/multiplication.html',
        '/traffic.html',
        '/emotions.html',
        '/stories.html',
        '/body_parts.html',
        '/games.html',
        '/chess.html',
        '/quiz.html',
        '/lessons.html',
        '/login.html',
        '/student_dashboard.html',
        '/teacher_dashboard.html',
        '/caregiver_dashboard.html',
        '/workplace.html',
        '/workspace.html'
    ]
    for page in pages:
        res = client.get(page)
        assert res.status_code == 200, f"Page {page} failed with status {res.status_code}"



def test_video_library_endpoints(client):
    # 1. Total videos count
    res = client.get('/api/videos')
    assert res.status_code == 200
    data = res.get_json()
    assert data['count'] == 39
    assert len(data['videos']) == 39

    # 2. Filter standard videos (26)
    res_std = client.get('/api/videos?type=standard')
    assert res_std.status_code == 200
    assert res_std.get_json()['count'] == 26

    # 3. Filter short videos (13)
    res_short = client.get('/api/videos?type=short')
    assert res_short.status_code == 200
    assert res_short.get_json()['count'] == 13

    # 4. Single video lookup
    vid_res = client.get('/api/videos/wjPEvWwwyVM')
    assert vid_res.status_code == 200
    video = vid_res.get_json()
    assert video['video_id'] == 'wjPEvWwwyVM'
    assert 'Good Habits' in video['title']
    assert len(video['questions']) >= 1

    # 5. Video activity submission & backend validation
    client.post('/api/auth/demo-login', json={'role': 'student'})
    sub_res = client.post('/api/videos/wjPEvWwwyVM/submit-activity', json={
        'answers': [
            {'id': 'q1', 'selected_answer': 'Wash hands with soap and water'},
            {'id': 'q2', 'selected_answer': 'Twice a day (morning and night)'}
        ],
        'reflection': 'I will always wash my hands before eating.',
        'time_spent_seconds': 90
    })
    assert sub_res.status_code == 200
    sub_data = sub_res.get_json()
    assert sub_data['score'] == 100.0
    assert sub_data['correct_count'] == 2

    # 6. Educator review endpoint
    client.post('/api/auth/demo-login', json={'role': 'teacher'})
    rev_res = client.post('/api/videos/B2UQWzufNNg/review', json={
        'review_status': 'approved',
        'subject': 'General Learning',
        'topic': 'Visual Exploration'
    })
    assert rev_res.status_code == 200
    assert rev_res.get_json()['video']['review_status'] == 'approved'

def test_activities_and_verification_workflow(client):
    # 1. Student views activities
    client.post('/api/auth/demo-login', json={'role': 'student'})
    act_res = client.get('/api/activities')
    assert act_res.status_code == 200
    activities = act_res.get_json()['activities']
    assert len(activities) >= 1

    act_id = activities[0]['id']
    start_res = client.post(f'/api/activities/{act_id}/start')
    assert start_res.status_code == 200
    assert start_res.get_json()['activity']['status'] in ['in_progress', 'assigned', 'awaiting_review', 'approved']

    # 2. Teacher assigns new activity
    client.post('/api/auth/demo-login', json={'role': 'teacher'})
    stu_res = client.get('/api/teacher/students')
    student_id = stu_res.get_json()['students'][0]['id']

    assign_res = client.post('/api/activities/assign', json={
        'student_id': student_id,
        'activity_type': 'video_activity',
        'reference_id': 'E5M60kXHsWM',
        'instructions': 'Practice bird names in Hindi and English.',
        'title': 'Bird Names Practice'
    })
    assert assign_res.status_code == 201
    new_act = assign_res.get_json()['activity']
    assert new_act['status'] == 'assigned'

    # 3. Teacher review queue
    queue_res = client.get('/api/teacher/review-queue')
    assert queue_res.status_code == 200
    submissions = queue_res.get_json()['submissions']
    assert len(submissions) >= 1

    # 4. Teacher verification action (approve)
    target_sub_id = submissions[0]['id']
    action_res = client.post(f'/api/teacher/submissions/{target_sub_id}/action', json={
        'action': 'approve',
        'feedback': 'Great effort demonstrated!'
    })
    assert action_res.status_code == 200
    assert action_res.get_json()['activity']['status'] == 'approved'

def test_teacher_dashboard_and_report_card(client):
    client.post('/api/auth/demo-login', json={'role': 'teacher'})
    stats_res = client.get('/api/teacher/stats')
    assert stats_res.status_code == 200
    stats = stats_res.get_json()
    assert 'total_students' in stats
    assert 'completion_rate' in stats
    assert stats['total_students'] >= 1

    stu_res = client.get('/api/teacher/students')
    student_id = stu_res.get_json()['students'][0]['id']

    # Report card for valid student
    rep_res = client.get(f'/api/teacher/students/{student_id}/report')
    assert rep_res.status_code == 200
    report = rep_res.get_json()
    assert 'display_name' in report
    assert 'strengths_summary' in report
    assert 'focus_support_areas' in report
    assert len(report['strengths_summary']) > 0

def test_security_and_videos_html_page(client):
    res = client.get('/videos.html')
    assert res.status_code == 200
    assert 'X-Content-Type-Options' in res.headers
    assert res.headers['X-Content-Type-Options'] == 'nosniff'

def test_platform_feedback_submission_and_retrieval(client):
    # 1. Categories
    cat_res = client.get('/api/feedback/categories')
    assert cat_res.status_code == 200
    assert 'categories' in cat_res.get_json()
    assert len(cat_res.get_json()['categories']) >= 5

    # 2. Submit Feedback on "what to change"
    payload = {
        'what_to_change': 'Please add louder phonics sounds when clicking letters in Kannada!',
        'category': 'Teaching Sound & Voice Narration',
        'rating': 5,
        'user_name': 'Aarav Learner',
        'role': 'student',
        'email': 'aarav@example.com'
    }
    sub_res = client.post('/api/feedback', json=payload)
    assert sub_res.status_code == 201
    res_data = sub_res.get_json()
    assert res_data['success'] is True
    assert res_data['feedback']['what_to_change'] == payload['what_to_change']
    assert res_data['feedback']['status'] == 'received'
    fb_id = res_data['feedback']['id']

    # 3. Retrieve Feedback list
    list_res = client.get('/api/feedback')
    assert list_res.status_code == 200
    list_data = list_res.get_json()
    assert list_data['total'] >= 1
    assert 'average_rating' in list_data
    assert any(fb['id'] == fb_id for fb in list_data['feedback'])

    # 4. Update status
    status_res = client.post(f'/api/feedback/{fb_id}/status', json={'status': 'planned'})
    assert status_res.status_code == 200
    assert status_res.get_json()['feedback']['status'] == 'planned'

def test_platform_feedback_validation(client):
    # Missing what_to_change
    res1 = client.post('/api/feedback', json={'what_to_change': ''})
    assert res1.status_code == 400
    assert 'error' in res1.get_json()

    # Invalid status
    res2 = client.post('/api/feedback/9999/status', json={'status': 'invalid_status'})
    assert res2.status_code == 404

def test_system_database_diagnostics(client):
    res = client.get('/api/feedback/system/status')
    assert res.status_code == 200
    data = res.get_json()
    assert 'primary_database' in data
    assert 'mongodb' in data
    assert 'deployment_targets' in data
    assert 'MongoDB Atlas (mango db)' in data['deployment_targets']['databases']

def test_mongo_service_resilience():
    from backend.services import mongo_service
    # Even when MONGO_URI is unset, service returns clean fallbacks and never crashes
    assert mongo_service.save_feedback({'what_to_change': 'test'}) is None or isinstance(mongo_service.save_feedback({'what_to_change': 'test'}), str)
    assert isinstance(mongo_service.get_feedback(), list)
    status = mongo_service.get_status_info()
    assert 'enabled' in status

def test_workplace_and_workspace_activity_workflow(client):
    # 1. Student submits direct workspace notes
    res = client.post('/api/activities/submit-direct', json={
        'title': 'Hospital & Doctors Workplace Reflection',
        'activity_type': 'practice',
        'subject': 'Life Skills & Working Places',
        'notes': 'Doctors treat sick patients in hospitals using stethoscopes.',
        'score': 100,
        'answers': [{'question': 'Where do doctors work?', 'answer': 'Hospital', 'is_correct': True}]
    })
    assert res.status_code == 201
    act_data = res.get_json()['activity']
    act_id = act_data['id']
    assert act_data['status'] == 'awaiting_review'
    assert 'Hospital' in act_data['title']

    # 2. Teacher retrieves review queue
    q_res = client.get('/api/teacher/review-queue')
    assert q_res.status_code == 200
    subs = q_res.get_json()['submissions']
    assert any(s['id'] == act_id for s in subs)

    # 3. Teacher inspects detail
    det_res = client.get(f'/api/activities/{act_id}')
    assert det_res.status_code == 200
    detail = det_res.get_json()
    assert 'submission_data' in detail
    assert detail['submission_data']['reflection'] == 'Doctors treat sick patients in hospitals using stethoscopes.'

    # 4. Teacher approves the submission
    act_res = client.post(f'/api/teacher/submissions/{act_id}/action', json={
        'action': 'approve',
        'feedback': 'Excellent understanding of hospitals and community healthcare!'
    })
    assert act_res.status_code == 200
    assert act_res.get_json()['activity']['status'] == 'approved'


