import re, json, sys

SRC = "../biden-sotu-2023-planned-official.txt"
OUT = "biden_chunks.json"
TARGET = 1200   # target characters per chunk
OVERLAP = 2     # sentences of overlap between consecutive chunks

def main():
    with open(SRC, "r", encoding="utf-8") as f:
        text = f.read().strip()
    text = re.sub(r"\s+", " ", text)

    # Sentence split, keeping terminal punctuation.
    sentences = re.split(r"(?<=[.!?]) +", text)

    chunks = []
    cur = []
    cur_len = 0
    for s in sentences:
        cur.append(s)
        cur_len += len(s) + 1
        if cur_len >= TARGET:
            chunks.append(" ".join(cur).strip())
            cur = cur[-OVERLAP:]
            cur_len = sum(len(x) + 1 for x in cur)

    if cur:
        tail = " ".join(cur).strip()
        if len(tail) > 60 and (not chunks or tail != chunks[-1]):
            chunks.append(tail)

    with open(OUT, "w", encoding="utf-8") as f:
        json.dump(chunks, f, ensure_ascii=False)

    print("num sentences:", len(sentences))
    print("num chunks:", len(chunks))
    print("avg chunk len:", sum(len(c) for c in chunks) // len(chunks))
    print("min/max len:", min(len(c) for c in chunks), max(len(c) for c in chunks))
    print("--- chunk 1 ---")
    print(chunks[0][:280])
    print("--- chunk 2 (overlap check) ---")
    print(chunks[1][:280])

if __name__ == "__main__":
    main()
