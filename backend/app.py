import os
from flask import Flask, jsonify, send_from_directory, request
from flask_cors import CORS
from backend.config import Config
from backend.models.db import init_db, close_db
from backend.routes import (
    auth_bp, lessons_bp, games_bp, 
    progress_bp, teacher_bp, caregiver_bp, mindbot_bp,
    videos_bp, activities_bp, feedback_bp
)

def create_app(config_class=Config):
    frontend_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', 'frontend'))
    app = Flask(__name__, static_folder=frontend_dir, static_url_path='')
    app.config.from_object(config_class)

    # Enable CORS for frontend flexibility (supports Netlify origin and local dev)
    CORS(app, supports_credentials=True, origins=['*'])

    # Initialize Database
    init_db(app.config['SQLALCHEMY_DATABASE_URI'])

    # Register Blueprints
    app.register_blueprint(auth_bp)
    app.register_blueprint(lessons_bp)
    app.register_blueprint(games_bp)
    app.register_blueprint(progress_bp)
    app.register_blueprint(teacher_bp)
    app.register_blueprint(caregiver_bp)
    app.register_blueprint(mindbot_bp)
    app.register_blueprint(videos_bp)
    app.register_blueprint(activities_bp)
    app.register_blueprint(feedback_bp)

    @app.teardown_appcontext
    def teardown(exception):
        close_db(exception)

    @app.after_request
    def set_security_headers(response):
        response.headers['X-Content-Type-Options'] = 'nosniff'
        response.headers['X-XSS-Protection'] = '1; mode=block'
        # Allow embedding iframe for YouTube players while protecting site frame
        response.headers['Referrer-Policy'] = 'strict-origin-when-cross-origin'
        return response

    @app.route('/api/health', methods=['GET'])
    def health():
        from backend.services import mongo_service
        return jsonify({
            'status': 'healthy',
            'platform': 'MindVerse Inclusive Learning Lab',
            'version': '2.2.0',
            'primary_db': 'PostgreSQL/Supabase' if 'postgres' in app.config['SQLALCHEMY_DATABASE_URI'] else 'SQLite',
            'mongodb_connected': mongo_service.is_mongo_connected(),
            'modules': ['auth', 'curriculum', 'games', 'videos', 'activities', 'progress', 'teacher', 'caregiver', 'mindbot', 'feedback']
        })

    # Serve Frontend Client Pages
    @app.route('/')
    def serve_index():
        return send_from_directory(frontend_dir, 'index.html')

    @app.route('/<path:filename>')
    def serve_frontend_files(filename):
        # Prevent accessing sensitive files
        if '..' in filename or filename.startswith('.'):
            return jsonify({'error': 'Forbidden'}), 403
        
        file_path = os.path.join(frontend_dir, filename)
        if os.path.isfile(file_path):
            return send_from_directory(frontend_dir, filename)
        elif os.path.isfile(file_path + '.html'):
            return send_from_directory(frontend_dir, filename + '.html')
        else:
            return send_from_directory(frontend_dir, 'index.html')

    # Global Error Handlers
    @app.errorhandler(404)
    def not_found(e):
        if request.path.startswith('/api/'):
            return jsonify({'error': 'API endpoint not found.'}), 404
        return send_from_directory(frontend_dir, 'index.html'), 404

    @app.errorhandler(500)
    def server_error(e):
        return jsonify({'error': 'An internal server error occurred.'}), 500

    return app

if __name__ == '__main__':
    app = create_app()
    port = int(os.environ.get('PORT', 5000))
    print(f"\n=======================================================")
    print(f"🚀 MindVerse Inclusive Learning Lab Backend Started!")
    print(f"🔗 Local Web Server: http://127.0.0.1:{port}")
    print(f"=======================================================\n")
    app.run(host='0.0.0.0', port=port, debug=True)
