# Nova Salud Móvil

App móvil en [**React Native**](https://reactnative.dev) del sistema de la botica Nova Salud. Por ahora incluye la pantalla de bienvenida, el **inicio de sesión**, el **registro** y una pantalla con los datos de la sesión, conectados a la misma API que la web.

> Antes de empezar, completa la guía [Preparar el entorno](https://reactnative.dev/docs/set-up-your-environment) (Android Studio y/o Xcode).

## Conexión con la API

La URL se define en [`src/services/api.js`](src/services/api.js):

- Emulador de Android: `http://10.0.2.2:4000/api` (apunta al `localhost` de tu PC).
- iOS / otros: `http://localhost:4000/api`.

Para un celular físico, reemplázala por la IP local de tu PC (por ejemplo `http://192.168.1.20:4000/api`) y asegúrate de que la API (`Server/`) esté en ejecución.

## Paso 1: iniciar Metro

```sh
npm install
npm start
```

## Paso 2: compilar y ejecutar

Con Metro en ejecución, abre otra terminal en esta carpeta:

### Android

```sh
npm run android
```

### iOS

La primera vez instala CocoaPods y luego las dependencias nativas (repite `pod install` cada vez que cambien):

```sh
bundle install
bundle exec pod install
npm run ios
```

También puedes compilar directamente desde Android Studio o Xcode.

## Recargar la app

- **Android:** presiona <kbd>R</kbd> dos veces o abre el menú de desarrollo con <kbd>Ctrl</kbd> + <kbd>M</kbd> (Windows/Linux) o <kbd>Cmd ⌘</kbd> + <kbd>M</kbd> (macOS) y elige **Reload**.
- **iOS:** presiona <kbd>R</kbd> en el simulador.

## Pruebas y calidad

```sh
npm run lint
npm test
```

## Problemas frecuentes

Consulta la página de [solución de problemas](https://reactnative.dev/docs/troubleshooting) de React Native.
