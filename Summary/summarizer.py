from transformers import T5Tokenizer, T5ForConditionalGeneration
import torch

# Load model
tokenizer = T5Tokenizer.from_pretrained("t5-small")
model = T5ForConditionalGeneration.from_pretrained("t5-small")

device = "cuda" if torch.cuda.is_available() else "cpu"
model.to(device)
print(f"Device set to use {device}")

# ---------- Chunking function ----------
def chunk_text(text, max_tokens=300):
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

# ---------- Main summarizer ----------
def summarize_text(text):
    """Summarize long text with automatic chunking."""
    chunks = chunk_text(text)
    final_summary = ""

    for chunk in chunks:
        inputs = tokenizer(
            "summarize: " + chunk,
            return_tensors="pt",
            max_length=512,
            truncation=True
        ).to(device)

        summary_ids = model.generate(
            inputs["input_ids"],
            num_beams=4,
            max_length=150,
            early_stopping=True
        )

        summary = tokenizer.decode(summary_ids[0], skip_special_tokens=True)
        final_summary += summary + " "

    return final_summary.strip()
