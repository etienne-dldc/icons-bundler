import prettier from 'prettier';
import fse from 'fs-extra';
import p from 'path';

export async function saveFile(path: string, content: string) {
  await fse.ensureDir(p.dirname(path));
  const prettierConf = await prettier.resolveConfig(path);
  const formatted = prettier.format(content, {
    ...prettierConf,
    filepath: path,
  });
  await fse.writeFile(path, formatted);
}
