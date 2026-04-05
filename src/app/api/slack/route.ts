import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, email } = body;

    const slackResponse = await axios.post(
      process.env.SLACK_WEBHOOK_URL ?? '',
      {text:`Name: ${name}, Email: ${email}`},
      {
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );
    if (slackResponse.status === 200) {
      return NextResponse.json({ message: 'Message sent successfully' }, { status: 200 });
    } else {
      return NextResponse.json({ message: 'Failed to send message' }, { status: slackResponse.status });
    }
  } catch (error) {
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}

export function OPTIONS() {
  return NextResponse.json({}, { status: 200 });
}

export function GET() {
  return NextResponse.json({ message: 'Method Not Allowed' }, { status: 405 });
}

export function PUT() {
  return NextResponse.json({ message: 'Method Not Allowed' }, { status: 405 });
}

export function DELETE() {
  return NextResponse.json({ message: 'Method Not Allowed' }, { status: 405 });
}
