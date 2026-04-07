FROM node:20-slim AS frontend-build
WORKDIR /app
COPY frontend/package.json frontend/package-lock.json ./
RUN npm ci
COPY frontend/ ./
RUN npm run build

FROM python:3.11-slim
WORKDIR /app
COPY *.py ./connect_four/
COPY backend/ ./connect_four/backend/
COPY --from=frontend-build /app/dist ./connect_four/frontend/dist
RUN pip install --no-cache-dir -r connect_four/backend/requirements.txt
EXPOSE 10000
CMD cd connect_four/backend && python -m uvicorn main:app --host 0.0.0.0 --port ${PORT:-10000} --proxy-headers
