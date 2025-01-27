import { NextResponse } from 'next/server';
import OpenAI from 'openai';

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  // Remove the baseURL as we want to use the default OpenAI endpoint
});

const ASSISTANT_ID = "asst_SizeRJtLIRnks53yEh8G6fU5";
const MAX_RETRIES = 10;
const INITIAL_RETRY_DELAY = 1;
const MAX_RETRY_DELAY = 5;

async function waitForRunCompletion(threadId: string, runId: string, maxRetries = MAX_RETRIES) {
  let retryCount = 0;
  let delay = INITIAL_RETRY_DELAY;

  while (retryCount < maxRetries) {
    try {
      const run = await openai.beta.threads.runs.retrieve(
        threadId,
        runId
      );
      
      if (run.status === "completed") {
        return run;
      } else if (["failed", "expired", "cancelled"].includes(run.status)) {
        throw new Error(`Run ended with status: ${run.status}`);
      }
      
      delay = Math.min(delay * 1.5, MAX_RETRY_DELAY);
      await new Promise(resolve => setTimeout(resolve, delay * 1000));
      retryCount++;
      
    } catch (error) {
      console.error("Error checking run status:", error);
      throw error;
    }
  }

  throw new Error("Maximum retries reached while waiting for run completion");
}

export async function POST(request: Request) {
  try {
    if (!process.env.OPENAI_API_KEY) {
      throw new Error('OPENAI_API_KEY environment variable is not set');
    }

    const body = await request.json();
    const userMessage = body.message;

    if (!userMessage) {
      return NextResponse.json({ response: 'No message provided' }, { status: 400 });
    }

    try {
      // Create thread with the user's message
      const thread = await openai.beta.threads.create({
        messages: [
          {
            role: "user",
            content: userMessage
          }
        ]
      });

      // Create and run the assistant
      const run = await openai.beta.threads.runs.create(
        thread.id,
        { 
          assistant_id: ASSISTANT_ID,
          instructions: "You are a helpful assistant that provides information about IFRS S1 & S2 for GCC Businesses."
        }
      );

      // Wait for the run to complete
      await waitForRunCompletion(thread.id, run.id);

      // Get the assistant's response
      const messages = await openai.beta.threads.messages.list(thread.id);
      
      if (!messages.data.length) {
        return NextResponse.json({ response: 'No response received from assistant' }, { status: 500 });
      }

      // Get the latest message content
      const messageContent = messages.data[0].content[0];
      if (messageContent.type !== 'text') {
        return NextResponse.json({ response: 'Unexpected response format from assistant' }, { status: 500 });
      }

      // Clean and format the response
      const cleanedResponse = messageContent.text.value
        .replace(/【[^】]+】/g, '')
        .trim();

      return NextResponse.json({ response: cleanedResponse });

    } catch (apiError) {
      console.error("OpenAI API Error:", apiError);
      return NextResponse.json({
        response: 'Error communicating with the AI assistant. Please try again later.',
        error: apiError instanceof Error ? apiError.message : 'Unknown API error'
      }, { status: 500 });
    }

  } catch (error) {
    console.error("Error in chat endpoint:", error);
    return NextResponse.json({
      response: 'An error occurred while processing your request',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
} 