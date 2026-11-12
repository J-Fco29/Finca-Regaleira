const http = require('http');
const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');

const PORT = process.env.PORT || 3000;
const ROOT_DIR = __dirname;
const APP_DIR = path.join(ROOT_DIR, 'app');
const FOTOS_DIR = path.join(APP_DIR, 'fotos_viajeros');
const DATA_FILE = path.join(APP_DIR, 'viajeros_db.json');

// Crear carpeta de fotos si no existe
if (!fs.existsSync(FOTOS_DIR)) {
    try { fs.mkdirSync(FOTOS_DIR, { recursive: true }); } catch (_) {}
}

// Cargar base de datos local de viajeros acumulados
let listaViajeros = [];
if (fs.existsSync(DATA_FILE)) {
    try {
        listaViajeros = JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
    } catch (_) {
        listaViajeros = [];
    }
}

// Función para actualizar registros.txt con todos los viajeros acumulados
function guardarRegistrosAcumulados(viajeros) {
    let texto = '=== REGISTRO DE VIAJEROS - FINCA REGALEIRA ===\n';
    texto += `Total de viajeros registrados: ${viajeros.length}\n`;
    texto += '==============================================\n\n';

    viajeros.forEach((v, idx) => {
        texto += `VIAJERO #${idx + 1}\n`;
        texto += `- Nombre: ${v.nombre || 'No especificado'}\n`;
        texto += `- DNI/NIE: ${v.dni || 'No especificado'}\n`;
        texto += `- Teléfono: ${v.telefono || 'No especificado'}\n`;
        texto += `- Alergias: ${v.tieneAlergias ? (v.alergias || 'Sí') : 'No'}\n`;
        texto += `- Lesiones: ${v.tieneLesiones ? (v.lesiones || 'Sí') : 'No'}\n`;
        texto += `- Discapacidad: ${v.discapacidadTexto || v.discapacidad || 'Ninguno'}\n`;
        texto += `- Compañeros de habitación: ${v.companeros || 'Sin preferencias'}\n`;
        texto += `- Foto adjunta: ${v.tieneFoto ? 'Sí' : 'No'}\n`;
        if (v.tieneFoto && v.foto) {
            texto += `- Foto personal (Base64): ${v.foto}\n`;
        }
        texto += `- Fecha: ${v.fechaRegistro || new Date().toLocaleString('es-ES')}\n`;
        texto += '----------------------------------------------\n\n';
    });

    const rutaApp = path.join(APP_DIR, 'registros.txt');
    const rutaRaiz = path.join(ROOT_DIR, 'registros.txt');

    try {
        fs.writeFileSync(rutaApp, texto, 'utf8');
        fs.writeFileSync(rutaRaiz, texto, 'utf8');
        fs.writeFileSync(DATA_FILE, JSON.stringify(viajeros, null, 2), 'utf8');
    } catch (err) {
        console.error('Error escribiendo archivo de registros:', err.message);
    }
}

const MIME_TYPES = {
    '.html': 'text/html; charset=utf-8',
    '.css': 'text/css; charset=utf-8',
    '.js': 'application/javascript; charset=utf-8',
    '.json': 'application/json; charset=utf-8',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.txt': 'text/plain; charset=utf-8',
    '.svg': 'image/svg+xml'
};

// Servidor HTTP
const server = http.createServer((req, res) => {
    // Cabeceras CORS para permitir conexiones externas desde cualquier dispositivo
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        res.writeHead(204);
        res.end();
        return;
    }

    // Endpoint para guardar registros enviados desde cualquier dispositivo
    if (req.method === 'POST' && req.url === '/api/guardar-registro') {
        let body = '';
        req.on('data', chunk => { body += chunk; });
        req.on('end', () => {
            try {
                const data = JSON.parse(body);
                const nuevo = data.nuevoViajero || (Array.isArray(data.registros) ? data.registros[data.registros.length - 1] : null);

                if (nuevo && nuevo.nombre) {
                    const indexExistente = listaViajeros.findIndex(v => v.dni && nuevo.dni && v.dni.trim().toUpperCase() === nuevo.dni.trim().toUpperCase());
                    if (indexExistente >= 0) {
                        listaViajeros[indexExistente] = nuevo;
                    } else {
                        listaViajeros.push(nuevo);
                    }

                    if (nuevo.foto && nuevo.foto.startsWith('data:image')) {
                        try {
                            const base64Data = nuevo.foto.replace(/^data:image\/\w+;base64,/, '');
                            const ext = nuevo.foto.includes('png') ? '.png' : '.jpg';
                            const nombreLimpio = (nuevo.dni || nuevo.nombre || 'viajero').replace(/[^a-zA-Z0-9_-]/g, '_');
                            fs.writeFileSync(path.join(FOTOS_DIR, `${nombreLimpio}${ext}`), base64Data, 'base64');
                        } catch (_) {}
                    }

                    guardarRegistrosAcumulados(listaViajeros);

                    console.log(`\n🎉 [${new Date().toLocaleTimeString()}] ¡Nuevo registro recibido!`);
                    console.log(`   👤 Viajero: ${nuevo.nombre} (DNI: ${nuevo.dni || 'N/A'}, Tel: ${nuevo.telefono || 'N/A'})`);
                    console.log(`   📊 Total registrados acumulados: ${listaViajeros.length}`);
                    console.log(`   💾 Guardado en: app/registros.txt\n`);

                    res.writeHead(200, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ ok: true, total: listaViajeros.length }));
                    return;
                } else if (data.contenido) {
                    const rutaApp = path.join(APP_DIR, 'registros.txt');
                    const rutaRaiz = path.join(ROOT_DIR, 'registros.txt');
                    fs.writeFileSync(rutaApp, data.contenido, 'utf8');
                    fs.writeFileSync(rutaRaiz, data.contenido, 'utf8');
                    res.writeHead(200, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ ok: true }));
                    return;
                }
            } catch (err) {
                console.error('Error procesando registro:', err);
            }

            res.writeHead(400, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ ok: false, error: 'Datos no válidos' }));
        });
        return;
    }

    // Servir archivos estáticos
    let safeUrl = req.url.split('?')[0];
    if (safeUrl === '/') safeUrl = '/app/index.html';

    let filePath = path.join(ROOT_DIR, safeUrl);
    if (!fs.existsSync(filePath)) {
        filePath = path.join(APP_DIR, safeUrl);
    }

    fs.stat(filePath, (err, stats) => {
        if (err || !stats.isFile()) {
            res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
            res.end('404 No encontrado');
            return;
        }

        const ext = path.extname(filePath).toLowerCase();
        const contentType = MIME_TYPES[ext] || 'application/octet-stream';
        res.writeHead(200, { 'Content-Type': contentType });
        fs.createReadStream(filePath).pipe(res);
    });
});

// Buscar ejecutable de cloudflared
function encontrarCloudflared() {
    const rutas = [
        '/opt/homebrew/bin/cloudflared',
        '/usr/local/bin/cloudflared',
        'cloudflared'
    ];
    for (const r of rutas) {
        if (r.startsWith('/') && fs.existsSync(r)) return r;
    }
    return 'cloudflared';
}

server.listen(PORT, async () => {
    console.log('\n🏰 Servidor local Finca Regaleira iniciado en http://localhost:' + PORT);
    console.log('🔄 Conectando túnel público seguro (Cloudflare) para acceso desde cualquier dispositivo...\n');

    const bin = encontrarCloudflared();
    const tunnel = spawn(bin, ['tunnel', '--url', `http://localhost:${PORT}`], {
        stdio: ['ignore', 'pipe', 'pipe']
    });

    let urlDetectada = false;

    const manejarSalida = (data) => {
        const texto = data.toString();
        const match = texto.match(/https:\/\/[a-zA-Z0-9-]+\.trycloudflare\.com/);
        if (match && !urlDetectada) {
            urlDetectada = true;
            const publicUrl = match[0];

            console.clear();
            console.log('═══════════════════════════════════════════════════════════════════════');
            console.log('  🏰 FINCA REGALEIRA — SERVIDOR PÚBLICO ACTIVO');
            console.log('═══════════════════════════════════════════════════════════════════════');
            console.log('\n🌐 ENLACE PÚBLICO (Accesible desde cualquier móvil, tablet o PC):');
            console.log(`\n   👉 \x1b[36m\x1b[1m${publicUrl}\x1b[0m\n`);
            console.log('📋 Copia este enlace para crear tu código QR o compartirlo directamente.');
            console.log('\n📝 Los formularios que se envíen se guardarán automáticamente en:');
            console.log(`   📁 \x1b[33m${path.join(APP_DIR, 'registros.txt')}\x1b[0m`);
            console.log('\n💡 Para detener el servidor y cerrar el enlace, pulsa Ctrl + C.');
            console.log('═══════════════════════════════════════════════════════════════════════\n');
        }
    };

    tunnel.stdout.on('data', manejarSalida);
    tunnel.stderr.on('data', manejarSalida);

    tunnel.on('error', (err) => {
        console.error('❌ Error iniciando túnel Cloudflare:', err.message);
        console.log('Verifica que cloudflared esté instalado en el sistema.');
    });

    tunnel.on('close', (code) => {
        if (!urlDetectada) {
            console.log(`Túnel finalizado con código: ${code}`);
        }
    });

    // Limpieza al salir
    const cerrar = () => {
        console.log('\n🛑 Cerrando servidor y enlace público...');
        tunnel.kill('SIGINT');
        server.close(() => {
            process.exit(0);
        });
    };

    process.on('SIGINT', cerrar);
    process.on('SIGTERM', cerrar);
});
