// app/api/notifications/route.ts
import { NextResponse } from 'next/server';
import { MOCK_NOTIFICATIONS } from '../mock-data';

let notifications = MOCK_NOTIFICATIONS.map(n => ({...n, timestamp: new Date(n.timestamp)}));

export async function GET() {
  const sortedNotifications = notifications.sort((a, b) => {
    if (a.isRead !== b.isRead) {
      return a.isRead ? 1 : -1;
    }
    return b.timestamp.getTime() - a.timestamp.getTime();
  });
  return NextResponse.json(sortedNotifications);
}

export async function PATCH(request: Request) {
  const { id, markAll } = await request.json();

  if (markAll) {
    notifications = notifications.map(n => ({ ...n, isRead: true }));
    return NextResponse.json({ message: 'All notifications marked as read.' });
  }

  const notification = notifications.find(n => n.id === id);
  if (notification) {
    notification.isRead = true;
    return NextResponse.json({ message: `Notification ${id} marked as read.` });
  }

  return NextResponse.json({ error: 'Notification not found' }, { status: 404 });
}