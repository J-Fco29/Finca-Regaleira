// =============================================================================
// FINCA REGALEIRA — CONFIGURACIÓN DE CONEXIÓN CON GITHUB
// =============================================================================
// Esta configuración permite que los registros del formulario se guarden
// directamente en el repositorio de GitHub (app/registros.txt y app/fotos_viajeros/)
// en vez de descargarse o guardarse únicamente en el dispositivo del viajero.
// =============================================================================

const GITHUB_CONFIG = {
    owner: 'J-Fco29',
    repo: 'Finca-Regaleira',
    branch: 'main',
    rutaRegistros: 'app/registros.txt',
    rutaFotos: 'app/fotos_viajeros',

    // Clave de sincronización para la API de GitHub
    key: 'U2QdDmcE5J2B4BJUljkt3q3EDiiNqDgUs5A2q7T9CjYNbCRBX1qrggk4bJb_ZpUk9rZLQdo20ASK4ZOC11_tap_buhtig'
};
