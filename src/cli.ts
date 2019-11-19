import { generateIcons } from './generateIcons';

export async function cli(argv: Array<string>) {
  return generateIcons({
    source: argv[2],
    target: argv[3],
  });
}
