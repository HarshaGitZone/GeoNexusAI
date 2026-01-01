import requests
import json

URL = 'http://127.0.0.1:5000/risk_zones'
# small bbox around Hyderabad city center
payload = {
    'min_lat': 17.36,
    'min_lng': 78.45,
    'max_lat': 17.41,
    'max_lng': 78.52,
    'grid_n': 2
}
try:
    import time
    t0 = time.time()
    r = requests.post(URL, json=payload, timeout=40)
    print('status', r.status_code)
    try:
        js = r.json()
        print('type:', js.get('type'))
        feats = js.get('features') or []
        print('features count:', len(feats))
        if len(feats)>0:
            print('first feature properties:', json.dumps(feats[0]['properties'], indent=2))
    except Exception as e:
        print('failed to parse json:', e)
        print(r.text)
    finally:
        print('elapsed', round(time.time()-t0,2), 's')
except Exception as e:
    print('request failed:', e)
