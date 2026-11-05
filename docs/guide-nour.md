# Modifier le portfolio

## Première connexion

David connecte le dépôt privé à [Pages CMS](https://app.pagescms.org/) puis invite votre adresse e-mail. Aucun compte GitHub n’est nécessaire pour cet accès éditorial. L’invitation n’est envoyée qu’après réception de l’adresse et instruction d’envoi. En attendant, la configuration des formulaires est prête dans le dépôt.

## Modifier les textes

Ouvrir « Profil de Nour — FR et EN », modifier le texte français et son équivalent anglais, puis enregistrer. Garder les deux langues cohérentes. Le contact doit être une adresse existante à laquelle vous acceptez de recevoir des demandes professionnelles. Ajouter uniquement des réseaux et agences officiels.

La description courte des moteurs de recherche résume vos activités et votre ville professionnelle réelle. Les descriptions des photographies expliquent ce qui est visible ; elles ne sont pas une liste de mots-clés. Ne jamais ajouter une marque, une agence, un rôle ou un crédit non confirmé.

## Préparer une photographie

1. Garder l’original hors du site. Dans votre logiciel photo, exporter en JPEG ou WebP, profil sRGB, qualité 75 à 85, côté long de 2 400 pixels maximum.
2. Supprimer les métadonnées de localisation et vérifier que le fichier fait **strictement moins de 2 Mo** (2 000 000 octets). Un export entre 200 et 700 Ko est généralement suffisant.
3. Utiliser un nom simple, par exemple `nour-portrait-studio-01.webp`, sans espace ni accent.
4. Importer l’image dans « Photos Web », puis la sélectionner dans le profil ou un projet. Les variantes adaptées aux écrans sont générées automatiquement à la compilation, avec suppression des métadonnées.

David dispose aussi d’un export local :

```sh
npm run prepare:photo -- "chemin/vers/original.jpg" "src/assets/photos/nour-portrait-01.webp"
```

Cette commande conserve l’original et refuse d’écraser un fichier existant. Les originaux volumineux, HEIC, vidéos et RAW ne sont pas acceptés dans le site.

## Ajouter un projet et organiser les photos

Dans « Projets et galeries », créer un projet avec un identifiant simple et stable, ses titres FR/EN, sa catégorie, ses crédits et éventuellement son année et un lien de publication. Le nombre « Ordre » le place dans la liste : le plus petit apparaît en premier.

Ajouter les photographies à la liste, remplir leurs descriptions FR/EN et leurs légendes facultatives. Déplacer les éléments pour changer l’ordre. Désactiver « Photo visible sur le site » pour masquer une image sans la supprimer. Désactiver « Visible sur le site » sur le projet pour conserver un brouillon complet.

Un projet visible nécessite au moins une photo visible et ses descriptions dans les deux langues. La première photo est mise en avant. Une galerie peut contenir jusqu’à 24 images.

## Bande démo

Coller un lien YouTube ou Vimeo dans le profil. Ne pas charger la vidéo dans le dépôt. Les visiteurs choisissent de lancer le lecteur ; aucune connexion au fournisseur vidéo n’est faite avant ce clic. Vous pouvez laisser le champ vide tant que la bande démo n’est pas prête.

## Après l’enregistrement

Après activation de la publication automatique, chaque sauvegarde déclenche une validation puis une compilation Cloudflare. Attendre le statut de réussite et vérifier la page concernée, dans les deux langues. Une compilation invalide laisse la dernière version fonctionnelle en ligne ; la sauvegarde reste dans le CMS et peut être corrigée.

Si rien ne change après quelques minutes, demander à David de consulter le dernier déploiement. Les causes fréquentes sont une image absente ou trop lourde, une traduction manquante ou un lien incorrect. Il n’y a aucun paiement à faire pour corriger ces erreurs.
