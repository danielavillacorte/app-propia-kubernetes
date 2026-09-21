import io

import flask
import torch
import torch.nn as nn
from torchvision import transforms
from torchvision.models import resnet18
from PIL import Image

import time
from prometheus_client import Counter, Histogram, generate_latest, CONTENT_TYPE_LATEST

app = flask.Flask(__name__)

DEVICE = torch.device("cuda" if torch.cuda.is_available() else "cpu")

CLASS_NAMES = [
    "airplane", "automobile", "bird", "cat", "deer",
    "dog", "frog", "horse", "ship", "truck",
]


def get_model(name, classes=10, pretrained=False):
    if name != "cifar_resnet110_v1":
        raise ValueError(f"Unknown model: {name}")

    weights = "DEFAULT" if pretrained else None
    model = resnet18(weights=weights)

    # Adaptar a CIFAR-10
    model.conv1 = nn.Conv2d(
        3, 64,
        kernel_size=3,
        stride=1,
        padding=1,
        bias=False,
    )
    model.maxpool = nn.Identity()
    model.fc = nn.Linear(model.fc.in_features, classes)

    return model


# Cargar el modelo una sola vez al iniciar el servidor
net = get_model("cifar_resnet110_v1", classes=10, pretrained=False)
state_dict = torch.load("cifar_resnet110_weights.pth", map_location=DEVICE)
net.load_state_dict(state_dict)
net.to(DEVICE)
net.eval()

transform_fn = transforms.Compose([
    transforms.Resize(32),
    transforms.CenterCrop(32),
    transforms.ToTensor(),
    transforms.Normalize([0.4914, 0.4822, 0.4465], [0.2023, 0.1994, 0.2010]),
])

#Para el monitoreo de kubernetes
PREDICTIONS = Counter('predictions_total', 'Total predictions served')
LATENCY = Histogram('prediction_latency_seconds', 'Time spent classifying an image')
RESULTS = Counter('prediction_results_total', 'Predictions by class', ['predicted_class'])

@app.route('/metrics') 
def metrics():
    return generate_latest(), 200, {'Content-Type': CONTENT_TYPE_LATEST}


@app.route("/predict", methods=["POST"])
def predict():
    prediction = None
    start = time.time()

    if flask.request.method == "POST":
        if flask.request.files.get("img"):
            img = Image.open(io.BytesIO(flask.request.files["img"].read())).convert("RGB")
            img_tensor = transform_fn(img).unsqueeze(0).to(DEVICE)

            with torch.no_grad():
                pred = net(img_tensor)
                probs = torch.softmax(pred, dim=1)
                ind = torch.argmax(probs, dim=1).item()
                confidence = probs[0, ind].item()

            LATENCY.observe(time.time() - start)#Time for each prediction
            PREDICTIONS.inc()
            RESULTS.labels(predicted_class=CLASS_NAMES[ind]).inc()

            prediction = (
                "The input picture is classified as [%s], with probability %.3f."
                % (CLASS_NAMES[ind], confidence)
            )

    return prediction or "No image provided", 200 if prediction else 400


if __name__ == "__main__":
    app.run(host="0.0.0.0")
