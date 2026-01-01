import requests
import json

url = 'http://127.0.0.1:5000/suitability'
for coord in [(0.0, 0.0), (17.385, 78.4867)]:
    payload = {'latitude': coord[0], 'longitude': coord[1], 'debug': True}
    try:
        r = requests.post(url, json=payload, timeout=30)
        print('\n== Request', payload)
        print('Status:', r.status_code)
        try:
            print(json.dumps(r.json(), indent=2))
        except Exception:
            print(r.text)
    except Exception as e:
        print('Request failed', e)
