import { NextRequest, NextResponse } from 'next/server';
import { readStoredTicketsServer, writeStoredTicketsServer, TicketMessage, TroubleTicket } from '@/lib/ticketStore';
import { sendCustomerReplyNotification, sendAdminTicketAlert } from '@/lib/ticketEmailer';

/**
 * POST /api/tickets/[id]/messages
 * Appends a communication reply or internal note to a trouble ticket.
 */
export async function POST(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const body = await req.json();
    const {
      senderName = 'Emil Halili',
      senderEmail = 'emil@appointmentlyy.com',
      senderRole = 'admin',
      isInternalNote = false,
      content,
    } = body;

    if (!content || !content.trim()) {
      return NextResponse.json({ error: 'Message content cannot be empty' }, { status: 400 });
    }

    const tickets = readStoredTicketsServer();
    const ticketIndex = tickets.findIndex(t => t.id.toLowerCase() === id.toLowerCase());

    if (ticketIndex === -1) {
      return NextResponse.json({ error: 'Ticket not found' }, { status: 404 });
    }

    const currentTicket = tickets[ticketIndex];
    const now = new Date().toISOString();

    const newMessage: TicketMessage = {
      id: `msg_${currentTicket.id.toLowerCase().replace(/[^a-z0-9]/g, '_')}_${Date.now()}`,
      ticketId: currentTicket.id,
      senderName: senderName.trim(),
      senderEmail: senderEmail.trim(),
      senderRole: senderRole as 'customer' | 'admin' | 'system',
      isInternalNote: Boolean(isInternalNote),
      content: content.trim(),
      createdAt: now,
    };

    // If an admin replies directly to the customer, transition status to in_progress or waiting_on_customer if open
    let updatedStatus = currentTicket.status;
    if (senderRole === 'admin' && !isInternalNote && currentTicket.status === 'open') {
      updatedStatus = 'in_progress';
    }

    const updatedTicket: TroubleTicket = {
      ...currentTicket,
      status: updatedStatus,
      updatedAt: now,
      messages: [...currentTicket.messages, newMessage],
    };

    tickets[ticketIndex] = updatedTicket;
    writeStoredTicketsServer(tickets);

    // If Admin sends a non-internal message, dispatch email update to customer!
    if (senderRole === 'admin' && !isInternalNote) {
      sendCustomerReplyNotification(updatedTicket, newMessage).catch(err => {
        console.warn('[Ticket Message Notification Error]', err);
      });
    }

    // If Customer sends a message, alert Admin team
    if (senderRole === 'customer') {
      sendAdminTicketAlert({
        ...updatedTicket,
        subject: `Re: ${updatedTicket.subject} (Customer Response)`,
        description: newMessage.content,
      }).catch(err => {
        console.warn('[Customer Reply Alert Error]', err);
      });
    }

    return NextResponse.json({
      success: true,
      message: newMessage,
      ticket: updatedTicket,
    });
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : 'Failed to post message to ticket';
    console.error('[API /api/tickets/[id]/messages POST error]', errorMsg);
    return NextResponse.json(
      { error: errorMsg },
      { status: 500 }
    );
  }
}
