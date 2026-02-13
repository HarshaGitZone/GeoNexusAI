from app import app
import json

with app.test_client() as client:
    # Test health endpoint
    response = client.get('/health')
    print(f"Health Status: {response.status_code}")
    data = response.get_json()
    print(f"Health Data: {json.dumps(data, indent=2)}")
    
    # Test suitability endpoint (basic)
    response2 = client.post('/suitability', 
                          json={"latitude": 17.3850, "longitude": 78.4867},
                          headers={'Content-Type': 'application/json'})
    print(f"Suitability Status: {response2.status_code}")
    
    # Test CORS headers
    print(f"CORS Headers: {dict(response.headers)}")
