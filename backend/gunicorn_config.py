# Emergency Gunicorn configuration for Render
# Ultra-minimal settings to prevent 502 errors

bind = "0.0.0.0:$PORT"
workers = 1  # Single worker
threads = 1  # Single thread
timeout = 60  # Shorter timeout
worker_class = "sync"  # Simple sync worker
max_requests = 100  # Restart after 100 requests
max_requests_jitter = 10  # Random jitter
preload_app = True  # Preload for stability
worker_connections = 1000  # Limit connections

# Memory optimization
limit_request_line = 4096
limit_request_fields = 100
limit_request_field_size = 8190

# Logging (minimal)
accesslog = "-"
errorlog = "-"
loglevel = "warning"  # Only warnings and errors
access_log_format = '%(h)s %(l)s %(u)s %(t)s "%(r)s" %(s)s %(b)s "%(f)s" "%(a)s"'
