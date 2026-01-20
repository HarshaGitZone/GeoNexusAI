import matplotlib
matplotlib.use('Agg')  
import matplotlib.pyplot as plt
import numpy as np
import io
import os
import requests
from datetime import datetime
from reportlab.lib.pagesizes import A4
from reportlab.pdfgen import canvas
from reportlab.lib import colors
from reportlab.lib.utils import ImageReader

def _draw_wrapped_text(c, text, x, y, max_width, line_height):
    """
    Helper to manually wrap text within a specific width on the PDF.
    """
    words = text.split(' ')
    line = ""
    for word in words:
        if c.stringWidth(line + word + " ", "Helvetica", 7.5) < max_width:
            line += word + " "
        else:
            c.drawString(x, y, line)
            line = word + " "
            y -= line_height
    c.drawString(x, y, line)
    return y - line_height

def _calculate_site_potential(factors):
    """
    Evaluates ALL factor combinations to provide comprehensive prescriptive insights.
    """
    potentials = []
    f = {k: float(v) for k, v in factors.items()}
    
    # 1. Environmental Risk Analysis (High Priority)
    hazards = [k.upper() for k in ['flood', 'landslide', 'pollution'] if f.get(k, 100) < 45]
    if hazards:
        potentials.append({
            "label": "ENVIRONMENTAL CONSTRAINTS",
            "color": colors.HexColor("#ef4444"),
            "reason": f"CRITICAL RISK: Low safety scores in {', '.join(hazards)} indicate high hazard vulnerability. Development requires significant engineering mitigation or strict conservation adherence."
        })

    # 2. Residential Suitability
    if f.get('flood', 0) > 50 and f.get('landslide', 0) > 50 and f.get('pollution', 0) > 40:
        strength = "superior air quality" if f.get('pollution', 0) > 75 else "stable terrain profiles"
        potentials.append({
            "label": "RESIDENTIAL POTENTIAL",
            "color": colors.HexColor("#10b981"),
            "reason": f"Highly viable for residential development driven by {strength}. The environmental safety index provides a secure foundation for long-term urban housing projects."
        })

    # 3. Agricultural Viability
    if f.get('soil', 0) > 60 or f.get('rainfall', 0) > 60:
        lead = "High Soil Nutrient Density" if f.get('soil', 0) > f.get('rainfall', 0) else "Optimal Rainfall Patterns"
        potentials.append({
            "label": "AGRICULTURAL UTILITY",
            "color": colors.HexColor("#3b82f6"),
            "reason": f"Excellent agricultural potential identified via {lead}. The terrain supports high-yield sustainable crop cycles and intensive resource-efficient farming."
        })

    # 4. Industrial & Logistics Suitability
    if f.get('proximity', 0) > 60 and f.get('landuse', 0) > 40:
        potentials.append({
            "label": "LOGISTICS & INDUSTRY",
            "color": colors.HexColor("#8b5cf6"),
            "reason": f"Strategically positioned for industrial use. Proximity to existing infrastructure ({f.get('proximity'):.0f}%) and favorable zoning make this a prime hub for logistics and manufacturing."
        })
        
    return potentials 

def _draw_location_analysis(c, data, title_prefix, width, height):
    # Colors
    COLOR_DANGER = colors.HexColor("#ef4444")
    COLOR_WARNING = colors.HexColor("#f59e0b")
    COLOR_SUCCESS = colors.HexColor("#10b981")
    COLOR_DEEP_NAVY = colors.HexColor("#0f172a") 

    # 1. HEADER
    c.setFillColor(COLOR_DEEP_NAVY)
    c.rect(0, height - 100, width, 100, fill=1, stroke=0)
    c.setFillColor(colors.white)
    c.setFont("Helvetica-Bold", 20)
    c.drawCentredString(width / 2, height - 40, "GeoAI – Land Suitability Certificate")
    c.setFont("Helvetica-Bold", 12)
    c.drawCentredString(width / 2, height - 60, f"{title_prefix}: {data.get('locationName', 'Site Analysis')}".upper())
    
    # Coordinates
    c.setFont("Helvetica", 8)
    loc = data.get('location', {})
    lat_lng = f"LAT: {loc.get('latitude', '0.0000')}  |  LNG: {loc.get('longitude', '0.0000')}"
    timestamp = datetime.now().strftime('%d %b %Y | %H:%M:%S IST')
    c.drawCentredString(width / 2, height - 80, f"{timestamp}  •  {lat_lng}")

    # 2. MINI MAP
    y_map = height - 210
    try:
        map_url = f"https://static-maps.yandex.ru/1.x/?ll={loc.get('longitude')},{loc.get('latitude')}&z=13&l=sat&size=500,140"
        map_res = requests.get(map_url, timeout=5)
        if map_res.status_code == 200:
            map_img = ImageReader(io.BytesIO(map_res.content))
            c.drawImage(map_img, 40, y_map, width=width-80, height=110)
            c.setStrokeColor(colors.white)
            c.rect(40, y_map, width-80, 110, stroke=1, fill=0)
    except:
        c.setFillColor(colors.lightgrey)
        c.rect(40, y_map, width-80, 110, fill=1, stroke=0)

    # 3. SCORECARD
    score = float(data.get('suitability_score', 0))
    score_color = COLOR_DANGER if score < 40 else (COLOR_WARNING if score < 70 else COLOR_SUCCESS)
    y_score = y_map - 50
    c.setFillColor(score_color)
    c.setFont("Helvetica-Bold", 32)
    c.drawString(45, y_score, f"{score:.1f}")
    c.setFont("Helvetica-Bold", 10)
    c.drawString(45, y_score - 15, f"GRADE: {data.get('label', 'UNSUITABLE').upper()}")

    # 4. TERRAIN ANALYSIS (Radar & Bars)
    factors = data.get("factors", {})
    y_analysis = y_score - 200
    
    # Radar Chart
    if factors:
        labels = [k.capitalize() for k in factors.keys()]
        values = [float(v) for v in factors.values()]
        fig = plt.figure(figsize=(3, 3), dpi=100)
        ax = fig.add_subplot(111, polar=True)
        angles = np.linspace(0, 2 * np.pi, len(labels), endpoint=False).tolist()
        v_loop = values + values[:1]
        a_loop = angles + angles[:1]
        ax.fill(a_loop, v_loop, color='#06b6d4', alpha=0.3)
        ax.plot(a_loop, v_loop, color='#06b6d4', linewidth=1.5)
        ax.set_yticklabels([]); ax.set_xticks(angles); ax.set_xticklabels(labels, fontsize=6)
        chart_io = io.BytesIO()
        plt.savefig(chart_io, format='png', transparent=True)
        plt.close(fig); chart_io.seek(0)
        c.drawImage(ImageReader(chart_io), 30, y_analysis, width=180, height=180, mask='auto')

    # Factor Bars
    y_bar = y_analysis + 140
    c.setFillColor(colors.black); c.setFont("Helvetica-Bold", 10)
    c.drawString(width/2 + 20, y_bar + 15, "FACTOR DISTRIBUTION (%)")
    for factor, val in factors.items():
        c.setFont("Helvetica", 8); c.drawString(width/2 + 20, y_bar, factor.capitalize())
        c.setFillColor(colors.HexColor("#e2e8f0"))
        c.roundRect(width/2 + 80, y_bar - 2, 100, 7, 3, fill=1, stroke=0)
        c.setFillColor(COLOR_DANGER if val < 40 else (COLOR_WARNING if val < 70 else COLOR_SUCCESS))
        c.roundRect(width/2 + 80, y_bar - 2, (float(val)/100)*100, 7, 3, fill=1, stroke=0)
        c.setFillColor(colors.black); c.setFont("Helvetica-Bold", 7)
        c.drawString(width - 55, y_bar, f"{val:.1f}%")
        y_bar -= 18

    # 5. SITE POTENTIAL ANALYSIS
    y_pot = y_analysis - 20
    c.setFillColor(colors.black); c.setFont("Helvetica-Bold", 11)
    c.drawString(45, y_pot, "SITE POTENTIAL ANALYSIS")
    y_pot -= 20

    potentials = _calculate_site_potential(factors)
    for pot in potentials:
        if y_pot < 120: break # Leave room for Terrain Module
        # Tag
        c.setFillColor(pot['color'])
        c.roundRect(45, y_pot - 5, 125, 16, 4, fill=1, stroke=0)
        c.setFillColor(colors.white); c.setFont("Helvetica-Bold", 7)
        c.drawString(50, y_pot, pot['label'])
        
        # Wrapped Reasoning
        c.setFillColor(colors.black); c.setFont("Helvetica", 7.5)
        y_pot = _draw_wrapped_text(c, pot['reason'], 180, y_pot, width - 220, 9)
        y_pot -= 8 # Gap between items

    # 3.5 TERRAIN MODULE (Now correctly placed BELOW Site Potential)
    # We use y_pot - 20 as the starting point for the terrain box
    terrain_data = data.get("terrain_analysis")
    if terrain_data:
        _draw_terrain_module(c, terrain_data, 40, y_pot - 10, width)

    # 6. FORCE EVIDENCE TO NEXT PAGE
    c.showPage()
    # ... Evidence Section code remains unchanged ...
    c.setFillColor(COLOR_DEEP_NAVY)
    c.rect(0, height - 60, width, 60, fill=1, stroke=0)
    c.setFillColor(colors.white); c.setFont("Helvetica-Bold", 12)
    c.drawString(40, height - 35, f"{title_prefix} - INTELLIGENCE EVIDENCE DETAILS")
    
    y_ev = height - 100
    factors_meta = data.get("explanation", {}).get("factors_meta", {})
    for f_key, meta in factors_meta.items():
        if y_ev < 80:
            c.showPage(); y_ev = height - 80
        
        val = float(factors.get(f_key, 0))
        c.setFillColor(COLOR_DANGER if val < 40 else (COLOR_WARNING if val < 70 else COLOR_SUCCESS))
        c.rect(40, y_ev - 30, 3, 35, fill=1, stroke=0)
        c.setFillColor(colors.black); c.setFont("Helvetica-Bold", 9.5)
        c.drawString(50, y_ev, f"{f_key.upper()} ANALYSIS SCORE: {val:.1f}")
        c.setFont("Helvetica", 8.5)
        reason = meta.get("reason", "Analysis complete.")
        y_ev = _draw_wrapped_text(c, reason, 50, y_ev - 15, width - 100, 10)
        y_ev -= 15

def _draw_terrain_module(c, terrain, x, y, width):
    """
    Draws the Terrain & Slope Analysis box in the PDF.
    Now uses the 'y' provided to place it below other elements.
    """
    if not terrain:
        return y
    
    slope = terrain.get('slope_percent', 0)
    verdict = terrain.get('verdict', 'N/A')
    
    # Draw Background Box
    c.setFillColor(colors.HexColor("#f8fafc"))
    # We draw the box 50 units high starting from current y
    c.roundRect(x, y - 50, width - 80, 55, 6, fill=1, stroke=0)
    
    # Draw Label
    c.setFillColor(colors.black)
    c.setFont("Helvetica-Bold", 10)
    c.drawString(x + 10, y - 10, "TERRAIN & SLOPE ANALYSIS")
    
    # Draw Slope Value
    slope_color = colors.HexColor("#ef4444") if slope > 15 else (colors.HexColor("#f59e0b") if slope > 5 else colors.HexColor("#10b981"))
    c.setFillColor(slope_color)
    c.setFont("Helvetica-Bold", 14)
    c.drawString(x + 10, y - 30, f"{slope:.1f}%")
    
    c.setFillColor(colors.black)
    c.setFont("Helvetica", 8)
    c.drawString(x + 60, y - 28, "Gradient")
    
    # Draw Verdict
    c.setFont("Helvetica-Oblique", 8)
    c.drawString(x + 10, y - 43, f"Verdict: {verdict}")
    
    return y - 60

def generate_land_report(data):
    buffer = io.BytesIO()
    c = canvas.Canvas(buffer, pagesize=A4)
    width, height = A4
    _draw_location_analysis(c, data, "LOCATION A", width, height)
    compare_data = data.get("compareData")
    if compare_data:
        c.showPage()
        _draw_location_analysis(c, compare_data, "LOCATION B", width, height)
    c.save(); buffer.seek(0)
    return buffer