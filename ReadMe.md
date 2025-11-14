# Personal AI Assistant

## Run locally with Docker
1. Create `.env` with OPENAI_API_KEY (do not commit).
2. docker-compose up --build
3. Open http://localhost:5000

## Run without Docker
cd backend
pip install -r requirements.txt
export OPENAI_API_KEY="sk-..."
python app.py
