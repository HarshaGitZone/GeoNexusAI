import requests
print('pinging /')
try:
    r = requests.get('http://127.0.0.1:5000/')
    print('GET / status', r.status_code)
except Exception as e:
    print('GET / failed', e)

try:
    r = requests.post('http://127.0.0.1:5000/suitability', json={'latitude':17.385,'longitude':78.4867}, timeout=20)
    print('/suitability status', r.status_code)
    print('json keys', list(r.json().keys()))
except Exception as e:
    print('/suitability failed', e)
