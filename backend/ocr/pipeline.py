import asyncio
import os
from typing import List, Tuple

import pdfplumber
from docx import Document as DocxDocument
from PIL import Image, ImageFilter, ImageOps
import pytesseract


async def extract_text(file_path: str, file_extension: str) -> Tuple[str, List[str]]:
    """Extract text from document. Returns (full_text, list_of_page_texts)."""
    ext = file_extension.lower()
    if ext == ".pdf":
        return await asyncio.to_thread(_extract_pdf, file_path)
    elif ext in (".docx", ".doc"):
        return await asyncio.to_thread(_extract_docx, file_path)
    elif ext in (".png", ".jpg", ".jpeg", ".tiff", ".bmp"):
        return await asyncio.to_thread(_extract_image, file_path)
    else:
        raise ValueError(f"Unsupported file extension: {ext}")


def _extract_pdf(file_path: str) -> Tuple[str, List[str]]:
    page_texts = []
    with pdfplumber.open(file_path) as pdf:
        for page in pdf.pages:
            text = page.extract_text() or ""
            # Preserve paragraph boundaries
            text = text.strip()
            if text:
                page_texts.append(text)
    full_text = "\n\n".join(page_texts)
    return full_text, page_texts


def _extract_docx(file_path: str) -> Tuple[str, List[str]]:
    doc = DocxDocument(file_path)
    paragraphs = []
    for para in doc.paragraphs:
        text = para.text.strip()
        if text:
            paragraphs.append(text)
    full_text = "\n\n".join(paragraphs)
    return full_text, paragraphs


def _extract_image(file_path: str) -> Tuple[str, List[str]]:
    """OCR via Tesseract with preprocessing for better accuracy."""
    img = Image.open(file_path)
    # Preprocessing: convert to grayscale, sharpen, threshold
    img = ImageOps.grayscale(img)
    img = img.filter(ImageFilter.SHARPEN)
    img = img.point(lambda x: 0 if x < 140 else 255, '1')
    text = pytesseract.image_to_string(img, lang='eng')
    text = text.strip()
    # Split into pseudo-pages by double newlines
    pages = [p.strip() for p in text.split("\n\n") if p.strip()]
    return text, pages
