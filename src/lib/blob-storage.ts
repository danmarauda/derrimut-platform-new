/**
 * Vercel Blob Storage Utilities
 *
 * Handles uploading and managing media files in Vercel Blob storage
 * to reduce bundle size and improve performance.
 */

import { put, del, list } from '@vercel/blob';

/**
 * Upload a file to Vercel Blob storage
 *
 * @param file File or Blob to upload
 * @param filename Filename for the blob
 * @param folder Optional folder prefix
 * @returns Blob URL
 */
export async function uploadToBlob(
  file: File | Blob,
  filename: string,
  folder?: string
): Promise<string> {
  const path = folder ? `${folder}/${filename}` : filename;

  const blob = await put(path, file, {
    access: 'public',
    addRandomSuffix: false,
  });

  return blob.url;
}

/**
 * Delete a file from Vercel Blob storage
 *
 * @param url Blob URL to delete
 */
export async function deleteFromBlob(url: string): Promise<void> {
  await del(url);
}

/**
 * List all files in a folder
 *
 * @param prefix Folder prefix to list
 * @returns Array of blob metadata
 */
export async function listBlobFiles(prefix?: string) {
  const { blobs } = await list({
    prefix: prefix || '',
  });

  return blobs;
}

/**
 * Upload an image with optimization
 *
 * @param file Image file
 * @param options Upload options
 * @returns Blob URL
 */
export async function uploadOptimizedImage(
  file: File,
  options: {
    folder?: string;
    maxWidth?: number;
    quality?: number;
  } = {}
): Promise<string> {
  const { folder = 'images', maxWidth = 1920, quality = 85 } = options;

  // For browser-side uploads, we'll rely on Next.js Image component optimization
  // For server-side, you can use sharp here
  const filename = file.name;
  return uploadToBlob(file, filename, folder);
}

/**
 * Get optimized image URL with Next.js Image parameters
 *
 * @param blobUrl Original blob URL
 * @param width Target width
 * @param quality Image quality (1-100)
 * @returns Optimized URL
 */
export function getOptimizedImageUrl(
  blobUrl: string,
  width?: number,
  quality: number = 85
): string {
  const url = new URL(blobUrl);

  if (width) {
    url.searchParams.set('w', width.toString());
  }

  url.searchParams.set('q', quality.toString());

  return url.toString();
}

/**
 * Environment-aware blob token retrieval
 */
export function getBlobReadWriteToken(): string {
  const token = process.env.BLOB_READ_WRITE_TOKEN;

  if (!token) {
    throw new Error('BLOB_READ_WRITE_TOKEN environment variable is not set');
  }

  return token;
}

/**
 * Check if blob storage is configured
 */
export function isBlobConfigured(): boolean {
  return !!process.env.BLOB_READ_WRITE_TOKEN;
}
