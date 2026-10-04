FROM python:3.11-slim

WORKDIR /app

ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

COPY back4app-chatbot/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY back4app-chatbot/ .

CMD ["sh", "-c", "uvicorn main:app --host 0.0.0.0 --port ${PORT:-8080}"]
