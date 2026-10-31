from flask import Blueprint, jsonify, request, session
from backend.models.db import get_db
from backend.models import User, GameResult
from backend.services.progress_service import ProgressService

games_bp = Blueprint('games_bp', __name__)

AVAILABLE_GAMES = [
    {
        'id': 'alphabet_adventure',
        'number': 1,
        'title': 'Alphabet Adventure',
        'icon': '🔤',
        'category': 'language',
        'category_label': 'Language & Literacy',
        'description': 'Match uppercase letters with lowercase letters and hear their sounds. Animated letters celebrate when matched!',
        'skills': 'Letter recognition, phonics, visual attention',
        'difficulties': ['easy', 'medium', 'hard']
    },
    {
        'id': 'number_catcher',
        'number': 2,
        'title': 'Number Catcher',
        'icon': '🧺',
        'category': 'math',
        'category_label': 'Mathematics',
        'description': 'Catch or drag the correct number of objects into a basket. Start with 1–5 and count along!',
        'skills': 'Counting, number recognition, hand-eye coordination',
        'difficulties': ['easy', 'medium', 'hard']
    },
    {
        'id': 'shape_puzzle',
        'number': 3,
        'title': 'Shape Puzzle World',
        'icon': '🔷',
        'category': 'logic',
        'category_label': 'Shapes & Logic',
        'description': 'Drag circles, squares, triangles, and stars into their matching glowing outlines.',
        'skills': 'Shape recognition, spatial reasoning, problem-solving',
        'difficulties': ['easy', 'medium']
    },
    {
        'id': 'animal_memory',
        'number': 4,
        'title': 'Animal Memory Match',
        'icon': '🦁',
        'category': 'memory',
        'category_label': 'Memory & Focus',
        'description': 'Flip picture cards and find matching pairs of friendly animals and everyday objects.',
        'skills': 'Working memory, attention, visual recognition',
        'difficulties': ['easy', 'medium', 'hard']
    },
    {
        'id': 'color_sorting',
        'number': 5,
        'title': 'Color Sorting Garden',
        'icon': '🎨',
        'category': 'logic',
        'category_label': 'Shapes & Logic',
        'description': 'Sort colorful flowers, fruits, and butterflies into matching color garden beds.',
        'skills': 'Color recognition, classification, following instructions',
        'difficulties': ['easy', 'medium']
    },
    {
        'id': 'sound_picture_match',
        'number': 6,
        'title': 'Sound and Picture Match',
        'icon': '🔊',
        'category': 'language',
        'category_label': 'Language & Literacy',
        'description': 'Hear a spoken word and select its matching picture, with an option to replay the sound.',
        'skills': 'Listening, vocabulary, word recognition',
        'difficulties': ['easy', 'medium']
    },
    {
        'id': 'jigsaw_builder',
        'number': 7,
        'title': 'Easy Jigsaw Builder',
        'icon': '🧩',
        'category': 'logic',
        'category_label': 'Shapes & Logic',
        'description': 'Complete cute picture puzzles using 2–4 pieces initially, increasing as confidence grows.',
        'skills': 'Visual processing, persistence, spatial reasoning',
        'difficulties': ['easy', 'medium']
    },
    {
        'id': 'mini_supermarket',
        'number': 8,
        'title': 'Mini Supermarket',
        'icon': '🛒',
        'category': 'life_skills',
        'category_label': 'Life Skills & Routines',
        'description': 'Choose items from a shopping list, place them in a basket, and practise simple money concepts.',
        'skills': 'Everyday independence, categorization, functional mathematics',
        'difficulties': ['easy', 'medium']
    },
    {
        'id': 'daily_routine',
        'number': 9,
        'title': 'Daily Routine Builder',
        'icon': '🪥',
        'category': 'life_skills',
        'category_label': 'Life Skills & Routines',
        'description': 'Arrange picture cards into sequences like brushing teeth, getting dressed, and washing hands.',
        'skills': 'Sequencing, self-care routines, independence',
        'difficulties': ['easy', 'medium']
    },
    {
        'id': 'emotion_explorer',
        'number': 10,
        'title': 'Emotion Explorer',
        'icon': '😊',
        'category': 'social',
        'category_label': 'Social-Emotional & Safety',
        'description': 'Match facial expressions to emotion words and practice choosing ways to ask for help or a calm break.',
        'skills': 'Emotional vocabulary, communication, social understanding',
        'difficulties': ['easy', 'medium']
    },
    {
        'id': 'road_safety',
        'number': 11,
        'title': 'Road Safety Adventure',
        'icon': '🚦',
        'category': 'social',
        'category_label': 'Social-Emotional & Safety',
        'description': 'Guide a character across illustrated streets by identifying traffic signals and safe choices.',
        'skills': 'Safety awareness, decision-making, attention',
        'difficulties': ['easy', 'medium']
    },
    {
        'id': 'animal_home_finder',
        'number': 12,
        'title': 'Animal Home Finder',
        'icon': '🏡',
        'category': 'nature',
        'category_label': 'Nature & Science',
        'description': 'Match animals with their natural habitats, such as fish with water and birds with cozy nests.',
        'skills': 'General knowledge, association, categorization',
        'difficulties': ['easy', 'medium']
    },
    {
        'id': 'music_rhythm',
        'number': 13,
        'title': 'Music and Rhythm Studio',
        'icon': '🎹',
        'category': 'creative',
        'category_label': 'Creative & Sensory',
        'description': 'Tap colorful virtual piano keys and bells to imitate joyful sound patterns.',
        'skills': 'Auditory attention, timing, creative expression',
        'difficulties': ['easy', 'medium']
    },
    {
        'id': 'magic_garden',
        'number': 14,
        'title': 'Grow a Magic Garden',
        'icon': '🌻',
        'category': 'nature',
        'category_label': 'Nature & Science',
        'description': 'Plant seeds, water them, give sunlight, and watch bright flowers bloom step by step.',
        'skills': 'Cause and effect, sequencing, responsibility',
        'difficulties': ['easy']
    },
    {
        'id': 'little_chef',
        'number': 15,
        'title': 'Little Chef',
        'icon': '🥪',
        'category': 'life_skills',
        'category_label': 'Life Skills & Routines',
        'description': 'Follow visual recipe instructions to prepare a virtual sandwich or delicious fruit salad.',
        'skills': 'Sequencing, food recognition, everyday life skills',
        'difficulties': ['easy', 'medium']
    },
    {
        'id': 'time_clock',
        'number': 16,
        'title': 'Time and Routine Clock',
        'icon': '⏰',
        'category': 'math',
        'category_label': 'Mathematics',
        'description': 'Match clock times and pictures to familiar activities such as breakfast, lunch, or bedtime.',
        'skills': 'Time concepts, daily planning, sequencing',
        'difficulties': ['easy', 'medium']
    },
    {
        'id': 'fruit_math_market',
        'number': 17,
        'title': 'Fruit Math Market',
        'icon': '🍎',
        'category': 'math',
        'category_label': 'Mathematics',
        'description': 'Add or remove fruits from a market stall to explore simple addition and subtraction visually.',
        'skills': 'Basic arithmetic, quantity, number relationships',
        'difficulties': ['easy', 'medium', 'hard']
    },
    {
        'id': 'interactive_story_world',
        'number': 18,
        'title': 'Interactive Story World',
        'icon': '📖',
        'category': 'language',
        'category_label': 'Language & Literacy',
        'description': 'Listen to an illustrated story scene and choose positive actions for the characters.',
        'skills': 'Comprehension, vocabulary, choices and consequences',
        'difficulties': ['easy', 'medium']
    },
    {
        'id': 'letter_tracing',
        'number': 19,
        'title': 'Letter Tracing Path',
        'icon': '✍️',
        'category': 'fine_motor',
        'category_label': 'Fine Motor & Writing',
        'description': 'Trace large letters using a finger or mouse with sparkling paths and audio phonics.',
        'skills': 'Letter formation, fine-motor practice, early literacy',
        'difficulties': ['easy', 'medium']
    },
    {
        'id': 'word_builder',
        'number': 20,
        'title': 'Word Builder Workshop',
        'icon': '🔨',
        'category': 'language',
        'category_label': 'Language & Literacy',
        'description': 'Arrange movable letter blocks to build simple words like C-A-T, S-U-N, and B-A-L-L.',
        'skills': 'Spelling, phonics, letter order, vocabulary',
        'difficulties': ['easy', 'medium']
    },
    {
        'id': 'weather_explorer',
        'number': 21,
        'title': 'Weather Explorer',
        'icon': '⛅',
        'category': 'nature',
        'category_label': 'Nature & Science',
        'description': 'Match sunny, rainy, and snowy weather conditions to clothing and outdoor items.',
        'skills': 'Observation, environmental awareness, practical reasoning',
        'difficulties': ['easy', 'medium']
    },
    {
        'id': 'clean_planet',
        'number': 22,
        'title': 'Clean Planet Challenge',
        'icon': '♻️',
        'category': 'nature',
        'category_label': 'Nature & Science',
        'description': 'Sort waste items into recycling, compost, and trash bins to keep our Earth clean.',
        'skills': 'Classification, environmental awareness, responsibility',
        'difficulties': ['easy', 'medium']
    },
    {
        'id': 'find_in_classroom',
        'number': 23,
        'title': 'Find It in the Classroom',
        'icon': '🔍',
        'category': 'logic',
        'category_label': 'Shapes & Logic',
        'description': 'Find requested objects such as pencil, book, backpack, or ruler in a colorful classroom.',
        'skills': 'Receptive language, visual scanning, object recognition',
        'difficulties': ['easy', 'medium']
    },
    {
        'id': 'friendly_maze',
        'number': 24,
        'title': 'Friendly Maze Runner',
        'icon': '🌀',
        'category': 'logic',
        'category_label': 'Shapes & Logic',
        'description': 'Guide a friendly mascot through a gentle maze to reach the trophy with visual hint arrows.',
        'skills': 'Planning, spatial reasoning, directional concepts',
        'difficulties': ['easy', 'medium']
    },
    {
        'id': 'pop_and_discover',
        'number': 25,
        'title': 'Pop and Discover',
        'icon': '🎈',
        'category': 'fine_motor',
        'category_label': 'Fine Motor & Writing',
        'description': 'Tap floating colorful bubbles containing target letters, shapes, or numbers to pop them!',
        'skills': 'Visual attention, target selection, basic recognition',
        'difficulties': ['easy', 'medium']
    },
    {
        'id': 'everyday_matcher',
        'number': 26,
        'title': 'Everyday Object Matcher',
        'icon': '🧦',
        'category': 'life_skills',
        'category_label': 'Life Skills & Routines',
        'description': 'Pair related everyday items like socks with shoes, and toothbrush with toothpaste.',
        'skills': 'Association, functional vocabulary, everyday knowledge',
        'difficulties': ['easy', 'medium']
    },
    {
        'id': 'virtual_pet_care',
        'number': 27,
        'title': 'Virtual Pet Care',
        'icon': '🐶',
        'category': 'social',
        'category_label': 'Social-Emotional & Safety',
        'description': 'Feed, groom, brush, and care for a playful virtual puppy through gentle interactive steps.',
        'skills': 'Sequencing, empathy, responsibility, routine following',
        'difficulties': ['easy', 'medium']
    },
    {
        'id': 'community_helpers',
        'number': 28,
        'title': 'Community Helpers',
        'icon': '👩‍⚕️',
        'category': 'social',
        'category_label': 'Social-Emotional & Safety',
        'description': 'Match community heroes like doctors, firefighters, and teachers with their tools and workplaces.',
        'skills': 'Social knowledge, vocabulary, real-world understanding',
        'difficulties': ['easy', 'medium']
    },
    {
        'id': 'direction_detective',
        'number': 29,
        'title': 'Direction Detective',
        'icon': '🧭',
        'category': 'logic',
        'category_label': 'Shapes & Logic',
        'description': 'Follow spoken and visual directions (Up, Down, Left, Right) to guide a character to hidden stars.',
        'skills': 'Directional language, listening, spatial awareness',
        'difficulties': ['easy', 'medium']
    },
    {
        'id': 'my_learning_adventure',
        'number': 30,
        'title': 'My Learning Adventure',
        'icon': '🗺️',
        'category': 'adventure',
        'category_label': 'Learning Quest & Badges',
        'description': 'Explore an adventure quest map! Earn sparkling medals, collect stars, and celebrate every victory.',
        'skills': 'Independent exploration, confidence, progress awareness',
        'difficulties': ['all_levels']
    }
]

@games_bp.route('/api/games', methods=['GET'])
def list_games():
    return jsonify({'games': AVAILABLE_GAMES})

@games_bp.route('/api/games/<game_id>/result', methods=['POST'])
def save_game_result(game_id):
    data = request.get_json() or {}
    score = int(data.get('score', 100))
    stars = int(data.get('stars', 3))
    time_spent = int(data.get('time_spent_seconds', 60))
    difficulty = data.get('difficulty', 'easy')

    user_id = session.get('user_id')
    db = get_db()

    # If not logged in, find demo student or record anonymously
    if not user_id:
        demo = db.query(User).filter_by(username='aarav').first()
        user_id = demo.id if demo else None

    if not user_id:
        return jsonify({'message': 'Result recorded locally.'})

    # Find matching game metadata
    game_meta = next((g for g in AVAILABLE_GAMES if g['id'] == game_id), None)
    game_name = game_meta['title'] if game_meta else game_id.title()

    res = ProgressService.record_game_result(
        session=db,
        student_id=user_id,
        game_id=game_id,
        game_name=game_name,
        difficulty=difficulty,
        score=score,
        stars=stars,
        time_spent=time_spent
    )

    return jsonify({
        'message': 'Game score successfully saved!',
        'result': res
    }), 201

@games_bp.route('/api/games/history', methods=['GET'])
def get_game_history():
    user_id = session.get('user_id')
    db = get_db()
    if not user_id:
        demo = db.query(User).filter_by(username='aarav').first()
        user_id = demo.id if demo else None

    if not user_id:
        return jsonify({'history': []})

    results = db.query(GameResult).filter_by(student_id=user_id).order_by(GameResult.created_at.desc()).limit(15).all()
    return jsonify({'history': [r.to_dict() for r in results]})
