# import matplotlib
# matplotlib.use('Agg')  # MUST BE LINE 1 to prevent server crashes
# import matplotlib.pyplot as plt
# import numpy as np
# import io
# import os
# import requests
# from datetime import datetime
# from reportlab.lib.pagesizes import A4
# from reportlab.pdfgen import canvas
# from reportlab.lib import colors
# from reportlab.lib.utils import ImageReader

# def _draw_location_analysis(c, data, title_prefix, width, height):
#     """
#     Core drawing logic used for both Location A and Location B.
#     Ensures identical formatting and tactical aesthetic.
#     """
#     # --- Tactical Branding Colors (Matched to React CSS) ---
#     COLOR_DANGER = colors.HexColor("#ef4444")
#     COLOR_WARNING = colors.HexColor("#f59e0b")
#     COLOR_SUCCESS = colors.HexColor("#10b981")
#     COLOR_DEEP_NAVY = colors.HexColor("#0f172a") 
#     COLOR_CYAN = colors.HexColor("#06b6d4")

#     # 1. HEADER: Dark Navy Bar with Title
#     c.setFillColor(COLOR_DEEP_NAVY)
#     c.rect(0, height - 120, width, 120, fill=1, stroke=0)
    
#     c.setFillColor(colors.white)
#     c.setFont("Helvetica-Bold", 24)
#     c.drawCentredString(width / 2, height - 50, "GeoAI – Land Suitability Certificate")
    
#     # Dynamic Title (e.g., LOCATION A: Site Name)
#     c.setFont("Helvetica-Bold", 14)
#     location_title = f"{title_prefix}: {data.get('locationName', 'Tactical Site Analysis')}"
#     c.drawCentredString(width / 2, height - 75, location_title.upper())
    
#     # Timestamp & Geospatial Coordinates
#     c.setFont("Helvetica", 9)
#     timestamp = datetime.now().strftime('%d %b %Y | %H:%M:%S IST')
#     loc = data.get('location', {})
#     lat_lng = f"LAT: {loc.get('latitude', '0.0000')}   |   LNG: {loc.get('longitude', '0.0000')}"
#     c.drawCentredString(width / 2, height - 95, f"{timestamp}   •   {lat_lng}")

#     # 2. MINI MAP PREVIEW (Tactical Satellite Preview)
#     y_map = height - 280
#     try:
#         # Fetching static satellite tile
#         map_url = f"https://static-maps.yandex.ru/1.x/?ll={loc.get('longitude')},{loc.get('latitude')}&z=13&l=sat&size=500,140"
#         map_res = requests.get(map_url, timeout=5)
#         if map_res.status_code == 200:
#             map_img = ImageReader(io.BytesIO(map_res.content))
#             c.drawImage(map_img, 40, y_map, width=width-80, height=140)
#             c.setStrokeColor(colors.white)
#             c.setLineWidth(1)
#             c.rect(40, y_map, width-80, 140, stroke=1, fill=0)
#     except Exception:
#         c.setFillColor(colors.lightgrey)
#         c.rect(40, y_map, width-80, 140, fill=1, stroke=0)
#         c.setFillColor(colors.black)
#         c.drawCentredString(width/2, y_map + 65, "[Satellite Intelligence Preview Unavailable]")

#     # 3. OVERALL SUITABILITY SCORE (Suitability Intelligence)
#     score = float(data.get('suitability_score', 0))
#     score_color = COLOR_DANGER if score < 40 else (COLOR_WARNING if score < 70 else COLOR_SUCCESS)
    
#     y_score = y_map - 60
#     c.setFillColor(score_color)
#     c.setFont("Helvetica-Bold", 42)
#     c.drawCentredString(width / 2, y_score, f"{score:.1f}")
    
#     c.setFont("Helvetica-Bold", 12)
#     c.drawCentredString(width / 2, y_score - 20, f"CLASSIFICATION: {data.get('label', 'UNSUITABLE').upper()}")

#     # 4. TERRAIN ANALYSIS (Split Layout: Radar Chart & Factor Bars)
#     factors = data.get("factors", {})
#     y_analysis = y_score - 280
    
#     # --- RADAR CHART (Left Column) ---
#     if factors:
#         labels = [k.capitalize() for k in factors.keys()]
#         values = [float(v) for v in factors.values()]
        
#         fig = plt.figure(figsize=(3, 3), dpi=100)
#         ax = fig.add_subplot(111, polar=True)
#         angles = np.linspace(0, 2 * np.pi, len(labels), endpoint=False).tolist()
        
#         # Closing the loop for radar plotting
#         plot_values = values + values[:1]
#         plot_angles = angles + angles[:1]
        
#         ax.fill(plot_angles, plot_values, color='#06b6d4', alpha=0.3)
#         ax.plot(plot_angles, plot_values, color='#06b6d4', linewidth=2)
#         ax.set_yticklabels([])
#         ax.set_xticks(angles)
#         ax.set_xticklabels(labels, fontsize=6)
        
#         chart_io = io.BytesIO()
#         plt.savefig(chart_io, format='png', transparent=True)
#         plt.close(fig) # Prevent memory leaks
#         chart_io.seek(0)
#         c.drawImage(ImageReader(chart_io), 30, y_analysis, width=220, height=220, mask='auto')

#     # --- FACTOR BARS (Right Column) ---
#     y_bar = y_analysis + 185
#     c.setFillColor(colors.black)
#     c.setFont("Helvetica-Bold", 11)
#     c.drawString(width/2 + 20, y_bar + 15, "FACTOR DISTRIBUTION (%)")
    
#     for factor, val in factors.items():
#         c.setFont("Helvetica", 9)
#         c.setFillColor(colors.black)
#         c.drawString(width/2 + 20, y_bar, factor.capitalize())
        
#         # Bar Background (Pill-style)
#         c.setFillColor(colors.HexColor("#e2e8f0"))
#         c.roundRect(width/2 + 80, y_bar - 2, 100, 8, 4, fill=1, stroke=0)
        
#         # Progressive Bar Fill
#         bar_color = COLOR_DANGER if val < 40 else (COLOR_WARNING if val < 70 else COLOR_SUCCESS)
#         c.setFillColor(bar_color)
#         c.roundRect(width/2 + 80, y_bar - 2, (float(val)/100)*100, 8, 4, fill=1, stroke=0)
        
#         # Numerical Display
#         c.setFillColor(colors.black)
#         c.setFont("Helvetica-Bold", 8)
#         c.drawString(width - 55, y_bar, f"{val:.1f}%")
#         y_bar -= 22

#     # 5. EVIDENCE DETAILS (Bottom Segment)
#     y_ev = y_analysis - 30
#     c.setFont("Helvetica-Bold", 12)
#     c.drawString(40, y_ev, "INTELLIGENCE EVIDENCE DETAILS")
#     y_ev -= 5
#     c.setStrokeColor(score_color)
#     c.line(40, y_ev, 240, y_ev)

#     y_ev -= 25
#     factors_meta = data.get("explanation", {}).get("factors_meta", {})
#     for f_key, meta in factors_meta.items():
#         if y_ev < 80: break # Break loop to avoid writing off-page
        
#         val = float(factors.get(f_key, 0))
#         tone_color = COLOR_DANGER if val < 40 else (COLOR_WARNING if val < 70 else COLOR_SUCCESS)
        
#         # Left-aligned colored accent bar
#         c.setFillColor(tone_color)
#         c.rect(40, y_ev - 30, 3, 35, fill=1, stroke=0)
        
#         c.setFillColor(colors.black)
#         c.setFont("Helvetica-Bold", 10)
#         c.drawString(50, y_ev, f"{f_key.upper()} ANALYSIS SCORE: {val:.1f}")
        
#         c.setFont("Helvetica", 8)
#         reason = meta.get("reason", "Analysis metrics finalized.")
        
#         # Text wrapping for long reasoning strings
#         c.drawString(50, y_ev - 15, reason[:120])
#         if len(reason) > 120:
#             c.drawString(50, y_ev - 25, reason[120:240])
        
#         y_ev -= 45

# def generate_land_report(data):
#     """
#     Orchestrator function that builds the PDF pages.
#     """
#     buffer = io.BytesIO()
#     c = canvas.Canvas(buffer, pagesize=A4)
#     width, height = A4

#     # 1. PROCESS PRIMARY DATA (LOCATION A)
#     _draw_location_analysis(c, data, "LOCATION A", width, height)

#     # 2. PROCESS COMPARISON DATA (LOCATION B) IF AVAILABLE
#     compare_data = data.get("compareData")
#     if compare_data:
#         c.showPage()  # Generate Page 2
#         _draw_location_analysis(c, compare_data, "LOCATION B", width, height)

#     c.save()
#     buffer.seek(0)
#     return buffer





import matplotlib
matplotlib.use('Agg')  # MUST BE LINE 1 to prevent server crashes
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

def _draw_location_analysis(c, data, title_prefix, width, height):
    """
    Core drawing logic used for both Location A and Location B.
    Ensures identical formatting and tactical aesthetic.
    """
    # --- Tactical Branding Colors (Matched to React CSS) ---
    COLOR_DANGER = colors.HexColor("#ef4444")
    COLOR_WARNING = colors.HexColor("#f59e0b")
    COLOR_SUCCESS = colors.HexColor("#10b981")
    COLOR_DEEP_NAVY = colors.HexColor("#0f172a") 
    COLOR_CYAN = colors.HexColor("#06b6d4")

    # 1. HEADER: Dark Navy Bar with Title
    c.setFillColor(COLOR_DEEP_NAVY)
    c.rect(0, height - 120, width, 120, fill=1, stroke=0)
    
    c.setFillColor(colors.white)
    c.setFont("Helvetica-Bold", 24)
    c.drawCentredString(width / 2, height - 50, "GeoAI – Land Suitability Certificate")
    
    # Dynamic Title (e.g., LOCATION A: Site Name)
    c.setFont("Helvetica-Bold", 14)
    location_title = f"{title_prefix}: {data.get('locationName', 'Tactical Site Analysis')}"
    c.drawCentredString(width / 2, height - 75, location_title.upper())
    
    # Timestamp & Geospatial Coordinates
    c.setFont("Helvetica", 9)
    timestamp = datetime.now().strftime('%d %b %Y | %H:%M:%S IST')
    loc = data.get('location', {})
    lat_lng = f"LAT: {loc.get('latitude', '0.0000')}   |   LNG: {loc.get('longitude', '0.0000')}"
    c.drawCentredString(width / 2, height - 95, f"{timestamp}   •   {lat_lng}")

    # 2. MINI MAP PREVIEW (Tactical Satellite Preview)
    y_map = height - 280
    try:
        # Fetching static satellite tile
        map_url = f"https://static-maps.yandex.ru/1.x/?ll={loc.get('longitude')},{loc.get('latitude')}&z=13&l=sat&size=500,140"
        map_res = requests.get(map_url, timeout=5)
        if map_res.status_code == 200:
            map_img = ImageReader(io.BytesIO(map_res.content))
            c.drawImage(map_img, 40, y_map, width=width-80, height=140)
            c.setStrokeColor(colors.white)
            c.setLineWidth(1)
            c.rect(40, y_map, width-80, 140, stroke=1, fill=0)
    except Exception:
        c.setFillColor(colors.lightgrey)
        c.rect(40, y_map, width-80, 140, fill=1, stroke=0)
        c.setFillColor(colors.black)
        c.drawCentredString(width/2, y_map + 65, "[Satellite Intelligence Preview Unavailable]")

    # 3. OVERALL SUITABILITY SCORE (Suitability Intelligence)
    score = float(data.get('suitability_score', 0))
    score_color = COLOR_DANGER if score < 40 else (COLOR_WARNING if score < 70 else COLOR_SUCCESS)
    
    y_score = y_map - 60
    c.setFillColor(score_color)
    c.setFont("Helvetica-Bold", 42)
    c.drawCentredString(width / 2, y_score, f"{score:.1f}")
    
    c.setFont("Helvetica-Bold", 12)
    c.drawCentredString(width / 2, y_score - 20, f"CLASSIFICATION: {data.get('label', 'UNSUITABLE').upper()}")

    # 4. TERRAIN ANALYSIS (Split Layout: Radar Chart & Factor Bars)
    factors = data.get("factors", {})
    y_analysis = y_score - 280
    
    # --- RADAR CHART (Left Column) ---
    if factors:
        labels = [k.capitalize() for k in factors.keys()]
        values = [float(v) for v in factors.values()]
        
        fig = plt.figure(figsize=(3, 3), dpi=100)
        ax = fig.add_subplot(111, polar=True)
        angles = np.linspace(0, 2 * np.pi, len(labels), endpoint=False).tolist()
        
        # Closing the loop for radar plotting
        plot_values = values + values[:1]
        plot_angles = angles + angles[:1]
        
        ax.fill(plot_angles, plot_values, color='#06b6d4', alpha=0.3)
        ax.plot(plot_angles, plot_values, color='#06b6d4', linewidth=2)
        ax.set_yticklabels([])
        ax.set_xticks(angles)
        ax.set_xticklabels(labels, fontsize=6)
        
        chart_io = io.BytesIO()
        plt.savefig(chart_io, format='png', transparent=True)
        plt.close(fig) # Prevent memory leaks
        chart_io.seek(0)
        c.drawImage(ImageReader(chart_io), 30, y_analysis, width=220, height=220, mask='auto')

    # --- FACTOR BARS (Right Column) ---
    y_bar = y_analysis + 185
    c.setFillColor(colors.black)
    c.setFont("Helvetica-Bold", 11)
    c.drawString(width/2 + 20, y_bar + 15, "FACTOR DISTRIBUTION (%)")
    
    for factor, val in factors.items():
        c.setFont("Helvetica", 9)
        c.setFillColor(colors.black)
        c.drawString(width/2 + 20, y_bar, factor.capitalize())
        
        # Bar Background (Pill-style)
        c.setFillColor(colors.HexColor("#e2e8f0"))
        c.roundRect(width/2 + 80, y_bar - 2, 100, 8, 4, fill=1, stroke=0)
        
        # Progressive Bar Fill
        bar_color = COLOR_DANGER if val < 40 else (COLOR_WARNING if val < 70 else COLOR_SUCCESS)
        c.setFillColor(bar_color)
        c.roundRect(width/2 + 80, y_bar - 2, (float(val)/100)*100, 8, 4, fill=1, stroke=0)
        
        # Numerical Display
        c.setFillColor(colors.black)
        c.setFont("Helvetica-Bold", 8)
        c.drawString(width - 55, y_bar, f"{val:.1f}%")
        y_bar -= 22

    # # 5. EVIDENCE DETAILS (Bottom Segment)
    # y_ev = y_analysis - 30
    # c.setFont("Helvetica-Bold", 12)
    # c.drawString(40, y_ev, "INTELLIGENCE EVIDENCE DETAILS")
    # y_ev -= 5
    # c.setStrokeColor(score_color)
    # c.line(40, y_ev, 240, y_ev)

    # y_ev -= 25
    # factors_meta = data.get("explanation", {}).get("factors_meta", {})
    # for f_key, meta in factors_meta.items():
    #     if y_ev < 80: break # Break loop to avoid writing off-page
        
    #     val = float(factors.get(f_key, 0))
    #     tone_color = COLOR_DANGER if val < 40 else (COLOR_WARNING if val < 70 else COLOR_SUCCESS)
        
    #     # Left-aligned colored accent bar
    #     c.setFillColor(tone_color)
    #     c.rect(40, y_ev - 30, 3, 35, fill=1, stroke=0)
        
    #     c.setFillColor(colors.black)
    #     c.setFont("Helvetica-Bold", 10)
    #     c.drawString(50, y_ev, f"{f_key.upper()} ANALYSIS SCORE: {val:.1f}")
        
    #     c.setFont("Helvetica", 8)
    #     reason = meta.get("reason", "Analysis metrics finalized.")
        
    #     # Text wrapping for long reasoning strings
    #     c.drawString(50, y_ev - 15, reason[:120])
    #     if len(reason) > 120:
    #         c.drawString(50, y_ev - 25, reason[120:240])
        
    #     y_ev -= 45
    # 5. INTELLIGENCE EVIDENCE DETAILS (Dynamic Loop)
    y_ev = y_analysis - 30
    c.setFont("Helvetica-Bold", 12)
    c.setFillColor(colors.black)
    c.drawString(40, y_ev, "INTELLIGENCE EVIDENCE DETAILS")
    y_ev -= 5
    c.setStrokeColor(score_color)
    c.line(40, y_ev, 240, y_ev)
    y_ev -= 25

    factors_meta = data.get("explanation", {}).get("factors_meta", {})
    
    # Loop through ALL factors present in the metadata
    for f_key, meta in factors_meta.items():
        # Check for page overflow - move to new page if near bottom
        if y_ev < 100:
            c.showPage()
            # Redraw basic header info for continuity on new page
            c.setFillColor(COLOR_DEEP_NAVY)
            c.rect(0, height - 50, width, 50, fill=1, stroke=0)
            c.setFillColor(colors.white)
            c.setFont("Helvetica-Bold", 12)
            c.drawString(40, height - 35, f"{title_prefix} - CONTINUED INTELLIGENCE")
            y_ev = height - 80

        val = float(factors.get(f_key, 0))
        tone_color = COLOR_DANGER if val < 40 else (COLOR_WARNING if val < 70 else COLOR_SUCCESS)
        
        # Left Accent Border
        c.setFillColor(tone_color)
        c.rect(40, y_ev - 30, 3, 35, fill=1, stroke=0)
        
        c.setFillColor(colors.black)
        c.setFont("Helvetica-Bold", 10)
        c.drawString(50, y_ev, f"{f_key.upper()} ANALYSIS SCORE: {val:.1f}")
        
        c.setFont("Helvetica", 8)
        reason = meta.get("reason", "Detailed analysis complete.")
        
        # Enhanced text wrapping (Handles up to 3 lines of intelligence text)
        wrapped_text = reason[:120]
        c.drawString(50, y_ev - 15, wrapped_text)
        if len(reason) > 120:
            c.drawString(50, y_ev - 25, reason[120:240])
        if len(reason) > 240:
            c.drawString(50, y_ev - 35, reason[240:360])
        
        y_ev -= 55 # Move down for the next intelligence block

def generate_land_report(data):
    """
    Orchestrator function that builds the PDF pages.
    """
    buffer = io.BytesIO()
    c = canvas.Canvas(buffer, pagesize=A4)
    width, height = A4

    # 1. PROCESS PRIMARY DATA (LOCATION A)
    _draw_location_analysis(c, data, "LOCATION A", width, height)

    # 2. PROCESS COMPARISON DATA (LOCATION B) IF AVAILABLE
    compare_data = data.get("compareData")
    if compare_data:
        c.showPage()  # Generate Page 2
        _draw_location_analysis(c, compare_data, "LOCATION B", width, height)

    c.save()
    buffer.seek(0)
    return buffer