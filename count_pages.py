import subprocess, sys
subprocess.run([sys.executable, '-m', 'pip', 'install', 'pdfminer.six', '-q'])
from pdfminer.high_level import extract_pages
pages = list(extract_pages('preview_output.pdf'))
print(f"TOTAL PAGES: {len(pages)}")
