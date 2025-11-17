# services/forecast/Dockerfile - FastAPI Forecast service
FROM python:3.13-slim

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1

WORKDIR /app

# System deps for psycopg
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential gcc libpq-dev && \
    rm -rf /var/lib/apt/lists/*

# Install dependencies
COPY requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt

# Copy app
COPY app ./app
COPY run_once.py ./

EXPOSE 8001
ENV PORT=8001
CMD ["python", "-m", "uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8001"]
