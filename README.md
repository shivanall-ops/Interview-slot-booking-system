# Interview Slot Booking System

A Flask-based web application for managing interview slot bookings between HR and candidates.

## Project Structure

```
Interview-Slot-Booking-System/
│── app.py
│── database.py
│── routes.py
│── requirements.txt
│── README.md
│
├── templates/
│   ├── base.html
│   ├── login.html
│   ├── register.html
│   ├── hr_dashboard.html
│   └── candidate_dashboard.html
│
├── static/
│   ├── css/
│   │   └── style.css
│   └── js/
│       └── script.js
```

## Installation

1. Install dependencies:
   ```
   pip install -r requirements.txt
   ```

2. Run the application:
   ```
   python app.py
   ```

3. Open your browser and navigate to `http://127.0.0.1:5000`

## Features

- User authentication (login/register)
- HR dashboard for managing interview slots
- Candidate dashboard for booking interview slots
