from flask import Blueprint, jsonify, request, session
from database import get_db, get_db_cursor  # Import SQLite helper

internship_bp = Blueprint('internship_bp', __name__)

@internship_bp.route('/', methods=['GET'])
def get_internships():
    cursor = get_db_cursor()  # Use the SQLite cursor
    cursor.execute("SELECT * FROM internships")
    internships = cursor.fetchall()
    return jsonify([dict(row) for row in internships])

# Post new internship (Recruiter Only)
@internship_bp.route('/post', methods=['POST'])
def post_internship():
    if 'user_id' not in session or session.get('role') != 'recruiter':
        return jsonify({'error': 'Unauthorized'}), 403

    data = request.json
    title = data.get('title')
    company = data.get('company')
    location = data.get('location')
    description = data.get('description')
    requirements = data.get('requirements')
    
    # Validate required fields
    if not all([title, company, location, description, requirements]):
        return jsonify({'error': 'Missing required fields'}), 400

    try:
        cursor = get_db_cursor()
        cursor.execute(
            "INSERT INTO internships (title, company, location, description, requirements, posted_by) VALUES (?, ?, ?, ?, ?, ?)",
            (title, company, location, description, requirements, session['user_id'])
        )
        get_db().commit()
    except Exception as e:
        get_db().rollback()
        return jsonify({'error': 'Failed to post internship'}), 500
    finally:
        cursor.close()

    return jsonify({'message': 'Internship posted successfully'}), 201