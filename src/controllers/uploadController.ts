// src/controllers/upload.controller.ts

import { FastifyReply, FastifyRequest } from 'fastify';
import { pipeline } from 'stream';
import { promisify } from 'util';
import * as fs from 'fs';
import * as path from 'path';

const pump = promisify(pipeline);

// Allowed image & video mime types
const allowedMimeTypes = [
  // Images
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/gif',
  'image/webp',
  'image/bmp',
  'image/tiff',
  'image/svg+xml',
  'image/heic',
  'image/heif',

  // Videos
  'video/mp4',
  'video/webm',
  'video/ogg',
  'video/quicktime',   // mov
  'video/x-msvideo',   // avi
  'video/x-matroska',  // mkv
  'video/mpeg',
  'video/3gpp',
];

export async function uploadFile(request: FastifyRequest, reply: FastifyReply) {
  try {
    const data = await request.file();

    if (!data) {
      return reply.status(400).send({ message: 'No file uploaded.' });
    }

    if (data.mimetype && !allowedMimeTypes.includes(data.mimetype)) {
      return reply
        .status(400)
        .send({ message: `Unsupported file type: ${data.mimetype}` });
    }

    const filename = `${Date.now()}-${data.filename.replace(/\s/g, '_')}`;
    const uploadDir = path.join(process.cwd(), 'public', 'assets');
    await fs.promises.mkdir(uploadDir, { recursive: true });

    const uploadPath = path.join(uploadDir, filename);
    await pump(data.file, fs.createWriteStream(uploadPath));

    const fileUrl = `../assets/${filename}`;
    return reply.status(201).send({ url: fileUrl });
  } catch (error) {
    request.log.error(error, 'Error uploading file');
    return reply.status(500).send({ message: 'Failed to upload file.' });
  }
}
