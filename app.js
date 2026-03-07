document.addEventListener('DOMContentLoaded', () => {
    // ---- Tabs Logic ----
    const tabs = document.querySelectorAll('#tabs-container li');
    const sections = document.querySelectorAll('.tab-content');

    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            // Remove active classes
            tabs.forEach(t => {
                t.classList.remove('tab-active');
                t.classList.add('hover:text-gray-300');
            });
            // Add active to clicked
            tab.classList.add('tab-active');
            tab.classList.remove('hover:text-gray-300');

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
            if(el) {
                el.addEventListener('input', calcFunction);
                if(el.type === 'checkbox') {
                    el.addEventListener('change', calcFunction);
                }
            }
        });
    };

    // ---- 1. Nefrología: MDRD-4 ----
    const calcMDRD = () => {
        const cr = parseFloat(document.getElementById('mdrd-cr').value);
        const age = parseFloat(document.getElementById('mdrd-age').value);
        const isFemale = document.getElementById('mdrd-female').checked;
        const isBlack = document.getElementById('mdrd-black').checked;

        if (cr > 0 && age > 0) {
            let gfr = 175 * Math.pow(cr, -1.154) * Math.pow(age, -0.203);
            if (isFemale) gfr *= 0.742;
            if (isBlack) gfr *= 1.212;
            document.getElementById('mdrd-result').textContent = gfr.toFixed(1);
        } else {
            document.getElementById('mdrd-result').textContent = '--';
        }
    };
    addCalcListeners(['mdrd-cr', 'mdrd-age', 'mdrd-female', 'mdrd-black'], calcMDRD);

    // ---- 2. Nefrología: FENa ----
    const calcFENa = () => {
        const una = parseFloat(document.getElementById('fena-una').value);
        const pna = parseFloat(document.getElementById('fena-pna').value);
        const ucr = parseFloat(document.getElementById('fena-ucr').value);
        const pcr = parseFloat(document.getElementById('fena-pcr').value);

        if (una > 0 && pna > 0 && ucr > 0 && pcr > 0) {
            const fena = ((una * pcr) / (pna * ucr)) * 100;
            document.getElementById('fena-result').textContent = fena.toFixed(2);
            
            const interpEl = document.getElementById('fena-interpretation');
            if(fena < 1) {
                interpEl.textContent = "Sugiere patología prerrenal (< 1%)";
                interpEl.className = "text-sm mt-2 font-medium text-cyan-400";
            }
            else if(fena > 2) {
                interpEl.textContent = "Sugiere necrosis tubular aguda - NTA (> 2%)";
                interpEl.className = "text-sm mt-2 font-medium text-orange-400";
            }
            else {
                interpEl.textContent = "Indeterminado (1% - 2%)";
                interpEl.className = "text-sm mt-2 font-medium text-gray-400";
            }
        } else {
            document.getElementById('fena-result').textContent = '--';
            document.getElementById('fena-interpretation').textContent = '';
        }
    };
    addCalcListeners(['fena-una', 'fena-pna', 'fena-ucr', 'fena-pcr'], calcFENa);

    // ---- 3. Endocrinología: Sodio Corregido (Katz) ----
    const calcKatz = () => {
        const na = parseFloat(document.getElementById('katz-na').value);
        const glu = parseFloat(document.getElementById('katz-glu').value);

        if (na > 0 && glu >= 0) {
            const factor = (glu - 100) / 100;
            const corrected = glu > 100 ? na + (1.6 * factor) : na;
            document.getElementById('katz-result').textContent = corrected.toFixed(1);
        } else {
            document.getElementById('katz-result').textContent = '--';
        }
    };
    addCalcListeners(['katz-na', 'katz-glu'], calcKatz);

    // ---- 4. Endocrinología: Osmolaridad Sérica ----
    const calcOsmo = () => {
        const na = parseFloat(document.getElementById('osmo-na').value);
        const glu = parseFloat(document.getElementById('osmo-glu').value);
        const bun = parseFloat(document.getElementById('osmo-bun').value);

        if (na > 0 && !isNaN(glu) && !isNaN(bun)) {
            // Handles if partial inputs exist but require all 3 for best result
            const valGlu = isNaN(glu) ? 0 : glu;
            const valBun = isNaN(bun) ? 0 : bun;
            const osmo = (2 * na) + (valGlu / 18) + (valBun / 2.8);
            document.getElementById('osmo-result').textContent = osmo.toFixed(1);
        } else {
            document.getElementById('osmo-result').textContent = '--';
        }
    };
    addCalcListeners(['osmo-na', 'osmo-glu', 'osmo-bun'], calcOsmo);

    // ---- 5. Fisiología: Anion Gap ----
    const calcAG = () => {
        const na = parseFloat(document.getElementById('ag-na').value);
        const cl = parseFloat(document.getElementById('ag-cl').value);
        const hco3 = parseFloat(document.getElementById('ag-hco3').value);

        if (na > 0 && cl > 0 && hco3 > 0) {
            const ag = na - (cl + hco3);
            document.getElementById('ag-result').textContent = ag.toFixed(1);
        } else {
            document.getElementById('ag-result').textContent = '--';
        }
    };
    addCalcListeners(['ag-na', 'ag-cl', 'ag-hco3'], calcAG);

    // ---- 6. Fisiología: Starling ----
    const calcStarling = () => {
        const pc = parseFloat(document.getElementById('star-pc').value);
        const pi = parseFloat(document.getElementById('star-pi').value);
        const pic = parseFloat(document.getElementById('star-pic').value);
        const pii = parseFloat(document.getElementById('star-pii').value);

        if (!isNaN(pc) && !isNaN(pi) && !isNaN(pic) && !isNaN(pii)) {
            const netFlow = (pc - pi) - (pic - pii);
            document.getElementById('star-result').textContent = netFlow.toFixed(1);
        } else {
            document.getElementById('star-result').textContent = '--';
        }
    };
    addCalcListeners(['star-pc', 'star-pi', 'star-pic', 'star-pii'], calcStarling);
});
