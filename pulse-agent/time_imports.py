"""Check if model is already cached or needs download."""
import time, os

# Check if model is cached
cache_home = os.path.expanduser("~/.cache/torch/sentence_transformers")
print(f"Torch sentence transformer cache: {cache_home}")
if os.path.isdir(cache_home):
    for d in os.listdir(cache_home):
        print(f"  Cached model: {d}")
else:
    print("  No cached models found")

# Check huggingface hub cache
hf_cache = os.path.expanduser("~/.cache/huggingface/hub")
print(f"\nHuggingFace hub cache: {hf_cache}")
if os.path.isdir(hf_cache):
    models = [d for d in os.listdir(hf_cache) if "bge" in d.lower()]
    for m in models:
        print(f"  BAAI model: {m}")
else:
    print("  No HF hub cache found")

# Time model loading
print("\nLoading BAAI/bge-small-en-v1.5...")
t0 = time.monotonic()
from sentence_transformers import SentenceTransformer
t1 = time.monotonic()
print(f"  Import: {t1-t0:.2f}s")

model = SentenceTransformer("BAAI/bge-small-en-v1.5")
t2 = time.monotonic()
print(f"  Model load: {t2-t1:.2f}s")
print(f"  Total: {t2-t0:.2f}s")
