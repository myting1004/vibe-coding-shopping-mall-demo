import { useEffect, useRef, useState } from 'react';
import {
  cloudinaryConfig,
  isCloudinaryConfigured,
  loadCloudinaryScript,
  type CloudinaryWidget,
} from '@/lib/cloudinary';

interface Props {
  value: string;
  onChange: (url: string) => void;
  folder?: string;
}

export default function CloudinaryUploadBox({ value, onChange, folder }: Props) {
  const widgetRef = useRef<CloudinaryWidget | null>(null);
  const [isOpening, setIsOpening] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [imgError, setImgError] = useState(false);

  useEffect(() => {
    setImgError(false);
  }, [value]);

  async function openWidget() {
    if (!isCloudinaryConfigured()) {
      setLoadError(
        '.env 의 VITE_CLOUDINARY_CLOUD_NAME / VITE_CLOUDINARY_UPLOAD_PRESET 을 설정해주세요.'
      );
      return;
    }

    setLoadError(null);

    try {
      setIsOpening(true);
      const cloudinary = await loadCloudinaryScript();

      if (!widgetRef.current) {
        widgetRef.current = cloudinary.createUploadWidget(
          {
            cloudName: cloudinaryConfig.cloudName,
            uploadPreset: cloudinaryConfig.uploadPreset,
            sources: ['local', 'url', 'camera'],
            multiple: false,
            maxFileSize: 5_000_000,
            folder,
            clientAllowedFormats: ['png', 'jpg', 'jpeg', 'webp', 'gif'],
          },
          (error, result) => {
            if (error) {
              setLoadError(
                error instanceof Error ? error.message : '업로드에 실패했습니다.'
              );
              return;
            }
            if (result?.event === 'success' && result.info?.secure_url) {
              onChange(result.info.secure_url);
            }
          }
        );
      }

      widgetRef.current.open();
    } catch (err) {
      setLoadError(err instanceof Error ? err.message : '위젯을 불러오지 못했습니다.');
    } finally {
      setIsOpening(false);
    }
  }

  function clearImage() {
    onChange('');
  }

  const hasImage = Boolean(value) && !imgError;

  return (
    <div>
      <button
        type="button"
        onClick={openWidget}
        disabled={isOpening}
        aria-label={hasImage ? '이미지 변경' : '이미지 추가'}
        className="group relative flex h-32 w-32 flex-col items-center justify-center gap-2 overflow-hidden rounded-lg border-2 border-dashed border-slate-200 bg-slate-50 text-slate-400 transition hover:border-rose-300 hover:bg-rose-50 hover:text-rose-500 disabled:cursor-wait disabled:opacity-60"
      >
        {hasImage ? (
          <>
            <img
              src={value}
              alt="상품 이미지 미리보기"
              className="h-full w-full object-cover"
              onError={() => setImgError(true)}
            />
            <span className="pointer-events-none absolute inset-0 hidden items-center justify-center bg-black/40 text-xs font-medium text-white group-hover:flex">
              변경
            </span>
          </>
        ) : (
          <>
            <ImageGlyph />
            <span className="text-xs">
              {isOpening ? '여는 중…' : '이미지 추가'}
            </span>
          </>
        )}
      </button>

      {hasImage && (
        <div className="mt-2 flex items-center gap-3 text-xs">
          <button
            type="button"
            onClick={openWidget}
            className="font-medium text-rose-600 hover:text-rose-700"
          >
            변경
          </button>
          <button
            type="button"
            onClick={clearImage}
            className="font-medium text-slate-500 hover:text-slate-900"
          >
            제거
          </button>
        </div>
      )}

      {value && (
        <p className="mt-2 break-all text-xs text-slate-400">{value}</p>
      )}

      {imgError && value && (
        <p className="mt-1 text-xs text-rose-600">
          이미지를 표시할 수 없습니다. URL 을 확인해주세요.
        </p>
      )}

      {loadError && (
        <p className="mt-2 text-xs text-rose-600">{loadError}</p>
      )}
    </div>
  );
}

function ImageGlyph() {
  return (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
      <circle cx="8.5" cy="8.5" r="1.5" />
      <polyline points="21 15 16 10 5 21" />
    </svg>
  );
}
