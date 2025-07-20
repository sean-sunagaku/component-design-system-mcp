import * as ts from 'typescript';

export class ASTParser {
  private sourceFile: ts.SourceFile;

  constructor(content: string, fileName: string = 'temp.tsx') {
    this.sourceFile = ts.createSourceFile(
      fileName,
      content,
      ts.ScriptTarget.Latest,
      true,
      fileName.endsWith('.tsx') ? ts.ScriptKind.TSX : ts.ScriptKind.TS
    );
  }

  public extractInterfaces(): Array<{ name: string; properties: Array<{ name: string; type: string; optional: boolean }> }> {
    const interfaces: Array<{ name: string; properties: Array<{ name: string; type: string; optional: boolean }> }> = [];

    const visit = (node: ts.Node) => {
      if (ts.isInterfaceDeclaration(node)) {
        const interfaceName = node.name.text;
        const properties: Array<{ name: string; type: string; optional: boolean }> = [];

        node.members.forEach(member => {
          if (ts.isPropertySignature(member) && member.name && ts.isIdentifier(member.name)) {
            const propName = member.name.text;
            const propType = member.type ? this.getTypeString(member.type) : 'any';
            const optional = !!member.questionToken;

            properties.push({
              name: propName,
              type: propType,
              optional
            });
          }
        });

        interfaces.push({
          name: interfaceName,
          properties
        });
      }

      ts.forEachChild(node, visit);
    };

    visit(this.sourceFile);
    return interfaces;
  }

  public extractTypeAliases(): Array<{ name: string; type: string }> {
    const typeAliases: Array<{ name: string; type: string }> = [];

    const visit = (node: ts.Node) => {
      if (ts.isTypeAliasDeclaration(node)) {
        const typeName = node.name.text;
        const typeString = this.getTypeString(node.type);

        typeAliases.push({
          name: typeName,
          type: typeString
        });
      }

      ts.forEachChild(node, visit);
    };

    visit(this.sourceFile);
    return typeAliases;
  }

  public extractImports(): Array<{ module: string; imports: string[] }> {
    const imports: Array<{ module: string; imports: string[] }> = [];

    const visit = (node: ts.Node) => {
      if (ts.isImportDeclaration(node) && node.moduleSpecifier && ts.isStringLiteral(node.moduleSpecifier)) {
        const moduleName = node.moduleSpecifier.text;
        const importedNames: string[] = [];

        if (node.importClause) {
          if (node.importClause.name) {
            importedNames.push(node.importClause.name.text);
          }

          if (node.importClause.namedBindings) {
            if (ts.isNamedImports(node.importClause.namedBindings)) {
              node.importClause.namedBindings.elements.forEach(element => {
                importedNames.push(element.name.text);
              });
            } else if (ts.isNamespaceImport(node.importClause.namedBindings)) {
              importedNames.push(node.importClause.namedBindings.name.text);
            }
          }
        }

        imports.push({
          module: moduleName,
          imports: importedNames
        });
      }

      ts.forEachChild(node, visit);
    };

    visit(this.sourceFile);
    return imports;
  }

  public extractJSXElements(): Array<{ tagName: string; props: Record<string, string> }> {
    const jsxElements: Array<{ tagName: string; props: Record<string, string> }> = [];

    const visit = (node: ts.Node) => {
      if (ts.isJsxElement(node) || ts.isJsxSelfClosingElement(node)) {
        const tagName = this.getJSXTagName(node);
        const props: Record<string, string> = {};

        const attributes = ts.isJsxElement(node) 
          ? node.openingElement.attributes.properties
          : node.attributes.properties;

        attributes.forEach(attr => {
          if (ts.isJsxAttribute(attr) && attr.name && ts.isIdentifier(attr.name)) {
            const propName = attr.name.text;
            const propValue = attr.initializer 
              ? this.getJSXAttributeValue(attr.initializer)
              : 'true';
            props[propName] = propValue;
          }
        });

        jsxElements.push({
          tagName,
          props
        });
      }

      ts.forEachChild(node, visit);
    };

    visit(this.sourceFile);
    return jsxElements;
  }

  private getTypeString(typeNode: ts.TypeNode): string {
    return typeNode.getText(this.sourceFile);
  }

  private getJSXTagName(node: ts.JsxElement | ts.JsxSelfClosingElement): string {
    const tagNameNode = ts.isJsxElement(node) 
      ? node.openingElement.tagName 
      : node.tagName;

    if (ts.isIdentifier(tagNameNode)) {
      return tagNameNode.text;
    } else if (ts.isPropertyAccessExpression(tagNameNode)) {
      return tagNameNode.getText(this.sourceFile);
    }

    return 'Unknown';
  }

  private getJSXAttributeValue(initializer: ts.JsxAttributeValue): string {
    if (ts.isStringLiteral(initializer)) {
      return initializer.text;
    } else if (ts.isJsxExpression(initializer) && initializer.expression) {
      return initializer.expression.getText(this.sourceFile);
    }
    return '';
  }
}
