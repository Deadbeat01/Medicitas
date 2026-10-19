
# MediCitas - Sistema de Gestión de Citas Médicas

Sistema web para la gestión eficiente de citas médicas, permitiendo a pacientes agendar citas y a doctores gestionar sus consultas.

## Características

- **Para Pacientes:**
  - Agendar citas médicas con especialistas
  - Ver historial de citas programadas
  - Seleccionar entre múltiples locales hospitalarios

- **Para Doctores:**
  - Gestionar citas de pacientes
  - Ver agenda completa
  - Actualizar estado de citas

## Tecnologías Utilizadas

Este proyecto está construido con:

- **Frontend:** React + TypeScript
- **Build Tool:** Vite
- **Styling:** Tailwind CSS
- **UI Components:** shadcn-ui
- **Icons:** Lucide React

## Instalación

Para ejecutar este proyecto localmente:

```sh
# Clonar el repositorio
git clone <URL_DEL_REPOSITORIO>

# Navegar al directorio del proyecto
cd medicitas

# Instalar dependencias
npm install

# Iniciar el servidor de desarrollo
npm run dev
```

## Scripts Disponibles

- `npm run dev` - Inicia el servidor de desarrollo
- `npm run build` - Construye la aplicación para producción
- `npm run preview` - Previsualiza la build de producción
- `npm run lint` - Ejecuta el linter

## Estructura del Proyecto

```
src/
├── components/         # Componentes reutilizables
│   ├── ui/            # Componentes de UI base
│   ├── AppointmentForm.tsx
│   ├── AppointmentsList.tsx
│   ├── Header.tsx
│   ├── LoginForm.tsx
│   └── RegisterForm.tsx
├── pages/             # Páginas principales
├── types/             # Definiciones de tipos TypeScript
├── hooks/             # Hooks personalizados
└── lib/               # Utilidades y configuración
```

## Funcionalidades

### Gestión de Citas
- Formulario completo para agendar citas
- Selección de doctor por especialidad
- Calendario integrado para fechas
- Horarios disponibles preconfigurados
- Validación de datos en tiempo real

### Locales Disponibles
- Hospital de V.E.S
- Hospital de Surquillo
- Hospital de Jesús María
- Hospital de Miraflores
- Hospital de Chorrillos

### Especialidades Médicas
- Medicina General
- Cardiología
- Dermatología
- Pediatría
- Ginecología

## Licencia

© 2024 MediCitas. Todos los derechos reservados.
