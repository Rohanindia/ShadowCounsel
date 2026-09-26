"""Generate a PDF version of the sample rental agreement for OCR testing."""
import os
import sys

def create_pdf():
    """Create PDF using reportlab if available, otherwise create a simple text-based approach."""
    try:
        from reportlab.lib.pagesizes import A4
        from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
        from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer
        from reportlab.lib.units import inch
        from reportlab.lib.enums import TA_CENTER, TA_JUSTIFY
        
        output_path = os.path.join(os.path.dirname(__file__), "sample_rental_agreement.pdf")
        input_path = os.path.join(os.path.dirname(__file__), "sample_rental_agreement.txt")
        
        with open(input_path, "r", encoding="utf-8") as f:
            text = f.read()
        
        doc = SimpleDocTemplate(
            output_path,
            pagesize=A4,
            rightMargin=72,
            leftMargin=72,
            topMargin=72,
            bottomMargin=72,
        )
        
        styles = getSampleStyleSheet()
        title_style = ParagraphStyle(
            'CustomTitle',
            parent=styles['Title'],
            fontSize=16,
            spaceAfter=30,
            alignment=TA_CENTER,
        )
        body_style = ParagraphStyle(
            'CustomBody',
            parent=styles['Normal'],
            fontSize=10,
            leading=14,
            alignment=TA_JUSTIFY,
            spaceAfter=8,
        )
        clause_style = ParagraphStyle(
            'ClauseHeader',
            parent=styles['Heading2'],
            fontSize=12,
            spaceBefore=20,
            spaceAfter=10,
        )
        
        story = []
        
        for line in text.split('\n'):
            line = line.strip()
            if not line:
                story.append(Spacer(1, 8))
                continue
            if line == '---':
                story.append(Spacer(1, 12))
                continue
            
            # Escape HTML special chars for reportlab
            line = line.replace('&', '&amp;').replace('<', '&lt;').replace('>', '&gt;')
            
            if line.startswith('RESIDENTIAL RENTAL AGREEMENT'):
                story.append(Paragraph(line, title_style))
            elif line.startswith('CLAUSE ') or line.startswith('BETWEEN') or line.startswith('AND ') or line.startswith('WHEREAS') or line.startswith('NOW THIS') or line.startswith('IN WITNESS'):
                story.append(Paragraph(line, clause_style))
            else:
                story.append(Paragraph(line, body_style))
        
        doc.build(story)
        print(f"PDF created: {output_path}")
        
    except ImportError:
        print("reportlab not installed. Run: pip install reportlab")
        print("Skipping PDF generation — use the .txt file for testing instead.")

if __name__ == "__main__":
    create_pdf()
