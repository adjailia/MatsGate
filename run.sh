#!/bin/bash
echo "Generating products.json from CSV..."
node generate.js
echo "Starting local server at http://localhost:8000"
python3 -m http.server 8000
