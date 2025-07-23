# FAZ Football Scores Platform

A full-stack, multi-platform football scores platform for the Football Association of Zambia (FAZ), offering real-time updates, detailed match analytics, news feeds, push notifications, voice-based score updates, and multilingual support (English and Bemba).

## Project Structure

This project is organized into the following main directories:

- `frontend/`: React 18 + TypeScript + Tailwind CSS application.
- `backend/`: Node.js (Express) and Python (FastAPI) APIs.
- `mobile/`: Flutter mobile application.
- `database/`: PostgreSQL schema, MongoDB and Redis descriptions.
- `mock-api/`: Mock data and API simulation for testing.
- `cloud/`: GCP deployment configurations.
- `security/`: Security and GDPR compliance features.
- `docs/`: Project documentation (developer guides, admin guides).
- `build/`: Output directory for production builds.

## Getting Started

To set up and run the project locally, follow these steps:

### Prerequisites

- Node.js (LTS recommended)
- Python 3.x
- Flutter SDK
- PostgreSQL, MongoDB, Redis (or Docker for local instances)
- Git

### Installation

1.  **Clone the repository:**
    ```bash
    git clone <repository-url>
    cd faz-scores
    ```

2.  **Frontend Setup:**
    ```bash
    cd frontend
    npm install
    npm start
    ```

3.  **Backend Setup (Node.js):**
    ```bash
    cd backend
    npm install
    npm start
    ```

4.  **Backend Setup (Python FastAPI - for analytics):**
    ```bash
    cd backend
    pip install -r requirements.txt
    uvicorn src.main:app --reload
    ```

5.  **Mobile App Setup:**
    ```bash
    cd mobile
    flutter pub get
    flutter run
    ```

## Running Tests

Refer to the `TESTING_STRATEGY.md` file for detailed information on running tests.

## Deployment

Deployment configurations for Google Cloud Platform (GCP) are located in the `cloud/` directory.

## Documentation

Comprehensive documentation for developers and administrators can be found in the `docs/` directory.

