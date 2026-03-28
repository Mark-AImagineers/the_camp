FROM python:3.11-slim-bookworm

WORKDIR /app

COPY 02_backend/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY 02_backend/ .

COPY version.json /version.json

EXPOSE 8000

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
