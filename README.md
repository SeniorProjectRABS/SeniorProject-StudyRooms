# Django-React-TypeScript Project

## Backend Setup
1. Create virtual environment:
python python -m venv venv .\venv\Scripts\activate # On Windows

2. Install dependencies:
python cd backend pip install django djangorestframework django-cors-headers

3. Run migrations:
python python manage.py makemigrations python manage.py migrate

4. Run server:
python python manage.py runserver

## Frontend Setup
1. Install dependencies:
cd frontend
npm install


2. Run development server:

## Project Structure
- `/backend` - Django backend
  - Django REST framework API
  - CORS configuration
  - Database models
  - API endpoints
- `/frontend` - React TypeScript frontend
  - Vite build system
  - TypeScript configuration
  - React components
  - API integration

## Running the Project
- Backend: `python manage.py runserver` (runs on http://localhost:8000)
- Frontend: `npm run dev` (runs on http://localhost:5173)

## API Endpoints
- Admin interface: `http://localhost:8000/admin/`
- API root: `http://localhost:8000/api/`
- Items endpoint: `http://localhost:8000/api/items/`

## Technologies Used
- Backend:
  - Django
  - Django REST Framework
  - Django CORS Headers
- Frontend:
  - React
  - TypeScript
  - Vite
