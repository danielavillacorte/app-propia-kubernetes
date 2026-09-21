FROM python:3.10-slim

WORKDIR /app

COPY requirements.txt .

RUN pip install --no-cache-dir -r requirements.txt

COPY App.py .
COPY cifar_resnet110_weights.pth .

CMD ["python", "App.py"]
