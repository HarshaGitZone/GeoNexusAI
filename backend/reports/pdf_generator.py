# import matplotlib
# matplotlib.use('Agg')  
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

#     # # 5. EVIDENCE DETAILS (Bottom Segment)
#     # y_ev = y_analysis - 30
#     # c.setFont("Helvetica-Bold", 12)
#     # c.drawString(40, y_ev, "INTELLIGENCE EVIDENCE DETAILS")
#     # y_ev -= 5
#     # c.setStrokeColor(score_color)
#     # c.line(40, y_ev, 240, y_ev)

#     # y_ev -= 25
#     # factors_meta = data.get("explanation", {}).get("factors_meta", {})
#     # for f_key, meta in factors_meta.items():
#     #     if y_ev < 80: break # Break loop to avoid writing off-page
        
#     #     val = float(factors.get(f_key, 0))
#     #     tone_color = COLOR_DANGER if val < 40 else (COLOR_WARNING if val < 70 else COLOR_SUCCESS)
        
#     #     # Left-aligned colored accent bar
#     #     c.setFillColor(tone_color)
#     #     c.rect(40, y_ev - 30, 3, 35, fill=1, stroke=0)
        
#     #     c.setFillColor(colors.black)
#     #     c.setFont("Helvetica-Bold", 10)
#     #     c.drawString(50, y_ev, f"{f_key.upper()} ANALYSIS SCORE: {val:.1f}")
        
#     #     c.setFont("Helvetica", 8)
#     #     reason = meta.get("reason", "Analysis metrics finalized.")
        
#     #     # Text wrapping for long reasoning strings
#     #     c.drawString(50, y_ev - 15, reason[:120])
#     #     if len(reason) > 120:
#     #         c.drawString(50, y_ev - 25, reason[120:240])
        
#     #     y_ev -= 45
#     # 5. INTELLIGENCE EVIDENCE DETAILS (Dynamic Loop)
#     y_ev = y_analysis - 30
#     c.setFont("Helvetica-Bold", 12)
#     c.setFillColor(colors.black)
#     c.drawString(40, y_ev, "INTELLIGENCE EVIDENCE DETAILS")
#     y_ev -= 5
#     c.setStrokeColor(score_color)
#     c.line(40, y_ev, 240, y_ev)
#     y_ev -= 25

#     factors_meta = data.get("explanation", {}).get("factors_meta", {})
    
#     # Loop through ALL factors present in the metadata
#     for f_key, meta in factors_meta.items():
#         # Check for page overflow - move to new page if near bottom
#         if y_ev < 100:
#             c.showPage()
#             # Redraw basic header info for continuity on new page
#             c.setFillColor(COLOR_DEEP_NAVY)
#             c.rect(0, height - 50, width, 50, fill=1, stroke=0)
#             c.setFillColor(colors.white)
#             c.setFont("Helvetica-Bold", 12)
#             c.drawString(40, height - 35, f"{title_prefix} - CONTINUED INTELLIGENCE")
#             y_ev = height - 80

#         val = float(factors.get(f_key, 0))
#         tone_color = COLOR_DANGER if val < 40 else (COLOR_WARNING if val < 70 else COLOR_SUCCESS)
        
#         # Left Accent Border
#         c.setFillColor(tone_color)
#         c.rect(40, y_ev - 30, 3, 35, fill=1, stroke=0)
        
#         c.setFillColor(colors.black)
#         c.setFont("Helvetica-Bold", 10)
#         c.drawString(50, y_ev, f"{f_key.upper()} ANALYSIS SCORE: {val:.1f}")
        
#         c.setFont("Helvetica", 8)
#         reason = meta.get("reason", "Detailed analysis complete.")
        
#         # Enhanced text wrapping (Handles up to 3 lines of intelligence text)
#         wrapped_text = reason[:120]
#         c.drawString(50, y_ev - 15, wrapped_text)
#         if len(reason) > 120:
#             c.drawString(50, y_ev - 25, reason[120:240])
#         if len(reason) > 240:
#             c.drawString(50, y_ev - 35, reason[240:360])
        
#         y_ev -= 55 # Move down for the next intelligence block

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




# import matplotlib
# matplotlib.use('Agg')  
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

# def _calculate_site_potential(factors):
#     """
#     Python implementation of the React 'getSitePotential' logic.
#     """
#     potentials = []
#     f = {k: float(v) for k, v in factors.items()}
    
#     # 1. Hazard Analysis
#     hazards = [k.upper() for k in ['flood', 'landslide', 'pollution'] if f.get(k, 100) < 45]
#     if hazards:
#         potentials.push_tag = {
#             "label": "ENVIRONMENTAL CONSTRAINTS",
#             "color": colors.HexColor("#ef4444"),
#             "icon": "!",
#             "reason": f"Critical risks detected in: {', '.join(hazards)}. Site requires mitigation."
#         }
#         potentials.append(potentials.push_tag)

#     # 2. Residential
#     if f.get('flood', 0) > 50 and f.get('landslide', 0) > 50 and f.get('pollution', 0) > 40:
#         strength = "pristine air quality" if f.get('pollution', 0) > 70 else "stable terrain"
#         potentials.append({
#             "label": "RESIDENTIAL POTENTIAL",
#             "color": colors.HexColor("#10b981"),
#             "icon": "H",
#             "reason": f"Recommended for housing due to {strength} and safety foundation."
#         })

#     # 3. Agricultural
#     if f.get('soil', 0) > 60 or f.get('rainfall', 0) > 60:
#         lead = "Soil Nutrient Density" if f.get('soil', 0) > f.get('rainfall', 0) else "Rainfall Patterns"
#         potentials.append({
#             "label": "AGRICULTURAL UTILITY",
#             "color": colors.HexColor("#3b82f6"),
#             "icon": "A",
#             "reason": f"High {lead} detected. Suitable for sustainable crop cycles."
#         })

#     # 4. Industrial
#     if f.get('proximity', 0) > 60 and f.get('landuse', 0) > 40:
#         potentials.append({
#             "label": "LOGISTICS & INDUSTRY",
#             "color": colors.HexColor("#8b5cf6"),
#             "icon": "I",
#             "reason": f"Strategic location. Ranks in top tier for Infrastructure Proximity."
#         })
        
#     return potentials[:2] # Limit to top 2 to save PDF space

# def _draw_location_analysis(c, data, title_prefix, width, height):
#     # --- Tactical Branding Colors ---
#     COLOR_DANGER = colors.HexColor("#ef4444")
#     COLOR_WARNING = colors.HexColor("#f59e0b")
#     COLOR_SUCCESS = colors.HexColor("#10b981")
#     COLOR_DEEP_NAVY = colors.HexColor("#0f172a") 
#     COLOR_CYAN = colors.HexColor("#06b6d4")
#     COLOR_BG_LIGHT = colors.HexColor("#f8fafc")

#     # 1. HEADER
#     c.setFillColor(COLOR_DEEP_NAVY)
#     c.rect(0, height - 120, width, 120, fill=1, stroke=0)
#     c.setFillColor(colors.white)
#     c.setFont("Helvetica-Bold", 24)
#     c.drawCentredString(width / 2, height - 50, "GeoAI – Land Suitability Certificate")
    
#     c.setFont("Helvetica-Bold", 14)
#     location_title = f"{title_prefix}: {data.get('locationName', 'Tactical Site Analysis')}"
#     c.drawCentredString(width / 2, height - 75, location_title.upper())
    
#     c.setFont("Helvetica", 9)
#     timestamp = datetime.now().strftime('%d %b %Y | %H:%M:%S IST')
#     loc = data.get('location', {})
#     lat_lng = f"LAT: {loc.get('latitude', '0.0000')}   |   LNG: {loc.get('longitude', '0.0000')}"
#     c.drawCentredString(width / 2, height - 95, f"{timestamp}   •   {lat_lng}")

#     # 2. MINI MAP
#     y_map = height - 280
#     try:
#         map_url = f"https://static-maps.yandex.ru/1.x/?ll={loc.get('longitude')},{loc.get('latitude')}&z=13&l=sat&size=500,140"
#         map_res = requests.get(map_url, timeout=5)
#         if map_res.status_code == 200:
#             map_img = ImageReader(io.BytesIO(map_res.content))
#             c.drawImage(map_img, 40, y_map, width=width-80, height=140)
#             c.setStrokeColor(colors.white)
#             c.rect(40, y_map, width-80, 140, stroke=1, fill=0)
#     except Exception:
#         c.setFillColor(colors.lightgrey)
#         c.rect(40, y_map, width-80, 140, fill=1, stroke=0)

#     # 3. SCORE & POTENTIAL ANALYSIS (Side-by-Side)
#     score = float(data.get('suitability_score', 0))
#     score_color = COLOR_DANGER if score < 40 else (COLOR_WARNING if score < 70 else COLOR_SUCCESS)
#     y_score_box = y_map - 110

#     # Score Circle/Box
#     c.setFillColor(score_color)
#     c.setFont("Helvetica-Bold", 36)
#     c.drawString(60, y_score_box + 40, f"{score:.1f}")
#     c.setFont("Helvetica-Bold", 10)
#     c.drawString(60, y_score_box + 25, f"GRADE: {data.get('label', 'UNSUITABLE').upper()}")

#     # --- NEW SITE POTENTIAL SECTION ---
#     c.setFillColor(colors.black)
#     c.setFont("Helvetica-Bold", 11)
#     c.drawString(width/2 - 40, y_score_box + 75, "SITE POTENTIAL ANALYSIS")
    
#     potentials = _calculate_site_potential(data.get('factors', {}))
#     y_pot = y_score_box + 55
#     for pot in potentials:
#         # Tag Background
#         c.setFillColor(pot['color'])
#         c.roundRect(width/2 - 40, y_pot - 5, 120, 15, 3, fill=1, stroke=0)
#         c.setFillColor(colors.white)
#         c.setFont("Helvetica-Bold", 8)
#         c.drawString(width/2 - 35, y_pot, pot['label'])
        
#         # Tag Reason
#         c.setFillColor(colors.black)
#         c.setFont("Helvetica", 7)
#         c.drawString(width/2 + 90, y_pot, pot['reason'][:70])
#         y_pot -= 25

#     # 4. TERRAIN ANALYSIS
#     factors = data.get("factors", {})
#     y_analysis = y_score_box - 240
    
#     if factors:
#         labels = [k.capitalize() for k in factors.keys()]
#         values = [float(v) for v in factors.values()]
#         fig = plt.figure(figsize=(3, 3), dpi=100)
#         ax = fig.add_subplot(111, polar=True)
#         angles = np.linspace(0, 2 * np.pi, len(labels), endpoint=False).tolist()
#         plot_values = values + values[:1]
#         plot_angles = angles + angles[:1]
#         ax.fill(plot_angles, plot_values, color='#06b6d4', alpha=0.3)
#         ax.plot(plot_angles, plot_values, color='#06b6d4', linewidth=2)
#         ax.set_yticklabels([])
#         ax.set_xticks(angles)
#         ax.set_xticklabels(labels, fontsize=6)
#         chart_io = io.BytesIO()
#         plt.savefig(chart_io, format='png', transparent=True)
#         plt.close(fig)
#         chart_io.seek(0)
#         c.drawImage(ImageReader(chart_io), 30, y_analysis, width=220, height=220, mask='auto')

#     # Factor Bars
#     y_bar = y_analysis + 185
#     c.setFillColor(colors.black)
#     c.setFont("Helvetica-Bold", 11)
#     c.drawString(width/2 + 20, y_bar + 15, "FACTOR DISTRIBUTION (%)")
#     for factor, val in factors.items():
#         c.setFont("Helvetica", 9)
#         c.drawString(width/2 + 20, y_bar, factor.capitalize())
#         c.setFillColor(colors.HexColor("#e2e8f0"))
#         c.roundRect(width/2 + 80, y_bar - 2, 100, 8, 4, fill=1, stroke=0)
#         bar_color = COLOR_DANGER if val < 40 else (COLOR_WARNING if val < 70 else COLOR_SUCCESS)
#         c.setFillColor(bar_color)
#         c.roundRect(width/2 + 80, y_bar - 2, (float(val)/100)*100, 8, 4, fill=1, stroke=0)
#         c.setFillColor(colors.black)
#         c.setFont("Helvetica-Bold", 8)
#         c.drawString(width - 55, y_bar, f"{val:.1f}%")
#         y_bar -= 22

#     # 5. EVIDENCE DETAILS
#     y_ev = y_analysis - 30
#     c.setFont("Helvetica-Bold", 12)
#     c.drawString(40, y_ev, "INTELLIGENCE EVIDENCE DETAILS")
#     y_ev -= 5
#     c.setStrokeColor(score_color)
#     c.line(40, y_ev, 240, y_ev)
#     y_ev -= 25

#     factors_meta = data.get("explanation", {}).get("factors_meta", {})
#     for f_key, meta in factors_meta.items():
#         if y_ev < 100:
#             c.showPage()
#             c.setFillColor(COLOR_DEEP_NAVY)
#             c.rect(0, height - 50, width, 50, fill=1, stroke=0)
#             c.setFillColor(colors.white)
#             c.setFont("Helvetica-Bold", 12)
#             c.drawString(40, height - 35, f"{title_prefix} - CONTINUED INTELLIGENCE")
#             y_ev = height - 80

#         val = float(factors.get(f_key, 0))
#         tone_color = COLOR_DANGER if val < 40 else (COLOR_WARNING if val < 70 else COLOR_SUCCESS)
#         c.setFillColor(tone_color)
#         c.rect(40, y_ev - 30, 3, 35, fill=1, stroke=0)
#         c.setFillColor(colors.black)
#         c.setFont("Helvetica-Bold", 10)
#         c.drawString(50, y_ev, f"{f_key.upper()} ANALYSIS SCORE: {val:.1f}")
#         c.setFont("Helvetica", 8)
#         reason = meta.get("reason", "Analysis complete.")
#         c.drawString(50, y_ev - 15, reason[:120])
#         if len(reason) > 120: c.drawString(50, y_ev - 25, reason[120:240])
#         y_ev -= 55

# def generate_land_report(data):
#     buffer = io.BytesIO()
#     c = canvas.Canvas(buffer, pagesize=A4)
#     width, height = A4
#     _draw_location_analysis(c, data, "LOCATION A", width, height)
#     compare_data = data.get("compareData")
#     if compare_data:
#         c.showPage()
#         _draw_location_analysis(c, compare_data, "LOCATION B", width, height)
#     c.save()
#     buffer.seek(0)
#     return buffer



# import matplotlib
# matplotlib.use('Agg')  
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

# def _calculate_site_potential(factors):
#     """
#     Python implementation of the React 'getSitePotential' logic.
#     Evaluates factor combinations to provide prescriptive insights.
#     """
#     potentials = []
#     f = {k: float(v) for k, v in factors.items()}
    
#     # 1. Hazard Analysis (Risk)
#     hazards = [k.upper() for k in ['flood', 'landslide', 'pollution'] if f.get(k, 100) < 45]
#     if hazards:
#         potentials.append({
#             "label": "ENVIRONMENTAL CONSTRAINTS",
#             "color": colors.HexColor("#ef4444"),
#             "icon": "!",
#             "reason": f"Critical risks detected in: {', '.join(hazards)}. Site requires mitigation."
#         })

#     # 2. Residential Potential
#     if f.get('flood', 0) > 50 and f.get('landslide', 0) > 50 and f.get('pollution', 0) > 40:
#         strength = "pristine air quality" if f.get('pollution', 0) > 70 else "stable terrain"
#         potentials.append({
#             "label": "RESIDENTIAL POTENTIAL",
#             "color": colors.HexColor("#10b981"),
#             "icon": "H",
#             "reason": f"Recommended for housing due to {strength} and safety foundation."
#         })

#     # 3. Agricultural Utility
#     if f.get('soil', 0) > 60 or f.get('rainfall', 0) > 60:
#         lead = "Soil Nutrient Density" if f.get('soil', 0) > f.get('rainfall', 0) else "Rainfall Patterns"
#         potentials.append({
#             "label": "AGRICULTURAL UTILITY",
#             "color": colors.HexColor("#3b82f6"),
#             "icon": "A",
#             "reason": f"High {lead} detected. Suitable for sustainable crop cycles."
#         })

#     # 4. Industrial Logistics
#     if f.get('proximity', 0) > 60 and f.get('landuse', 0) > 40:
#         potentials.append({
#             "label": "LOGISTICS & INDUSTRY",
#             "color": colors.HexColor("#8b5cf6"),
#             "icon": "I",
#             "reason": f"Strategic location. Ranks in top tier for Infrastructure Proximity."
#         })
        
#     return potentials[:2] # Limit to top 2 to preserve layout integrity

# def _draw_location_analysis(c, data, title_prefix, width, height):
#     """
#     Core drawing logic. Formatting is tightened to remove gaps.
#     Evidence details are forced to a new page if space is constrained.
#     """
#     # --- Tactical Branding Colors ---
#     COLOR_DANGER = colors.HexColor("#ef4444")
#     COLOR_WARNING = colors.HexColor("#f59e0b")
#     COLOR_SUCCESS = colors.HexColor("#10b981")
#     COLOR_DEEP_NAVY = colors.HexColor("#0f172a") 
#     COLOR_CYAN = colors.HexColor("#06b6d4")

#     # 1. HEADER (Tightened)
#     header_height = 100
#     c.setFillColor(COLOR_DEEP_NAVY)
#     c.rect(0, height - header_height, width, header_height, fill=1, stroke=0)
    
#     c.setFillColor(colors.white)
#     c.setFont("Helvetica-Bold", 20)
#     c.drawCentredString(width / 2, height - 40, "GeoAI – Land Suitability Certificate")
    
#     c.setFont("Helvetica-Bold", 12)
#     location_title = f"{title_prefix}: {data.get('locationName', 'Tactical Site Analysis')}"
#     c.drawCentredString(width / 2, height - 60, location_title.upper())
    
#     c.setFont("Helvetica", 8)
#     timestamp = datetime.now().strftime('%d %b %Y | %H:%M:%S IST')
#     loc = data.get('location', {})
#     lat_lng = f"LAT: {loc.get('latitude', '0.0000')}   |   LNG: {loc.get('longitude', '0.0000')}"
#     c.drawCentredString(width / 2, height - 80, f"{timestamp}   •   {lat_lng}")

#     # 2. MINI MAP (Moved Up)
#     y_map = height - 230
#     try:
#         map_url = f"https://static-maps.yandex.ru/1.x/?ll={loc.get('longitude')},{loc.get('latitude')}&z=13&l=sat&size=500,140"
#         map_res = requests.get(map_url, timeout=5)
#         if map_res.status_code == 200:
#             map_img = ImageReader(io.BytesIO(map_res.content))
#             c.drawImage(map_img, 40, y_map, width=width-80, height=120)
#             c.setStrokeColor(colors.white)
#             c.rect(40, y_map, width-80, 120, stroke=1, fill=0)
#     except Exception:
#         c.setFillColor(colors.lightgrey)
#         c.rect(40, y_map, width-80, 120, fill=1, stroke=0)

#     # 3. SCORE & POTENTIAL ANALYSIS
#     score = float(data.get('suitability_score', 0))
#     score_color = COLOR_DANGER if score < 40 else (COLOR_WARNING if score < 70 else COLOR_SUCCESS)
#     y_score_row = y_map - 60

#     # Suitability Score (Left Side)
#     c.setFillColor(score_color)
#     c.setFont("Helvetica-Bold", 38)
#     c.drawString(45, y_score_row, f"{score:.1f}")
#     c.setFont("Helvetica-Bold", 10)
#     c.drawString(45, y_score_row - 15, f"GRADE: {data.get('label', 'UNSUITABLE').upper()}")

#     # Potential Analysis (Right Side)
#     c.setFillColor(colors.black)
#     c.setFont("Helvetica-Bold", 10)
#     c.drawString(width/2 - 20, y_score_row + 15, "SITE POTENTIAL ANALYSIS")
    
#     potentials = _calculate_site_potential(data.get('factors', {}))
#     y_pot = y_score_row - 5
#     for pot in potentials:
#         c.setFillColor(pot['color'])
#         c.roundRect(width/2 - 20, y_pot - 2, 110, 14, 3, fill=1, stroke=0)
#         c.setFillColor(colors.white)
#         c.setFont("Helvetica-Bold", 7)
#         c.drawString(width/2 - 15, y_pot + 2, pot['label'])
        
#         c.setFillColor(colors.black)
#         c.setFont("Helvetica", 7)
#         c.drawString(width/2 + 95, y_pot + 2, pot['reason'][:65])
#         y_pot -= 18

#     # 4. TERRAIN ANALYSIS (Radar & Bars)
#     factors = data.get("factors", {})
#     y_analysis = y_score_row - 230
    
#     if factors:
#         labels = [k.capitalize() for k in factors.keys()]
#         values = [float(v) for v in factors.values()]
#         fig = plt.figure(figsize=(3, 3), dpi=100)
#         ax = fig.add_subplot(111, polar=True)
#         angles = np.linspace(0, 2 * np.pi, len(labels), endpoint=False).tolist()
#         plot_values = values + values[:1]
#         plot_angles = angles + angles[:1]
#         ax.fill(plot_angles, plot_values, color='#06b6d4', alpha=0.3)
#         ax.plot(plot_angles, plot_values, color='#06b6d4', linewidth=1.5)
#         ax.set_yticklabels([])
#         ax.set_xticks(angles)
#         ax.set_xticklabels(labels, fontsize=6)
#         chart_io = io.BytesIO()
#         plt.savefig(chart_io, format='png', transparent=True)
#         plt.close(fig)
#         chart_io.seek(0)
#         c.drawImage(ImageReader(chart_io), 30, y_analysis, width=200, height=200, mask='auto')

#     y_bar = y_analysis + 160
#     c.setFillColor(colors.black)
#     c.setFont("Helvetica-Bold", 10)
#     c.drawString(width/2 + 20, y_bar + 15, "FACTOR DISTRIBUTION (%)")
#     for factor, val in factors.items():
#         c.setFont("Helvetica", 8)
#         c.drawString(width/2 + 20, y_bar, factor.capitalize())
#         c.setFillColor(colors.HexColor("#e2e8f0"))
#         c.roundRect(width/2 + 80, y_bar - 2, 100, 7, 3, fill=1, stroke=0)
#         bar_color = COLOR_DANGER if val < 40 else (COLOR_WARNING if val < 70 else COLOR_SUCCESS)
#         c.setFillColor(bar_color)
#         c.roundRect(width/2 + 80, y_bar - 2, (float(val)/100)*100, 7, 3, fill=1, stroke=0)
#         c.setFillColor(colors.black)
#         c.setFont("Helvetica-Bold", 7)
#         c.drawString(width - 55, y_bar, f"{val:.1f}%")
#         y_bar -= 20

#     # 5. EVIDENCE DETAILS (New Page Logic)
#     y_ev_start = y_analysis - 20
#     # If we have less than 200 units of space, force evidence to next page
#     if y_ev_start < 200:
#         c.showPage()
#         # Draw small continuity header
#         c.setFillColor(COLOR_DEEP_NAVY)
#         c.rect(0, height - 50, width, 50, fill=1, stroke=0)
#         c.setFillColor(colors.white)
#         c.setFont("Helvetica-Bold", 10)
#         c.drawString(40, height - 30, f"{title_prefix} - INTELLIGENCE EVIDENCE DETAILS")
#         y_ev = height - 80
#     else:
#         y_ev = y_ev_start
#         c.setFont("Helvetica-Bold", 12)
#         c.setFillColor(colors.black)
#         c.drawString(40, y_ev, "INTELLIGENCE EVIDENCE DETAILS")
#         y_ev -= 5
#         c.setStrokeColor(score_color)
#         c.line(40, y_ev, 240, y_ev)
#         y_ev -= 25

#     factors_meta = data.get("explanation", {}).get("factors_meta", {})
#     for f_key, meta in factors_meta.items():
#         if y_ev < 80: # Standard sub-page overflow
#             c.showPage()
#             c.setFillColor(COLOR_DEEP_NAVY)
#             c.rect(0, height - 40, width, 40, fill=1, stroke=0)
#             c.setFillColor(colors.white)
#             c.setFont("Helvetica-Bold", 10)
#             c.drawString(40, height - 25, f"{title_prefix} - CONTINUED")
#             y_ev = height - 70

#         val = float(factors.get(f_key, 0))
#         tone_color = COLOR_DANGER if val < 40 else (COLOR_WARNING if val < 70 else COLOR_SUCCESS)
#         c.setFillColor(tone_color)
#         c.rect(40, y_ev - 30, 2.5, 35, fill=1, stroke=0)
#         c.setFillColor(colors.black)
#         c.setFont("Helvetica-Bold", 9)
#         c.drawString(50, y_ev, f"{f_key.upper()} ANALYSIS SCORE: {val:.1f}")
#         c.setFont("Helvetica", 8)
#         reason = meta.get("reason", "Analysis complete.")
#         c.drawString(50, y_ev - 15, reason[:125])
#         if len(reason) > 125: c.drawString(50, y_ev - 25, reason[125:250])
#         y_ev -= 50

# def generate_land_report(data):
#     """
#     Entry point for report generation. 
#     Handles multi-page logic for comparison reports.
#     """
#     buffer = io.BytesIO()
#     c = canvas.Canvas(buffer, pagesize=A4)
#     width, height = A4
    
#     # Process Site A
#     _draw_location_analysis(c, data, "LOCATION A", width, height)
    
#     # Process Site B
#     compare_data = data.get("compareData")
#     if compare_data:
#         c.showPage()
#         _draw_location_analysis(c, compare_data, "LOCATION B", width, height)
    
#     c.save()
#     buffer.seek(0)
#     return buffer

# import matplotlib
# matplotlib.use('Agg')  
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

# def _calculate_site_potential(factors):
#     """
#     Python implementation of the React 'getSitePotential' logic.
#     Evaluates factor combinations to provide prescriptive insights.
#     """
#     potentials = []
#     f = {k: float(v) for k, v in factors.items()}
    
#     # 1. Hazard Analysis (Risk)
#     hazards = [k.upper() for k in ['flood', 'landslide', 'pollution'] if f.get(k, 100) < 45]
#     if hazards:
#         potentials.append({
#             "label": "ENVIRONMENTAL CONSTRAINTS",
#             "color": colors.HexColor("#ef4444"),
#             "icon": "!",
#             "reason": f"Critical risks detected in: {', '.join(hazards)}. Site requires mitigation."
#         })

#     # 2. Residential Potential
#     if f.get('flood', 0) > 50 and f.get('landslide', 0) > 50 and f.get('pollution', 0) > 40:
#         strength = "pristine air quality" if f.get('pollution', 0) > 70 else "stable terrain"
#         potentials.append({
#             "label": "RESIDENTIAL POTENTIAL",
#             "color": colors.HexColor("#10b981"),
#             "icon": "H",
#             "reason": f"Recommended for housing due to {strength} and safety foundation."
#         })

#     # 3. Agricultural Utility
#     if f.get('soil', 0) > 60 or f.get('rainfall', 0) > 60:
#         lead = "Soil Nutrient Density" if f.get('soil', 0) > f.get('rainfall', 0) else "Rainfall Patterns"
#         potentials.append({
#             "label": "AGRICULTURAL UTILITY",
#             "color": colors.HexColor("#3b82f6"),
#             "icon": "A",
#             "reason": f"High {lead} detected. Suitable for sustainable crop cycles."
#         })

#     # 4. Industrial Logistics
#     if f.get('proximity', 0) > 60 and f.get('landuse', 0) > 40:
#         potentials.append({
#             "label": "LOGISTICS & INDUSTRY",
#             "color": colors.HexColor("#8b5cf6"),
#             "icon": "I",
#             "reason": f"Strategic location. Ranks in top tier for Infrastructure Proximity."
#         })
        
#     return potentials[:2] # Limit to top 2 to preserve layout integrity

# def _draw_location_analysis(c, data, title_prefix, width, height):
#     """
#     Core drawing logic. Formatting is tightened to remove gaps.
#     Evidence details are forced to a new page from the start.
#     """
#     # --- Tactical Branding Colors ---
#     COLOR_DANGER = colors.HexColor("#ef4444")
#     COLOR_WARNING = colors.HexColor("#f59e0b")
#     COLOR_SUCCESS = colors.HexColor("#10b981")
#     COLOR_DEEP_NAVY = colors.HexColor("#0f172a") 
#     COLOR_CYAN = colors.HexColor("#06b6d4")

#     # 1. HEADER (Tightened)
#     header_height = 100
#     c.setFillColor(COLOR_DEEP_NAVY)
#     c.rect(0, height - header_height, width, header_height, fill=1, stroke=0)
    
#     c.setFillColor(colors.white)
#     c.setFont("Helvetica-Bold", 20)
#     c.drawCentredString(width / 2, height - 40, "GeoAI – Land Suitability Certificate")
    
#     c.setFont("Helvetica-Bold", 12)
#     location_title = f"{title_prefix}: {data.get('locationName', 'Tactical Site Analysis')}"
#     c.drawCentredString(width / 2, height - 60, location_title.upper())
    
#     c.setFont("Helvetica", 8)
#     timestamp = datetime.now().strftime('%d %b %Y | %H:%M:%S IST')
#     loc = data.get('location', {})
#     lat_lng = f"LAT: {loc.get('latitude', '0.0000')}   |   LNG: {loc.get('longitude', '0.0000')}"
#     c.drawCentredString(width / 2, height - 80, f"{timestamp}   •   {lat_lng}")

#     # 2. MINI MAP
#     y_map = height - 210
#     try:
#         map_url = f"https://static-maps.yandex.ru/1.x/?ll={loc.get('longitude')},{loc.get('latitude')}&z=13&l=sat&size=500,140"
#         map_res = requests.get(map_url, timeout=5)
#         if map_res.status_code == 200:
#             map_img = ImageReader(io.BytesIO(map_res.content))
#             c.drawImage(map_img, 40, y_map, width=width-80, height=110)
#             c.setStrokeColor(colors.white)
#             c.rect(40, y_map, width-80, 110, stroke=1, fill=0)
#     except Exception:
#         c.setFillColor(colors.lightgrey)
#         c.rect(40, y_map, width-80, 110, fill=1, stroke=0)

#     # 3. SCORECARD
#     score = float(data.get('suitability_score', 0))
#     score_color = COLOR_DANGER if score < 40 else (COLOR_WARNING if score < 70 else COLOR_SUCCESS)
#     y_score_row = y_map - 50

#     c.setFillColor(score_color)
#     c.setFont("Helvetica-Bold", 32)
#     c.drawString(45, y_score_row, f"{score:.1f}")
#     c.setFont("Helvetica-Bold", 10)
#     c.drawString(45, y_score_row - 15, f"GRADE: {data.get('label', 'UNSUITABLE').upper()}")

#     # 4. TERRAIN ANALYSIS (Radar & Bars)
#     factors = data.get("factors", {})
#     y_analysis = y_score_row - 210
    
#     if factors:
#         labels = [k.capitalize() for k in factors.keys()]
#         values = [float(v) for v in factors.values()]
#         fig = plt.figure(figsize=(3, 3), dpi=100)
#         ax = fig.add_subplot(111, polar=True)
#         angles = np.linspace(0, 2 * np.pi, len(labels), endpoint=False).tolist()
#         plot_values = values + values[:1]
#         plot_angles = angles + angles[:1]
#         ax.fill(plot_angles, plot_values, color='#06b6d4', alpha=0.3)
#         ax.plot(plot_angles, plot_values, color='#06b6d4', linewidth=1.5)
#         ax.set_yticklabels([])
#         ax.set_xticks(angles)
#         ax.set_xticklabels(labels, fontsize=6)
#         chart_io = io.BytesIO()
#         plt.savefig(chart_io, format='png', transparent=True)
#         plt.close(fig)
#         chart_io.seek(0)
#         c.drawImage(ImageReader(chart_io), 30, y_analysis, width=180, height=180, mask='auto')

#     y_bar = y_analysis + 140
#     c.setFillColor(colors.black)
#     c.setFont("Helvetica-Bold", 10)
#     c.drawString(width/2 + 20, y_bar + 15, "FACTOR DISTRIBUTION (%)")
#     for factor, val in factors.items():
#         c.setFont("Helvetica", 8)
#         c.drawString(width/2 + 20, y_bar, factor.capitalize())
#         c.setFillColor(colors.HexColor("#e2e8f0"))
#         c.roundRect(width/2 + 80, y_bar - 2, 100, 7, 3, fill=1, stroke=0)
#         bar_color = COLOR_DANGER if val < 40 else (COLOR_WARNING if val < 70 else COLOR_SUCCESS)
#         c.setFillColor(bar_color)
#         c.roundRect(width/2 + 80, y_bar - 2, (float(val)/100)*100, 7, 3, fill=1, stroke=0)
#         c.setFillColor(colors.black)
#         c.setFont("Helvetica-Bold", 7)
#         c.drawString(width - 55, y_bar, f"{val:.1f}%")
#         y_bar -= 18

#     # 5. SITE POTENTIAL ANALYSIS (Now below Terrain Factors)
#     y_pot_start = y_analysis - 20
#     c.setFillColor(colors.black)
#     c.setFont("Helvetica-Bold", 11)
#     c.drawString(45, y_pot_start, "SITE POTENTIAL ANALYSIS")
    
#     potentials = _calculate_site_potential(data.get('factors', {}))
#     y_pot = y_pot_start - 25
#     for pot in potentials:
#         # Tag Background
#         c.setFillColor(pot['color'])
#         c.roundRect(45, y_pot - 5, 130, 16, 4, fill=1, stroke=0)
#         c.setFillColor(colors.white)
#         c.setFont("Helvetica-Bold", 7.5)
#         c.drawString(50, y_pot, pot['label'])
        
#         # Tag Reason
#         c.setFillColor(colors.black)
#         c.setFont("Helvetica", 7.5)
#         c.drawString(185, y_pot, pot['reason'][:95])
#         y_pot -= 25

#     # 6. FORCE EVIDENCE DETAILS TO NEXT PAGE
#     c.showPage()
    
#     # Draw Intelligence Header on New Page
#     c.setFillColor(COLOR_DEEP_NAVY)
#     c.rect(0, height - 60, width, 60, fill=1, stroke=0)
#     c.setFillColor(colors.white)
#     c.setFont("Helvetica-Bold", 12)
#     c.drawString(40, height - 35, f"{title_prefix} - INTELLIGENCE EVIDENCE DETAILS")
    
#     y_ev = height - 100
#     c.setStrokeColor(score_color)
#     c.setLineWidth(1.5)
#     c.line(40, y_ev + 5, 240, y_ev + 5)

#     factors_meta = data.get("explanation", {}).get("factors_meta", {})
#     for f_key, meta in factors_meta.items():
#         if y_ev < 80: # Sub-page overflow for very long lists
#             c.showPage()
#             c.setFillColor(COLOR_DEEP_NAVY)
#             c.rect(0, height - 40, width, 40, fill=1, stroke=0)
#             c.setFillColor(colors.white)
#             c.setFont("Helvetica-Bold", 10)
#             c.drawString(40, height - 25, f"{title_prefix} - EVIDENCE CONTINUED")
#             y_ev = height - 70

#         val = float(factors.get(f_key, 0))
#         tone_color = COLOR_DANGER if val < 40 else (COLOR_WARNING if val < 70 else COLOR_SUCCESS)
        
#         c.setFillColor(tone_color)
#         c.rect(40, y_ev - 30, 3, 35, fill=1, stroke=0)
        
#         c.setFillColor(colors.black)
#         c.setFont("Helvetica-Bold", 9.5)
#         c.drawString(50, y_ev, f"{f_key.upper()} ANALYSIS SCORE: {val:.1f}")
        
#         c.setFont("Helvetica", 8.5)
#         reason = meta.get("reason", "Detailed geospatial analysis complete.")
#         c.drawString(50, y_ev - 15, reason[:120])
#         if len(reason) > 120: 
#             c.drawString(50, y_ev - 25, reason[120:240])
        
#         y_ev -= 55

# def generate_land_report(data):
#     """
#     Entry point for report generation. 
#     Handles multi-page logic for comparison reports.
#     """
#     buffer = io.BytesIO()
#     c = canvas.Canvas(buffer, pagesize=A4)
#     width, height = A4
    
#     # Process Site A
#     _draw_location_analysis(c, data, "LOCATION A", width, height)
    
#     # Process Site B
#     compare_data = data.get("compareData")
#     if compare_data:
#         c.showPage()
#         _draw_location_analysis(c, compare_data, "LOCATION B", width, height)
    
#     c.save()
#     buffer.seek(0)
#     return buffer



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
        
    return potentials # Returns ALL matched categories

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

    # 4. TERRAIN ANALYSIS
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

    # 5. SITE POTENTIAL ANALYSIS (Placed BELOW factors)
    y_pot = y_analysis - 20
    c.setFillColor(colors.black); c.setFont("Helvetica-Bold", 11)
    c.drawString(45, y_pot, "SITE POTENTIAL ANALYSIS")
    y_pot -= 20

    potentials = _calculate_site_potential(factors)
    for pot in potentials:
        if y_pot < 80: break # Safety break
        # Tag
        c.setFillColor(pot['color'])
        c.roundRect(45, y_pot - 5, 125, 16, 4, fill=1, stroke=0)
        c.setFillColor(colors.white); c.setFont("Helvetica-Bold", 7)
        c.drawString(50, y_pot, pot['label'])
        
        # Wrapped Reasoning
        c.setFillColor(colors.black); c.setFont("Helvetica", 7.5)
        y_pot = _draw_wrapped_text(c, pot['reason'], 180, y_pot, width - 220, 9)
        y_pot -= 5 # Gap between items

    # 6. FORCE EVIDENCE TO NEXT PAGE
    c.showPage()
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