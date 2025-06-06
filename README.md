# Weatheroo 🌤️

A beautiful, feature-rich weather application built with Nuxt 3, providing real-time weather data, interactive maps, and intelligent caching for optimal performance.

## ✨ Features

### 🌍 Location & Weather

- **Automatic location detection** with intelligent permission handling
- **City search** with autocomplete and error handling
- **Current weather conditions** with detailed metrics
- **5-day weather forecast** with daily breakdowns
- **Real-time local time display** with timezone support
- **Weather animations** that match current conditions

### 🗺️ Interactive Maps

- **Multiple weather layers**: Precipitation, Clouds, Temperature, Wind, Pressure
- **Interactive controls** with zoom and center location
- **Custom markers** with city labels
- **Responsive design** optimized for all devices
- **Performance optimized** with hardware acceleration

### 🎨 User Experience

- **Dark/Light theme support** with system preference detection
- **Smooth animations** and transitions throughout the app
- **Responsive design** that works on mobile, tablet, and desktop
- **Custom weather icons** with animated effects
- **Skeleton loading states** for better perceived performance
- **Error handling** with retry mechanisms

### ⚡ Performance & Caching

- **Redis-powered caching** for faster response times
- **Client-side caching** with automatic expiration
- **Rate limiting** to prevent API abuse
- **Intelligent cache management** with stale-while-revalidate strategy
- **Performance monitoring** with built-in health checks

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- npm, pnpm, yarn, or bun
- OpenWeatherMap API key ([Get one here](https://openweathermap.org/api))
- Redis instance (optional, for caching - works without it)

### Installation

1. **Clone the repository**

   ```bash
   git clone https://github.com/Vasilis-Rousis/weatheroo.git
   cd weatheroo
   ```

2. **Install dependencies**

   ```bash
   # npm
   npm install

   # pnpm
   pnpm install

   # yarn
   yarn install

   # bun
   bun install
   ```

3. **Environment setup**

   Create a `.env` file in the root directory:

   ```env
   # Required: OpenWeatherMap API Key
   OPENWEATHER_API_KEY=your_openweathermap_api_key_here

   # Optional: Redis Configuration (for caching)
   KV_REST_API_URL=your_redis_url
   KV_REST_API_TOKEN=your_redis_token

   # Optional: Admin credentials for test routes
   ADMIN_USERNAME=admin
   ADMIN_PASSWORD=your_secure_password
   ```

4. **Start development server**

   ```bash
   npm run dev
   ```

   Visit `http://localhost:3000` to see your app! 🎉

## 🛠️ Tech Stack

### Core Framework

- **[Nuxt 3](https://nuxt.com/)** - The Intuitive Vue Framework
- **[Vue 3](https://vuejs.org/)** - The Progressive JavaScript Framework
- **[TypeScript](https://www.typescriptlang.org/)** - Type-safe development

### Styling & UI

- **[Tailwind CSS](https://tailwindcss.com/)** - Utility-first CSS framework
- **[shadcn/ui](https://ui.shadcn.com/)** - Re-usable components built with Radix UI and Tailwind CSS
- **[Lucide Icons](https://lucide.dev/)** - Beautiful & consistent icons
- **[Tailwind Animate](https://github.com/jamiebuilds/tailwindcss-animate)** - Animation utilities

### Data & APIs

- **[OpenWeatherMap API](https://openweathermap.org/api)** - Weather data provider
- **[Leaflet](https://leafletjs.com/)** - Interactive maps
- **[@upstash/redis](https://docs.upstash.com/redis)** - Serverless Redis for caching

### Performance & Analytics

- **[@vercel/analytics](https://vercel.com/analytics)** - Web analytics
- **[@vueuse/core](https://vueuse.org/)** - Collection of Vue Composition Utilities

## 📁 Project Structure

```
weatheroo/
├── components/               # Vue components
│   ├── ui/                  # shadcn/ui components
│   │   ├── button/
│   │   ├── card/
│   │   └── input/
│   ├── LocationDialog.vue   # Location permission dialog
│   ├── LocationButton.vue   # Location toggle button
│   ├── WeatherMap.vue       # Interactive weather map
│   ├── WeatherIcons.vue     # Custom weather icons
│   ├── WeatherAnimation.vue # Weather animations
│   ├── SkeletonLoader.vue   # Loading states
│   └── CacheStatus.vue      # Cache indicators
├── composables/             # Vue composables
│   ├── useLocationService.ts    # Location handling
│   ├── useWeatherService.ts     # Weather API calls
│   ├── useUserPreferences.ts    # User settings
│   └── useDebounce.ts          # Debounce utility
├── pages/                   # Application pages
│   ├── index.vue           # Main weather page
│   └── test/               # Admin test pages
├── server/                  # Server-side code
│   ├── api/                # API routes
│   │   ├── weather.ts      # Weather data endpoint
│   │   ├── admin/          # Admin endpoints
│   │   └── utils/          # Server utilities
│   ├── utils/              # Server utilities
│   │   └── redis.ts        # Redis operations
│   └── middleware/         # Server middleware
├── assets/css/             # Global styles
└── public/                 # Static files
```

## 🔧 Configuration

### Environment Variables

| Variable              | Required | Description                                        |
| --------------------- | -------- | -------------------------------------------------- |
| `OPENWEATHER_API_KEY` | ✅       | Your OpenWeatherMap API key                        |
| `KV_REST_API_URL`     | ❌       | Redis connection URL (Upstash format)              |
| `KV_REST_API_TOKEN`   | ❌       | Redis authentication token                         |
| `ADMIN_USERNAME`      | ❌       | Username for admin test routes (default: admin)    |
| `ADMIN_PASSWORD`      | ❌       | Password for admin test routes (default: password) |

### Redis Setup (Optional)

Weatheroo works without Redis but performs better with caching enabled:

1. **Local Redis**: Install and run Redis locally
2. **Upstash Redis**: Get a free Redis instance at [Upstash](https://console.upstash.com/)
3. **Vercel KV**: Use Vercel's built-in KV storage when deployed on Vercel

### OpenWeatherMap API

1. Sign up at [OpenWeatherMap](https://openweathermap.org/api)
2. Get your free API key (1000 calls/day)
3. For production, consider upgrading to a paid plan

## 🎯 Usage

### Basic Weather Lookup

1. **Search by city**: Type any city name in the search bar
2. **Use current location**: Click the location button to use GPS
3. **View forecast**: Scroll down to see the 5-day forecast
4. **Explore maps**: Check different weather layers on the interactive map

### Location Permissions

The app intelligently handles location permissions:

- **First visit**: Shows a friendly permission dialog
- **Permission granted**: Automatically loads weather for current location
- **Permission denied**: Falls back to last searched city or London
- **Manual toggle**: Use the location button to enable/disable location services

### Theme Switching

Toggle between light and dark themes using the theme button in the header. The app remembers your preference and respects system settings.

## 🧪 Testing & Development

### Admin Test Routes

Visit `/test/redis` (requires basic auth) to:

- Test Redis connection health
- Monitor cache performance
- Check rate limiting status
- Stress test the system

### API Endpoints

- `GET /api/weather?city=London` - Get weather by city name
- `GET /api/weather?lat=51.5&lon=0.1` - Get weather by coordinates
- `GET /api/health/redis` - Check Redis health
- `GET /api/admin/usage` - Get usage statistics

### Performance Monitoring

The app includes built-in monitoring for:

- API response times
- Cache hit rates
- Rate limiting status
- Redis connection health

## 🚢 Deployment

### Vercel (Recommended)

1. **Connect your repository** to Vercel
2. **Add environment variables** in the Vercel dashboard
3. **Deploy**: Vercel will automatically deploy on every push

### Other Platforms

The app can be deployed on any platform that supports Nuxt 3:

```bash
# Build for production
npm run build

# Preview the production build
npm run preview
```

## 🔍 Features Deep Dive

### Intelligent Caching Strategy

- **Multi-level caching**: Browser storage + Redis server-side cache
- **Cache invalidation**: Automatic expiration after 30 minutes
- **Stale-while-revalidate**: Show cached data while fetching fresh data
- **Geographic optimization**: Cache by rounded coordinates for better hit rates

### Rate Limiting

- **Per-minute limits**: 50 requests per minute
- **Daily limits**: 950 requests per day
- **Graceful degradation**: Falls back to cached data when limits are reached
- **User-friendly errors**: Clear messages with retry times

### Location Services

- **Privacy-first**: Only requests location when explicitly allowed
- **Intelligent fallbacks**: Uses last searched city or sensible defaults
- **Permission management**: Remembers user preferences across sessions
- **Error handling**: Graceful handling of location errors

### Responsive Design

- **Mobile-first**: Optimized for mobile devices
- **Adaptive layout**: Changes layout based on screen size
- **Touch-friendly**: Large touch targets and gestures
- **Performance**: Optimized animations and reduced motion support

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details.

### Development Setup

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Make your changes and test them
4. Commit your changes: `git commit -m 'Add amazing feature'`
5. Push to the branch: `git push origin feature/amazing-feature`
6. Open a Pull Request

### Code Style

- Use TypeScript for type safety
- Follow Vue 3 Composition API patterns
- Use Tailwind CSS for styling
- Write meaningful commit messages
- Add tests for new features

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **[OpenWeatherMap](https://openweathermap.org/)** for providing weather data
- **[Nuxt.js Team](https://nuxt.com/)** for the amazing framework
- **[shadcn](https://ui.shadcn.com/)** for the beautiful UI components
- **[Leaflet](https://leafletjs.com/)** for the interactive maps
- **[Upstash](https://upstash.com/)** for serverless Redis

## 📞 Support

If you have any questions or run into issues:

1. Check the [FAQ section](#-faq) below
2. Search existing [GitHub Issues](https://github.com/yourusername/weatheroo/issues)
3. Create a new issue with detailed information
4. Join our [Discord community](https://discord.gg/your-server) for real-time help

## ❓ FAQ

**Q: Why is my location not being detected?**
A: Make sure you've granted location permissions in your browser and that location services are enabled on your device.

**Q: Can I use this without Redis?**
A: Yes! The app works perfectly without Redis, you'll just miss out on some performance optimizations.

**Q: How do I get an OpenWeatherMap API key?**
A: Sign up at [openweathermap.org](https://openweathermap.org/api) and choose the free plan (1000 calls/day).

**Q: Is this app free to use?**
A: Yes, the app is open source and free to use. You'll need your own OpenWeatherMap API key.

**Q: Can I customize the weather icons?**
A: Absolutely! Check out `components/WeatherIcons.vue` and `components/WeatherAnimation.vue` for customization options.

---

Made with ❤️ using Nuxt 3, Tailwind CSS, and shadcn/ui components

⭐ **Star this repo if you found it helpful!**
