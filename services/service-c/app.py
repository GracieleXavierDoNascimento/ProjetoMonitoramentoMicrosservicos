from flask import Flask, jsonify, request
from prometheus_client import Counter, Histogram, Gauge, generate_latest, REGISTRY
import psutil
import time
import random
import os

app = Flask(__name__)

SERVICE_NAME = os.getenv('SERVICE_NAME', 'service-c')
PORT = int(os.getenv('PORT', 5000))

# Prometheus metrics
request_count = Counter(
    'http_requests_total',
    'Total HTTP requests',
    ['method', 'endpoint', 'status']
)

request_duration = Histogram(
    'http_request_duration_seconds',
    'HTTP request duration',
    ['method', 'endpoint']
)

cpu_usage = Gauge('cpu_usage_percent', 'CPU usage percentage')
memory_usage = Gauge('memory_usage_percent', 'Memory usage percentage')
service_health = Gauge('service_health', 'Service health status (1=healthy, 0=unhealthy)')

# Initialize service as healthy
service_health.set(1)

def update_system_metrics():
    """Update CPU and memory metrics"""
    cpu_usage.set(psutil.cpu_percent(interval=0.1))
    memory_usage.set(psutil.virtual_memory().percent)

@app.before_request
def before_request():
    request.start_time = time.time()

@app.after_request
def after_request(response):
    request_duration_seconds = time.time() - request.start_time
    
    request_count.labels(
        method=request.method,
        endpoint=request.path,
        status=response.status_code
    ).inc()
    
    request_duration.labels(
        method=request.method,
        endpoint=request.path
    ).observe(request_duration_seconds)
    
    update_system_metrics()
    
    return response

@app.route('/')
def home():
    return jsonify({
        'service': SERVICE_NAME,
        'status': 'running',
        'timestamp': time.time()
    })

@app.route('/health')
def health():
    """Health check endpoint"""
    update_system_metrics()
    
    cpu = psutil.cpu_percent(interval=0.1)
    memory = psutil.virtual_memory().percent
    
    # Simulate unhealthy state if CPU or memory is too high
    is_healthy = cpu < 90 and memory < 90
    service_health.set(1 if is_healthy else 0)
    
    return jsonify({
        'service': SERVICE_NAME,
        'healthy': is_healthy,
        'cpu_percent': cpu,
        'memory_percent': memory,
        'timestamp': time.time()
    }), 200 if is_healthy else 503

@app.route('/api/data')
def get_data():
    """Simulate data processing with variable response time"""
    # Simulate processing time
    processing_time = random.uniform(0.1, 0.5)
    time.sleep(processing_time)
    
    return jsonify({
        'service': SERVICE_NAME,
        'data': [random.randint(1, 100) for _ in range(10)],
        'processing_time': processing_time,
        'timestamp': time.time()
    })

@app.route('/api/slow')
def slow_endpoint():
    """Simulate a slow endpoint"""
    time.sleep(random.uniform(1, 3))
    return jsonify({
        'service': SERVICE_NAME,
        'message': 'This is a slow endpoint',
        'timestamp': time.time()
    })

@app.route('/api/error')
def error_endpoint():
    """Simulate error for testing"""
    if random.random() < 0.3:
        return jsonify({'error': 'Random error occurred'}), 500
    return jsonify({'message': 'Success'}), 200

@app.route('/metrics')
def metrics():
    """Prometheus metrics endpoint"""
    update_system_metrics()
    return generate_latest(REGISTRY), 200, {'Content-Type': 'text/plain; charset=utf-8'}

if __name__ == '__main__':
    print(f"Starting {SERVICE_NAME} on port {PORT}")
    app.run(host='0.0.0.0', port=PORT, debug=False)
