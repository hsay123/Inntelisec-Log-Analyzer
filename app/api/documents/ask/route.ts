import { generateText } from "ai";

export const maxDuration = 60;

// Sample document chunks for demo - in production, these would come from a vector database
const sampleDocumentChunks = [
  {
    docName: "Employee Handbook.pdf",
    chunkId: 1,
    section: "Leave Policies",
    text: "Maternity Leave Policy: All full-time employees are entitled to 16 weeks of paid maternity leave. This leave can begin up to 4 weeks before the expected due date. Employees must notify HR at least 30 days in advance. During maternity leave, employees retain full health benefits and their position is guaranteed upon return.",
  },
  {
    docName: "Employee Handbook.pdf",
    chunkId: 2,
    section: "Leave Policies",
    text: "Paternity Leave Policy: Full-time employees are entitled to 8 weeks of paid paternity leave within the first year of the child's birth or adoption. This leave can be taken in increments of at least 1 week. Employees should coordinate with their manager to minimize workflow disruption.",
  },
  {
    docName: "Employee Handbook.pdf",
    chunkId: 3,
    section: "Workplace Conduct",
    text: "Remote Work Policy: Employees may work remotely up to 3 days per week with manager approval. A formal remote work agreement must be signed. Employees are expected to maintain regular working hours and be available during core hours of 10 AM to 4 PM in their local timezone.",
  },
  {
    docName: "Product Specification.txt",
    chunkId: 4,
    section: "System Requirements",
    text: "System Requirements: The IntelliSync platform requires a minimum of 8GB RAM, 4-core CPU, and 20GB available storage. Supported operating systems include Windows 10+, macOS 11+, and Ubuntu 20.04+. Internet connection with minimum 10 Mbps download speed is required for optimal performance.",
  },
  {
    docName: "Product Specification.txt",
    chunkId: 5,
    section: "API Integration",
    text: "API Key Management: To reset your API key, navigate to Settings > API Keys > Generate New Key. Note that generating a new key will invalidate the previous key immediately. Store your API key securely as it provides full access to your account. Keys can also be rotated on a scheduled basis via the admin dashboard.",
  },
  {
    docName: "Product Specification.txt",
    chunkId: 6,
    section: "Features",
    text: "Document Processing: IntelliSync supports PDF, TXT, DOC, and DOCX file formats. Maximum file size is 50MB per document. Documents are automatically chunked using intelligent boundary detection based on paragraphs, sections, and semantic meaning.",
  },
  {
    docName: "HR Policy Document.pdf",
    chunkId: 7,
    section: "Expense Reimbursement",
    text: "Expense Reimbursement: Business-related expenses must be submitted within 30 days of incurrence. Receipts are required for all expenses over $25. Expenses are typically reimbursed within 2 pay periods. For questions about expense policies, contact the Finance department at finance@company.com.",
  },
  {
    docName: "HR Policy Document.pdf",
    chunkId: 8,
    section: "Performance Reviews",
    text: "Performance Review Process: Annual performance reviews are conducted in Q4 each year. Self-assessments are due by November 15th. Manager reviews are completed by December 15th. Final ratings and compensation adjustments are communicated by January 15th of the following year.",
  },
  {
    docName: "HR Policy Document.pdf",
    chunkId: 9,
    section: "Benefits",
    text: "Health Insurance: The company provides comprehensive health insurance including medical, dental, and vision coverage. Plans are effective from the first of the month following 30 days of employment. Employees may add dependents during open enrollment or within 30 days of a qualifying life event.",
  },
];

// Simple TF-IDF-like similarity calculation for demo
function calculateSimilarity(query: string, text: string): number {
  const queryTerms = query.toLowerCase().split(/\s+/);
  const textLower = text.toLowerCase();
  
  let matchCount = 0;
  let totalWeight = 0;
  
  for (const term of queryTerms) {
    if (term.length < 3) continue;
    totalWeight += 1;
    if (textLower.includes(term)) {
      matchCount += 1;
      // Boost for exact phrase matches
      if (textLower.includes(query.toLowerCase())) {
        matchCount += 0.5;
      }
    }
  }
  
  if (totalWeight === 0) return 0;
  
  // Base similarity from term matching
  let similarity = matchCount / totalWeight;
  
  // Add some randomness to simulate embedding-based retrieval
  similarity = Math.min(1, similarity + Math.random() * 0.15);
  
  return similarity;
}

// Dynamic K retrieval - adjusts based on similarity score distribution
function retrieveChunks(query: string, chunks: typeof sampleDocumentChunks) {
  // Calculate similarities
  const scored = chunks.map((chunk) => ({
    ...chunk,
    similarity: calculateSimilarity(query, chunk.text),
  }));

  // Sort by similarity
  scored.sort((a, b) => b.similarity - a.similarity);

  // Dynamic K selection based on score distribution
  const topScore = scored[0]?.similarity || 0;
  
  // If top scores are very high, use fewer chunks (more confident)
  // If scores are spread out, use more chunks for coverage
  let k = 3; // default
  
  if (topScore > 0.7) {
    k = 2; // High confidence, fewer needed
  } else if (topScore < 0.3) {
    k = 5; // Low confidence, need more for coverage
  } else {
    // Check score spread
    const secondScore = scored[1]?.similarity || 0;
    if (topScore - secondScore > 0.2) {
      k = 2; // Clear winner
    } else {
      k = 4; // Close scores, get more context
    }
  }

  return scored.slice(0, k).filter((s) => s.similarity > 0.1);
}

export async function POST(req: Request) {
  try {
    const { question } = await req.json();

    if (!question || typeof question !== "string") {
      return Response.json(
        { error: "Question is required" },
        { status: 400 }
      );
    }

    // Retrieve relevant chunks
    const retrievedChunks = retrieveChunks(question, sampleDocumentChunks);

    // If no relevant chunks found
    if (retrievedChunks.length === 0) {
      return Response.json({
        answer: "This information is not found in the provided documents.",
        sources: [],
      });
    }

    // Build context for the AI
    const context = retrievedChunks
      .map(
        (chunk, i) =>
          `[CHUNK ${i + 1}]: ${chunk.text} (Source: ${chunk.docName}, Section: ${chunk.section})`
      )
      .join("\n\n");

    // Generate grounded answer using AI SDK
    const result = await generateText({
      model: "anthropic/claude-sonnet-4-20250514",
      system: `You are a precise document assistant. Answer the user's question ONLY using the provided context chunks. If the answer cannot be found in the context, respond exactly with: 'This information is not found in the provided documents.'
Never make assumptions or add information not present in the context.
Always be concise and direct.
When citing sources, reference the specific chunk number and document name.`,
      messages: [
        {
          role: "user",
          content: `Context chunks:
${context}

Question: ${question}

Answer the question using only the above context. Cite which chunk(s) you used.`,
        },
      ],
      abortSignal: req.signal,
    });

    // Format sources for the response
    const sources = retrievedChunks.map((chunk) => ({
      docName: chunk.docName,
      chunkId: chunk.chunkId,
      text: chunk.text.slice(0, 200) + (chunk.text.length > 200 ? "..." : ""),
      similarity: Math.round(chunk.similarity * 100) / 100,
      section: chunk.section,
    }));

    return Response.json({
      answer: result.text,
      sources,
    });
  } catch (error) {
    console.error("Document QA error:", error);
    return Response.json(
      { error: "Failed to process question" },
      { status: 500 }
    );
  }
}
