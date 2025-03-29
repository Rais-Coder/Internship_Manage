from flask import Blueprint, request, jsonify, session, render_template, redirect, url_for, flash, current_app
import re
import sqlite3
import os
from database import get_db, get_db_cursor, insert_candidate, insert_company, db  # Import SQLite helper and insert functions

auth_bp = Blueprint('auth_bp', __name__)

# Signup Route
@auth_bp.route('/signup', methods=['POST'])
def signup():
    data = request.json
    first_name = data.get('first_name')
    last_name = data.get('last_name')
    email = data.get('email')
    password = data.get('password')
    role = data.get('role')

    # Password Validation
    if not re.match(r'^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$', password):
        return jsonify({'error': 'Password must be at least 8 characters, include 1 number & 1 special character'}), 400

    try:
        cursor = get_db_cursor()
        cursor.execute(
            "INSERT INTO users (first_name, last_name, email, password, role) VALUES (?, ?, ?, ?, ?)", 
            (first_name, last_name, email, password, role)
        )
        get_db().commit()
        cursor.close()
        return jsonify({'message': 'User registered successfully'}), 201
    except sqlite3.IntegrityError:
        return jsonify({'error': 'Email already registered'}), 400
    except Exception as e:
        current_app.logger.error(f"Unexpected error during signup: {str(e)}", exc_info=True)
        return jsonify({'error': 'An unexpected error occurred'}), 500

# Login Route
@auth_bp.route('/login', methods=["GET", "POST"], endpoint="login")
def login():
    if request.method == "POST":
        email = request.form.get('email')
        password = request.form.get('password')
        role = request.form.get('role')

        try:
            cursor = get_db_cursor()
            if role == "student":
                cursor.execute(
                    "SELECT candidate_id AS id, first_name FROM candidates WHERE email = ? AND password = ?",
                    (email, password)
                )
            elif role == "recruiter":
                cursor.execute(
                    "SELECT company_id AS id, company_name FROM companies WHERE contact_email = ? AND password = ?",
                    (email, password)
                )
            else:
                return jsonify({"error": "Invalid role selected"}), 400

            user = cursor.fetchone()
            if user:
                session['user_id'] = user['id']
                session['role'] = role
                session['name'] = user['first_name'] if role == "student" else user['company_name']
                session['logged_in'] = True
                redirect_url = url_for("dashboard" if role == "student" else "recruiter")
                return jsonify({"redirect": redirect_url}), 200
            else:
                return jsonify({"error": "Invalid email or password"}), 401
        except Exception as e:
            current_app.logger.error(f"Unexpected error during login: {str(e)}", exc_info=True)
            return jsonify({"error": "An unexpected error occurred"}), 500
        finally:
            cursor.close()

    return render_template("login.html")

# Logout Route
@auth_bp.route('/logout', methods=['GET'])
def logout():
    session.clear()
    flash("You have been logged out.", "info")
    return redirect(url_for('main.login'))

# New GET routes for Signup pages with explicit endpoints
@auth_bp.route('/candidate_signup', methods=['GET'], endpoint='candidate_signup_get')
def candidate_signup_get():
    return render_template('candidate_signup.html')  # Ensure this template exists

@auth_bp.route('/candidate/signup', methods=['GET', 'POST'])
def candidate_signup():
    if request.method == 'GET':
        return render_template('candidate_signup.html')

    try:
        first_name = request.form.get('firstName')
        last_name = request.form.get('lastName')
        email = request.form.get('email')
        password = request.form.get('password')
        confirm_password = request.form.get('confirmPassword')

        if not all([first_name, last_name, email, password, confirm_password]):
            return jsonify({'error': 'Missing required fields'}), 400

        if password != confirm_password:
            return jsonify({'error': 'Passwords do not match'}), 400

        query = """
            INSERT INTO candidates (first_name, last_name, email, password)
            VALUES (:first_name, :last_name, :email, :password)
        """
        db.session.execute(query, {'first_name': first_name,
                                   'last_name': last_name,
                                   'email': email,
                                   'password': password})
        db.session.commit()

        return jsonify({'message': 'Candidate registered successfully'}), 201
    except Exception as e:
        print(f"Error inserting candidate: {e}")
        return jsonify({'error': 'Failed to register candidate'}), 500

@auth_bp.route('/company_signup', methods=['GET'], endpoint='company_signup_get')
def company_signup_get():
    return render_template('company_signup.html')  # Ensure this template exists

# Define company signup route with a consistent endpoint
@auth_bp.route('/company/signup', methods=['GET', 'POST'])
def company_signup():
    if request.method == 'GET':
        # Render the company signup page for GET requests
        return render_template('company_signup.html')

    try:
        # Handle form submission for POST requests
        company_name = request.form.get('companyName')
        company_email = request.form.get('companyEmail')
        password = request.form.get('password')
        confirm_password = request.form.get('confirmPassword')
        contact_number = request.form.get('contactNumber')
        industry_type = request.form.get('industryType')
        company_description = request.form.get('companyDescription')
        terms_agreement = request.form.get('termsAgreement')

        # Validate required fields
        if not all([company_name, company_email, password, confirm_password, contact_number, industry_type, company_description, terms_agreement]):
            return jsonify({'error': 'Missing required fields'}), 400

        if password != confirm_password:
            return jsonify({'error': 'Passwords do not match'}), 400

        # Check for duplicate email
        query = "SELECT COUNT(*) FROM companies WHERE contact_email = ?"
        cursor = get_db_cursor()
        result = cursor.execute(query, (company_email,)).fetchone()
        if result[0] > 0:
            return jsonify({'error': 'Email already exists'}), 400
        cursor.close()

        # Insert into the companies table
        query = """
            INSERT INTO companies (company_name, contact_email, password, contact_number, industry_type, company_description)
            VALUES (?, ?, ?, ?, ?, ?)
        """
        cursor = get_db_cursor()
        cursor.execute(query, (company_name, company_email, password, contact_number, industry_type, company_description))
        get_db().commit()
        cursor.close()

        return jsonify({'message': 'Company registered successfully'}), 201
    except Exception as e:
        current_app.logger.error(f"Unexpected error during company signup: {str(e)}", exc_info=True)
        return jsonify({'error': 'Failed to register company'}), 500