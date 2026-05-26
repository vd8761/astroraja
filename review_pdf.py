import subprocess, sys

# Install pdfminer if needed
subprocess.run([sys.executable, '-m', 'pip', 'install', 'pdfminer.six', '-q'], check=False)

from pdfminer.high_level import extract_text, extract_pages
from pdfminer.layout import LTPage

pdf_path = 'preview_output.pdf'

# Count pages
pages = list(extract_pages(pdf_path))
print(f"=== TOTAL PAGES: {len(pages)} ===\n")

# Extract all text
text = extract_text(pdf_path)
lines = [l for l in text.split('\n') if l.strip()]
print(f"Total non-empty lines: {len(lines)}\n")

print("=== FULL TEXT CONTENT ===")
for i, line in enumerate(lines):
    print(f"{i+1:03d}: {line}")
