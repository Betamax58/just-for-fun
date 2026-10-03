# Just for Fun

Araignée interactive en JavaScript pur, sans dépendance et sans requête réseau. Version originale inspirée du principe montré dans la capture, sans reprendre le code de son auteur.

## Jouer immédiatement
Ouvrir `demo.html` dans un navigateur sur ordinateur, puis cliquer sur **Lancer / retirer**. L’araignée suit la souris (ou un toucher sur écran tactile).

## Sur un autre site : console
Ouvrir la page cible, puis les outils de développement (F12), onglet Console. Coller le contenu de `extension/effects.js` et exécuter. Relancer le même script retire l’araignée. Exécuter uniquement sur une page dont vous souhaitez modifier l’affichage.

## Sur un autre site : favori
Ouvrir `demo.html`. Glisser le lien **Just for Fun** dans la barre de favoris. Sur la page cible, cliquer sur ce favori. Le fichier `bookmarklet.txt` contient aussi son adresse complète. Certaines politiques de sécurité peuvent bloquer les favoris JavaScript ; utiliser alors l’extension.

## Extension Chrome / Chromium / Edge (ordinateur)
1. Ouvrir la page de gestion des extensions : `chrome://extensions` ou `edge://extensions`.
2. Activer le mode développeur.
3. Choisir **Charger l’extension non empaquetée**, puis sélectionner le dossier `extension`.
4. Épingler l’extension et cliquer sur son icône sur la page souhaitée.

L’extension demande seulement `activeTab` et `scripting`, pour la page où vous cliquez. Pas de lecture de toutes les pages en arrière-plan. Les pages internes, boutiques d’extensions et certaines pages protégées refusent l’injection. Les contenus dans des iframes et les Shadow DOM ne sont pas parcourus. Chrome Android ne permet pas de charger cette extension ; la démo reste utilisable sur téléphone.

## Effets
Le menu en haut à droite propose une araignée, une fourmi stylisée, un papillon et un sniper. En mode sniper, cliquer sur un mot le masque et fait tomber ses lettres sous forme de fragments. Fermer restaure les mots ; aucun changement n’est enregistré sur le site. La fragmentation utilise les lettres comme morceaux, pas une fracture physique des glyphes.

## Commandes
- Souris / toucher : choisir la destination.
- P : pause / reprise.
- D : afficher les ancrages.
- Échap : retirer.
- Deuxième lancement : retirer.

Les raccourcis ne s’activent pas pendant la saisie dans un champ. Le calque laisse passer les clics. Recharger la page supprime l’araignée.

## Développement
Modifier `extension/effects.js`, puis reconstruire la démo et le favori :

```sh
python3 tools/build.py
```

Le corps tourne vers sa destination ; chaque pied conserve son ancrage jusqu’à son prochain pas. Les points d’appui sont calculés à partir des rectangles des lignes de texte et des bords d’éléments. Les pattes utilisent une articulation stylisée et une interpolation de pas, sans simulation physique complète.

## Publier sur GitHub
Le dossier est un dépôt Git local, avec un premier commit. Créer un dépôt GitHub vide nommé `just-for-fun`, puis depuis ce dossier :

```sh
git remote add origin https://github.com/VOTRE_COMPTE/just-for-fun.git
git push -u origin main
```

## Licence
MIT — voir LICENSE.
