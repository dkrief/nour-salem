# Exploitation du portfolio

## Propriétaires et limites

Le dépôt est privé et indépendant d’EditMyPDF. David administre GitHub, le compte Cloudflare dédié « DataSqueeze — Nour Salem » et Porkbun. Nour reçoit uniquement l’accès éditorial Pages CMS après instruction d’envoi. Aucun secret ne doit être committé.

Le domaine a été enregistré au nom de DataSqueeze jusqu’au 5 novembre 2027. Ne pas souscrire d’hébergement Porkbun, boîte mail, service d’images, Workers Paid ou stockage vidéo.

État vérifié le 5 novembre 2026 : zone Cloudflare active en offre Free, serveurs `mack.ns.cloudflare.com` et `melinda.ns.cloudflare.com` enregistrés chez Porkbun et confirmés par le DNS public. La redirection www répond en HTTP et HTTPS et conserve chemin et paramètres. Always Use HTTPS est activé. Pages CMS est connecté au dépôt, ses formulaires sont opérationnels ; une sauvegarde de biographie et son annulation ont créé des commits et déclenché GitHub Actions. L’application Pages CMS est limitée à `dkrief/nour-salem`. La liaison Cloudflare préexistante à `dkrief/mang` est conservée dans son périmètre initial. Aucune configuration de l’organisation APRSNL n’a été modifiée.

## Configuration Cloudflare

1. Ajouter `nour-salem.com` dans le compte dédié et choisir **Free**. Conserver les enregistrements de messagerie réellement utilisés ; ne pas importer le parking ni les services d’essai du registrar.
2. Chez Porkbun, remplacer les serveurs de noms par les deux valeurs exactes assignées à la zone Cloudflare. Vérifier l’état Active puis le DNS public. Les valeurs varient par zone : ne pas les deviner.
3. Garder Universal SSL actif. Le Worker ne contient que des assets statiques, sans serveur ni facturation par requête de fonction. HTTPS est fourni par Cloudflare.
4. Utiliser **GitHub Actions**, workflow `.github/workflows/check.yml`. Branche de publication : `codex/portfolio-foundation` (branche par défaut de ce dépôt neuf). Les autres branches et les pull requests exécutent uniquement les contrôles. L’intégration native Cloudflare GitHub est déjà liée au compte MANG ; ne pas la déplacer ni la réinstaller. [Cloudflare recommande une liaison GitHub vers un seul compte Cloudflare](https://developers.cloudflare.com/workers/ci-cd/builds/git-integration/github-integration/).
5. Le secret de dépôt `CLOUDFLARE_API_TOKEN` contient un jeton du seul compte « DataSqueeze — Nour Salem » : Workers Scripts Write et Account Settings Read sur ce compte, Zone Read sur `nour-salem.com`. Il n’a aucun droit sur les autres comptes. Ne pas le stocker dans les sources. [Procédure GitHub Actions officielle](https://developers.cloudflare.com/workers/ci-cd/external-cicd/github-actions/).
6. Chaque sauvegarde déclenche `npm ci`, types, tests, build non indexable, contrôles du HTML et test de production dans une copie isolée. Avec `demoMode: true`, le push sur la branche de publication déploie ce build non indexable sur le domaine. Avec `publicationApproved: true` et `demoMode: false`, il exécute d’abord `npm run build:release && npm run verify:dist`. Dans les deux cas, la commande de déploiement est `npx --no-install wrangler deploy --env production`. Node : `24.13.0`. Conserver `package-lock.json` et l’installation npm verrouillée.

Le fichier `wrangler.jsonc` désactive `workers.dev` et les Preview URLs. Le Worker public `nour-salem` est lié seulement à `nour-salem.com`. David a explicitement demandé le 5 novembre 2026 de publier des textes et une photo fictifs pour voir le site fonctionner sur son domaine. Cette démonstration utilise `demoMode: true`, `publicationApproved: false`, un bandeau bilingue, `noindex` en HTML et HTTP, un sitemap vide et aucune donnée structurée Person. Le contenu est accessible publiquement ; `noindex` n’est pas une protection par mot de passe. Le déclenchement manuel avec `deploy_preview=true` reste limité au Worker `nour-salem-preview`, sans domaine ni URL publique.

Premier téléversement vérifié : [GitHub Actions 41965148880](https://github.com/dkrief/nour-salem/actions/runs/41965148880), commit `aff539f187df942adeb5e401066bec2b82bd21de`, version Cloudflare `4158afc5-e41f-4ec5-9e0a-eb63455e2856`. Résultat : réussite, `nour-salem-preview` téléversé, aucun domaine ni route déployé. Cela prouve l’accès de déploiement, pas encore le fonctionnement public du portfolio avec ses vrais contenus.

Démonstration publique déployée le 5 novembre 2026 : [GitHub Actions 41968392271](https://github.com/dkrief/nour-salem/actions/runs/41968392271), commit `c3f19efcef4190b7b896a51e4db02e7956623d83`, version Cloudflare `68e0fa92` en état Ready. Les 12 pages répondent 200 en HTTPS, la racine et www redirigent correctement (chemin et paramètres conservés), une URL inconnue renvoie 404. En-tête et HTML noindex, sitemap vide, absence de Person JSON-LD, image optimisée servie et SHA exact contrôlés. DNS public vérifié via Cloudflare, Google et le serveur autoritaire ; à 04:34 UTC la box locale répondait encore sans enregistrement A. Le contrôle HTTPS a donc utilisé l’adresse publique résolue, sans contourner la validation du certificat. Rapport local ignoré : `reports/live-demo-smoke.json`.

Recette de ce build en navigateur local : ordinateur et téléphone 390 × 844, image nette et cadrée, agrandissement au clavier, Échap avec restitution du focus, lien FR/EN vers le même portfolio, et contenus retrouvés dans Pages CMS. Lighthouse mobile sur l’accueil local : Performance 100, Accessibilité 100, Bonnes pratiques 100 ; SEO 69 pour cette démo volontairement non indexable. Ce score local ne mesure ni la propagation DNS ni les futures photos réelles.

## Redirection www

Créer un enregistrement DNS **A**, nom `www`, valeur `192.0.2.0`, proxy Cloudflare activé. Cette adresse réservée sert uniquement à la règle de redirection ; elle n’est pas une origine à contacter.

Créer une Single Redirect avec l’expression `http.host eq "www.nour-salem.com"`, destination dynamique `concat("https://nour-salem.com", http.request.uri.path)`, code **301**, conservation de la query string activée. Le modèle est dans `infra/www-redirect.json`. Ajouter la règle aux règles existantes sans remplacer le ruleset entier.

La redirection `/` vers `/fr/` est produite dans `dist/_redirects`. Les fichiers Workers `_redirects` ne permettent pas une correspondance du domaine source : la règle www doit être configurée sur la zone.

## Activer Pages CMS

David se connecte à [Pages CMS](https://app.pagescms.org/) avec GitHub et installe l’application uniquement sur ce dépôt. Ouvrir sa branche par défaut ; `.pages.yml` doit afficher Profil, Projets et Photos Web. Les sauvegardes sont des commits ; elles déclenchent GitHub Actions. Pages CMS omet les valeurs vides : les schémas appliquent les valeurs par défaut sans autoriser une publication incomplète.

Après réception de son adresse et instruction d’envoi, inviter Nour comme collaboratrice éditoriale. La sauvegarde de biographie, l’import d’une image synthétique, l’ajout d’un projet, la réorganisation au clavier et le masquage individuel ont été testés dans le CMS hébergé. L’ordre B/A a été enregistré au commit `0f04c195d8010efaa4aa4fbada5b4972e29ed6a3` ; B masquée et A visible au commit `843a2cddd05dff0f1b3649a1d9323eb45a029f24`. Les pages FR/EN compilées reproduisent l’ordre et omettent bien B après masquage, sans supprimer l’entrée dans le CMS. [CI du réordonnancement](https://github.com/dkrief/nour-salem/actions/runs/41966504976), [CI du masquage](https://github.com/dkrief/nour-salem/actions/runs/41966621278) : réussies.

Les fichiers de recette sont retirés des sources actives après vérification. Il reste à tester l’accès de Nour depuis son propre poste et à relire la version publique avec les vraies photos ; aucun test synthétique ne remplace cette recette de lancement.

## Première mise en ligne

Pour remplacer la démonstration par le portfolio indexable, recevoir et relire : photos autorisées, textes français et anglais, crédits, ville professionnelle, contact public, réseaux, vidéo facultative et mentions légales adaptées à l’éditeur réel. Remplacer la photo et tous les textes de démonstration, retirer le projet `demo-editorial`, puis passer `demoMode` à `false` et `publicationApproved` à `true` dans `src/site-settings.json` après validation de David. Ces valeurs ne sont pas modifiables dans le CMS. La compilation refuse leur activation simultanée.

Exécuter les vérifications du README, `npm run build:release`, `npm run verify:dist`, puis le déploiement. Ne jamais publier les fixtures de `.codex-tmp/`. Vérifier mobile et ordinateur, galerie au clavier, vidéo après clic, contact, liens de langues, HTTPS, www avec chemin/query et une URL inconnue renvoyant 404.

Refaire Lighthouse mobile avec les vraies photos : objectifs Performance >=90, Accessibilité et SEO >=95. Les scores des images synthétiques ne constituent pas une recette des contenus réels. Créer la propriété Search Console et ajouter son TXT DNS uniquement lorsque l’accès est disponible ; soumettre `https://nour-salem.com/sitemap.xml` après publication indexable.

## Échec et retour arrière

Après chaque déploiement public, le runner GitHub vérifie aussi la résolution DNS normale, le certificat HTTPS, le SHA servi, les accueils FR/EN, les redirections racine/www et une vraie 404. La démo doit toujours répondre noindex. Un échec de ce contrôle signale un incident après publication ; il ne déclenche pas de rollback automatique.

La commande de release valide le contenu avant de remplacer `dist`. Cloudflare ne publie qu’après un build réussi. Pour une régression après publication, restaurer un déploiement antérieur dans Cloudflare puis corriger le contenu dans GitHub/Pages CMS. Un rollback Cloudflare ne corrige pas les sources : le prochain build reprend le contenu Git.

Test réel du 5 novembre 2026 : masquer toutes les photos d’un projet encore visible dans Pages CMS produit le commit `eb0ff9fbfdbc4dc2716710ae8d2084578d74f65f`. Le [workflow avec demande de déploiement](https://github.com/dkrief/nour-salem/actions/runs/41966831741) échoue à la validation avec « ajouter une photo visible » ; les étapes de téléversement sont ignorées. Le tableau de bord Cloudflare relu après l’échec conserve la version `4158afc5` en état Ready. La protection a été éprouvée sur le Worker privé de préparation, sans publier de données de test sur le domaine.

Conserver le renouvellement du domaine, vérifier les notifications Porkbun et maintenir les comptes d’administration. Ne pas supprimer les médias encore référencés. Git conserve l’historique ; les images mises dans un dépôt privé sont accessibles aux applications explicitement autorisées sur ce dépôt.
