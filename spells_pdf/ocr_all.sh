#!/bin/bash

for img in page-*.png; do
    base=$(basename "$img" .png)
    echo "OCR'ing $img..."
    tesseract "$img" "$base" --psm 1 -l eng
done
