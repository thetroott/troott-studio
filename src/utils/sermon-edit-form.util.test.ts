import { describe, expect, it, vi } from 'vitest';

import { resolveSermonCoverUrl } from '@/services/upload/sermon-cover-upload.service';
import { mapApiDocToEditForm } from '@/utils/sermon-edit-form.util';

vi.stubGlobal('window', {
    location: { origin: 'http://localhost:5053' },
});

describe('resolveSermonCoverUrl', () => {
    it('prefers imageUrl when present', () => {
        expect(
            resolveSermonCoverUrl({
                imageUrl: 'https://cdn.example/images/a.png',
                image: { item: 'https://s3.example/images/a.png' },
            }),
        ).toBe('https://cdn.example/images/a.png');
    });

    it('falls back to image.item', () => {
        expect(
            resolveSermonCoverUrl({
                imageUrl: '',
                image: { item: 'https://s3.example/images/a.png' },
            }),
        ).toBe('https://s3.example/images/a.png');
    });

    it('returns null when neither is set', () => {
        expect(resolveSermonCoverUrl({})).toBeNull();
    });
});

describe('mapApiDocToEditForm cover', () => {
    it('sets thumbnailPreview from signed or CDN imageUrl', () => {
        const form = mapApiDocToEditForm(
            {
                title: 'T',
                imageUrl:
                    'https://bucket.s3.amazonaws.com/images/x.png?X-Amz-Signature=abc',
                image: { item: 'https://ignored.example/x.png' },
            },
            'sermon-1',
        );
        expect(form.thumbnailPreview).toContain('X-Amz-Signature=abc');
    });

    it('sets thumbnailPreview null when no cover', () => {
        const form = mapApiDocToEditForm({ title: 'T' }, 'sermon-1');
        expect(form.thumbnailPreview).toBeNull();
    });
});
