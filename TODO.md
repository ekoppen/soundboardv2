# Soundboard v2 - TODO & Feature List

## 🚧 In Progress

### Discord Integration
- [x] Backend Discord bot module
- [x] API endpoints voor Discord control
- [x] Server integratie
- [x] Toggle button in navbar
- [ ] Frontend JavaScript voor toggle functionality
- [ ] README updaten met Discord setup instructies
- [ ] Testen met echte Discord bot token

## 📋 Backlog - High Priority

### User Experience Improvements

#### 1. Drag & Drop Reordering
- [ ] Implementeer drag-and-drop voor sound cards
- [ ] Save custom order in localStorage
- [ ] Persist order per gebruiker/sessie
- [ ] Visual feedback tijdens dragging
- **Technology**: HTML5 Drag & Drop API of SortableJS library

#### 2. Favorite Sounds
- [ ] "Favorite" knop op elke sound card
- [ ] Favorites opslaan in localStorage
- [ ] **Optie A**: Favorites bovenaan tonen (altijd eerst)
- [ ] **Optie B**: Apart "Favorites" filter/tab
- [ ] Visual indicator voor favorites (bijv. gele ster)

#### 3. Hide/Show Sounds
- [ ] Toggle om sounds te verbergen
- [ ] Hidden sounds opslaan in localStorage
- [ ] "Show hidden" optie in settings
- [ ] Visuele indicator voor hidden sounds in admin view

## 🎯 Backlog - Nice to Have

### Performance & Scalability
- [ ] Database indexes toevoegen (play_count, active, created_at)
- [ ] Paginering implementeren voor soundboard (20-50 items per pagina)
- [ ] Lazy loading van audio files
- [ ] Image optimization (thumbnails genereren)
- [ ] Redis caching voor frequently played sounds

### Frontend Modernization
- [ ] Migreer van jQuery naar Vanilla JS of modern framework
- [ ] Update Bootstrap 2.x → Bootstrap 5
- [ ] Responsive design improvements
- [ ] Dark mode support
- [ ] PWA support (offline functionality)

### Discord Features
- [ ] Multi-server support (meerdere Discord servers)
- [ ] Per-user voice channel detection
- [ ] Volume control via webapp
- [ ] Queue systeem voor meerdere sounds
- [ ] Discord slash commands (/play soundnaam)
- [ ] Visual indicator: bot online/offline status

### Authentication & Authorization
- [ ] User accounts (login systeem)
- [ ] Upload rechten per user
- [ ] Admin panel voor sound moderation
- [ ] Private sounds (alleen zichtbaar voor uploader)

### Sound Management
- [ ] Edit sound metadata (naam, tags, afbeelding)
- [ ] Delete sounds functionaliteit
- [ ] Sound categories/playlists
- [ ] Bulk upload functionaliteit
- [ ] Audio trimming/editing in browser
- [ ] Waveform visualization

### Analytics & Statistics
- [ ] Play count charts (most popular sounds)
- [ ] User statistics dashboard
- [ ] Download statistics
- [ ] Trending sounds (populair deze week/maand)

### API & Integrations
- [ ] REST API documentatie (Swagger/OpenAPI)
- [ ] Webhooks voor sound upload events
- [ ] Integration met andere platforms (Twitch, Slack, etc.)
- [ ] Mobile app support

### Testing & Quality
- [ ] Unit tests (Jest)
- [ ] Integration tests
- [ ] E2E tests (Cypress/Playwright)
- [ ] CI/CD pipeline (GitHub Actions)
- [ ] Code coverage target: 70%+

### DevOps
- [ ] Production deployment guide
- [ ] Health check endpoint
- [ ] Monitoring & logging (Winston, Sentry)
- [ ] Automated backups voor database
- [ ] CDN setup voor static assets

## 🐛 Known Issues

- [ ] FFmpeg moet handmatig geïnstalleerd worden voor Discord audio
- [ ] Geen error handling voor upload failures op client-side
- [ ] Socket.IO disconnect handling kan beter

## 💡 Ideas / Future Consideration

- Voice-to-text voor automatische sound naming
- AI-generated tags voor uploaded sounds
- Sound effects/filters (pitch, speed, reverb)
- Soundboard themes/skins
- Export playlists functionality
- Sound sharing via permalink
- Collaborative playlists
- Real-time collaboration (multiple users DJing)

---

**Last Updated**: November 2024
**Current Version**: 2.0 (Major improvements completed)
