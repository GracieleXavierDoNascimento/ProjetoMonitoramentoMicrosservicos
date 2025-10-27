from flask import Flask, render_template, jsonify, request
from flask_cors import CORS
import requests
from datetime import datetime
import time
from prometheus_client import Counter, generate_latest, REGISTRY

app = Flask(__name__)
CORS(app)

# Prometheus metrics for dashboard
dashboard_requests = Counter('dashboard_requests_total', 'Total dashboard requests')
alerts_received = Counter('alerts_received_total', 'Total alerts received', ['severity'])

# In-memory storage for alerts (in production, use a database)
alerts_storage = []

PROMETHEUS_URL = 'http://prometheus:9090'
SERVICES = ['service-a:5000', 'service-b:5001', 'service-c:5002']

@app.route('/')
def index():
    """Main dashboard page"""
    dashboard_requests.inc()
    return render_template('index.html')

@app.route('/api/services/status')
def get_services_status():
    """Get status of all services"""
    services_status = []
    
    for service in SERVICES:
        try:
            response = requests.get(f'http://{service}/health', timeout=2)
            status_data = response.json()
            services_status.append({
                'name': status_data.get('service', service),
                'status': 'healthy' if status_data.get('healthy', False) else 'unhealthy',
                'cpu': status_data.get('cpu_percent', 0),
                'memory': status_data.get('memory_percent', 0),
                'timestamp': status_data.get('timestamp', time.time())
            })
        except Exception as e:
            services_status.append({
                'name': service,
                'status': 'down',
                'error': 'Service unavailable',
                'timestamp': time.time()
            })
    
    return jsonify(services_status)

@app.route('/api/metrics/query', methods=['POST'])
def query_metrics():
    """Query Prometheus metrics"""
    query = request.json.get('query', '')
    
    try:
        response = requests.get(
            f'{PROMETHEUS_URL}/api/v1/query',
            params={'query': query}
        )
        return jsonify(response.json())
    except Exception as e:
        return jsonify({'error': 'Failed to query metrics'}), 500

@app.route('/api/metrics/range', methods=['POST'])
def query_range():
    """Query Prometheus metrics over a time range"""
    data = request.json
    query = data.get('query', '')
    start = data.get('start', int(time.time()) - 3600)
    end = data.get('end', int(time.time()))
    step = data.get('step', '15s')
    
    try:
        response = requests.get(
            f'{PROMETHEUS_URL}/api/v1/query_range',
            params={
                'query': query,
                'start': start,
                'end': end,
                'step': step
            }
        )
        return jsonify(response.json())
    except Exception as e:
        return jsonify({'error': 'Failed to query metrics range'}), 500

@app.route('/api/alerts', methods=['GET', 'POST'])
def handle_alerts():
    """Handle alerts from AlertManager"""
    if request.method == 'POST':
        # Receive alerts from AlertManager
        alert_data = request.json
        
        for alert in alert_data.get('alerts', []):
            severity = alert.get('labels', {}).get('severity', 'info')
            alerts_received.labels(severity=severity).inc()
            
            alert_info = {
                'status': alert.get('status', 'unknown'),
                'labels': alert.get('labels', {}),
                'annotations': alert.get('annotations', {}),
                'startsAt': alert.get('startsAt', ''),
                'endsAt': alert.get('endsAt', ''),
                'generatorURL': alert.get('generatorURL', ''),
                'received_at': datetime.now().isoformat()
            }
            
            alerts_storage.append(alert_info)
            
            # Keep only last 100 alerts
            if len(alerts_storage) > 100:
                alerts_storage.pop(0)
        
        return jsonify({'status': 'ok', 'received': len(alert_data.get('alerts', []))}), 200
    
    else:
        # Return stored alerts
        limit = request.args.get('limit', 50, type=int)
        return jsonify(alerts_storage[-limit:])

@app.route('/api/alerts/active')
def get_active_alerts():
    """Get active alerts from Prometheus"""
    try:
        response = requests.get(f'{PROMETHEUS_URL}/api/v1/alerts')
        return jsonify(response.json())
    except Exception as e:
        return jsonify({'error': 'Failed to get active alerts'}), 500

@app.route('/api/alerts/rules')
def get_alert_rules():
    """Get alert rules from Prometheus"""
    try:
        response = requests.get(f'{PROMETHEUS_URL}/api/v1/rules')
        return jsonify(response.json())
    except Exception as e:
        return jsonify({'error': 'Failed to get alert rules'}), 500

@app.route('/metrics')
def metrics():
    """Prometheus metrics endpoint"""
    return generate_latest(REGISTRY), 200, {'Content-Type': 'text/plain; charset=utf-8'}

@app.route('/health')
def health():
    """Health check endpoint"""
    return jsonify({
        'service': 'dashboard',
        'status': 'healthy',
        'timestamp': time.time()
    })

if __name__ == '__main__':
    print("Starting Dashboard on port 8080")
    app.run(host='0.0.0.0', port=8080, debug=False)
