document.addEventListener('DOMContentLoaded', () => {
    // ---- Theme Toggle Logic ----
    const themeToggleBtn = document.getElementById('theme-toggle');
    const darkIcon = document.getElementById('theme-toggle-dark-icon');
    const lightIcon = document.getElementById('theme-toggle-light-icon');
    const themeColorMeta = document.getElementById('theme-color-meta');

    // Change the icons inside the button based on previous settings
    if (document.documentElement.classList.contains('dark')) {
        darkIcon.classList.remove('hidden');
    } else {
        lightIcon.classList.remove('hidden');
    }

    themeToggleBtn.addEventListener('click', function () {
        // Toggle icons inside button
        darkIcon.classList.toggle('hidden');
        lightIcon.classList.toggle('hidden');

        if (document.documentElement.classList.contains('dark')) {
            document.documentElement.classList.remove('dark');
            localStorage.setItem('theme', 'light');
            themeColorMeta.setAttribute('content', '#ffffff');
        } else {
            document.documentElement.classList.add('dark');
            localStorage.setItem('theme', 'dark');
            themeColorMeta.setAttribute('content', '#0f172a');
        }
    });

    // ---- Tabs Logic ----
    const tabs = document.querySelectorAll('#tabs-container li');
    const sections = document.querySelectorAll('.tab-content');

    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            // Remove active classes
            tabs.forEach(t => {
                t.classList.remove('tab-active');
                t.classList.add('tab-idle');
            });
            // Add active to clicked
            tab.classList.add('tab-active');
            tab.classList.remove('tab-idle');

            // Hide all sections
            sections.forEach(s => s.classList.add('hidden'));

            // Show target section
            const targetId = tab.getAttribute('data-tab');
            document.getElementById(targetId).classList.remove('hidden');
        });
    });

    // ---- Calculation Helper ----
    const addCalcListeners = (inputs, calcFunction) => {
        inputs.forEach(id => {
            const el = document.getElementById(id);
            if (el) {
                el.addEventListener('input', calcFunction);
                if (el.type === 'checkbox') {
                    el.addEventListener('change', calcFunction);
                }
            }
        });
    };

    // ---- Osmolarity Selector Logic ----
    const osmoTypeSelect = document.getElementById('osmo-type');
    const ureaContainer = document.getElementById('osmo-urea-container');
    const bunContainer = document.getElementById('osmo-bun-container');

    osmoTypeSelect.addEventListener('change', (e) => {
        if (e.target.value === 'urea') {
            ureaContainer.classList.remove('hidden');
            bunContainer.classList.add('hidden');
        } else {
            ureaContainer.classList.add('hidden');
            bunContainer.classList.remove('hidden');
        }
        calcOsmo(); // Recalculate
    });

    // ---- 1. Nefrología: MDRD-4 ----
    const calcMDRD = () => {
        const cr = parseFloat(document.getElementById('mdrd-cr').value);
        const age = parseFloat(document.getElementById('mdrd-age').value);
        const isFemale = document.getElementById('mdrd-female').checked;
        const isBlack = document.getElementById('mdrd-black').checked;

        const resultEl = document.getElementById('mdrd-result');
        const interpEl = document.getElementById('mdrd-interpretation');

        if (cr > 0 && age > 0) {
            let gfr = 175 * Math.pow(cr, -1.154) * Math.pow(age, -0.203);
            if (isFemale) gfr *= 0.742;
            if (isBlack) gfr *= 1.212;

            gfr = parseFloat(gfr.toFixed(1));
            resultEl.textContent = gfr;

            if (gfr > 90) {
                interpEl.textContent = "Función normal (>90)";
                interpEl.className = "text-sm font-medium mt-2 text-green-500";
            } else if (gfr >= 60) {
                interpEl.textContent = "Disminución leve (60-89)";
                interpEl.className = "text-sm font-medium mt-2 text-yellow-500";
            } else {
                interpEl.textContent = "Fallo renal (<60)";
                interpEl.className = "text-sm font-medium mt-2 text-red-500";
            }
        } else {
            resultEl.textContent = '--';
            interpEl.textContent = '';
        }
    };
    addCalcListeners(['mdrd-cr', 'mdrd-age', 'mdrd-female', 'mdrd-black'], calcMDRD);

    // ---- 2. Nefrología: FENa ----
    const calcFENa = () => {
        const una = parseFloat(document.getElementById('fena-una').value);
        const pna = parseFloat(document.getElementById('fena-pna').value);
        const ucr = parseFloat(document.getElementById('fena-ucr').value);
        const pcr = parseFloat(document.getElementById('fena-pcr').value);

        const resultEl = document.getElementById('fena-result');
        const interpEl = document.getElementById('fena-interpretation');

        if (una > 0 && pna > 0 && ucr > 0 && pcr > 0) {
            const fena = ((una * pcr) / (pna * ucr)) * 100;
            resultEl.textContent = fena.toFixed(2);

            if (fena < 1) {
                interpEl.textContent = "Causa prerenal (< 1%)";
                interpEl.className = "text-sm font-medium mt-2 text-yellow-500";
            } else if (fena > 1) {
                interpEl.textContent = "Causa renal/ATN (> 1%)";
                interpEl.className = "text-sm font-medium mt-2 text-red-500";
            } else {
                interpEl.textContent = "Indeterminado (~ 1%)";
                interpEl.className = "text-sm font-medium mt-2 text-gray-500";
            }
        } else {
            resultEl.textContent = '--';
            interpEl.textContent = '';
        }
    };
    addCalcListeners(['fena-una', 'fena-pna', 'fena-ucr', 'fena-pcr'], calcFENa);

    // ---- 3. Endocrinología: Sodio Corregido (Katz) ----
    const calcKatz = () => {
        const na = parseFloat(document.getElementById('katz-na').value);
        const glu = parseFloat(document.getElementById('katz-glu').value);

        const resultEl = document.getElementById('katz-result');
        const interpEl = document.getElementById('katz-interpretation');

        if (na > 0 && glu >= 0) {
            const factor = (glu - 100) / 100;
            const corrected = glu > 100 ? na + (1.6 * factor) : na;
            const resVal = parseFloat(corrected.toFixed(1));
            resultEl.textContent = resVal;

            if (resVal < 135) {
                interpEl.textContent = "Hiponatremia (< 135)";
                interpEl.className = "text-sm font-medium mt-2 text-red-500";
            } else if (resVal >= 135 && resVal <= 145) {
                interpEl.textContent = "Normal (135 - 145)";
                interpEl.className = "text-sm font-medium mt-2 text-green-500";
            } else {
                interpEl.textContent = "Hipernatremia (> 145)";
                interpEl.className = "text-sm font-medium mt-2 text-red-500";
            }
        } else {
            resultEl.textContent = '--';
            interpEl.textContent = '';
        }
    };
    addCalcListeners(['katz-na', 'katz-glu'], calcKatz);

    // ---- 4. Endocrinología: Osmolaridad Sérica ----
    const calcOsmo = () => {
        const na = parseFloat(document.getElementById('osmo-na').value);
        const glu = parseFloat(document.getElementById('osmo-glu').value);
        const type = document.getElementById('osmo-type').value;
        const urea = parseFloat(document.getElementById('osmo-urea').value);
        const bun = parseFloat(document.getElementById('osmo-bun').value);

        const resultEl = document.getElementById('osmo-result');
        const interpEl = document.getElementById('osmo-interpretation');

        let isValid = false;
        let thirdVal = 0;
        let thirdFactor = 1;

        if (na > 0 && !isNaN(glu)) {
            if (type === 'urea' && !isNaN(urea)) {
                isValid = true;
                thirdVal = urea;
                thirdFactor = 6;
            } else if (type === 'bun' && !isNaN(bun)) {
                isValid = true;
                thirdVal = bun;
                thirdFactor = 2.8;
            }
        }

        if (isValid) {
            const osmo = (2 * na) + (glu / 18) + (thirdVal / thirdFactor);
            const resVal = parseFloat(osmo.toFixed(1));
            resultEl.textContent = resVal;

            if (resVal < 275) {
                interpEl.textContent = "Hipoosmolar (< 275)";
                interpEl.className = "text-sm font-medium mt-2 text-blue-500";
            } else if (resVal >= 275 && resVal <= 295) {
                interpEl.textContent = "Isoosmolar/Normal (275 - 295)";
                interpEl.className = "text-sm font-medium mt-2 text-green-500";
            } else {
                interpEl.textContent = "Hiperoosmolar (> 295)";
                interpEl.className = "text-sm font-medium mt-2 text-red-500";
            }
        } else {
            resultEl.textContent = '--';
            interpEl.textContent = '';
        }
    };
    addCalcListeners(['osmo-na', 'osmo-glu', 'osmo-urea', 'osmo-bun'], calcOsmo);

    // ---- 5. Fisiología: Anion Gap ----
    const calcAG = () => {
        const na = parseFloat(document.getElementById('ag-na').value);
        const cl = parseFloat(document.getElementById('ag-cl').value);
        const hco3 = parseFloat(document.getElementById('ag-hco3').value);

        const resultEl = document.getElementById('ag-result');
        const interpEl = document.getElementById('ag-interpretation');

        if (na > 0 && cl > 0 && hco3 > 0) {
            const ag = na - (cl + hco3);
            const resVal = parseFloat(ag.toFixed(1));
            resultEl.textContent = resVal;

            if (resVal < 8) {
                interpEl.textContent = "Brecha baja (< 8)";
                interpEl.className = "text-sm font-medium mt-2 text-blue-500";
            } else if (resVal >= 8 && resVal <= 12) {
                interpEl.textContent = "Normal (8 - 12)";
                interpEl.className = "text-sm font-medium mt-2 text-green-500";
            } else {
                interpEl.textContent = "Brecha elevada (> 12)";
                interpEl.className = "text-sm font-medium mt-2 text-red-500";
            }
        } else {
            resultEl.textContent = '--';
            interpEl.textContent = '';
        }
    };
    addCalcListeners(['ag-na', 'ag-cl', 'ag-hco3'], calcAG);

    // ---- 6. Fisiología: Starling ----
    const calcStarling = () => {
        const pc = parseFloat(document.getElementById('star-pc').value);
        const pi = parseFloat(document.getElementById('star-pi').value);
        const pic = parseFloat(document.getElementById('star-pic').value);
        const pii = parseFloat(document.getElementById('star-pii').value);

        const resultEl = document.getElementById('star-result');
        const interpEl = document.getElementById('star-interpretation');

        if (!isNaN(pc) && !isNaN(pi) && !isNaN(pic) && !isNaN(pii)) {
            const netFlow = (pc - pi) - (pic - pii);
            const resVal = parseFloat(netFlow.toFixed(1));
            resultEl.textContent = resVal;

            if (resVal > 0) {
                interpEl.textContent = "Presión Neta de Filtración (> 0)";
                interpEl.className = "text-sm font-medium mt-2 text-green-500";
            } else if (resVal < 0) {
                interpEl.textContent = "Presión Neta de Reabsorción (< 0)";
                interpEl.className = "text-sm font-medium mt-2 text-blue-500";
            } else {
                interpEl.textContent = "Equilibrio (0)";
                interpEl.className = "text-sm font-medium mt-2 text-gray-500";
            }
        } else {
            resultEl.textContent = '--';
            interpEl.textContent = '';
        }
    };
    addCalcListeners(['star-pc', 'star-pi', 'star-pic', 'star-pii'], calcStarling);


    // ---- Clear Buttons Logic ----
    // Mapping format data-clear="type" directly to the calculation resets
    const clearMappers = {
        'mdrd': () => calcMDRD(),
        'fena': () => calcFENa(),
        'katz': () => calcKatz(),
        'osmo': () => calcOsmo(),
        'ag': () => calcAG(),
        'star': () => calcStarling()
    };

    document.querySelectorAll('button[data-clear]').forEach(btn => {
        btn.addEventListener('click', () => {
            const type = btn.getAttribute('data-clear');
            const container = document.getElementById(`card-${type}`);
            if (container) {
                const inputs = container.querySelectorAll('input');
                inputs.forEach(inp => {
                    if (inp.type === 'checkbox' || inp.type === 'radio') {
                        inp.checked = false;
                    } else {
                        inp.value = '';
                    }
                });

                // Recalculate to clear outputs
                if (clearMappers[type]) {
                    clearMappers[type]();
                }
            }
        });
    });

    // ---- Copy Buttons Logic ----
    document.querySelectorAll('button[data-copy]').forEach(btn => {
        btn.addEventListener('click', async () => {
            const type = btn.getAttribute('data-copy');
            const resultVal = document.getElementById(`${type}-result`)?.textContent;
            const interpVal = document.getElementById(`${type}-interpretation`)?.textContent;

            if (resultVal && resultVal !== '--') {
                const textToCopy = `Resultado: ${resultVal}\nInterpretación: ${interpVal || 'N/A'}`;

                try {
                    await navigator.clipboard.writeText(textToCopy);

                    // Show "Copiado!" message
                    const msgEl = document.getElementById(`${type}-copied`);
                    if (msgEl) {
                        msgEl.classList.remove('hidden');
                        setTimeout(() => {
                            msgEl.classList.add('hidden');
                        }, 2000); // hide after 2 seconds
                    }
                } catch (err) {
                    console.error('Failed to copy: ', err);
                }
            }
        });
    });
});
