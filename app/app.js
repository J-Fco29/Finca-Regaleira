document.addEventListener('DOMContentLoaded', () => {
    // Referencias del DOM
    const form = document.getElementById('registroForm');
    const alertExito = document.getElementById('mensajeExito');
    const datosGuardados = document.getElementById('datosGuardados');
    const btnNuevo = document.getElementById('btnNuevoRegistro');
    const btnDescargarTxt = document.getElementById('btnDescargarTxt');

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

    let archivoTxtHandle = null;

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
    // FORMATEO DE REGISTROS CON FOTO (TXT)
    // ==========================================
    function generarContenidoTxt(registros) {
        let texto = '=== REGISTRO DE VIAJEROS - FINCA REGALEIRA ===\n';
        texto += `Total de viajeros registrados: ${registros.length}\n`;
        texto += '==============================================\n\n';

        registros.forEach((v, idx) => {
            texto += `VIAJERO #${idx + 1}\n`;
            texto += `- Nombre: ${v.nombre}\n`;
            texto += `- DNI/NIE: ${v.dni}\n`;
            texto += `- Teléfono: ${v.telefono}\n`;
            texto += `- Alergias: ${v.tieneAlergias ? v.alergias : 'No'}\n`;
            texto += `- Lesiones: ${v.tieneLesiones ? v.lesiones : 'No'}\n`;
            texto += `- Discapacidad: ${v.discapacidadTexto || v.discapacidad}\n`;
            texto += `- Compañeros de habitación: ${v.companeros || 'Sin preferencias'}\n`;
            texto += `- Foto adjunta: ${v.tieneFoto ? 'Sí' : 'No'}\n`;
            if (v.tieneFoto && v.foto) {
                texto += `- Foto personal (Base64): ${v.foto}\n`;
            }
            texto += `- Fecha: ${v.fechaRegistro}\n`;
            texto += '----------------------------------------------\n\n';
        });

        return texto;
    }

    function descargarArchivoBlob(contenido) {
        const blob = new Blob([contenido], { type: 'text/plain;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'registros.txt';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }

    // ==========================================
    // GUARDAR EN ARCHIVO DE REGISTROS
    // ==========================================
    async function guardarEnArchivoTxt(registros, nuevoViajero = null) {
        const contenido = generarContenidoTxt(registros);

        // 1. Intentar guardar en backend si está activo (Node.js server.js)
        try {
            const respuesta = await fetch('/api/guardar-registro', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ contenido, registros, nuevoViajero })
            });
            if (respuesta.ok) {
                return true;
            }
        } catch (_) {
            // Sin servidor backend activo
        }

        // 2. File System Access API (si el navegador lo soporta)
        if ('showSaveFilePicker' in window) {
            try {
                if (!archivoTxtHandle) {
                    archivoTxtHandle = await window.showSaveFilePicker({
                        suggestedName: 'registros.txt',
                        types: [{
                            description: 'Archivo de texto',
                            accept: { 'text/plain': ['.txt'] }
                        }]
                    });
                }
                const writable = await archivoTxtHandle.createWritable();
                await writable.write(contenido);
                await writable.close();
                return true;
            } catch (_) {
                descargarArchivoBlob(contenido);
                return true;
            }
        } else {
            // 3. Fallback: descarga directa del archivo registros.txt
            descargarArchivoBlob(contenido);
            return true;
        }
    }

    function obtenerRegistros() {
        try {
            return JSON.parse(localStorage.getItem('viajeros_registrados') || '[]');
        } catch (_) {
            return [];
        }
    }

    function guardarRegistros(lista) {
        try {
            localStorage.setItem('viajeros_registrados', JSON.stringify(lista));
        } catch (e) {
            const listaLigera = lista.map(item => ({ ...item, foto: '' }));
            localStorage.setItem('viajeros_registrados', JSON.stringify(listaLigera));
        }
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

        // Guardar en almacenamiento privado
        const registros = obtenerRegistros();
        registros.push(nuevoViajero);
        guardarRegistros(registros);

        // Guardar / actualizar en registros.txt
        await guardarEnArchivoTxt(registros, nuevoViajero);

        // Mostrar pantalla de éxito privada
        datosGuardados.textContent = `Ficha registrada: ${nuevoViajero.nombre} (${nuevoViajero.dni}). Tus datos y foto personal han sido guardados para el viaje.`;
        form.classList.add('hidden');
        alertExito.classList.remove('hidden');
        mostrarToast('✓ ¡Registro y archivo actualizados!');
    });

    if (btnDescargarTxt) {
        btnDescargarTxt.addEventListener('click', () => {
            const registros = obtenerRegistros();
            const contenido = generarContenidoTxt(registros);
            descargarArchivoBlob(contenido);
        });
    }

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
