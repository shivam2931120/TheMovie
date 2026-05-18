# AI Recommendation System Implementation

This project implements a **Hybrid Content-Based Recommendation System** trained on the MovieLens dataset. It is designed for **Zero Latency** production deployment on Vercel.

## Architecture

1.  **Training (Offline)**:
    -   We use a Python script (`ml/train_model.py`) to process **Hybrid Features**:
        -   **Collaborative Filtering (70%)**: Analyzes identifying patterns in 100,000+ user ratings.
        -   **SVD (Matrix Factorization)**: We apply Singular Value Decomposition to find "Latent Features" (hidden concepts like "Dark Mood" or "Strong Hero") to reduce noise and improve quality.
    -   **Content-Based Filtering (32%)**: Analyzes titles, genres, and user tags (good for stability and cold-start cases).
    -   **Search Intent Model**: Builds a compact TF-IDF search index from title, genre, tag, year, and Bayesian rating quality signals.
    -   We use **chunked Cosine Similarity** on both matrices and fuse them with a weighted average, avoiding large in-memory pairwise matrices during training.
    -   We **Pre-compute** the top 20 recommendations for every movie.
    -   The results are exported to `src/data/recommendations.json` and `src/data/recommendation-search-index.json`.

2.  **Inference (Online)**:
    -   The Next.js API Route (`src/app/api/ai-recommend/route.ts`) acts as a micro-service.
    -   It loads the optimized JSON map (O(1) complexity lookup).
    -   For search-driven recommendations, it converts the search phrase and top movie search results into weighted recommendation seeds before expanding through the hybrid model.
    -   It returns the recommendations instantly (<10ms).

3.  **Frontend**:
    -   `AIRecommendations.tsx` and the search page fetch these IDs and fill in lightweight card metadata from TMDB in parallel.

## How to Retrain / Update Model

If you want to update the AI logic (e.g., add new movies, use different algorithms like SVD or Matrix Factorization):

1.  **Install Python Dependencies**:
    ```bash
    pip install -r requirements.txt
    ```

2.  **Run Training Script**:
    ```bash
    python3 ml/train_model.py
    # or
    source venv/bin/activate && python3 ml/train_model.py
    ```
    This will:
    -   Download the latest MovieLens dataset if needed.
    -   Train the model.
    -   Overwrite `src/data/recommendations.json`.
    -   Overwrite `src/data/recommendation-search-index.json`.

3.  **Deploy**:
    -   Commit the changes to both generated files.
    -   Push to Vercel.

## Scaling to Millions

For millions of users/movies where a JSON file is too big (e.g., >100MB):
1.  **Vector Database**: Push the vectors (from `tfidf_matrix`) to **Pinecone** or **Milvus**.
2.  **Vercel Python Function**: Create a `api/vector_search.py` that queries Pinecone.
3.  For this project size, the JSON approach is faster and cheaper (Free).
