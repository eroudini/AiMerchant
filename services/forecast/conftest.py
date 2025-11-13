import os
import sys

# Ensure the project root (this directory) is on sys.path so `import app.*` works
ROOT = os.path.abspath(os.path.dirname(__file__))
if ROOT not in sys.path:
    sys.path.insert(0, ROOT)
