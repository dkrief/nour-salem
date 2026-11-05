# Nour Salem

Portfolio bilingue Astro, entièrement statique. Hébergement sur Cloudflare Workers Static Assets, édition avec Pages CMS et publication validée par GitHub Actions. Aucun serveur applicatif, base de données, service d’images ou de vidéo payant. À la demande de David, une démonstration publique est publiée sur `nour-salem.com`, avec textes fictifs, photographie illustrative et indexation désactivée.

## Démarrer

Node 24.13 ou plus récent et npm sont nécessaires.

```sh
npm ci
npm run dev
```

Ouvrir http://127.0.0.1:4381/fr/. La démonstration est non indexable et signale explicitement ses textes fictifs et son modèle illustratif. La photo ne représente pas Nour ; sa [provenance et son prompt](docs/demo-image.md) sont documentés.

```sh
npm run check
npm test
npm run build
npm run verify:dist
npm run test:production
```

Le dernier contrôle compile une copie isolée contenant des données TEST ONLY et des images synthétiques ; il contrôle les formats AVIF/WebP/JPEG, la suppression EXIF, le référencement et le refus d’un contenu invalide. Ses fichiers restent dans `.codex-tmp/`, ignoré par Git. Ne jamais les déployer.

## Contenu et publication

- [Guide de Nour](docs/guide-nour.md) : textes, projets, photos et export.
- [Exploitation](docs/deploiement.md) : DNS, Cloudflare, accès éditorial, publication et retour arrière.
- `src/content/profile.json` : profil, textes FR/EN, contact, images principales et liens.
- `src/content/projects/*.json` : projets, crédits, photos, ordre et visibilité.
- `.pages.yml` : formulaires Pages CMS ; aucune modification de mise en page nécessaire.
- `src/site-settings.json` : mode démonstration publique et approbation initiale d’indexation, réservés à David.

`npm run build:release` refuse une publication tant que les vrais contenus requis et l’approbation initiale ne sont pas présents. Une erreur est détectée avant le déploiement ; la dernière version Cloudflare reste active. La validation garantit les champs et les médias, pas la véracité biographique : la relecture des deux langues reste humaine.

Les sauvegardes Pages CMS sur `codex/portfolio-foundation` déclenchent les contrôles puis la publication automatique si `demoMode` ou `publicationApproved` est actif. En mode démonstration, le build conserve le bandeau, `noindex`, un sitemap vide et aucune donnée structurée Person. Les deux modes ne peuvent pas être actifs simultanément. Le workflow manuel peut téléverser le Worker de test sans URL publique ; il ne déploie jamais les données synthétiques de recette.

La racine redirige vers `/fr/`. Six pages existent par langue (les cinq pages du portfolio et les mentions légales), avec liens entre traductions, canonicals, sitemap et une vraie 404. La vidéo externe n’est chargée qu’après un clic.

## Budget

Le domaine est enregistré chez Porkbun jusqu’au 5 novembre 2027 ; renouvellement affiché à 11,81 USD/an hors taxes au 5 novembre 2026, susceptible d’évolution. Hébergement, DNS et HTTPS utilisent les offres gratuites. Pas de boîte mail supplémentaire. Les limites gratuites de compilation et de stockage GitHub restent applicables : exporter les photographies pour le Web.

Sources : [Porkbun .com](https://porkbun.com/tld/com), [Cloudflare Static Assets](https://developers.cloudflare.com/workers/static-assets/billing-and-limitations/), [Pages CMS](https://pagescms.org/).
