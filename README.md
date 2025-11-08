# Question Paper Generator

A web application that generates multiple question papers based on a model question paper and syllabus using AI.

## Features

- Upload a model question paper (PDF format)
- Extract metadata (subject, marks, time, format) from the model
- Enter syllabus content
- Generate 3 different question papers for academic years 2024-25, 2023-24, and 2022-23
- Download generated question papers as PDF

## Setup

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```

3. Get a free Hugging Face API key:
   - Visit [huggingface.co](https://huggingface.co)
   - Create a free account
   - Go to Settings > Access Tokens
   - Create a new token with "Read" role

4. Create a `.env` file in the root directory:
   ```
   REACT_APP_HF_API_KEY=your_api_key_here
   ```

5. Start the development server:
   ```bash
   npm start
   ```

## Deployment to GitHub Pages

1. Update the `homepage` field in `package.json` with your GitHub username:
   ```json
   "homepage": "https://yourusername.github.io/qpgen"
   ```

2. Deploy to GitHub Pages:
   ```bash
   npm run deploy
   ```

## Technologies Used

- React (TypeScript)
- Hugging Face Inference API (free tier)
- pdf-parse for PDF text extraction
- jsPDF for PDF generation
- GitHub Pages for hosting

## How It Works

1. **Model Analysis**: The app parses the uploaded PDF to extract question format, marks distribution, subject, and time
2. **AI Generation**: Uses Hugging Face's text generation models to create new questions based on the syllabus
3. **Paper Creation**: Generates 3 distinct question papers maintaining the same format as the model
4. **PDF Export**: Converts the generated papers to downloadable PDF format

## Limitations

- Requires a stable internet connection for AI generation
- PDF parsing may not work perfectly with all document formats
- Free Hugging Face API has rate limits
