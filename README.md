# Retrieval-Augmented Generation (RAG) based President Biden's Speech 2023
<p align="center">
  <img src="https://github.com/akhilchibber/RAG-BidenSpeech/blob/main/President_Biden.png?raw=true" alt="earthml Logo">
</p>

## Dataset
The dataset used in this project can be found on Kaggle: [President Biden Speech Dataset](https://www.kaggle.com/datasets/whegedusich/president-bidens-state-of-the-union-2023/data). 

## Objective
The goal is to develop a Q&A system capable of delivering informed responses on the content of President Biden's address, demonstrating RAG's application in combining semantic data retrieval with generative language models for NLP analysis in political discourse.

## Key Components
- **Groq LLM**: Employs llama-3.3-70b-versatile for generating text responses that mimic human conversation.
- **Supabase**: Acts as a vector database for storing and retrieving speech data semantically.
- **Sentence Transformers**: Generates semantic embeddings for text chunks.
- **LangChain**: Orchestrates the interaction between components, facilitating the RAG process.

## Functionality
The system retrieves information from Supabase based on user queries about the SOTU address, then uses Groq LLM to generate responses. This ensures accuracy and broader contextual understanding, resulting in precise and enriched answers.
<p align="center">
  <img src="https://github.com/akhilchibber/RAG-BidenSpeech/blob/main/RAG.png?raw=true" alt="earthml Logo">
</p>

## Use Case
Ideal for researchers, journalists, educators, and the public for exploring political speeches via natural language queries. It showcases how retrieval and generation can be integrated in NLP to improve information access and understanding.

## Getting Started
To get started with this project:

1. Clone this repository to your local machine.
2. Install the required dependencies: `pip install -r requirements.txt`
3. Configure your API keys in `.env` file (see `.env.example`)
4. Setup Supabase database (see ARCHITECTURE.md for SQL setup)
5. Index the speech: `python chatbot_final.py index`
6. Run the chatbot: `python chatbot_final.py` (CLI) or `python app.py` (Web)

## Contributing
We welcome contributions to enhance the functionality and efficiency of this script. Feel free to fork, modify, and make pull requests to this repository. To contribute:

1. Fork the Project.
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`).
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`).
4. Push to the Branch (`git push origin feature/AmazingFeature`).
5. Open a Pull Request against the `main` branch.

## License
This project is licensed under the MIT License - see the `LICENSE` file for details.

## Contact
Author: Akhil Chhibber

LinkedIn: https://www.linkedin.com/in/akhilchhibber/

Medium Blogs: https://medium.com/@akhil.chibber

Live Deployment: https://rag-biden-speech--akhilchibber.replit.app/
