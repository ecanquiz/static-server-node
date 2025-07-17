
import fs from 'fs';

export default function createSymlink(storageDir:string, publicStorageLink: string): void {
  try {
    if (!fs.existsSync(storageDir)) {
      fs.mkdirSync(storageDir, { recursive: true });
      console.log('The storage folder was created');
    }
    if (!fs.existsSync(publicStorageLink)) {
      fs.symlinkSync(storageDir, publicStorageLink, 'junction');
      console.log('public/storage symlink created and points to storage');
    } else {
      // Check if it is a symbolic link and points correctly
      const linkStat = fs.lstatSync(publicStorageLink);
      if (!linkStat.isSymbolicLink()) {
        console.warn('public/storage exists but is not a symlink.');
      }
    }
  } catch (err) {
    console.error('Error creating symbolic link:', err);
  }
}
