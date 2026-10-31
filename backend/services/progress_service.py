from datetime import datetime
from backend.models import (
    User, Lesson, LessonProgress, AssessmentAttempt, 
    GameResult, TeacherAssignment, TeacherFeedback
)

class ProgressService:
    @staticmethod
    def get_student_summary(session, student_id):
        student = session.query(User).filter_by(id=student_id).first()
        if not student:
            return None

        # Total lessons in platform
        total_lessons = session.query(Lesson).filter_by(is_published=True).count()
        progress_records = session.query(LessonProgress).filter_by(student_id=student_id).all()
        
        completed_lessons = [p for p in progress_records if p.status == 'completed']
        in_progress_lessons = [p for p in progress_records if p.status == 'in_progress']
        
        # Assessments
        attempts = session.query(AssessmentAttempt).filter_by(student_id=student_id).order_by(AssessmentAttempt.attempted_at.desc()).all()
        avg_score = (sum(a.score_percentage for a in attempts) / len(attempts)) if attempts else 0.0

        # Games
        game_results = session.query(GameResult).filter_by(student_id=student_id).all()
        total_stars = sum(g.stars for g in game_results)
        total_game_score = sum(g.score for g in game_results)

        # Assignments
        assignments = session.query(TeacherAssignment).filter_by(student_id=student_id).all()
        pending_assignments = [a for a in assignments if a.status != 'completed']

        # Feedback
        feedbacks = session.query(TeacherFeedback).filter_by(student_id=student_id).order_by(TeacherFeedback.created_at.desc()).all()

        # Subject completion breakdown
        subject_breakdown = {}
        for p in completed_lessons:
            subj = p.lesson.subject if p.lesson else 'general'
            subject_breakdown[subj] = subject_breakdown.get(subj, 0) + 1

        total_time_spent = sum(p.time_spent_seconds for p in progress_records) + sum(g.time_spent_seconds for g in game_results)

        return {
            'student_id': student.id,
            'student_code': student.student_id,
            'display_name': student.display_name,
            'grade_level': student.grade_level,
            'total_lessons': total_lessons,
            'completed_count': len(completed_lessons),
            'in_progress_count': len(in_progress_lessons),
            'completion_rate': round((len(completed_lessons) / total_lessons * 100), 1) if total_lessons > 0 else 0,
            'total_assessments': len(attempts),
            'average_assessment_score': round(avg_score, 1),
            'games_played': len(game_results),
            'total_stars': total_stars,
            'total_game_score': total_game_score,
            'time_spent_minutes': round(total_time_spent / 60, 1),
            'subject_breakdown': subject_breakdown,
            'recent_progress': [p.to_dict() for p in progress_records[:5]],
            'recent_assessments': [a.to_dict() for a in attempts[:5]],
            'recent_games': [g.to_dict() for g in game_results[:5]],
            'pending_assignments': [a.to_dict() for a in pending_assignments],
            'teacher_feedback': [f.to_dict() for f in feedbacks[:5]]
        }

    @staticmethod
    def record_lesson_progress(session, student_id, lesson_id, status='completed', score=100.0, time_spent=60):
        prog = session.query(LessonProgress).filter_by(student_id=student_id, lesson_id=lesson_id).first()
        if not prog:
            prog = LessonProgress(
                student_id=student_id,
                lesson_id=lesson_id,
                status=status,
                score=score,
                attempts=1,
                time_spent_seconds=time_spent,
                completed_at=datetime.utcnow() if status == 'completed' else None
            )
            session.add(prog)
        else:
            prog.attempts += 1
            prog.time_spent_seconds += time_spent
            if score > prog.score:
                prog.score = score
            if status == 'completed':
                prog.status = 'completed'
                prog.completed_at = datetime.utcnow()
        session.commit()
        return prog.to_dict()

    @staticmethod
    def record_quiz_attempt(session, student_id, subject, quiz_name, total_q, correct_q, answers_json):
        pct = (correct_q / total_q * 100.0) if total_q > 0 else 0.0
        att = AssessmentAttempt(
            student_id=student_id,
            subject=subject,
            quiz_name=quiz_name,
            total_questions=total_q,
            correct_count=correct_q,
            score_percentage=pct,
            answers_json=answers_json
        )
        session.add(att)
        session.commit()
        return att.to_dict()

    @staticmethod
    def record_game_result(session, student_id, game_id, game_name, difficulty, score, stars, time_spent):
        res = GameResult(
            student_id=student_id,
            game_id=game_id,
            game_name=game_name,
            difficulty=difficulty,
            score=score,
            stars=stars,
            time_spent_seconds=time_spent,
            completed=True
        )
        session.add(res)
        session.commit()
        return res.to_dict()

class RecommendationService:
    @staticmethod
    def get_recommendations(session, student_id):
        # Look at completed lessons and scores
        completed_ids = [p.lesson_id for p in session.query(LessonProgress).filter_by(student_id=student_id, status='completed').all()]
        
        # Next uncompleted lesson
        next_lesson = session.query(Lesson).filter(Lesson.id.notin_(completed_ids)).order_by(Lesson.order_index).first()
        
        # Check if student needs practice on low-scoring assessments
        low_quizzes = session.query(AssessmentAttempt).filter(AssessmentAttempt.student_id == student_id, AssessmentAttempt.score_percentage < 70).all()
        review_topics = list(set([q.subject for q in low_quizzes]))

        suggestions = []
        if next_lesson:
            suggestions.append({
                'type': 'next_lesson',
                'title': f'Ready for: {next_lesson.title}',
                'description': next_lesson.description,
                'slug': next_lesson.slug,
                'subject': next_lesson.subject
            })
        
        if review_topics:
            suggestions.append({
                'type': 'review',
                'title': f'Review Practice in {review_topics[0].capitalize()}',
                'description': 'A friendly refresher will help strengthen memory and confidence!',
                'subject': review_topics[0]
            })
        else:
            suggestions.append({
                'type': 'game_practice',
                'title': 'Play Memory Matching Cards',
                'description': 'Enjoy a calming game to reinforce shape, number, and picture recognition.',
                'game_id': 'memory'
            })

        return suggestions

class ReportingService:
    @staticmethod
    def generate_report_card(session, student_id):
        summary = ProgressService.get_student_summary(session, student_id)
        if not summary:
            return None

        # Determine strengths and supportive growth areas
        strengths = []
        growth_areas = []

        if summary['average_assessment_score'] >= 80:
            strengths.append('High comprehension and accuracy in self-paced quizzes')
        else:
            growth_areas.append('Would benefit from audio repetition and picture-supported quiz retries')

        if summary['completed_count'] >= 2:
            strengths.append('Consistently engages with structured daily learning modules')
        else:
            growth_areas.append('Ready to explore additional lessons with guided teacher support')

        if summary['games_played'] > 0:
            strengths.append('Actively applies concepts through interactive educational games')

        return {
            'report_title': 'MindVerse Inclusive Learning Progress Report',
            'generated_at': datetime.utcnow().strftime('%B %d, %Y'),
            'student_name': summary['display_name'],
            'student_code': summary['student_code'],
            'grade_level': summary['grade_level'],
            'lessons_completed': summary['completed_count'],
            'total_lessons': summary['total_lessons'],
            'completion_percentage': summary['completion_rate'],
            'quizzes_taken': summary['total_assessments'],
            'average_score': summary['average_assessment_score'],
            'games_completed': summary['games_played'],
            'total_stars_earned': summary['total_stars'],
            'total_study_minutes': summary['time_spent_minutes'],
            'strengths': strengths or ['Enthusiastic and curious learner'],
            'growth_areas': growth_areas or ['Ready for the next exciting level of discovery'],
            'teacher_feedback': summary['teacher_feedback'],
            'overall_status': 'Demonstrating Steady & Positive Growth'
        }
