import { saveFile } from './saveFile';
import SVGO from 'svgo';
import path from 'path';
import fse from 'fs-extra';
import svgson from 'svgson';

export type Options = {
  source?: string;
  target?: string;
};

export const generateIcons = async (options: Options = {}) => {
  const {
    source = 'resources/icons.json',
    target = 'src/generated/icons.ts',
  } = options;
  const modulePath = process.cwd();
  const iconsJsonPath = path.resolve(modulePath, source);
  const iconsJsonFolderPath = path.dirname(iconsJsonPath);
  const outputPath = path.resolve(modulePath, target);
  const iconData: IconsData = await fse.readJSON(iconsJsonPath);
  saveFile(
    outputPath,
    [
      `import { Parts } from 'icons-bundler';`,
      ``,
      `// prettier-ignore`,
      'export const ICONS_PATHS = {',
      await buildPathsObject(iconData, iconsJsonFolderPath),
      '};',
      '',
      'export type IconsPaths = typeof ICONS_PATHS;',
      'export type IconName = keyof IconsPaths;',
    ].join('\n')
  );
};

interface IconsData {
  [key: string]: string;
}

const svgo = new SVGO({
  plugins: [
    { convertShapeToPath: { convertArcs: true } },
    { cleanupAttrs: true },
    { removeEmptyContainers: true },
    { convertTransform: true },
  ],
});

async function buildPathsObject(
  data: IconsData,
  relativePath: string
): Promise<string> {
  const all: Array<Promise<string>> = Object.keys(data).map(
    async (iconName): Promise<string> => {
      const iconInfo = (data as any)[iconName];
      const iconPath = path.resolve(relativePath, iconInfo.path);
      const svg = fse.readFileSync(iconPath, 'utf-8');
      const parts = await svgo
        .optimize(svg, { path: iconPath })
        .then(async ({ data }) => {
          const ast = await svgson(data);
          const elems = ast.children.map((child) => {
            if (child.children.length > 0) {
              throw new Error(
                `Unsuported children in ${iconName} > ${child.name}`
              );
            }
            if (child.name === 'path') {
              return child.attributes.d;
            }
            if (child.name === 'rect') {
              const a = child.attributes;
              const params = [
                a.x,
                a.y,
                a.width,
                a.height,
                a.rx,
                a.ry,
              ].map((v) => parseFloat(v));
              params.forEach((v) => {
                if (Number.isNaN(v)) {
                  throw new Error(`Invalid rect params !`);
                }
              });
              return ['rect', params];
            }
            throw new Error(`Unsuported item ${child.name}`);
          });
          return elems;
        });

      return `  "${iconName}": ${JSON.stringify(parts)} as Parts,`;
    }
  );
  return Promise.all(all).then((all) => all.join('\n'));
}
