import React, { useState } from 'react';
import './App.css';

// Declare modules for client-side usage
declare const require: any;

interface QuestionPaper {
  subject: string;
  totalMarks: number;
  time: string;
  academicYear: string;
  questions: string[];
}

function App() {
  const [modelFile, setModelFile] = useState<File | null>(null);
  const [syllabus, setSyllabus] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedPapers, setGeneratedPapers] = useState<QuestionPaper[]>([]);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setModelFile(file);
    }
  };

  const parseModelQP = async (file: File): Promise<Partial<QuestionPaper>> => {
    // For now, return mock data since pdf-parse has issues in browser build
    // In a real implementation, you'd use a different PDF parsing approach
    const metadata: Partial<QuestionPaper> = {
      subject: "Computer Science",
      totalMarks: 100,
      time: "3 hours",
      questions: [
        "What is an algorithm?",
        "Explain the concept of variables in programming.",
        "Describe the difference between compiled and interpreted languages.",
        "What is a data structure?",
        "Explain the working of a stack."
      ]
    };

    return metadata;
  };

  const generateQuestions = async (syllabus: string, modelMetadata: Partial<QuestionPaper>): Promise<string[]> => {
    const { HfInference } = require('@huggingface/inference');
    const hf = new HfInference(process.env.REACT_APP_HF_API_KEY);

    const prompt = `Generate ${modelMetadata.questions?.length || 10} academic questions based on this syllabus: ${syllabus}.
    The questions should follow this format: ${modelMetadata.questions?.[0] || 'Multiple choice and descriptive questions'}.
    Subject: ${modelMetadata.subject || 'General'}.
    Total marks: ${modelMetadata.totalMarks || 100}.
    Make questions educational and appropriate for academic assessment.`;

    const response = await hf.textGeneration({
      model: 'microsoft/DialoGPT-medium',
      inputs: prompt,
      parameters: {
        max_new_tokens: 500,
        temperature: 0.7,
      }
    });

    return response.generated_text.split('\n').filter((q: string) => q.trim().length > 0);
  };

  const generateQuestionPapers = async () => {
    if (!modelFile || !syllabus) {
      alert('Please upload a model question paper and enter syllabus');
      return;
    }

    setIsGenerating(true);
    try {
      const modelMetadata = await parseModelQP(modelFile);
      const academicYears = ['2024-25', '2023-24', '2022-23'];

      const papers: QuestionPaper[] = [];

      for (const year of academicYears) {
        const questions = await generateQuestions(syllabus, modelMetadata);
        papers.push({
          subject: modelMetadata.subject || 'Subject',
          totalMarks: modelMetadata.totalMarks || 100,
          time: modelMetadata.time || '3 hours',
          academicYear: year,
          questions: questions
        });
      }

      setGeneratedPapers(papers);
    } catch (error) {
      console.error('Error generating question papers:', error);
      alert('Error generating question papers. Please check your API key and try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const downloadPDF = (paper: QuestionPaper) => {
    const { jsPDF } = require('jspdf');
    const doc = new jsPDF();

    doc.setFontSize(16);
    doc.text(`${paper.subject} - ${paper.academicYear}`, 20, 20);

    doc.setFontSize(12);
    doc.text(`Total Marks: ${paper.totalMarks}`, 20, 35);
    doc.text(`Time: ${paper.time}`, 20, 45);

    let yPosition = 60;
    paper.questions.forEach((question, index) => {
      if (yPosition > 270) {
        doc.addPage();
        yPosition = 20;
      }
      doc.text(`${index + 1}. ${question}`, 20, yPosition);
      yPosition += 10;
    });

    doc.save(`${paper.subject}_${paper.academicYear}.pdf`);
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1>Question Paper Generator</h1>

        <div className="upload-section">
          <label htmlFor="model-file">Upload Model Question Paper (PDF):</label>
          <input
            type="file"
            id="model-file"
            accept=".pdf"
            onChange={handleFileUpload}
          />
        </div>

        <div className="syllabus-section">
          <label htmlFor="syllabus">Enter Syllabus:</label>
          <textarea
            id="syllabus"
            value={syllabus}
            onChange={(e) => setSyllabus(e.target.value)}
            placeholder="Enter the syllabus content here..."
            rows={5}
          />
        </div>

        <button
          onClick={generateQuestionPapers}
          disabled={isGenerating || !modelFile || !syllabus}
          className="generate-btn"
        >
          {isGenerating ? 'Generating...' : 'Generate Question Papers'}
        </button>

        {generatedPapers.length > 0 && (
          <div className="results-section">
            <h2>Generated Question Papers:</h2>
            {generatedPapers.map((paper, index) => (
              <div key={index} className="paper-card">
                <h3>{paper.subject} - {paper.academicYear}</h3>
                <p>Total Marks: {paper.totalMarks}</p>
                <p>Time: {paper.time}</p>
                <button onClick={() => downloadPDF(paper)}>Download PDF</button>
              </div>
            ))}
          </div>
        )}
      </header>
    </div>
  );
}

export default App;
