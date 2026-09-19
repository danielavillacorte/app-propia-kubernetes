const http = require("http");

let requests = 0;
const startTime = new Date();

function jsonResponse(response, statusCode, payload) {
  response.writeHead(statusCode, { "Content-Type": "application/json" });
  response.end(JSON.stringify(payload, null, 2));
}

function predictPerformance(studyHours, sleepHours, focusLevel) {
  const studyScore = Math.min(studyHours / 8, 1) * 0.45;
  const sleepScore = Math.min(sleepHours / 8, 1) * 0.35;
  const focusScore = Math.min(focusLevel / 10, 1) * 0.2;
  const score = studyScore + sleepScore + focusScore;

  if (score >= 0.78) {
    return { label: "alto rendimiento esperado", score };
  }

  if (score >= 0.55) {
    return { label: "rendimiento medio esperado", score };
  }

  return { label: "riesgo academico moderado", score };
}

function renderHome(host, uptimeSeconds) {
  return `<!doctype html>
<html lang="es">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Analitica Academica | Kubernetes</title>
  <style>
    :root {
      color-scheme: light;
      --ink: #17202a;
      --muted: #617082;
      --line: #d9e0e8;
      --panel: #ffffff;
      --soft: #f4f7fb;
      --blue: #2563eb;
      --teal: #0f766e;
      --green: #15803d;
    }

    * { box-sizing: border-box; }

    body {
      margin: 0;
      min-height: 100vh;
      font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
      color: var(--ink);
      background: var(--soft);
    }

    header {
      border-bottom: 1px solid var(--line);
      background: #ffffff;
    }

    .wrap {
      width: min(1120px, calc(100% - 32px));
      margin: 0 auto;
    }

    .topbar {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 16px;
      min-height: 72px;
    }

    .brand {
      display: flex;
      align-items: center;
      gap: 12px;
      font-weight: 800;
      letter-spacing: 0;
    }

    .mark {
      display: grid;
      place-items: center;
      width: 42px;
      height: 42px;
      border-radius: 8px;
      color: white;
      background: linear-gradient(135deg, var(--blue), var(--teal));
      font-weight: 900;
    }

    .status {
      display: flex;
      align-items: center;
      gap: 8px;
      color: var(--green);
      font-size: 14px;
      font-weight: 700;
    }

    .dot {
      width: 10px;
      height: 10px;
      border-radius: 999px;
      background: var(--green);
    }

    main { padding: 32px 0 44px; }

    .hero {
      display: grid;
      grid-template-columns: minmax(0, 1.05fr) minmax(320px, 0.95fr);
      gap: 28px;
      align-items: stretch;
    }

    .intro,
    .predictor,
    .metric,
    .result {
      border: 1px solid var(--line);
      border-radius: 8px;
      background: var(--panel);
      box-shadow: 0 8px 24px rgba(30, 41, 59, 0.06);
    }

    .intro { padding: 32px; }

    h1 {
      margin: 0 0 16px;
      font-size: clamp(32px, 5vw, 56px);
      line-height: 1.02;
      letter-spacing: 0;
    }

    .lead {
      max-width: 720px;
      margin: 0;
      color: var(--muted);
      font-size: 18px;
      line-height: 1.65;
    }

    .metrics {
      display: grid;
      grid-template-columns: repeat(3, minmax(0, 1fr));
      gap: 12px;
      margin-top: 28px;
    }

    .metric { padding: 16px; }

    .metric span {
      display: block;
      color: var(--muted);
      font-size: 13px;
      font-weight: 700;
      text-transform: uppercase;
    }

    .metric strong {
      display: block;
      margin-top: 8px;
      overflow-wrap: anywhere;
      font-size: 20px;
    }

    .predictor { padding: 24px; }

    h2 {
      margin: 0 0 18px;
      font-size: 24px;
      letter-spacing: 0;
    }

    label {
      display: block;
      margin: 16px 0 8px;
      color: #263547;
      font-weight: 700;
    }

    input[type="range"] {
      width: 100%;
      accent-color: var(--blue);
    }

    .value {
      color: var(--teal);
      font-weight: 800;
    }

    button {
      width: 100%;
      min-height: 46px;
      margin-top: 22px;
      border: 0;
      border-radius: 8px;
      color: white;
      background: var(--blue);
      font: inherit;
      font-weight: 800;
      cursor: pointer;
    }

    button:hover { background: #1d4ed8; }

    .result {
      display: none;
      margin-top: 16px;
      padding: 16px;
      background: #f8fbff;
    }

    .result.visible { display: block; }

    .result strong {
      display: block;
      margin-bottom: 6px;
      color: var(--teal);
      font-size: 20px;
    }

    .result p {
      margin: 0 0 12px;
      color: var(--muted);
      font-weight: 700;
    }

    .result pre {
      margin: 0;
      overflow: auto;
      white-space: pre-wrap;
      font-size: 14px;
      line-height: 1.5;
    }

    footer {
      margin-top: 28px;
      color: var(--muted);
      font-size: 14px;
    }

    @media (max-width: 820px) {
      .hero,
      .metrics { grid-template-columns: 1fr; }
    }
  </style>
</head>
<body>
  <header>
    <div class="wrap topbar">
      <div class="brand">
        <div class="mark">IA</div>
        <div>Analitica Academica | Kubernetes</div>
      </div>
      <div class="status"><span class="dot"></span> Kubernetes activo</div>
    </div>
  </header>

  <main class="wrap">
    <section class="hero">
      <div class="intro">
        <h1>Analitica academica desplegada en Kubernetes</h1>
        <p class="lead">
          Aplicacion de datos e IA que simula una prediccion de desempeno academico
          usando variables de estudio, descanso y enfoque. Cada respuesta muestra
          el pod que proceso la solicitud, permitiendo observar el funcionamiento
          de replicas y Services en Kubernetes.
        </p>

        <div class="metrics">
          <div class="metric">
            <span>Pod</span>
            <strong>${host}</strong>
          </div>
          <div class="metric">
            <span>Requests</span>
            <strong>${requests}</strong>
          </div>
          <div class="metric">
            <span>Uptime</span>
            <strong>${uptimeSeconds}s</strong>
          </div>
        </div>
      </div>

      <div>
        <form class="predictor" id="predictor">
          <h2>Simulador de prediccion</h2>

          <label for="study">Horas de estudio: <span class="value" id="studyValue">6</span></label>
          <input id="study" name="studyHours" type="range" min="0" max="10" step="1" value="6">

          <label for="sleep">Horas de descanso: <span class="value" id="sleepValue">7</span></label>
          <input id="sleep" name="sleepHours" type="range" min="0" max="10" step="1" value="7">

          <label for="focus">Nivel de enfoque: <span class="value" id="focusValue">8</span></label>
          <input id="focus" name="focusLevel" type="range" min="0" max="10" step="1" value="8">

          <button type="submit">Calcular prediccion</button>
        </form>

        <div class="result" id="result">
          <strong id="resultTitle"></strong>
          <p id="resultScore"></p>
          <pre></pre>
        </div>
      </div>
    </section>

    <footer>
      Endpoints disponibles: /health, /api/metrics, /api/predict?studyHours=6&sleepHours=7&focusLevel=8
    </footer>
  </main>

  <script>
    const form = document.getElementById("predictor");
    const result = document.getElementById("result");
    const fields = [
      ["study", "studyValue"],
      ["sleep", "sleepValue"],
      ["focus", "focusValue"]
    ];

    fields.forEach(([inputId, valueId]) => {
      const input = document.getElementById(inputId);
      const value = document.getElementById(valueId);
      input.addEventListener("input", () => {
        value.textContent = input.value;
      });
    });

    form.addEventListener("submit", async (event) => {
      event.preventDefault();
      const params = new URLSearchParams(new FormData(form));
      const response = await fetch("/api/predict?" + params.toString());
      const payload = await response.json();
      result.classList.add("visible");
      document.getElementById("resultTitle").textContent = payload.prediction;
      document.getElementById("resultScore").textContent = "Score: " + payload.score + " | Pod: " + payload.pod;
      result.querySelector("pre").textContent = JSON.stringify(payload, null, 2);
    });
  </script>
</body>
</html>`;
}

const server = http.createServer((request, response) => {
  const host = process.env.HOSTNAME || "local";
  requests += 1;
  const uptimeSeconds = Math.round((new Date() - startTime) / 1000);
  const url = new URL(request.url, `http://${request.headers.host}`);

  console.log(
    "Pod:",
    host,
    "| Requests:",
    requests,
    "| Uptime:",
    uptimeSeconds,
    "seconds",
    "| Time:",
    new Date().toISOString()
  );

  if (url.pathname === "/health") {
    jsonResponse(response, 200, { status: "ok", pod: host, version: "v2" });
    return;
  }

  if (url.pathname === "/api/metrics") {
    jsonResponse(response, 200, {
      app: "microproyecto2-datos-ia",
      pod: host,
      requests,
      uptimeSeconds,
      version: "v2",
    });
    return;
  }

  if (url.pathname === "/api/predict") {
    const studyHours = Number(url.searchParams.get("studyHours") || 6);
    const sleepHours = Number(url.searchParams.get("sleepHours") || 7);
    const focusLevel = Number(url.searchParams.get("focusLevel") || 8);
    const prediction = predictPerformance(studyHours, sleepHours, focusLevel);

    jsonResponse(response, 200, {
      prediction: prediction.label,
      score: Number(prediction.score.toFixed(3)),
      features: {
        studyHours,
        sleepHours,
        focusLevel,
      },
      pod: host,
      version: "v2",
    });
    return;
  }

  if (url.pathname === "/") {
    response.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
    response.end(renderHome(host, uptimeSeconds));
    return;
  }

  jsonResponse(response, 404, { error: "Ruta no encontrada" });
});

server.listen(8080, () => {
  console.log("Microproyecto 2 app started at:", startTime.toISOString());
});
