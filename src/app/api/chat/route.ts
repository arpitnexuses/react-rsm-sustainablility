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

// Replace the old config with the new runtime config
export const runtime = 'edge';

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

    // Create a TransformStream for streaming the response
    const encoder = new TextEncoder();
    const decoder = new TextDecoder();
    const stream = new TransformStream();
    const writer = stream.writable.getWriter();

    // Start processing in the background
    (async () => {
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
          throw new Error('No response received from assistant');
        }

        // Get the latest message content
        const messageContent = messages.data[0].content[0];
        if (messageContent.type !== 'text') {
          throw new Error('Unexpected response format from assistant');
        }

        // Clean and format the response
        const cleanedResponse = messageContent.text.value
          .replace(/【[^】]+】/g, '')
          .trim();

        // Write the response to the stream
        await writer.write(encoder.encode(JSON.stringify({ response: cleanedResponse })));
      } catch (error) {
        await writer.write(
          encoder.encode(
            JSON.stringify({
              error: error instanceof Error ? error.message : 'An error occurred'
            })
          )
        );
      } finally {
        await writer.close();
      }
    })();

    return new Response(stream.readable, {
      headers: {
        'Content-Type': 'application/json',
        'Transfer-Encoding': 'chunked',
      },
    });

  } catch (error) {
    console.error("Error in chat endpoint:", error);
    return NextResponse.json({
      response: 'An error occurred while processing your request',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
} 