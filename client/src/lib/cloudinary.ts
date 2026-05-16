const SCRIPT_URL = 'https://upload-widget.cloudinary.com/global/all.js';
const SCRIPT_ID = 'cloudinary-upload-widget-script';

interface CloudinaryUploadResultInfo {
  secure_url: string;
  public_id: string;
  format: string;
  width: number;
  height: number;
  bytes: number;
}

interface CloudinaryUploadResult {
  event:
    | 'success'
    | 'close'
    | 'abort'
    | 'queues-end'
    | 'display-changed'
    | (string & {});
  info?: CloudinaryUploadResultInfo;
}

interface CloudinaryUploadOptions {
  cloudName: string;
  uploadPreset: string;
  sources?: string[];
  multiple?: boolean;
  maxFileSize?: number;
  folder?: string;
  clientAllowedFormats?: string[];
}

interface CloudinaryWidget {
  open: () => void;
  close: () => void;
}

interface CloudinaryGlobal {
  createUploadWidget: (
    options: CloudinaryUploadOptions,
    callback: (error: unknown, result: CloudinaryUploadResult) => void
  ) => CloudinaryWidget;
}

declare global {
  interface Window {
    cloudinary?: CloudinaryGlobal;
  }
}

let scriptPromise: Promise<CloudinaryGlobal> | null = null;

export function loadCloudinaryScript(): Promise<CloudinaryGlobal> {
  if (typeof window === 'undefined') {
    return Promise.reject(new Error('Cloudinary is only available in the browser.'));
  }
  if (window.cloudinary) {
    return Promise.resolve(window.cloudinary);
  }
  if (scriptPromise) return scriptPromise;

  scriptPromise = new Promise<CloudinaryGlobal>((resolve, reject) => {
    const existing = document.getElementById(SCRIPT_ID) as HTMLScriptElement | null;
    const script = existing ?? document.createElement('script');
    if (!existing) {
      script.id = SCRIPT_ID;
      script.src = SCRIPT_URL;
      script.async = true;
      document.head.appendChild(script);
    }
    script.addEventListener('load', () => {
      if (window.cloudinary) resolve(window.cloudinary);
      else reject(new Error('Cloudinary widget script loaded but window.cloudinary is missing.'));
    });
    script.addEventListener('error', () => {
      scriptPromise = null;
      reject(new Error('Cloudinary widget script failed to load.'));
    });
  });

  return scriptPromise;
}

export const cloudinaryConfig = {
  cloudName: import.meta.env.VITE_CLOUDINARY_CLOUD_NAME ?? '',
  uploadPreset: import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET ?? '',
};

export function isCloudinaryConfigured(): boolean {
  return Boolean(cloudinaryConfig.cloudName && cloudinaryConfig.uploadPreset);
}

export type {
  CloudinaryUploadOptions,
  CloudinaryUploadResult,
  CloudinaryUploadResultInfo,
  CloudinaryWidget,
};
