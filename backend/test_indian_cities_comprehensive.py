#!/usr/bin/env python3
"""
Comprehensive test for all major Indian cities by region
"""

from suitability_factors.hydrology.water_utility import get_water_utility

def test_indian_cities_comprehensive():
    """Test all major Indian cities by region"""
    
    print("=" * 80)
    print("COMPREHENSIVE INDIAN CITIES WATER DETECTION TEST")
    print("=" * 80)
    
    # Organized by region
    regions = {
        "North India": [
            (28.6139, 77.2090, "New Delhi"),
            (28.6353, 77.2250, "Gurgaon"),
            (28.4595, 77.0266, "Noida"),
            (28.6692, 77.4538, "Ghaziabad"),
            (26.9124, 75.7873, "Jaipur"),
            (26.8467, 78.1702, "Agra"),
            (28.7041, 77.1025, "Faridabad"),
            (29.3909, 76.9635, "Karnal"),
            (30.7333, 76.7794, "Chandigarh"),
            (31.1471, 75.3401, "Jalandhar"),
            (31.6340, 74.8723, "Amritsar"),
            (32.7186, 74.8581, "Jammu"),
            (34.0837, 74.7973, "Srinagar"),
            (29.2000, 79.5000, "Nainital"),
            (25.5941, 85.1376, "Patna"),
            (25.4358, 81.8463, "Allahabad"),
            (26.8467, 80.9462, "Kanpur"),
            (26.2124, 78.1591, "Gwalior"),
            (26.2183, 78.1828, "Jhansi"),
        ],
        
        "South India": [
            (17.5380, 78.3945, "Hyderabad"),
            (12.9716, 77.5946, "Bangalore"),
            (13.0674, 80.2377, "Chennai"),
            (9.9252, 78.1198, "Madurai"),
            (11.0168, 76.9558, "Coimbatore"),
            (10.7905, 78.7047, "Tiruchirappalli"),
            (12.9141, 74.8560, "Mangalore"),
            (9.9312, 76.2673, "Kochi"),
            (8.5241, 76.9366, "Thiruvananthapuram"),
            (15.2993, 74.1240, "Belgaum"),
            (17.3217, 78.4732, "Warangal"),
            (16.5062, 80.6480, "Vijayawada"),
            (14.5970, 79.8194, "Nellore"),
            (14.4401, 79.9864, "Tirupati"),
        ],
        
        "East India": [
            (22.5726, 88.3639, "Kolkata"),
            (20.2961, 85.8245, "Bhubaneswar"),
            (26.1445, 91.7362, "Guwahati"),
            (23.3441, 85.3096, "Ranchi"),
            (23.8315, 86.4425, "Dhanbad"),
            (24.7960, 85.0079, "Bokaro"),
            (25.6136, 87.1275, "Purnia"),
            (26.7498, 83.3635, "Gorakhpur"),
            (25.4479, 81.8337, "Varanasi"),
            (25.6234, 85.0412, "Patna"),
        ],
        
        "West India": [
            (19.0760, 72.8777, "Mumbai"),
            (18.5204, 73.8567, "Pune"),
            (21.1702, 72.8311, "Surat"),
            (23.2156, 72.6369, "Ahmedabad"),
            (22.3039, 70.8022, "Rajkot"),
            (20.0113, 73.7906, "Nashik"),
            (19.8762, 75.3431, "Aurangabad"),
            (26.9157, 75.8198, "Ajmer"),
            (24.5854, 73.7128, "Udaipur"),
            (26.2389, 73.0243, "Jodhpur"),
            (27.0238, 74.2179, "Bikaner"),
        ],
        
        "Central India": [
            (23.2599, 77.4126, "Bhopal"),
            (21.1463, 79.0849, "Nagpur"),
            (22.7196, 75.8577, "Indore"),
            (23.1793, 75.7849, "Ujjain"),
            (26.8755, 78.9218, "Gwalior"),
            (24.0539, 82.8334, "Rewa"),
            (23.4733, 77.9470, "Sagar"),
        ]
    }
    
    total_cities = 0
    total_correct = 0
    
    for region_name, cities in regions.items():
        print(f"\n{region_name.upper()}:")
        print("-" * 50)
        
        region_correct = 0
        for lat, lng, city in cities:
            total_cities += 1
            result = get_water_utility(lat, lng)
            water_type = result.get('water_type', '')
            value = result.get('value', 0)
            
            # Check if correctly classified as land (not water body)
            if water_type not in ['ocean', 'major_water', 'local_water'] and value > 0:
                region_correct += 1
                total_correct += 1
                print(f"✅ {city} -> {water_type} (Score: {value})")
            else:
                print(f"❌ {city} -> {water_type} (Score: {value})")
        
        print(f"Region: {region_correct}/{len(cities)} correct ({region_correct/len(cities)*100:.1f}%)")
    
    print(f"\n" + "=" * 80)
    print("INDIA COMPREHENSIVE RESULTS")
    print("=" * 80)
    print(f"Total Cities: {total_cities}")
    print(f"Correctly Classified: {total_correct}")
    print(f"Overall Accuracy: {total_correct/total_cities*100:.1f}%")
    
    return total_correct / total_cities

if __name__ == "__main__":
    test_indian_cities_comprehensive()
