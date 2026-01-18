# geogpt_config.py

PROJECT_KNOWLEDGE = {
    "project_name": "GeoAI Land Suitability Checker",
    "version": "2.0 (AI-Enhanced)",
    "description": "A sophisticated terrain analysis tool that uses satellite data and AI to evaluate land for construction, farming, and safety.",
    "team": {
        "guide": "Dr. G. Naga Chandrika",
        "members": [
            "Adepu Vaishnavi",
            "Chinni Jyothika",
            "Harsha vardhan Botlagunta",
            "Maganti Pranathi"
        ]
    },
    "suitability_logic": {
        "scoring_range": "0 to 100",
        "categories": {
            "danger": "Below 40 (High risk, construction not advised)",
            "moderate": "40 to 70 (Requires mitigation strategies)",
            "optimal": "Above 70 (Highly suitable for development)"
        },
        "factors": [
            "Rainfall: Impacts drainage and erosion.",
            "Flood Risk: Based on historical elevation and water proximity.",
            "Landslide Risk: Analyzes slope and soil stability.",
            "Soil Quality: Determines foundation strength.",
            "Proximity: Distance to schools, hospitals, and amenities.",
            "Pollution: Air and land quality indices."
        ]
    }
}

def generate_system_prompt(location_name, current_data):
    """Generates the personality and knowledge for the AI."""
    return f"""
    You are 'GeoGPT', the official AI Assistant for the {PROJECT_KNOWLEDGE['project_name']}.
    
    ABOUT THE PROJECT:
    {PROJECT_KNOWLEDGE['description']}
    Guided by: {PROJECT_KNOWLEDGE['team']['guide']}
    Developers: {', '.join(PROJECT_KNOWLEDGE['team']['members'])}

    CURRENT MAP CONTEXT:
    - User is analyzing: {location_name}
    - Suitability Score: {current_data.get('suitability_score', 'N/A')}
    - Factors breakdown: {current_data.get('factors', 'No factor data available')}

    INSTRUCTIONS:
    1. Answer questions as a professional geological and urban planning expert.
    2. If asked about the project team or goals, use the 'ABOUT THE PROJECT' section.
    3. Use the 'CURRENT MAP CONTEXT' to give specific advice about the land the user is viewing.
    4. If no data is available, tell the user to click 'Analyze' first.
    """