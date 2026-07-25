import prisma from '../lib/prisma.js';

const VALID_TYPES = ['practice', 'tournament', 'social'];

function validateEventInput(data, { partial = false } = {}) {
  const errors = [];

  if (!partial || data.title !== undefined) {
    if (!data.title || typeof data.title !== 'string') errors.push('title is required');
  }
  if (!partial || data.location !== undefined) {
    if (!data.location || typeof data.location !== 'string') errors.push('location is required');
  }
  if (!partial || data.type !== undefined) {
    if (!VALID_TYPES.includes(data.type)) errors.push(`type must be one of ${VALID_TYPES.join(', ')}`);
  }
  if (!partial || data.startDate !== undefined) {
    if (!data.startDate || Number.isNaN(Date.parse(data.startDate))) errors.push('startDate is required and must be a valid date');
  }
  if (data.endDate !== undefined && data.endDate !== null && Number.isNaN(Date.parse(data.endDate))) {
    errors.push('endDate must be a valid date');
  }

  if (errors.length) {
    const err = new Error(errors.join('; '));
    err.status = 400;
    throw err;
  }
}

export async function listEvents({ upcoming } = {}) {
  const where = upcoming ? { startDate: { gte: new Date() } } : {};
  return prisma.event.findMany({ where, orderBy: { startDate: 'asc' } });
}

export async function createEvent(data) {
  validateEventInput(data);
  return prisma.event.create({
    data: {
      title: data.title,
      description: data.description ?? null,
      startDate: new Date(data.startDate),
      endDate: data.endDate ? new Date(data.endDate) : null,
      time: data.time ?? null,
      location: data.location,
      type: data.type,
    },
  });
}

export async function updateEvent(id, data) {
  validateEventInput(data, { partial: true });
  const updateData = {};
  if (data.title !== undefined) updateData.title = data.title;
  if (data.description !== undefined) updateData.description = data.description;
  if (data.startDate !== undefined) updateData.startDate = new Date(data.startDate);
  if (data.endDate !== undefined) updateData.endDate = data.endDate ? new Date(data.endDate) : null;
  if (data.time !== undefined) updateData.time = data.time;
  if (data.location !== undefined) updateData.location = data.location;
  if (data.type !== undefined) updateData.type = data.type;

  return prisma.event.update({ where: { id }, data: updateData });
}

export async function deleteEvent(id) {
  await prisma.event.delete({ where: { id } });
}
