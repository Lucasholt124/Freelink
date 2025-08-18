// app/api/search/route.ts
import { NextResponse } from 'next/server';
import { MOCK_SEARCH_RESULTS } from '../mock-data';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get('q')?.toLowerCase() || '';

  if (!query) {
    return NextResponse.json([]);
  }

  // Simula um delay de rede
  await new Promise(resolve => setTimeout(resolve, 200));

  const filteredItems = MOCK_SEARCH_RESULTS.filter(item =>
    item.label.toLowerCase().includes(query) ||
    item.tags.some(tag => tag.includes(query))
  );

  return NextResponse.json(filteredItems);
}