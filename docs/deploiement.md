# Exploitation du portfolio

## Propriétaires et limites

Le dépôt est privé et indépendant d’EditMyPDF. David administre GitHub, le compte Cloudflare dédié « DataSqueeze — Nour Salem » et Porkbun. Nour reçoit uniquement l’accès éditorial Pages CMS après instruction d’envoi. Aucun secret ne doit être committé.

Le domaine a été enregistré au nom de DataSqueeze jusqu’au 5 novembre 2027. Ne pas souscrire d’hébergement Porkbun, boîte mail, service d’images, Workers Paid ou stockage vidéo.

État vérifié le 5 novembre 2026 : zone Cloudflare active en offre Free, serveurs `mack.ns.cloudflare.com` et `melinda.ns.cloudflare.com` enregistrés chez Porkbun et confirmés par le DNS public. La redirection www est activée et conserve chemin et paramètres. Always Use HTTPS est activé ; le certificat Universal SSL est en cours d’émission à ce stade. Pages CMS est connecté au dépôt, ses formulaires sont opérationnels. L’application Pages CMS est limitée à `dkrief/nour-salem`. La liaison Cloudflare préexistante à `dkrief/mang` est conservée ; seul `nour-salem` a été ajouté. Aucune configuration de l’organisation APRSNL n’a été modifiée.

## Configuration Cloudflare

1. Ajouter `nour-salem.com` dans le compte dédié et choisir **Free**. Conserver les enregistrements de messagerie réellement utilisés ; ne pas importer le parking ni les services d’essai du registrar.
2. Chez Porkbun, remplacer les serveurs de noms par les deux valeurs exactes assignées à la zone Cloudflare. Vérifier l’état Active puis le DNS public. Les valeurs varient par zone : ne pas les deviner.
3. Garder Universal SSL actif. Le Worker ne contient que des assets statiques, sans serveur ni facturation par requête de fonction. HTTPS est fourni par Cloudflare.
4. Connecter uniquement le dépôt `dkrief/nour-salem` à Cloudflare Workers Builds. Branche initiale : `codex/portfolio-foundation` (branche par défaut de ce dépôt neuf). Désactiver les déploiements automatiques des autres branches.
5. Commande de build : `npm run check && npm test && npm run build:release && npm run verify:dist`. Commande de déploiement : `npx wrangler deploy --env production`. Racine : `/`. Node : `24.13.0`. Conserver `package-lock.json` et l’installation npm verrouillée.

Le fichier `wrangler.jsonc` désactive `workers.dev` et les Preview URLs. La production est liée seulement à `nour-salem.com`. Ne pas rattacher le domaine tant que le contenu n’est pas prêt. La prévisualisation de travail reste locale ; `noindex` n’est pas une protection par mot de passe.

## Redirection www

Créer un enregistrement DNS **A**, nom `www`, valeur `192.0.2.0`, proxy Cloudflare activé. Cette adresse réservée sert uniquement à la règle de redirection ; elle n’est pas une origine à contacter.

Créer une Single Redirect avec l’expression `http.host eq "www.nour-salem.com"`, destination dynamique `concat("https://nour-salem.com", http.request.uri.path)`, code **301**, conservation de la query string activée. Le modèle est dans `infra/www-redirect.json`. Ajouter la règle aux règles existantes sans remplacer le ruleset entier.

La redirection `/` vers `/fr/` est produite dans `dist/_redirects`. Les fichiers Workers `_redirects` ne permettent pas une correspondance du domaine source : la règle www doit être configurée sur la zone.

## Activer Pages CMS

David se connecte à [Pages CMS](https://app.pagescms.org/) avec GitHub et installe l’application uniquement sur ce dépôt. Ouvrir sa branche par défaut ; `.pages.yml` doit afficher Profil, Projets et Photos Web. Les sauvegardes sont des commits ; elles déclenchent Workers Builds une fois la connexion établie.

Après réception de son adresse et instruction d’envoi, inviter Nour comme collaboratrice éditoriale. Tester réellement : modifier une biographie, ajouter une photo Web, déplacer une photo, la masquer, puis lire la version publiée. Les tests locaux vérifient les effets sur les fichiers mais ne prouvent pas la connexion du CMS hébergé ni la réception de l’invitation.

## Première mise en ligne

Recevoir et relire : photos autorisées, textes français et anglais, crédits, ville professionnelle, contact public, réseaux, vidéo facultative et mentions légales adaptées à l’éditeur réel. Renseigner les champs, puis passer `publicationApproved` à `true` dans `src/site-settings.json` après validation de David. Cette valeur n’est pas modifiable dans le CMS.

Exécuter les vérifications du README, `npm run build:release`, `npm run verify:dist`, puis le déploiement. Ne jamais publier les fixtures de `.codex-tmp/`. Vérifier mobile et ordinateur, galerie au clavier, vidéo après clic, contact, liens de langues, HTTPS, www avec chemin/query et une URL inconnue renvoyant 404.

Refaire Lighthouse mobile avec les vraies photos : objectifs Performance >=90, Accessibilité et SEO >=95. Les scores des images synthétiques ne constituent pas une recette des contenus réels. Créer la propriété Search Console et ajouter son TXT DNS uniquement lorsque l’accès est disponible ; soumettre `https://nour-salem.com/sitemap.xml` après publication indexable.

## Échec et retour arrière

La commande de release valide le contenu avant de remplacer `dist`. Cloudflare ne publie qu’après un build réussi. Pour une régression après publication, restaurer un déploiement antérieur dans Cloudflare puis corriger le contenu dans GitHub/Pages CMS. Un rollback Cloudflare ne corrige pas les sources : le prochain build reprend le contenu Git.

Conserver le renouvellement du domaine, vérifier les notifications Porkbun et maintenir les comptes d’administration. Ne pas supprimer les médias encore référencés. Git conserve l’historique ; les images mises dans un dépôt privé sont accessibles aux applications explicitement autorisées sur ce dépôt.
