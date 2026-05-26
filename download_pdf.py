import urllib.request, sys, os

url = 'http://localhost:4321/api/preview-pdf'
out = 'preview_output.pdf'

try:
    with urllib.request.urlopen(url, timeout=30) as resp:
        data = resp.read()
    with open(out, 'wb') as f:
        f.write(data)
    size = os.path.getsize(out)
    print(f"Status: {resp.status}")
    print(f"Size: {size:,} bytes")

    # Quick page count from PDF xref
    pages = data.count(b'/Page\n') + data.count(b'/Page\r') + data.count(b'/Page ')
    print(f"Approximate page markers: {pages}")
    print("PDF saved successfully!" if size > 50000 else "WARNING: PDF looks too small!")
except Exception as e:
    print(f"Error: {e}")
    sys.exit(1)
