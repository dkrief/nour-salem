import { loadContent } from '../src/lib/content.mjs';
try {
  const data = await loadContent();
  console.log('Contenus valides — ' + data.projects.length + ' projet(s) visible(s).');
  if (!data.isPublic) console.log('Mode aperçu non indexé. Éléments restant avant publication :\n- ' + data.missing.join('\n- '));
} catch (error) {
  console.error(error.message);
  process.exitCode = 1;
}
