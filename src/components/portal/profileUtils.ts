export interface ProfileFormValues {
  fullName: string;
  email: string;
  phone: string;
  companyName: string;
}

export type ProfileFormErrors = Partial<Record<keyof ProfileFormValues, string>>;

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const ALLOWED_TYPES = ['image/png', 'image/jpeg'];
const MAX_FILE_SIZE = 2 * 1024 * 1024;
const MIN_DIMENSION = 100;
const MAX_DIMENSION = 2000;
const MIN_RATIO = 0.8;
const MAX_RATIO = 1.25;

export function joinFullName(firstName: string | null | undefined, lastName: string | null | undefined): string {
  return [firstName?.trim(), lastName?.trim()].filter(Boolean).join(' ');
}

export function splitFullName(fullName: string): { firstName: string | null; lastName: string | null } {
  const parts = fullName
    .trim()
    .split(/\s+/)
    .filter(Boolean);

  if (parts.length === 0) {
    return { firstName: null, lastName: null };
  }

  if (parts.length === 1) {
    return { firstName: parts[0], lastName: null };
  }

  return {
    firstName: parts[0],
    lastName: parts.slice(1).join(' '),
  };
}

export function formatPhoneNumber(phone: string | null | undefined): string | null {
  if (!phone) return null;

  const cleaned = phone.replace(/\D/g, '');
  const match = cleaned.match(/^(\d{3})(\d{3})(\d{4})$/);

  if (match) {
    return `(${match[1]}) ${match[2]}-${match[3]}`;
  }

  return phone;
}

export function validateProfileForm(values: ProfileFormValues): ProfileFormErrors {
  const errors: ProfileFormErrors = {};
  const email = values.email.trim().toLowerCase();
  const phoneDigits = values.phone.replace(/\D/g, '');

  if (!values.fullName.trim()) {
    errors.fullName = 'Full name is required.';
  }

  if (!email) {
    errors.email = 'Email is required.';
  } else if (!EMAIL_PATTERN.test(email)) {
    errors.email = 'Enter a valid email address.';
  }

  if (!values.phone.trim()) {
    errors.phone = 'Phone number is required.';
  } else if (phoneDigits.length < 10 || phoneDigits.length > 15) {
    errors.phone = 'Enter a valid phone number.';
  }

  if (!values.companyName.trim()) {
    errors.companyName = 'Company name is required.';
  }

  return errors;
}

function readImageDimensions(file: File): Promise<{ width: number; height: number }> {
  return new Promise((resolve, reject) => {
    const objectUrl = URL.createObjectURL(file);
    const image = new Image();

    image.onload = () => {
      URL.revokeObjectURL(objectUrl);
      resolve({ width: image.naturalWidth, height: image.naturalHeight });
    };

    image.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      reject(new Error('Could not read image dimensions.'));
    };

    image.src = objectUrl;
  });
}

export async function validateAvatarFile(file: File): Promise<string | null> {
  if (!ALLOWED_TYPES.includes(file.type)) {
    return 'Only PNG and JPEG images are allowed.';
  }

  if (file.size > MAX_FILE_SIZE) {
    return 'Image must be under 2 MB.';
  }

  try {
    const { width, height } = await readImageDimensions(file);

    if (width < MIN_DIMENSION || height < MIN_DIMENSION) {
      return `Image must be at least ${MIN_DIMENSION}x${MIN_DIMENSION} pixels.`;
    }

    if (width > MAX_DIMENSION || height > MAX_DIMENSION) {
      return `Image must be at most ${MAX_DIMENSION}x${MAX_DIMENSION} pixels.`;
    }

    const ratio = width / height;
    if (ratio < MIN_RATIO || ratio > MAX_RATIO) {
      return 'Image should be roughly square (between 4:5 and 5:4).';
    }
  } catch (error) {
    return error instanceof Error ? error.message : 'Could not validate the selected image.';
  }

  return null;
}
