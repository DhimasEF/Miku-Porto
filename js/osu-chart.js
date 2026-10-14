// The bundled .osu file is the sole source of gameplay notes. Keep hit object
// timestamps in source milliseconds; the game derives excerpt-relative time.
(() => {
    // Resolve beside this script so the chart still loads when the portfolio is
    // published under a nested path (for example, a GitHub Pages project URL).
    const scriptUrl = document.currentScript && document.currentScript.src;
    const SOURCE_URL = scriptUrl
        ? new URL('../assets/hit.osu', scriptUrl).href
        : new URL('assets/hit.osu', document.baseURI).href;
    const START_MS = 162000;
    const END_MS = 240000;
    const LANE_BY_X = new Map([[64, 0], [192, 1], [320, 2], [448, 3]]);

    function parseOsuManiaChart(contents) {
        const lines = contents.split(/\r?\n/);
        let section = '';
        let mode = null;
        let keyCount = null;
        let foundHitObjects = false;
        const notes = [];

        for (const rawLine of lines) {
            const line = rawLine.trim();
            if (!line || line.startsWith('//')) continue;
            const heading = line.match(/^\[(.+)]$/);
            if (heading) {
                section = heading[1];
                if (section === 'HitObjects') foundHitObjects = true;
                continue;
            }

            if (section === 'General' && line.startsWith('Mode:')) {
                mode = Number(line.slice(line.indexOf(':') + 1).trim());
            } else if (section === 'Difficulty' && line.startsWith('CircleSize:')) {
                keyCount = Number(line.slice(line.indexOf(':') + 1).trim());
            } else if (section === 'HitObjects') {
                const fields = line.split(',');
                if (fields.length < 5) throw new Error(`Invalid HitObjects row: ${line}`);
                const x = Number(fields[0]);
                const timeMs = Number(fields[2]);
                const type = Number(fields[3]);
                if (!Number.isFinite(x) || !Number.isInteger(timeMs) || !Number.isInteger(type)) {
                    throw new Error(`Invalid HitObjects values: ${line}`);
                }
                if (timeMs < START_MS || timeMs > END_MS) continue;
                const lane = LANE_BY_X.get(x);
                if (lane === undefined) throw new Error(`Unexpected 4K x-coordinate ${x} at ${timeMs} ms`);

                if (type === 1 || type === 5) {
                    notes.push({ sourceTimeMs: timeMs, lane, endTimeMs: timeMs, type });
                } else if ((type & 128) !== 0) {
                    const holdEndMs = Number((fields[5] || '').split(':')[0]);
                    if (!Number.isInteger(holdEndMs) || holdEndMs < timeMs) {
                        throw new Error(`Invalid hold end time: ${line}`);
                    }
                    notes.push({ sourceTimeMs: timeMs, lane, endTimeMs: holdEndMs, type: 128 });
                }
            }
        }

        if (!foundHitObjects || mode !== 3 || keyCount !== 4) {
            throw new Error(`Expected an osu!mania 4K map (Mode 3, CircleSize 4); got Mode ${mode}, CircleSize ${keyCount}`);
        }
        // Do not sort or coalesce: preserve every source row and source ordering.
        return notes;
    }

    window.osuArcadeChartReady = fetch(SOURCE_URL)
        .then(response => {
            if (!response.ok) throw new Error(`Could not load ${SOURCE_URL} (${response.status})`);
            return response.text();
        })
        .then(parseOsuManiaChart)
        .then(notes => {
            window.osuArcadeChart = notes;
            return notes;
        });
})();
