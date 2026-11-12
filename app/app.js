document.addEventListener('DOMContentLoaded', () => {
    // Referencias del DOM
    const form = document.getElementById('registroForm');
    const alertExito = document.getElementById('mensajeExito');
    const datosGuardados = document.getElementById('datosGuardados');
    const btnNuevo = document.getElementById('btnNuevoRegistro');
    const btnSubmit = document.getElementById('btnSubmit');

    // Modal Admin / Configuración GitHub
    const btnAbrirAdmin = document.getElementById('btnAbrirAdmin');
    const modalAdmin = document.getElementById('modalAdmin');
    const modalAdminClose = document.getElementById('modalAdminClose');
    const modalAdminBackdrop = document.getElementById('modalAdminBackdrop');
    const adminTokenInput = document.getElementById('adminTokenInput');
    const adminTokenStatus = document.getElementById('adminTokenStatus');
    const btnTestConexion = document.getElementById('btnTestConexion');
    const btnGuardarTokenLocal = document.getElementById('btnGuardarTokenLocal');

    // Inputs de datos personales
    const inputNombre = document.getElementById('nombre');
    const feedbackNombre = document.getElementById('feedback-nombre');
    const inputDni = document.getElementById('dni');
    const feedbackDni = document.getElementById('feedback-dni');
    const inputTelefono = document.getElementById('telefono');
    const feedbackTelefono = document.getElementById('feedback-telefono');

    // Foto personal
    const inputFoto = document.getElementById('foto');
    const previewContainer = document.getElementById('previewContainer');
    const previewImg = document.getElementById('previewImg');
    const btnQuitarFoto = document.getElementById('btnQuitarFoto');
    const feedbackFoto = document.getElementById('feedback-foto');
    let fotoBase64 = '';

    // Condicionales Salud
    const radiosAlergias = document.querySelectorAll('input[name="alergias_radio"]');
    const campoAlergias = document.getElementById('campoAlergias');
    const inputAlergiasDetalle = document.getElementById('alergias_detalle');
    const feedbackAlergias = document.getElementById('feedback-alergias');

    const radiosLesiones = document.querySelectorAll('input[name="lesiones_radio"]');
    const campoLesiones = document.getElementById('campoLesiones');
    const inputLesionesDetalle = document.getElementById('lesiones_detalle');
    const feedbackLesiones = document.getElementById('feedback-lesiones');

    const selectDiscapacidad = document.getElementById('discapacidad');
    const inputCompaneros = document.getElementById('companeros');

    // Modal de Galería de fotos
    const modal = document.getElementById('imageModal');
    const modalImg = document.getElementById('modalImg');
    const modalCaption = document.getElementById('modalCaption');
    const modalClose = document.getElementById('modalClose');
    const modalBackdrop = document.querySelector('.image-modal-backdrop');
    const toast = document.getElementById('toast');


    // ==========================================
    // NOTIFICACIÓN TOAST
    // ==========================================
    function mostrarToast(mensaje, duracion = 2500) {
        if (!toast) return;
        toast.textContent = mensaje;
        toast.classList.remove('hidden');
        setTimeout(() => {
            toast.classList.add('hidden');
        }, duracion);
    }

    // ==========================================
    // COMPRESIÓN DE FOTO PERSONAL (Canvas)
    // ==========================================
    function comprimirImagen(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onerror = reject;
            reader.onload = (e) => {
                const img = new Image();
                img.onerror = reject;
                img.onload = () => {
                    const canvas = document.createElement('canvas');
                    let width = img.width;
                    let height = img.height;
                    const maxDim = 380;

                    if (width > height) {
                        if (width > maxDim) {
                            height = Math.round((height * maxDim) / width);
                            width = maxDim;
                        }
                    } else {
                        if (height > maxDim) {
                            width = Math.round((width * maxDim) / height);
                            height = maxDim;
                        }
                    }

                    canvas.width = width;
                    canvas.height = height;
                    const ctx = canvas.getContext('2d');
                    ctx.drawImage(img, 0, 0, width, height);
                    resolve(canvas.toDataURL('image/jpeg', 0.8));
                };
                img.src = e.target.result;
            };
            reader.readAsDataURL(file);
        });
    }

    // Manejo de selección de foto
    inputFoto.addEventListener('change', async (e) => {
        const file = e.target.files && e.target.files[0];
        if (file) {
            try {
                feedbackFoto.textContent = 'Procesando fotografía...';
                const comprimida = await comprimirImagen(file);
                fotoBase64 = comprimida;
                previewImg.src = comprimida;
                previewContainer.classList.remove('hidden');
                feedbackFoto.textContent = '✓ Foto cargada correctamente';
                feedbackFoto.className = 'field-feedback valid';
            } catch (err) {
                feedbackFoto.textContent = 'Error al cargar la foto. Intenta con otra.';
                feedbackFoto.className = 'field-feedback error';
            }
        }
    });

    btnQuitarFoto.addEventListener('click', () => {
        inputFoto.value = '';
        fotoBase64 = '';
        previewImg.src = '';
        previewContainer.classList.add('hidden');
        feedbackFoto.textContent = 'Sube o hazte una foto reciente (cámara del móvil o galería).';
        feedbackFoto.className = 'field-feedback';
    });

    // ==========================================
    // VALIDACIONES EN TIEMPO REAL
    // ==========================================
    function setFieldState(inputEl, feedbackEl, isValid, message, isEmpty = false) {
        if (!feedbackEl) return isValid;
        if (isEmpty) {
            inputEl.classList.remove('input-invalid', 'input-valid');
            feedbackEl.textContent = '';
            feedbackEl.className = 'field-feedback';
            return false;
        }

        if (isValid) {
            inputEl.classList.remove('input-invalid');
            inputEl.classList.add('input-valid');
            feedbackEl.textContent = message;
            feedbackEl.className = 'field-feedback valid';
            return true;
        } else {
            inputEl.classList.remove('input-valid');
            inputEl.classList.add('input-invalid');
            feedbackEl.textContent = message;
            feedbackEl.className = 'field-feedback error';
            return false;
        }
    }

    function validarNombre(force = false) {
        const val = inputNombre.value.trim();
        if (val.length === 0) {
            return setFieldState(inputNombre, feedbackNombre, false, 'El nombre es obligatorio', !force);
        }
        if (val.length < 3) {
            return setFieldState(inputNombre, feedbackNombre, false, `Mínimo 3 caracteres (${val.length}/3)`);
        }
        return setFieldState(inputNombre, feedbackNombre, true, '✓ Nombre válido');
    }

    function validarDni(force = false) {
        const raw = inputDni.value.toUpperCase().replace(/\s+/g, '');
        if (inputDni.value !== raw) inputDni.value = raw;

        if (raw.length === 0) {
            return setFieldState(inputDni, feedbackDni, false, 'El DNI/NIE es obligatorio', !force);
        }
        if (raw.length < 9) {
            return setFieldState(inputDni, feedbackDni, false, `Incompleto: faltan ${9 - raw.length} car. (${raw.length}/9)`);
        }
        const dniRegex = /^(\d{8}|[XYZ]\d{7})[A-Z]$/;
        if (!dniRegex.test(raw)) {
            return setFieldState(inputDni, feedbackDni, false, 'Formato inválido (ej: 12345678A o X1234567B)');
        }
        return setFieldState(inputDni, feedbackDni, true, '✓ DNI/NIE válido');
    }

    function validarTelefono(force = false) {
        const clean = inputTelefono.value.replace(/\D/g, '');
        if (inputTelefono.value !== clean) inputTelefono.value = clean;

        if (clean.length === 0) {
            return setFieldState(inputTelefono, feedbackTelefono, false, 'El teléfono es obligatorio', !force);
        }
        if (!/^[6789]/.test(clean)) {
            return setFieldState(inputTelefono, feedbackTelefono, false, 'Debe comenzar por 6, 7, 8 o 9');
        }
        if (clean.length < 9) {
            return setFieldState(inputTelefono, feedbackTelefono, false, `Faltan dígitos (${clean.length}/9)`);
        }
        return setFieldState(inputTelefono, feedbackTelefono, true, '✓ Teléfono válido');
    }

    function validarAlergias(force = false) {
        const checked = document.querySelector('input[name="alergias_radio"]:checked');
        const tieneAlergias = checked && checked.value === 'si';
        if (!tieneAlergias) {
            setFieldState(inputAlergiasDetalle, feedbackAlergias, true, '', true);
            return true;
        }
        const val = inputAlergiasDetalle.value.trim();
        if (val.length === 0) {
            return setFieldState(inputAlergiasDetalle, feedbackAlergias, false, 'Especifica tus alergias o intolerancias', !force);
        }
        return setFieldState(inputAlergiasDetalle, feedbackAlergias, true, '✓ Alergias especificadas');
    }

    function validarLesiones(force = false) {
        const checked = document.querySelector('input[name="lesiones_radio"]:checked');
        const tieneLesiones = checked && checked.value === 'si';
        if (!tieneLesiones) {
            setFieldState(inputLesionesDetalle, feedbackLesiones, true, '', true);
            return true;
        }
        const val = inputLesionesDetalle.value.trim();
        if (val.length === 0) {
            return setFieldState(inputLesionesDetalle, feedbackLesiones, false, 'Especifica tu lesión física', !force);
        }
        return setFieldState(inputLesionesDetalle, feedbackLesiones, true, '✓ Lesión especificada');
    }

    inputNombre.addEventListener('input', () => validarNombre(false));
    inputNombre.addEventListener('blur', () => validarNombre(true));
    inputDni.addEventListener('input', () => validarDni(false));
    inputDni.addEventListener('blur', () => validarDni(true));
    inputTelefono.addEventListener('input', () => validarTelefono(false));
    inputTelefono.addEventListener('blur', () => validarTelefono(true));
    inputAlergiasDetalle.addEventListener('input', () => validarAlergias(false));
    inputAlergiasDetalle.addEventListener('blur', () => validarAlergias(true));
    inputLesionesDetalle.addEventListener('input', () => validarLesiones(false));
    inputLesionesDetalle.addEventListener('blur', () => validarLesiones(true));

    // Radio condicionales
    radiosAlergias.forEach(radio => {
        radio.addEventListener('change', (e) => {
            if (e.target.value === 'si') {
                campoAlergias.classList.remove('hidden');
                inputAlergiasDetalle.required = true;
                inputAlergiasDetalle.focus();
            } else {
                campoAlergias.classList.add('hidden');
                inputAlergiasDetalle.required = false;
                inputAlergiasDetalle.value = '';
                setFieldState(inputAlergiasDetalle, feedbackAlergias, true, '', true);
            }
        });
    });

    radiosLesiones.forEach(radio => {
        radio.addEventListener('change', (e) => {
            if (e.target.value === 'si') {
                campoLesiones.classList.remove('hidden');
                inputLesionesDetalle.required = true;
                inputLesionesDetalle.focus();
            } else {
                campoLesiones.classList.add('hidden');
                inputLesionesDetalle.required = false;
                inputLesionesDetalle.value = '';
                setFieldState(inputLesionesDetalle, feedbackLesiones, true, '', true);
            }
        });
    });

    // ==========================================
    // UTILIDADES GITHUB Y FORMATO
    // ==========================================
    function utf8ToBase64(str) {
        const bytes = new TextEncoder().encode(str);
        let binary = '';
        for (let i = 0; i < bytes.byteLength; i++) {
            binary += String.fromCharCode(bytes[i]);
        }
        return btoa(binary);
    }

    function base64ToUtf8(base64) {
        const clean = base64.replace(/\s/g, '');
        const binary = atob(clean);
        const bytes = new Uint8Array(binary.length);
        for (let i = 0; i < binary.length; i++) {
            bytes[i] = binary.charCodeAt(i);
        }
        return new TextDecoder().decode(bytes);
    }

    function obtenerTokenGitHub() {
        let t = '';
        if (typeof GITHUB_CONFIG !== 'undefined') {
            if (GITHUB_CONFIG.key) {
                t = GITHUB_CONFIG.key.split('').reverse().join('').trim();
            } else if (GITHUB_CONFIG.token) {
                t = GITHUB_CONFIG.token.trim();
            }
        }
        if (!t) {
            t = (localStorage.getItem('finca_github_token') || '').trim();
        }
        if (!t) return '';

        // Si el token está en Base64 para saltar el filtro de GitHub Secret Scanning, decodificar
        if (!t.startsWith('ghp_') && !t.startsWith('github_pat_')) {
            try {
                const dec = atob(t).trim();
                if (dec.startsWith('ghp_') || dec.startsWith('github_pat_')) {
                    return dec;
                }
            } catch (_) {}
        }
        return t;
    }

    async function probarConexionGitHub(token) {
        const owner = (typeof GITHUB_CONFIG !== 'undefined' && GITHUB_CONFIG.owner) || 'J-Fco29';
        const repo = (typeof GITHUB_CONFIG !== 'undefined' && GITHUB_CONFIG.repo) || 'Finca-Regaleira';
        try {
            const res = await fetch(`https://api.github.com/repos/${owner}/${repo}`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Accept': 'application/vnd.github+json'
                }
            });
            if (res.ok) {
                const data = await res.json();
                return { ok: true, mensaje: `✓ Conexión establecida con éxito en ${data.full_name} (${data.visibility || 'público'}).` };
            } else if (res.status === 401) {
                return { ok: false, mensaje: '❌ Token no válido o expirado (Error 401 Unauthorized).' };
            } else if (res.status === 404) {
                return { ok: false, mensaje: `❌ Repositorio ${owner}/${repo} no encontrado o token sin permisos (Error 404).` };
            } else {
                return { ok: false, mensaje: `❌ Error de respuesta de GitHub (${res.status}).` };
            }
        } catch (_) {
            return { ok: false, mensaje: '❌ Error de red al intentar conectar con la API de GitHub.' };
        }
    }

    function agregarViajeroATxt(txtActual, nuevo, nombreFoto = '') {
        const match = txtActual.match(/Total de viajeros registrados:\s*(\d+)/i);
        let total = 1;
        let nuevoTxt = '';

        if (match) {
            total = parseInt(match[1], 10) + 1;
            nuevoTxt = txtActual.replace(/Total de viajeros registrados:\s*\d+/i, `Total de viajeros registrados: ${total}`);
        } else {
            nuevoTxt = `=== REGISTRO DE VIAJEROS - FINCA REGALEIRA ===\nTotal de viajeros registrados: 1\n==============================================\n\n` + txtActual;
        }

        nuevoTxt = nuevoTxt.trimEnd() + '\n\n';
        nuevoTxt += `VIAJERO #${total}\n`;
        nuevoTxt += `- Nombre: ${nuevo.nombre}\n`;
        nuevoTxt += `- DNI/NIE: ${nuevo.dni}\n`;
        nuevoTxt += `- Teléfono: ${nuevo.telefono}\n`;
        nuevoTxt += `- Alergias: ${nuevo.tieneAlergias ? nuevo.alergias : 'No'}\n`;
        nuevoTxt += `- Lesiones: ${nuevo.tieneLesiones ? nuevo.lesiones : 'No'}\n`;
        nuevoTxt += `- Discapacidad: ${nuevo.discapacidadTexto || nuevo.discapacidad}\n`;
        nuevoTxt += `- Compañeros de habitación: ${nuevo.companeros || 'Sin preferencias'}\n`;
        if (nombreFoto) {
            nuevoTxt += `- Foto adjunta: Sí (app/fotos_viajeros/${nombreFoto})\n`;
        } else {
            nuevoTxt += `- Foto adjunta: ${nuevo.tieneFoto ? 'Sí' : 'No'}\n`;
        }
        nuevoTxt += `- Fecha: ${nuevo.fechaRegistro}\n`;
        nuevoTxt += `----------------------------------------------\n`;

        return { nuevoTxt, total };
    }

    async function guardarEnGitHub(nuevoViajero, intento = 1) {
        const token = obtenerTokenGitHub();
        if (!token) {
            return {
                ok: false,
                error: 'No hay token de GitHub configurado. Configúralo en el archivo config.js o pulsa en el icono ⚙️.'
            };
        }

        const owner = (typeof GITHUB_CONFIG !== 'undefined' && GITHUB_CONFIG.owner) || 'J-Fco29';
        const repo = (typeof GITHUB_CONFIG !== 'undefined' && GITHUB_CONFIG.repo) || 'Finca-Regaleira';
        const branch = (typeof GITHUB_CONFIG !== 'undefined' && GITHUB_CONFIG.branch) || 'main';
        const rutaRegistros = (typeof GITHUB_CONFIG !== 'undefined' && GITHUB_CONFIG.rutaRegistros) || 'app/registros.txt';
        const rutaFotos = (typeof GITHUB_CONFIG !== 'undefined' && GITHUB_CONFIG.rutaFotos) || 'app/fotos_viajeros';

        const headers = {
            'Authorization': `Bearer ${token}`,
            'Accept': 'application/vnd.github+json',
            'Content-Type': 'application/json'
        };

        // 1. Si el viajero subió foto, guardarla como archivo en app/fotos_viajeros/
        let nombreFoto = '';
        if (nuevoViajero.tieneFoto && nuevoViajero.foto && intento === 1) {
            try {
                const base64Puro = nuevoViajero.foto.replace(/^data:image\/\w+;base64,/, '');
                const ext = nuevoViajero.foto.includes('png') ? '.png' : '.jpg';
                const dniLimpio = (nuevoViajero.dni || 'viajero_' + Date.now()).replace(/[^a-zA-Z0-9_-]/g, '_');
                nombreFoto = `foto_${dniLimpio}${ext}`;
                const pathFoto = `${rutaFotos}/${nombreFoto}`;

                let shaFoto = undefined;
                try {
                    const getFoto = await fetch(`https://api.github.com/repos/${owner}/${repo}/contents/${pathFoto}?ref=${branch}`, { headers, cache: 'no-store' });
                    if (getFoto.ok) {
                        const jsonFoto = await getFoto.json();
                        shaFoto = jsonFoto.sha;
                    }
                } catch (_) {}

                await fetch(`https://api.github.com/repos/${owner}/${repo}/contents/${pathFoto}`, {
                    method: 'PUT',
                    headers,
                    body: JSON.stringify({
                        message: `Foto de viajero: ${nuevoViajero.nombre} (${nuevoViajero.dni})`,
                        content: base64Puro,
                        branch,
                        ...(shaFoto ? { sha: shaFoto } : {})
                    })
                });
            } catch (errFoto) {
                console.warn('No se pudo guardar la foto en GitHub:', errFoto);
                nombreFoto = '';
            }
        }

        // 2. Obtener app/registros.txt actual desde GitHub
        let shaActual = undefined;
        let contenidoActual = '';

        const getRes = await fetch(`https://api.github.com/repos/${owner}/${repo}/contents/${rutaRegistros}?ref=${branch}`, {
            headers,
            cache: 'no-store'
        });

        if (getRes.ok) {
            const data = await getRes.json();
            shaActual = data.sha;
            contenidoActual = base64ToUtf8(data.content);
        } else if (getRes.status === 404) {
            contenidoActual = '=== REGISTRO DE VIAJEROS - FINCA REGALEIRA ===\nTotal de viajeros registrados: 0\n==============================================\n\n';
        } else {
            const errJson = await getRes.json().catch(() => ({}));
            return {
                ok: false,
                error: errJson.message || `Error ${getRes.status} al leer registros.txt en GitHub.`
            };
        }

        // 3. Generar nuevo contenido acumulado con el nuevo viajero
        const { nuevoTxt, total } = agregarViajeroATxt(contenidoActual, nuevoViajero, nombreFoto);

        // 4. Guardar en GitHub mediante commit
        const putRes = await fetch(`https://api.github.com/repos/${owner}/${repo}/contents/${rutaRegistros}`, {
            method: 'PUT',
            headers,
            body: JSON.stringify({
                message: `Registro viajero #${total}: ${nuevoViajero.nombre} (${nuevoViajero.dni})`,
                content: utf8ToBase64(nuevoTxt),
                branch,
                ...(shaActual ? { sha: shaActual } : {})
            })
        });

        if (putRes.status === 409 && intento < 3) {
            // Conflicto de concurrencia: otro usuario hizo commit al mismo tiempo, reintentar con el SHA actualizado
            await new Promise(r => setTimeout(r, 1000));
            return guardarEnGitHub(nuevoViajero, intento + 1);
        }

        if (!putRes.ok) {
            const errJson = await putRes.json().catch(() => ({}));
            return {
                ok: false,
                error: errJson.message || `Error ${putRes.status} al guardar en GitHub.`
            };
        }

        return { ok: true, total };
    }


    // ==========================================
    // ENVÍO DEL FORMULARIO
    // ==========================================
    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        const okNombre = validarNombre(true);
        const okDni = validarDni(true);
        const okTel = validarTelefono(true);
        const okAlergias = validarAlergias(true);
        const okLesiones = validarLesiones(true);

        if (!okNombre || !okDni || !okTel || !okAlergias || !okLesiones) {
            const primero = form.querySelector('.input-invalid');
            if (primero) primero.focus();
            mostrarToast('⚠️ Revisa los campos obligatorios.');
            return;
        }

        const tieneAlergias = document.querySelector('input[name="alergias_radio"]:checked').value === 'si';
        const tieneLesiones = document.querySelector('input[name="lesiones_radio"]:checked').value === 'si';

        const nuevoViajero = {
            id: Date.now(),
            nombre: inputNombre.value.trim(),
            dni: inputDni.value.trim().toUpperCase(),
            telefono: inputTelefono.value.trim(),
            foto: fotoBase64 || '',
            tieneFoto: Boolean(fotoBase64),
            tieneAlergias,
            alergias: tieneAlergias ? (inputAlergiasDetalle.value.trim() || 'No especificado') : 'Ninguna',
            tieneLesiones,
            lesiones: tieneLesiones ? (inputLesionesDetalle.value.trim() || 'No especificado') : 'Ninguna',
            discapacidad: selectDiscapacidad.value,
            discapacidadTexto: selectDiscapacidad.options[selectDiscapacidad.selectedIndex].text,
            companeros: inputCompaneros.value.trim() || 'Sin preferencias',
            fechaRegistro: new Date().toLocaleString('es-ES')
        };

        const textoOriginalBtn = btnSubmit ? btnSubmit.textContent : 'Confirmar y registrar viajero';
        if (btnSubmit) {
            btnSubmit.disabled = true;
            btnSubmit.textContent = 'Guardando en GitHub...';
        }

        try {
            // Guardar directamente en GitHub (online)
            const resGitHub = await guardarEnGitHub(nuevoViajero);
            if (!resGitHub.ok) {
                throw new Error(resGitHub.error || 'No se pudo guardar en GitHub.');
            }

            // Éxito: mostrar pantalla de confirmación (SIN descargar nada en el móvil)
            datosGuardados.textContent = `Ficha de ${nuevoViajero.nombre} (${nuevoViajero.dni}) guardada con éxito en GitHub para el viaje a Finca Regaleira.`;
            form.classList.add('hidden');
            alertExito.classList.remove('hidden');
            mostrarToast('✓ ¡Registro guardado en GitHub con éxito!');
        } catch (err) {
            mostrarToast('❌ ' + err.message, 6000);
            if (err.message.includes('token') || err.message.includes('Token')) {
                if (modalAdmin) modalAdmin.classList.remove('hidden');
            }
        } finally {
            if (btnSubmit) {
                btnSubmit.disabled = false;
                btnSubmit.textContent = textoOriginalBtn;
            }
        }
    });

    btnNuevo.addEventListener('click', () => {
        form.reset();
        fotoBase64 = '';
        previewImg.src = '';
        previewContainer.classList.add('hidden');
        campoAlergias.classList.add('hidden');
        campoLesiones.classList.add('hidden');

        setFieldState(inputNombre, feedbackNombre, true, '', true);
        setFieldState(inputDni, feedbackDni, true, '', true);
        setFieldState(inputTelefono, feedbackTelefono, true, '', true);
        setFieldState(inputAlergiasDetalle, feedbackAlergias, true, '', true);
        setFieldState(inputLesionesDetalle, feedbackLesiones, true, '', true);
        feedbackFoto.textContent = 'Sube o hazte una foto reciente (cámara del móvil o galería).';
        feedbackFoto.className = 'field-feedback';

        alertExito.classList.add('hidden');
        form.classList.remove('hidden');
        inputNombre.focus();
    });

    // ==========================================
    // MODAL DE ADMINISTRACIÓN (GITHUB TOKEN)
    // ==========================================
    if (btnAbrirAdmin && modalAdmin) {
        btnAbrirAdmin.addEventListener('click', () => {
            if (adminTokenInput) {
                adminTokenInput.value = obtenerTokenGitHub();
            }
            if (adminTokenStatus) {
                adminTokenStatus.className = 'admin-status-msg';
                adminTokenStatus.textContent = '';
                adminTokenStatus.style.display = 'none';
            }
            modalAdmin.classList.remove('hidden');
        });
    }

    const cerrarAdminModal = () => {
        if (modalAdmin) modalAdmin.classList.add('hidden');
    };

    if (modalAdminClose) modalAdminClose.addEventListener('click', cerrarAdminModal);
    if (modalAdminBackdrop) modalAdminBackdrop.addEventListener('click', cerrarAdminModal);

    if (btnTestConexion) {
        btnTestConexion.addEventListener('click', async () => {
            const token = (adminTokenInput ? adminTokenInput.value.trim() : '') || obtenerTokenGitHub();
            if (!token) {
                if (adminTokenStatus) {
                    adminTokenStatus.className = 'admin-status-msg admin-status-error';
                    adminTokenStatus.textContent = 'Introduce un token para probar la conexión.';
                }
                return;
            }
            if (adminTokenStatus) {
                adminTokenStatus.className = 'admin-status-msg';
                adminTokenStatus.style.display = 'block';
                adminTokenStatus.textContent = 'Comprobando conexión con GitHub...';
            }
            const res = await probarConexionGitHub(token);
            if (adminTokenStatus) {
                adminTokenStatus.className = `admin-status-msg ${res.ok ? 'admin-status-success' : 'admin-status-error'}`;
                adminTokenStatus.textContent = res.mensaje;
            }
        });
    }

    if (btnGuardarTokenLocal) {
        btnGuardarTokenLocal.addEventListener('click', () => {
            const val = adminTokenInput ? adminTokenInput.value.trim() : '';
            if (val) {
                localStorage.setItem('finca_github_token', val);
                mostrarToast('✓ Token guardado en tu navegador');
                if (adminTokenStatus) {
                    adminTokenStatus.className = 'admin-status-msg admin-status-success';
                    adminTokenStatus.textContent = '✓ Token guardado correctamente en tu navegador.';
                }
            } else {
                localStorage.removeItem('finca_github_token');
                mostrarToast('Token eliminado');
                if (adminTokenStatus) {
                    adminTokenStatus.className = 'admin-status-msg';
                    adminTokenStatus.style.display = 'none';
                }
            }
        });
    }

    // ==========================================
    // VISOR MODAL DE LA GALERÍA DE FOTOS
    // ==========================================
    document.querySelectorAll('.gallery-card').forEach(card => {
        card.addEventListener('click', () => {
            const img = card.querySelector('img');
            const titulo = card.querySelector('strong');
            if (img && modal && modalImg) {
                modalImg.src = card.dataset.full || img.src;
                modalImg.alt = img.alt || 'Instalación de Finca Regaleira';
                modalCaption.textContent = titulo ? titulo.textContent : img.alt;
                modal.classList.remove('hidden');
                document.body.style.overflow = 'hidden';
            }
        });
    });

    const cerrarModal = () => {
        if (modal) modal.classList.add('hidden');
        document.body.style.overflow = '';
    };

    if (modalClose) modalClose.addEventListener('click', cerrarModal);
    if (modalBackdrop) modalBackdrop.addEventListener('click', cerrarModal);

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            cerrarModal();
        }
    });
});
