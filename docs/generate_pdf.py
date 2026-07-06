from pathlib import Path
from reportlab.lib.pagesizes import letter
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, PageBreak
from reportlab.lib.enums import TA_LEFT

source = Path('docs/backend_learning_notes.md')
out = Path('docs/backend_learning_notes.pdf')

text = source.read_text(encoding='utf-8')

lines = text.splitlines()

styles = getSampleStyleSheet()
styles.add(ParagraphStyle(name='MyHeading1', parent=styles['Heading1'], fontSize=18, spaceAfter=12, textColor='#1f2937'))
styles.add(ParagraphStyle(name='MyBodyText', parent=styles['BodyText'], fontSize=10.5, leading=14, spaceAfter=6))
styles.add(ParagraphStyle(name='MyBullet', parent=styles['BodyText'], leftIndent=18, bulletIndent=0, spaceAfter=4))
styles.add(ParagraphStyle(name='MyCode', parent=styles['BodyText'], fontName='Courier', fontSize=9, leading=11, backColor='#f3f4f6', padding=4))

story = []

for line in lines:
    if line.startswith('# '):
        story.append(Paragraph(line[2:], styles['MyHeading1']))
    elif line.startswith('## '):
        story.append(Paragraph(line[3:], styles['Heading2']))
    elif line.startswith('### '):
        story.append(Paragraph(line[4:], styles['Heading3']))
    elif line.startswith('- '):
        story.append(Paragraph(line[2:], styles['Bullet']))
    elif line.strip() == '':
        story.append(Spacer(1, 6))
    elif line.startswith('1.') or line.startswith('2.') or line.startswith('3.'):
        story.append(Paragraph(line, styles['BodyText']))
    else:
        story.append(Paragraph(line, styles['BodyText']))

story.append(Spacer(1, 12))

doc = SimpleDocTemplate(str(out), pagesize=letter, rightMargin=54, leftMargin=54, topMargin=54, bottomMargin=54)
doc.build(story)
print(f'PDF created: {out.resolve()}')
