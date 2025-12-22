from transformers import T5Tokenizer, T5ForConditionalGeneration
import torch

# Load model and tokenizer
tokenizer = T5Tokenizer.from_pretrained("t5-small")
model = T5ForConditionalGeneration.from_pretrained("t5-small")

device = "cuda" if torch.cuda.is_available() else "cpu"
model.to(device)
print(f"Device set to use {device}")

def chunk_text(text, max_tokens=300):
    """Split text into chunks by words to keep token length small."""
    words = text.split()
    chunks = []
    current_chunk = []

    for w in words:
        current_chunk.append(w)
        if len(current_chunk) >= max_tokens:
            chunks.append(" ".join(current_chunk))
            current_chunk = []

    if current_chunk:
        chunks.append(" ".join(current_chunk))

    return chunks

def summarize_text(text):
    """Summarize long text safely by chunking then concatenating chunk summaries."""
    if not text or not text.strip():
        return ""

    chunks = chunk_text(text, max_tokens=300)
    final_summary_parts = []

    for chunk in chunks:
        # T5 expects a "summarize:" prefix
        input_text = "summarize: " + chunk
        inputs = tokenizer(input_text, return_tensors="pt", max_length=512, truncation=True).to(device)

        summary_ids = model.generate(
            inputs["input_ids"],
            num_beams=4,
            max_length=150,
            early_stopping=True
        )

        summary = tokenizer.decode(summary_ids[0], skip_special_tokens=True)
        final_summary_parts.append(summary)

    return " ".join(final_summary_parts).strip()
