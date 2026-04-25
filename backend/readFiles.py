import fitz
import io
import docx

def readPDF(file_bytes: bytes) -> str:
    doc = fitz.open(stream=file_bytes, filetype="pdf")
    text = ""
    for page in doc:
        text+=page.get_text()
    doc.close()
    return text.strip()

def readDOCX(file_bytes: bytes) -> str:
    doc = docx.Document(io.BytesIO(file_bytes))
    return "\n".join(passage.text for passage in doc.paragraphs if passage.text.strip())


