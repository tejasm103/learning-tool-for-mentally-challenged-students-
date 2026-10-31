import re
from flask import Blueprint, jsonify, request
from backend.services.curriculum_service import curriculum_service

mindbot_bp = Blueprint('mindbot_bp', __name__)

@mindbot_bp.route('/api/mindbot/chat', methods=['POST'])
def chat():
    data = request.get_json() or {}
    message = data.get('message', '').strip().lower()

    if not message:
        return jsonify({
            'reply': 'Hello there! I am MindBot, your friendly learning assistant. Ask me about any letter, number, Kannada, Hindi, road safety, or emotions!',
            'suggestions': ['What is the letter A?', 'Tell me about Kannada vowels', 'What does Red light mean?', 'I need a calm break']
        })

    # 1. Letter matching
    letter_match = re.search(r'\bletter\s+([a-z])\b|\bwhat\s+is\s+([a-z])\b', message)
    if letter_match:
        target_char = (letter_match.group(1) or letter_match.group(2)).upper()
        letter_data = curriculum_service.get_letter(target_char)
        if letter_data:
            return jsonify({
                'reply': f"This is the letter {letter_data['letter']}. {letter_data['letter']} is for {letter_data['primary_word']}! {letter_data['sentence']} {letter_data['fact']}",
                'icon': letter_data['icon'],
                'audio_text': letter_data['audio_text'],
                'suggestions': [f"Show me {letter_data['example_words'][1]}", "Practice letter quiz", "Next letter"]
            })

    # 2. Kannada queries
    if 'kannada' in message or 'varnamala' in message or 'ಸ್ವರ' in message:
        return jsonify({
            'reply': 'In Kannada, we start with ಸ್ವರಗಳು (vowels) such as ಅ (ಅರಸ - King) and ಆ (ಆಕಾಶ - Sky). Then we learn ವ್ಯಂಜನಗಳು (consonants) like ಕ (ಕಮಲ - Lotus). Would you like to explore the Kannada Varnamala station?',
            'icon': '🪷',
            'suggestions': ['Explore Kannada Varnamala', 'What is ಕಾಗುಣಿತ?', 'Play picture matching']
        })

    if 'kagunita' in message or 'ಕಾಗುಣಿತ' in message:
        return jsonify({
            'reply': 'ಕಾಗುಣಿತ (Kagunita) shows how consonants join with vowel signs! For example: ಕ + ಆ = ಕಾ, ಕ + ಇ = ಕಿ, ಕ + ಈ = ಕೀ. It creates all the beautiful sounds in Kannada!',
            'icon': '✨',
            'suggestions': ['Open Kagunita Builder', 'Show me Hindi matras']
        })

    # 3. Hindi queries
    if 'hindi' in message or 'swar' in message or 'स्वर' in message:
        return jsonify({
            'reply': 'In Hindi, foundational learning begins with स्वर (vowels) such as अ से अनार (Pomegranate) and आ से आम (Mango), followed by व्यंजन like क से कबूतर (Pigeon)!',
            'icon': '🥭',
            'suggestions': ['Explore Hindi Varnamala', 'Show Hindi Matras', 'Quiz on Hindi letters']
        })

    if 'matra' in message or 'मात्रा' in message:
        return jsonify({
            'reply': 'In Hindi, Matras (मात्राएँ) change the vowel sound of consonants: क + ा = का, क + ि = कि, क + ी = की. Would you like to try combining them in the Hindi lab?',
            'icon': '📚',
            'suggestions': ['Open Hindi Lab', 'Explore English Letters']
        })

    # 4. Math & Multiplication
    mult_match = re.search(r'(\d+)\s*(?:x|\*|times|multiplied by)\s*(\d+)', message)
    if mult_match:
        n1 = int(mult_match.group(1))
        n2 = int(mult_match.group(2))
        ans = n1 * n2
        return jsonify({
            'reply': f'{n1} × {n2} = {ans}! You can imagine {n1} groups of {n2} friendly stars.',
            'icon': '⭐',
            'suggestions': [f'Show Table of {n1}', 'Play Number Adventure', 'Try Math Quiz']
        })

    table_match = re.search(r'table\s+of\s+(\d+)', message)
    if table_match:
        t_num = int(table_match.group(1))
        if 1 <= t_num <= 20:
            return jsonify({
                'reply': f'The Table of {t_num} starts with {t_num} × 1 = {t_num}, {t_num} × 2 = {t_num * 2}, and {t_num} × 3 = {t_num * 3}! Would you like to practice the full table in the interactive lab?',
                'icon': '🔢',
                'suggestions': [f'Open Table of {t_num}', 'Practice missing numbers']
            })

    # 5. Traffic safety
    if 'traffic' in message or 'red light' in message or 'road' in message or 'cross' in message:
        return jsonify({
            'reply': 'Road Safety is super important! Red light means STOP, Yellow means prepare to stop cautiously, and Green means GO when safe. Always cross on the Zebra Crossing and hold an adult\'s hand!',
            'icon': '🚦',
            'suggestions': ['Open Traffic Safety Lab', 'Take Road Safety Quiz', 'Play pedestrian crossing game']
        })

    # 6. Emotions & feelings
    if 'sad' in message or 'unhappy' in message or 'crying' in message:
        return jsonify({
            'reply': 'It is completely okay to feel sad sometimes. Taking slow, deep breaths, listening to gentle music, or sharing your feelings with someone you trust can help your heart feel lighter.',
            'icon': '💙',
            'suggestions': ['Try a calming breathing break', 'Explore Emotion Cards', 'Listen to a cheerful rhyme']
        })

    if 'angry' in message or 'mad' in message:
        return jsonify({
            'reply': 'When feeling angry, your body might feel warm and tense. Try breathing in for 4 seconds, holding gently, and breathing out slowly like blowing a bubble. You are safe and doing great.',
            'icon': '🫧',
            'suggestions': ['Calm Breathing Exercise', 'Quiet Mode', 'Explore emotions']
        })

    if 'happy' in message or 'excited' in message:
        return jsonify({
            'reply': 'Yay! Your happiness brightens up our whole MindVerse classroom! What wonderful activity would you like to explore together?',
            'icon': '🌟',
            'suggestions': ['Play Memory Matching', 'Read a short story', 'Solve a puzzle']
        })

    # 7. Rest / Break
    if 'break' in message or 'tired' in message or 'rest' in message:
        return jsonify({
            'reply': 'Taking gentle breaks is a great superpower! Rest your eyes, drink a cup of fresh cool water, and stretch your arms up high. MindVerse will be right here whenever you are ready.',
            'icon': '🌿',
            'suggestions': ['Enable Sensory Calm Mode', 'Listen to peaceful chime', 'I am ready to learn again']
        })

    # Default friendly curriculum-aware response
    return jsonify({
        'reply': f'That is a wonderful question! In MindVerse, we explore together step by step: Show → Explain → Demonstrate → Practice. Would you like to explore letters, numbers, Kannada, Hindi, stories, or games?',
        'icon': '🤖',
        'suggestions': ['Explore English Alphabet', 'Kannada Varnamala', 'Hindi Varnamala', 'Multiplication Tables', 'Play Educational Games']
    })
