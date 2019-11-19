declare module 'svgson' {
  export interface AstNode {
    name: 'svg' | 'rect' | 'path';
    type: 'element';
    attributes: {
      [key: string]: string;
    };
    children: Array<AstNode>;
  }

  function parse(str: string): Promise<AstNode>;

  export function stringify(ast: AstNode): string;

  export default parse;
}
