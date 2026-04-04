import { useRef, useState } from 'react';

const MAX_PHOTOS = 6;
const MAX_DIM = 1200;
const JPEG_QUALITY = 0.75;

async function compressImage(file) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      let { width, height } = img;
      if (width > MAX_DIM || height > MAX_DIM) {
        if (width > height) {
          height = Math.round(height * MAX_DIM / width);
          width = MAX_DIM;
        } else {
          width = Math.round(width * MAX_DIM / height);
          height = MAX_DIM;
        }
      }
      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      canvas.getContext('2d').drawImage(img, 0, 0, width, height);
      URL.revokeObjectURL(url);
      resolve(canvas.toDataURL('image/jpeg', JPEG_QUALITY));
    };
    img.onerror = () => { URL.revokeObjectURL(url); reject(new Error('Failed to load image')); };
    img.src = url;
  });
}

export default function PhotoSection({ photos = [], onPhotosChange, readOnly }) {
  const fileInputRef = useRef(null);
  const [lightboxIdx, setLightboxIdx] = useState(null);
  const [uploading, setUploading] = useState(false);

  async function handleFiles(e) {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;

    const remaining = MAX_PHOTOS - photos.length;
    const toProcess = files.slice(0, remaining);

    setUploading(true);
    try {
      const compressed = await Promise.all(toProcess.map(compressImage));
      onPhotosChange([...photos, ...compressed]);
    } catch (err) {
      console.error('Photo compression failed:', err);
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  }

  function deletePhoto(idx) {
    const updated = photos.filter((_, i) => i !== idx);
    onPhotosChange(updated);
    if (lightboxIdx !== null) {
      if (lightboxIdx >= updated.length) setLightboxIdx(updated.length - 1 || null);
    }
  }

  const canAdd = !readOnly && photos.length < MAX_PHOTOS;

  return (
    <div className="card" style={{ padding: 20, marginBottom: 12 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 18 }}>📷</span>
          <h3 style={{ color: '#2c2416', fontSize: 15, fontWeight: 600, margin: 0 }}>Photos</h3>
          {photos.length > 0 && (
            <span style={{ color: '#9c8b6e', fontSize: 12 }}>{photos.length}/{MAX_PHOTOS}</span>
          )}
        </div>
        {canAdd && (
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            style={{
              background: 'none', border: '1px solid #c8bc96', borderRadius: 6,
              color: '#9c8b6e', fontSize: 12, padding: '4px 10px', cursor: 'pointer',
            }}
          >
            {uploading ? 'Adding...' : '+ Add'}
          </button>
        )}
      </div>

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        multiple
        style={{ display: 'none' }}
        onChange={handleFiles}
      />

      {photos.length === 0 && !readOnly && (
        <button
          onClick={() => fileInputRef.current?.click()}
          style={{
            width: '100%', padding: '28px 0',
            background: 'none', border: '1px dashed #c8bc96', borderRadius: 8,
            color: '#9c8b6e', fontSize: 13, cursor: 'pointer', lineHeight: 1.6,
          }}
        >
          📷 Add photos from this trip
          <br />
          <span style={{ fontSize: 11 }}>Up to {MAX_PHOTOS} photos · compressed automatically</span>
        </button>
      )}

      {photos.length > 0 && (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: 6,
        }}>
          {photos.map((src, i) => (
            <div
              key={i}
              style={{ position: 'relative', aspectRatio: '1', borderRadius: 6, overflow: 'hidden', cursor: 'pointer' }}
              onClick={() => setLightboxIdx(i)}
            >
              <img
                src={src}
                alt={`Trip photo ${i + 1}`}
                style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
              />
              {!readOnly && (
                <button
                  onClick={e => { e.stopPropagation(); deletePhoto(i); }}
                  style={{
                    position: 'absolute', top: 4, right: 4,
                    background: 'rgba(0,0,0,0.65)', border: 'none', borderRadius: '50%',
                    color: '#fff', fontSize: 13, width: 22, height: 22,
                    cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    lineHeight: 1,
                  }}
                >
                  ×
                </button>
              )}
            </div>
          ))}

          {/* Add tile (if room left) */}
          {canAdd && (
            <button
              onClick={() => fileInputRef.current?.click()}
              style={{
                aspectRatio: '1', borderRadius: 6, border: '1px dashed #c8bc96',
                background: 'none', color: '#9c8b6e', fontSize: 22,
                cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}
            >
              +
            </button>
          )}
        </div>
      )}

      {/* Lightbox */}
      {lightboxIdx !== null && photos[lightboxIdx] && (
        <div
          onClick={() => setLightboxIdx(null)}
          style={{
            position: 'fixed', inset: 0, zIndex: 2000,
            background: 'rgba(0,0,0,0.92)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            padding: 20,
          }}
        >
          {/* Prev / Next */}
          {lightboxIdx > 0 && (
            <button
              onClick={e => { e.stopPropagation(); setLightboxIdx(i => i - 1); }}
              style={{
                position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)',
                background: 'rgba(255,255,255,0.1)', border: 'none', borderRadius: '50%',
                color: '#fff', fontSize: 22, width: 44, height: 44,
                cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}
            >
              ‹
            </button>
          )}
          {lightboxIdx < photos.length - 1 && (
            <button
              onClick={e => { e.stopPropagation(); setLightboxIdx(i => i + 1); }}
              style={{
                position: 'absolute', right: 16, top: '50%', transform: 'translateY(-50%)',
                background: 'rgba(255,255,255,0.1)', border: 'none', borderRadius: '50%',
                color: '#fff', fontSize: 22, width: 44, height: 44,
                cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}
            >
              ›
            </button>
          )}

          <img
            src={photos[lightboxIdx]}
            alt={`Photo ${lightboxIdx + 1}`}
            onClick={e => e.stopPropagation()}
            style={{
              maxWidth: '100%', maxHeight: '90vh',
              borderRadius: 10, objectFit: 'contain',
              boxShadow: '0 8px 40px rgba(0,0,0,0.6)',
            }}
          />

          {/* Counter + close */}
          <div style={{
            position: 'absolute', top: 16, right: 16,
            display: 'flex', gap: 10, alignItems: 'center',
          }}>
            <span style={{ color: 'rgba(255,255,255,0.5)', fontSize: 12 }}>
              {lightboxIdx + 1} / {photos.length}
            </span>
            <button
              onClick={() => setLightboxIdx(null)}
              style={{
                background: 'rgba(255,255,255,0.1)', border: 'none', borderRadius: '50%',
                color: '#fff', fontSize: 18, width: 34, height: 34,
                cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}
            >
              ✕
            </button>
          </div>

          {/* Delete from lightbox */}
          {!readOnly && (
            <button
              onClick={e => {
                  e.stopPropagation();
                  const remaining = photos.length - 1;
                  deletePhoto(lightboxIdx);
                  if (remaining === 0) setLightboxIdx(null);
                  else setLightboxIdx(Math.min(lightboxIdx, remaining - 1));
                }}
              style={{
                position: 'absolute', bottom: 20, left: '50%', transform: 'translateX(-50%)',
                background: 'rgba(248,113,113,0.15)', border: '1px solid rgba(248,113,113,0.35)',
                borderRadius: 6, color: '#f87171', fontSize: 13, padding: '7px 16px', cursor: 'pointer',
              }}
            >
              Delete photo
            </button>
          )}
        </div>
      )}
    </div>
  );
}
