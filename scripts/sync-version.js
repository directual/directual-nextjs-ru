// Скрипт для синхронизации версии из package.json в lib/version.ts
const fs = require('fs');
const path = require('path');

const packageJsonPath = path.join(__dirname, '..', 'package.json');
const versionTsPath = path.join(__dirname, '..', 'lib', 'version.ts');

try {
  const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
  const version = packageJson.version;

  if (!version) {
    throw new Error('Версия не найдена в package.json');
  }

  const versionContent = `// Версия приложения (автоматически синхронизируется с package.json)
export const APP_VERSION = '${version}';
`;

  fs.writeFileSync(versionTsPath, versionContent, 'utf8');
  console.log(`✓ Версия синхронизирована: ${version}`);
} catch (error) {
  console.error('Ошибка синхронизации версии:', error.message);
  process.exit(1);
}
