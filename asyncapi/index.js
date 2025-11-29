import * as fs from 'fs';
import { parse } from 'yaml';

const data = parse(fs.readFileSync('./asyncapi.yaml', 'utf-8'));
const derives = '#[derive(Clone, Debug, Default, Deserialize, Serialize)]\n';

const types = [];

function toCamelCase(snake_case) {
  return snake_case.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join('');
}

function getType(type, field, schema) {
  if (schema.$ref) {
    return schema.$ref.split('/').at(-1);
  }
  switch (schema.type) {
    case 'integer':
      return 'usize';
    case 'string':
      if (schema.enum) {
        const name = type + toCamelCase(field);
        const description = schema.description ? `/// ${schema.description}\n` : '';
        const values = schema.enum.map(value => `  ${toCamelCase(value)},`).join('\n');
        types.push([name, description + `${derives}#[serde(rename_all = "snake_case")]\npub enum ${name} {\n  #[default]\n${values}\n}`]);
        return name;
      }
      return 'String';
    case 'boolean':
      return 'bool';
    case 'array':
      return `Vec<${getType(type, field, schema.items)}>`;
    case 'object': {
      if (!schema.properties) return '{}';
      const required = new Set(schema.required);
      const properties = Object
        .entries(schema.properties)
        .sort((a, b) => a[0].localeCompare(b[0]))
        .map(([name, schema]) => getField(type, name, required.has(name), schema))
        .join('\n');
      return `{\n${properties}\n}`;
    }
  }
}

function getField(type, name, required, schema) {
  const comments = [];
  schema.description && comments.push(schema.description);
  schema.format && comments.push(`format: ${schema.format}`);
  schema.minimum && comments.push(`minimum: ${schema.minimum}`);
  schema.maximum && comments.push(`maximum: ${schema.maximum}`);
  schema.default && comments.push(`default: ${JSON.stringify(schema.default)}`);
  schema.example && comments.push(`example: ${JSON.stringify(schema.example)}`);

  const comment = comments.length > 0 ? comments.map(line => `  /// ${line}`).join('\n  ///\n') + '\n' : '';
  const t = getType(type, name, schema);
  return comment + `  pub ${name === 'type' ? 'r#type' : name}: ${required ? t : `Option<${t}>`},`;
}

function getStruct(name, schema) {
  if (schema.type !== 'object') {
    throw new Error(`unexpected schema type ${schema.type}`);
  }
  return `${derives}#[serde(default)]\npub struct ${name} ${getType(name, '', schema)}`;
}

Object
  .entries(data.components.messages)
  .filter(([, message]) => message.payload.type === 'object')
  .forEach(([name, message]) => {
    const comment = message.summary ? `/// ${message.summary}\n` : '';
    types.push([name, comment + getStruct(name, message.payload)]);
  });
Object
  .entries(data.components.schemas)
  .forEach(([name, schema]) => types.push([name, getStruct(name, schema)]))

fs.writeFileSync(
  '../src-tauri/src/automation/types.rs',
  '//! Automatically generated from asyncapi.yaml, don\'t edit!\nuse serde::{Deserialize, Serialize};\n\n' +
  types
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([, t]) => t)
    .join('\n\n'),
);
