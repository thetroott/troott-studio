import type { AxiosResponse } from 'axios';
import Uppy from '@uppy/core';
import AwsS3 from '@uppy/aws-s3';
import type { UppyFile } from '@uppy/core';

import api from '@/api/config';

const S3_MULTIPART_THRESHOLD_BYTES = 6 * 1024 * 1024;

export function coverFileFingerprint(file: File): string {
    return `${file.name}:${file.size}:${file.lastModified}`;
}

export function resolveSermonCoverUrl(
    doc: Record<string, unknown>,
): string | null {
    const imageUrl =
        typeof doc.imageUrl === 'string' ? doc.imageUrl.trim() : '';
    if (imageUrl) {
        return imageUrl;
    }
    const image = doc.image as { item?: unknown } | undefined;
    const item =
        image && typeof image.item === 'string' ? image.item.trim() : '';
    return item || null;
}

export type SermonCoverUploadResult = {
    imageUrl: string;
};

type TroottMeta = {
    sessionId?: string;
};

function unwrapEnvelope<T>(res: AxiosResponse<{ data?: T }>): T {
    const payload = res.data?.data;
    if (!payload) {
        throw new Error('Invalid API response');
    }
    return payload;
}

function parseCoverResponse(
    envelope: Record<string, unknown>,
): SermonCoverUploadResult {
    if (envelope.error) {
        throw new Error(
            typeof envelope.message === 'string'
                ? envelope.message
                : 'Cover upload failed',
        );
    }
    const imageUrl = resolveSermonCoverUrl(envelope);
    if (!imageUrl) {
        throw new Error('Cover upload succeeded but no image URL returned');
    }
    return { imageUrl };
}

async function uploadSermonCoverViaS3(
    sermonId: string,
    file: File,
    onProgress?: (percent: number) => void,
): Promise<SermonCoverUploadResult> {
    const uppy = new Uppy({ restrictions: { maxNumberOfFiles: 1 } });

    uppy.use(AwsS3, {
        shouldUseMultipart: () => true,
        createMultipartUpload: async (uppyFile: UppyFile) => {
            const res = await api.storage.createStorageMultipart({
                filename: file.name,
                contentType: file.type || 'image/jpeg',
                contentLength: file.size,
                purpose: 'storage-image',
            });
            const data = unwrapEnvelope<{
                sessionId: string;
                key: string;
                s3UploadId: string;
            }>(res);
            (uppyFile.meta as TroottMeta).sessionId = data.sessionId;
            return { uploadId: data.s3UploadId, key: data.key };
        },
        signPart: async (uppyFile, partData) => {
            const meta = uppyFile.meta as TroottMeta;
            const res = await api.storage.signStoragePart({
                sessionId: String(meta.sessionId),
                partNumber: partData.partNumber,
            });
            const data = unwrapEnvelope<{ url: string; headers?: Record<string, string> }>(
                res,
            );
            return { url: data.url, headers: data.headers ?? {} };
        },
        listParts: async (uppyFile) => {
            const meta = uppyFile.meta as TroottMeta;
            const res = await api.storage.listStorageParts(String(meta.sessionId));
            const data = unwrapEnvelope<{
                parts: Array<{ partNumber: number; size: number; etag: string }>;
            }>(res);
            return {
                parts: data.parts.map((p) => ({
                    PartNumber: p.partNumber,
                    Size: p.size,
                    ETag: p.etag,
                })),
            };
        },
        completeMultipartUpload: async (uppyFile, { parts }) => {
            const meta = uppyFile.meta as TroottMeta;
            await api.storage.completeStorageMultipart({
                sessionId: String(meta.sessionId),
                parts: parts.map((p) => ({
                    partNumber: p.PartNumber ?? 0,
                    etag: String(p.ETag ?? ''),
                })),
            });
            const coverRes = await api.sermon.completeSermonCoverMultipart({
                sessionId: String(meta.sessionId),
                sermonId,
            });
            (uppyFile.meta as TroottMeta & { coverResponse?: Record<string, unknown> }).coverResponse =
                unwrapEnvelope(coverRes) as Record<string, unknown>;
        },
        abortMultipartUpload: async (uppyFile) => {
            const meta = uppyFile.meta as TroottMeta;
            if (meta.sessionId) {
                await api.storage.abortStorageMultipart({
                    sessionId: String(meta.sessionId),
                });
            }
        },
    });

    uppy.on('upload-progress', (_file, progress) => {
        const total = progress.bytesTotal ?? file.size;
        if (total > 0 && onProgress) {
            onProgress(
                Math.min(100, Math.round((progress.bytesUploaded / total) * 100)),
            );
        }
    });

    uppy.addFile({
        name: file.name,
        type: file.type || 'image/jpeg',
        data: file,
    });

    const result = await uppy.upload();
    uppy.destroy();

    if (result.failed.length > 0) {
        throw new Error(result.failed[0]?.error ?? 'Cover upload failed');
    }

    const uploaded = result.successful[0];
    const coverPayload = (
        uploaded?.meta as TroottMeta & { coverResponse?: Record<string, unknown> }
    )?.coverResponse;

    if (!coverPayload) {
        throw new Error('Cover upload completed without sermon response');
    }

    return parseCoverResponse(coverPayload);
}

/**
 * Upload sermon cover image and attach to an existing sermon row.
 */
export async function uploadSermonCoverForSermon(
    sermonId: string,
    file: File,
    onProgress?: (percent: number) => void,
): Promise<SermonCoverUploadResult> {
    if (file.size > S3_MULTIPART_THRESHOLD_BYTES) {
        return uploadSermonCoverViaS3(sermonId, file, onProgress);
    }

    const formData = new FormData();
    formData.append('file', file);
    formData.append('sermonId', sermonId);
    const res = (await api.sermon.uploadCover(
        formData,
        onProgress,
    )) as AxiosResponse<{
        data?: { error?: boolean; message?: string } | Record<string, unknown>;
        error?: boolean;
        message?: string;
    }>;
    const envelope = res.data?.data ?? res.data;
    if (envelope && typeof envelope === 'object') {
        return parseCoverResponse(envelope as Record<string, unknown>);
    }
    throw new Error('Cover upload failed');
}
