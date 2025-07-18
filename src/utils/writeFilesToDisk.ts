import { writeFileSync } from 'fs';
import { v4 as uuidv4 } from 'uuid';

export default function(base64StrReBuilt: string, dir: string, imageNames: string[]) {
  const matches = base64StrReBuilt.match(/^data:image\/(\w+);base64,(.+)$/);
  if (!matches) return;
    
  const [_, ext, data] = matches;
  const filename = `${uuidv4()}.${ext}`;
  const path = `${dir}/${filename}`;
    
  writeFileSync(`.${path}`, Buffer.from(data, 'base64'));

  imageNames.push(filename);
}
