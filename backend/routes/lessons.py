from flask import Blueprint, jsonify, request
from backend.models.db import get_db
from backend.models import Lesson
from backend.services.curriculum_service import curriculum_service

lessons_bp = Blueprint('lessons_bp', __name__)

@lessons_bp.route('/api/lessons', methods=['GET'])
def get_lessons():
    db = get_db()
    subject = request.args.get('subject')
    query = db.query(Lesson).filter_by(is_published=True)
    if subject:
        query = query.filter_by(subject=subject)
    lessons = query.order_index if hasattr(query, 'order_index') else query.order_by(Lesson.order_index).all()
    return jsonify({'lessons': [l.to_dict() for l in lessons]})

@lessons_bp.route('/api/curriculum/english', methods=['GET'])
def get_english():
    letter = request.args.get('letter')
    if letter:
        item = curriculum_service.get_letter(letter)
        if not item:
            return jsonify({'error': 'Letter not found.'}), 404
        return jsonify(item)
    return jsonify(curriculum_service.get_english_alphabet())

@lessons_bp.route('/api/curriculum/kannada', methods=['GET'])
def get_kannada():
    return jsonify(curriculum_service.get_kannada())

@lessons_bp.route('/api/curriculum/hindi', methods=['GET'])
def get_hindi():
    return jsonify(curriculum_service.get_hindi())

@lessons_bp.route('/api/curriculum/math', methods=['GET'])
def get_math():
    return jsonify(curriculum_service.get_mathematics())

@lessons_bp.route('/api/curriculum/multiplication/<int:number>', methods=['GET'])
def get_multiplication(number):
    if number < 1 or number > 20:
        return jsonify({'error': 'Multiplication table must be between 1 and 20.'}), 400
    table = curriculum_service.get_multiplication_table(number)
    if not table:
        return jsonify({'error': 'Table not found.'}), 404
    return jsonify(table)

@lessons_bp.route('/api/curriculum/traffic', methods=['GET'])
def get_traffic():
    return jsonify(curriculum_service.get_traffic_rules())

@lessons_bp.route('/api/curriculum/emotions', methods=['GET'])
def get_emotions():
    return jsonify(curriculum_service.get_emotions())

@lessons_bp.route('/api/curriculum/body-parts', methods=['GET'])
def get_body_parts():
    return jsonify(curriculum_service.get_body_parts())

@lessons_bp.route('/api/curriculum/workplaces', methods=['GET'])
def get_workplaces():
    return jsonify(curriculum_service.get_workplaces())

@lessons_bp.route('/api/curriculum/stories', methods=['GET'])
def get_stories():
    story_id = request.args.get('id')
    if story_id:
        s = curriculum_service.get_story(story_id)
        if not s:
            return jsonify({'error': 'Story not found.'}), 404
        return jsonify(s)
    return jsonify(curriculum_service.get_stories())

@lessons_bp.route('/api/curriculum/quizzes', methods=['GET'])
def get_quizzes():
    subject = request.args.get('subject')
    return jsonify(curriculum_service.get_quizzes(subject))
