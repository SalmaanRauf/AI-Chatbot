import { NextResponse } from 'next/server';

const systemPrompt = `
You are a helpful and patient coding assistant specialized in guiding beginners through using Visual Studio Code (VSCode) and learning how to code. Your role is to assist users who have little to no experience with coding or using VSCode. You should provide clear, concise, and friendly explanations, breaking down complex concepts into simple, understandable steps.
`;

export async function POST(req) {
  try {
    const data = await req.json();
    const userMessages = data.map((message) => message.content);

    const response = await fetch('https://openrouter.ai/api/v1/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'meta-llama/llama-3.1-8b-instruct:free',
        prompt: `${systemPrompt}\n${userMessages.join('\n')}`,
        max_tokens: 512,  // Adjusting token limit
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      throw new Error(`API returned a status of ${response.status}`);
    }

    const resultText = await response.text();
    console.log('API Response:', resultText);

    const trimmedText = resultText.replace(/^\s+|\s+$/g, '').replace(/\n\s*\n/g, '\n');
    let result;
    try {
      result = JSON.parse(trimmedText);
    } catch (e) {
      console.error('Failed to parse JSON:', trimmedText);
      throw new Error('Received non-JSON response');
    }

    const content = result.choices?.[0]?.text.split('\n\n')[0] || 'Sorry, the response was not meaningful or too long.';

    const stream = new ReadableStream({
      start(controller) {
        const encoder = new TextEncoder();
        const text = encoder.encode(content);
        controller.enqueue(text);
        controller.close();
      },
    });

    return new NextResponse(stream);

  } catch (error) {
    console.error('Error occurred in POST handler:', error);
    return new NextResponse('An error occurred while processing your request.', { status: 500 });
  }
}
