/**
 * Safely extracts the file name from a file object returned by backend / MongoDB.
 * Handles various field naming conventions (name, fileName, filename, originalFileName, originalFilename, title, displayName, key)
 * and falls back to parsing the file name from its cloud storage URL if property names are missing.
 */
export const getFileName = (file) => {
  if (!file) return 'Untitled File';
  if (typeof file === 'string') return file;

  const possibleName =
    file.name ||
    file.fileName ||
    file.filename ||
    file.originalFileName ||
    file.originalFilename ||
    file.originalName ||
    file.title ||
    file.displayName ||
    file.key;

  if (possibleName && typeof possibleName === 'string' && possibleName.trim() !== '') {
    return possibleName.trim();
  }

  const url = file.url || file.fileUrl || file.downloadUrl || file.s3Url || file.minioUrl;
  if (url && typeof url === 'string') {
    try {
      const pathname = new URL(url).pathname;
      const cleanPath = pathname.split('?')[0];
      let nameFromUrl = cleanPath.substring(cleanPath.lastIndexOf('/') + 1);
      if (nameFromUrl && nameFromUrl.trim() !== '') {
        nameFromUrl = decodeURIComponent(nameFromUrl);
        return nameFromUrl;
      }
    } catch (e) {
      // ignore URL parsing errors
    }
  }

  return 'Untitled File';
};

/**
 * Formats file names to fit nicely within UI containers without breaking layouts.
 */
export const formatFileName = (fileOrName, maxLength = 35) => {
  const validName = typeof fileOrName === 'object' ? getFileName(fileOrName) : (fileOrName || 'Untitled File');
  if (validName.length <= maxLength) return validName;

  const parts = validName.split('.');
  if (parts.length > 1) {
    const ext = parts.pop();
    const base = parts.join('.');
    const availableBaseLength = Math.max(8, maxLength - ext.length - 4);
    return `${base.substring(0, availableBaseLength)}...${ext}`;
  }

  return `${validName.substring(0, maxLength - 3)}...`;
};
