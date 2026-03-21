import { NextResponse } from 'next/server';

export async function POST(request) {
    try {
        const body = await request.json();

        // Forward the request to the Python Service
        const pythonServiceUrl = process.env.PYTHON_SERVICE_URL || 'http://127.0.0.1:8000';

        const response = await fetch(`${pythonServiceUrl}/predict`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(body),
        });

        if (!response.ok) {
            const errorData = await response.json();
            return NextResponse.json(
                { error: errorData.detail || 'Python service error' },
                { status: response.status }
            );
        }

        const data = await response.json();
        return NextResponse.json(data);

    } catch (error) {
        console.error('Error connecting to Python service:', error);
        return NextResponse.json(
            { error: 'Failed to connect to prediction service' },
            { status: 500 }
        );
    }
}
