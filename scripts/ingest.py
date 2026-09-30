import json, os, sys, time, urllib.request, urllib.error

SUPABASE_URL = os.environ["SUPABASE_URL"].rstrip("/")
SERVICE_KEY = os.environ["SERVICE_KEY"]
GOOGLE_API_KEY = os.environ["GOOGLE_API_KEY"]

EMBED_URL = (
    "https://generativelanguage.googleapis.com/v1beta/"
    "models/gemini-embedding-001:embedContent?key=" + GOOGLE_API_KEY
)
TABLE_URL = SUPABASE_URL + "/rest/v1/biden_speech_chunks"


def post_json(url, payload, headers):
    data = json.dumps(payload).encode("utf-8")
    req = urllib.request.Request(url, data=data, headers=headers, method="POST")
    try:
        with urllib.request.urlopen(req, timeout=60) as r:
            body = r.read().decode("utf-8")
            return r.status, body
    except urllib.error.HTTPError as e:
        return e.code, e.read().decode("utf-8")


def embed(text):
    payload = {
        "model": "models/gemini-embedding-001",
        "content": {"parts": [{"text": text}]},
    }
    status, body = post_json(EMBED_URL, payload, {"Content-Type": "application/json"})
    d = json.loads(body)
    return d["embedding"]["values"]


def clear_table():
    # delete all rows (id >= 0)
    req = urllib.request.Request(
        TABLE_URL + "?id=gte.0",
        headers={"Authorization": "Bearer " + SERVICE_KEY, "apikey": SERVICE_KEY},
        method="DELETE",
    )
    with urllib.request.urlopen(req, timeout=60) as r:
        return r.status


def insert(content, embedding):
    # pgvector via PostgREST expects a string literal like "[0.1,0.2,...]"
    embedding_str = "[" + ",".join(repr(float(x)) for x in embedding) + "]"
    payload = {
        "content": content,
        "embedding": embedding_str,
        "metadata": {"source": "biden-sotu-2023-planned-official.txt"},
    }
    headers = {
        "Authorization": "Bearer " + SERVICE_KEY,
        "apikey": SERVICE_KEY,
        "Content-Type": "application/json",
        "Prefer": "return=minimal",
    }
    return post_json(TABLE_URL, payload, headers)


def main():
    with open("biden_chunks.json", "r", encoding="utf-8") as f:
        chunks = json.load(f)
    print("loaded", len(chunks), "chunks")

    print("clearing table:", clear_table())

    ok = 0
    for i, c in enumerate(chunks, 1):
        try:
            emb = embed(c)
        except urllib.error.HTTPError as e:
            print(f"  chunk {i}: embed HTTP error {e.code}: {e.read().decode()[:200]}")
            sys.exit(1)
        if len(emb) != 3072:
            print(f"  chunk {i}: unexpected dim {len(emb)}")
            sys.exit(1)
        status, body = insert(c, emb)
        if status not in (200, 201):
            print(f"  chunk {i}: insert failed {status}: {body[:200]}")
            sys.exit(1)
        ok += 1
        print(f"  {i}/{len(chunks)} embedded(dim={len(emb)}) + inserted")
        time.sleep(0.1)

    print("DONE. inserted", ok, "chunks")


if __name__ == "__main__":
    main()
