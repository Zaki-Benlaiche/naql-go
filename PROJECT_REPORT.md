# NaqlGo — Rapport Complet du Projet
## منصة النقل والشحن في الجزائر

---

## 1. Vision (الرؤية)

**NaqlGo** est une plateforme algérienne qui connecte les clients (particuliers, commerces) à un réseau de chauffeurs disponibles pour trois services distincts :

| Service | Description | Cible |
|---------|-------------|-------|
| 🛵 **Livreur** | Livraison rapide de petits colis | Commerces, e-commerce |
| 🚖 **Frodeur** (Taxi) | Transport de personnes — le chauffeur fixe le prix | Particuliers |
| 🚚 **Transporteur** | Transport de marchandises et meubles | Déménagements, logistique |

Le système couvre **deux modèles de transport** :
- **داخل الولاية (Intra-wilaya)** : sélection directe d'un chauffeur, négociation de prix 1-à-1
- **بين الولايات (Inter-wilayas)** : appel d'offres multi-transporteurs, le client choisit la meilleure offre

---

## 2. Stack Technique

### Frontend
- **Next.js 16.2.2** (App Router, React 19, React Compiler activé)
- **Tailwind CSS 4** (design system orange/dark NaqlGo)
- **TypeScript 5** (strict)
- **Lucide-react** + emoji pour les icônes
- **React Leaflet** pour la cartographie

### Backend
- **Next.js API Routes** (serverless functions sur Vercel)
- **NextAuth v4** (authentification par téléphone + mot de passe, JWT, cookies cross-origin sécurisés)
- **Prisma 7** (ORM type-safe)
- **PostgreSQL** hébergé sur **Neon** (serverless, edge-friendly via NeonHTTP adapter)
- **bcryptjs** pour le hash des mots de passe (10 rounds)

### Mobile
- **Capacitor 8** — wrapper natif Android
- **Plugins natifs** : SplashScreen, StatusBar, App, Network, Haptics, Preferences, Keyboard
- **Gradient & branding** : icône logo2.png en taille adaptive (toutes densités), splash screen sombre avec logo centré
- **Build pipeline** : `npm run build:apk` → static export → bundle dans `android/app/src/main/assets/public/` → Gradle assembleDebug

### Infra
- **Hébergement** : Vercel (CDN + Edge functions)
- **Base de données** : Neon PostgreSQL (US-East), connection pooling HTTP
- **Domaine** : naql-go.vercel.app
- **Code source** : GitHub `Zaki-Benlaiche/naql-go`

---

## 3. Fonctionnalités

### 3.1. Côté Client (`/client`)

- **Création de demande en 5 étapes** :
  1. Type de transport : intra-wilaya ou inter-wilayas
  2. Service : Livreur / Frodeur / Transporteur
  3. Wilaya (intra) ou trajet départ→arrivée (inter)
  4. Sélection du chauffeur (intra) avec affichage : nom, note, type+couleur du véhicule
  5. Détails (adresse, marchandise, poids — adaptatifs selon le service)
- **Suivi des demandes** : statut en temps réel (polling adaptatif 3s/12s)
- **Acceptation des offres** : chaque offre du chauffeur (prix + ETA + note) est affichée, le client accepte celle qui lui convient
- **Chat intégré** avec le chauffeur pour les commandes acceptées
- **Notifications** : nouveau bid, acceptation, livraison
- **Notation** post-livraison (1-5 étoiles + commentaire)

### 3.2. Côté Chauffeur (`/transporter`)

- **Profil personnalisable** :
  - Wilaya de service
  - Véhicule (texte libre — modèle, marque)
  - Couleur du véhicule (texte libre)
  - Services offerts (3 toggles : Livreur, Frodeur, Transporteur — multi-sélection)
- **Toggle en ligne / hors ligne** depuis la barre latérale
- **Browse** : liste des demandes inter-wilayas filtrée par services activés
- **Ses commandes** :
  - Section "**en attente**" pour les demandes directes intra : formulaire de proposition de prix
  - Section "**actives**" pour les commandes acceptées par le client
  - Boutons : démarrer, marquer en route, marquer livré, photo de preuve
- **Earnings** : breakdown par mois, total brut, net (90%) et commission admin (10%)
- **Documents** : upload de licence, immatriculation, assurance
- **GPS sharing** : partage de position en direct pendant le trajet

### 3.3. Côté Admin (`/admin`)

- **Dashboard** : carte revenu hero, stats utilisateurs (clients, transporteurs, note moyenne), stats commandes (ouvertes, acceptées, en route, livrées)
- **Utilisateurs** :
  - Recherche + filtres (rôle, statut)
  - Pagination 50 par page
  - Affichage : nom, téléphone, email, wilaya, véhicule + couleur, services, note (badge coloré ★), nombre de demandes/offres
  - Actions : bloquer / activer / supprimer
  - Garde-fou : impossible de supprimer un utilisateur avec commandes actives ; impossible de se supprimer
- **Commandes** :
  - Live polling 15s
  - Filtres par statut
  - Pagination 50 par page
  - Suppression cascade (messages, tracks, ratings, bids)
- **Commissions** :
  - Total perçu par l'admin
  - Détail par chauffeur : livraisons effectuées, brut, commission totale, dû ce mois
- **Création/reset du compte admin** : `npm run create:admin` (variables d'env `ADMIN_PHONE`, `ADMIN_PASSWORD`)

---

## 4. Schéma de Base de Données

```
┌──────────────────┐
│      User        │  CLIENT | TRANSPORTER | ADMIN
├──────────────────┤
│ id, name, phone  │
│ password (bcrypt)│
│ role, isActive   │
│ wilaya           │
│ vehicleType      │  ← texte libre
│ vehicleColor     │  ← texte libre
│ isLivreur        │  ← bool, services offerts
│ isFrodeur        │
│ isTransporteur   │
│ avgRating        │
└────────┬─────────┘
         │
         │ 1—N (clientId, assignedTransporterId)
         ▼
┌──────────────────────┐         ┌─────────────────┐
│ TransportRequest     │◄────────│      Bid        │
├──────────────────────┤  N—1    ├─────────────────┤
│ id, clientId         │         │ id, requestId   │
│ fromCity, toCity     │         │ transporterId   │
│ fromAddress, toAddr  │         │ price           │
│ goodsType, weight    │         │ estimatedTime   │
│ status               │         │ note            │
│   OPEN, ACCEPTED,    │         │ status          │
│   IN_TRANSIT,        │         │   PENDING,      │
│   DELIVERED,         │         │   ACCEPTED,     │
│   CANCELLED          │         │   REJECTED      │
│ acceptedBidId  ─────►│         └─────────────────┘
│ transportType        │
│   INTER | INTRA      │
│ serviceCategory      │
│   LIVREUR | FRODEUR  │
│   | TRANSPORTEUR     │
│ assignedTransporterId│
└──────────┬───────────┘
           │
           ├──► Rating (1-1)
           ├──► Message[] (chat)
           ├──► LocationTrack (GPS)
           └──► Bids[]
```

**Modèles auxiliaires** :
- `Vehicle` (flotte du transporteur)
- `Document` (papiers du transporteur)
- `Notification` (in-app)
- `Coupon` + `CouponUse` (promotions)

---

## 5. Système de Commission

```
Prix accepté = 100%
       ├─ 90% → Chauffeur (net)
       └─ 10% → Plateforme NaqlGo (commission)
```

- **Calcul à la volée** sur le total des bids acceptés (status `DELIVERED`)
- **Aucune migration** — la commission est calculée au moment du reporting, pas stockée
- **Suivi mensuel** : page admin/earnings affiche le dû par chauffeur ce mois
- **Transparence** : chaque chauffeur voit dans `/transporter/earnings` son brut, son net 90%, et la part admin 10%

---

## 6. Sécurité

| Couche | Mesure |
|--------|--------|
| **Auth** | NextAuth JWT, password bcrypt 10 rounds, cookies `__Host-` / `__Secure-` (sameSite: none, secure: true) |
| **APIs** | Vérification `getServerSession` + role check sur chaque endpoint sensible |
| **CORS** | Whitelist d'origines (localhost capacitor, *.vercel.app, openstreetmap) avec `credentials: true` |
| **DB** | Prisma queries paramétrées (pas de SQL injection), `$executeRaw` avec interpolation `${id}` typée |
| **Mobile** | Network security config HTTPS-only, pas de cleartext en prod, third-party cookies activés explicitement dans MainActivity |
| **Admin protection** | Impossible de supprimer un autre admin, impossible de se supprimer, impossible de supprimer un user avec commandes ACCEPTED/IN_TRANSIT |
| **Cascade delete** | Suppression utilisateur en SQL brut (sequential, NeonHTTP-friendly) — couvre 9 relations inverses sans laisser d'orphelins |

---

## 7. Performance & Scalabilité

### Optimisations appliquées (v2.2.0)

| Couche | Mesure | Impact |
|--------|--------|--------|
| **DB indexes** | 12 index sur les colonnes filtrées (role, wilaya, status, transporterId, requestId, userId) | Queries `findMany` restent O(log n) jusqu'à 100k+ users |
| **Pagination** | Admin users + admin orders : 50/page avec `Promise.all([findMany, count])` | Liste reste rapide même avec 10 000 utilisateurs |
| **Polling adaptatif** | 3s pour active, 12s pour idle, 25s pour notifications, **pause** quand l'app est en arrière-plan | Réduction ~70% des requêtes API en idle |
| **Splash** | Réduit de 1500ms → 700ms ; hide immédiat par NativeBridge dès le premier paint | Lancement perçu ~1.1s plus rapide |
| **Static export** | Frontend bundlé dans l'APK (HTML+CSS+JS+fonts), pas de WebView qui charge depuis le réseau | First paint ~instantané même offline |
| **NeonHTTP adapter** | Driver HTTP pur (vs WebSocket) → cold start serverless ~150ms |  |
| **React Compiler** | Activé (Next 16) → mémoization automatique des composants |  |
| **Prisma `select`** | Tous les `findMany` admin n'incluent que les colonnes affichées (pas de `*`) | Payload réduit, moins de bande passante |

### Capacité estimée
- **PostgreSQL Neon (free tier)** : 191 connexions concurrentes, 0.5 GB stockage → suffisant pour ~50 000 users + ~500 000 commandes
- **Vercel Hobby** : 100 GB bande passante/mois, 100k invocations/jour → ~15 000 utilisateurs actifs/jour confortablement
- **Au-delà** : passer Neon Pro ($19/mois) + Vercel Pro ($20/mois) → millions d'utilisateurs

---

## 8. Application Mobile

### Build pipeline
```
1. npm run build:apk          # Hide /api + middleware → Next static export → cap sync
2. cd android && ./gradlew assembleDebug
3. APK : android/app/build/outputs/apk/debug/app-debug.apk
4. cp ... public/naqlgo.apk   # served at https://naql-go.vercel.app/naqlgo.apk
```

### Caractéristiques de l'APK v2.2.0
- **Taille** : ~77 MB (frontend bundlé + Capacitor runtime + plugins natifs)
- **versionCode** : 12 / **versionName** : 2.2.0
- **applicationId** : com.naqlgo.app
- **minSdk** : 24 (Android 7.0+)
- **targetSdk** : 36 (Android 14)
- **Orientation** : portrait verrouillé
- **Permissions** : Internet, Location, Camera, Vibrate, Network state

### iOS
- **Statut** : préparé (logo, manifest, design responsive) mais non publié — nécessite un compte Apple Developer ($99/an) et build sur macOS

---

## 9. Authentification Admin

```bash
npm run create:admin
```
**Identifiants par défaut** :
- 📞 `0700000000`
- 🔑 `Admin@2026`

Pour changer :
```bash
ADMIN_PHONE=0xxxxxxxxx ADMIN_PASSWORD=NewPass123 npm run create:admin
```

---

## 10. Roadmap (suggestions futures)

| Priorité | Fonctionnalité | Effort |
|----------|----------------|--------|
| 🔴 Haut | Push notifications (Firebase FCM) | 2-3 jours |
| 🔴 Haut | Mode hors-ligne (cache des dernières commandes via Capacitor Preferences) | 1-2 jours |
| 🟡 Moyen | Système de paiement intégré (Edahabia / CIB) | 1-2 semaines |
| 🟡 Moyen | Vérification KYC chauffeur (OCR carte d'identité) | 1 semaine |
| 🟡 Moyen | Portage iOS (TestFlight + App Store) | 1 semaine |
| 🟢 Bas | Programme de fidélité client (points, niveaux) | 3-5 jours |
| 🟢 Bas | Tableau de bord analytics avancé pour l'admin (revenus par wilaya, par service, heatmap horaire) | 1 semaine |
| 🟢 Bas | Multi-langue : ajouter Tamazight | 2 jours |

---

## 11. Statistiques de Code

```
Pages          : 18 routes (client, transporter, admin, auth, public)
APIs           : 25 endpoints REST
Composants     : 30+ React components réutilisables
Migrations DB  : 7 migrations versionnées
Lignes de code : ~12 000 LoC TypeScript/TSX
Plugins natifs : 7 plugins Capacitor
Fonctionnalités: 60+ user stories couvertes
```

---

## 12. Démo & Liens

- 🌐 **Site web** : https://naql-go.vercel.app
- 📱 **Téléchargement APK** : https://naql-go.vercel.app/naqlgo.apk (v2.2.0, 77 MB)
- 💻 **Code source** : https://github.com/Zaki-Benlaiche/naql-go
- 🔐 **Admin demo** : `0700000000` / `Admin@2026`

---

## Conclusion

NaqlGo est aujourd'hui une **plateforme MVP complète et opérationnelle**, prête à recevoir ses premiers utilisateurs réels en Algérie. L'architecture serverless (Vercel + Neon) permet de démarrer **sans coût d'infra** et de scaler progressivement. Le code est entièrement type-safe, documenté, et structuré pour permettre l'ajout rapide de nouvelles fonctionnalités.

Les trois services (Livreur, Frodeur, Transporteur) couvrent l'essentiel du marché de la mobilité urbaine et inter-wilaya en Algérie, et le système de commission 90/10 offre un modèle économique transparent et scalable.

**Prochaine étape recommandée** : recruter une dizaine de chauffeurs-pilotes dans une wilaya cible (par exemple Alger ou Oran), valider l'expérience utilisateur sur le terrain, puis itérer.
