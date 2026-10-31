import os
import json
from backend.config import Config

class CurriculumService:
    def __init__(self, data_dir=None):
        self.data_dir = data_dir or Config.DATA_DIR
        self._cache = {}

    def _load_json(self, filename):
        if filename in self._cache:
            return self._cache[filename]
        filepath = os.path.join(self.data_dir, filename)
        if not os.path.exists(filepath):
            return None
        with open(filepath, 'r', encoding='utf-8') as f:
            data = json.load(f)
            self._cache[filename] = data
            return data

    def get_english_alphabet(self):
        return self._load_json('english.json') or []

    def get_letter(self, letter):
        all_letters = self.get_english_alphabet()
        for item in all_letters:
            if item.get('letter', '').upper() == letter.upper():
                return item
        return None

    def get_kannada(self):
        return self._load_json('kannada.json') or {}

    def get_hindi(self):
        return self._load_json('hindi.json') or {}

    def get_mathematics(self):
        return self._load_json('mathematics.json') or {}

    def get_multiplication_table(self, number):
        math_data = self.get_mathematics()
        tables = math_data.get('tables', {})
        return tables.get(str(number))

    def get_traffic_rules(self):
        return self._load_json('traffic_rules.json') or {}

    def get_emotions(self):
        return self._load_json('emotions.json') or {}

    def get_body_parts(self):
        return self._load_json('body_parts.json') or {}

    def get_workplaces(self):
        return self._load_json('workplaces.json') or {}

    def get_stories(self):
        return self._load_json('stories.json') or []

    def get_story(self, story_id):
        stories = self.get_stories()
        for s in stories:
            if s.get('id') == story_id:
                return s
        return None

    def get_quizzes(self, subject=None):
        quizzes = self._load_json('quizzes.json') or []
        if subject:
            return [q for q in quizzes if q.get('subject') == subject]
        return quizzes

curriculum_service = CurriculumService()
