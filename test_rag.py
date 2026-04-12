#!/usr/bin/env python3
"""
Test the RAG chatbot with multiple questions
"""

from chatbot_final import chat

questions = [
    "What did Biden say about jobs?",
    "What is the CHIPS Act?",
    "How does Biden plan to address climate change?",
    "What did Biden say about healthcare?",
    "What did Biden say about infrastructure?"
]

print("\n" + "="*70)
print("🤖 RAG CHATBOT TEST")
print("="*70)

for i, question in enumerate(questions, 1):
    print(f"\n[Question {i}] {question}")
    print("-" * 70)
    
    response = chat(question)
    
    # Print answer
    answer = response['answer']
    if len(answer) > 400:
        print(answer[:400] + "...\n")
    else:
        print(answer + "\n")
    
    # Print sources
    print(f"📚 Sources found: {len(response['sources'])}")
    if response['sources']:
        for j, source in enumerate(response['sources'], 1):
            print(f"   {j}. Similarity: {source['similarity']:.2f}")

print("\n" + "="*70)
print("✓ Test completed!")
print("="*70)
