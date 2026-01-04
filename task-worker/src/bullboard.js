import { createBullBoard } from '@bull-board/api';
import { BullMQAdapter } from '@bull-board/api/bullMQAdapter';
import { ExpressAdapter } from '@bull-board/express';
import { queue } from './queue/queue';

export function setupBullboard(app) {
  const serverAdapter = new ExpressAdapter();
  serverAdapter.setBasePath('/admin/queues');
  createBullBoard({ queues: [new BullMQAdapter(queue)], serverAdapter });
  app.use('/admin/queues',serverAdapter.getRouter())
}
