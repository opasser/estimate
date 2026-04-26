const fs = require('fs');
const path = require('path');

// Читання файлу environment.ts - READ AS FILE!!! NEED TO REWRITE.
const filePath = path.join(process.cwd(), 'src/environments/environment.ts');
const fileContent = fs.readFileSync(filePath, 'utf-8');  // Додаємо кодування 'utf-8', щоб отримати рядок

// Оголошуємо змінну designTemplate зі значенням за замовчуванням
let designTemplate = 'default';

// Парсинг значення designTemplate
const match = fileContent.match(/designTemplate:\s*'([^']+)'/);

if (match) {
    designTemplate = match[1];
}

// Масив компонентів для перевірки
const components = [
  { name: 'app', path: '' },
  { name: 'header', path: 'header' },
  { name: 'logo', path: 'inc/logo' },
  { name: 'main', path: 'main' },
  { name: 'footer', path: 'footer' },
  // Додавайте інші компоненти тут
];

// Функція для перевірки існування файлу
function checkFileExists(filePath) {
  return fs.existsSync(filePath);
}

// Функція для підрахунку кількості рівнів у шляху
function countLevels(pathString) {
  return (pathString.match(/\//g) || []).length;
}

// Створюємо рядок для `template.env.ts`
let templateEnvContent = `export const templatePaths = {\n`;

// Проходимо по кожному компоненту
components.forEach(component => {
  const templatePath = path.join(process.cwd(), `src/templates/${designTemplate}/${component.path}/${component.name}.component.html`);
  const stylePath = path.join(process.cwd(), `src/templates/${designTemplate}/${component.path}/${component.name}.component.scss`);

  // Підраховуємо кількість рівнів для компонента
  let levelsUp = component.path ? '../'.repeat(countLevels(component.path) + 2) : '../'; // Додаємо +2 для коректного переходу

  const templateUrl = checkFileExists(templatePath)
    ? `${levelsUp}templates/${designTemplate}/${component.path}/${component.name}.component.html`
    : `./${component.name}.component.html`;

  const styleUrl = checkFileExists(stylePath)
    ? `${levelsUp}templates/${designTemplate}/${component.path}/${component.name}.component.scss`
    : `./${component.name}.component.scss`;

  // Додаємо результати до файлу конфігурації
  templateEnvContent += `  ${component.name}: {\n`;
  templateEnvContent += `    templateUrl: '${templateUrl}',\n`;
  templateEnvContent += `    styleUrl: '${styleUrl}'\n`;
  templateEnvContent += `  },\n`;
});

// Закриваємо об'єкт у файлі
templateEnvContent += `};\n`;

// Шлях до файлу `template.env.ts`
const envFilePath = path.join(process.cwd(), 'src/pre-build/template.env.ts');

// Записуємо вміст до `template.env.ts`
fs.writeFileSync(envFilePath, templateEnvContent, 'utf-8');
console.log('Template environment configuration generated successfully at:', envFilePath);
