




    sampleProfileLine(coordinates) {
        const options = {units: 'meters'};
        const line = turf.lineString(coordinates);
        const lineLength = turf.length(line, options);
        let numSamples = 200;
        const metersPerPx = this.getZoomLevelResolution(coordinates[0][1], 12);

        const stepSize = Math.max(metersPerPx, lineLength / numSamples);
        numSamples = lineLength / stepSize;

        const samples = [];
        for (let i = 0; i <= numSamples; i++) {
            const along = turf.along(line, i * stepSize, options);
            const coords = along.geometry.coordinates;
            samples.push(coords);
        }

        return samples;
    }

    getZoomLevelResolution(latitude, zoom) {
        const metersPerPx = (Math.cos(latitude * Math.PI/180.0) * 2 * Math.PI * 6378137) / (512 * 2**zoom);
        return metersPerPx;
    }

    clearChart() {
        if (this.chart) {
            this.chart.detach();
        }
        document.getElementById('chart').innerHTML = "";
    }

    async drawElevationProfile(coordinates) {
        const samples = this.sampleProfileLine(coordinates);
        const elevationProfile = [];
        for (const c of samples) {
            const elevation = await this.elevationProvider.getElevation(c[1], c[0]);
            elevationProfile.push(elevation);
        }

        const minElevation = Math.min(...elevationProfile);

        this.chart = new Chartist.Line('#chart', {
            series: [elevationProfile]
        }, {
            low: minElevation - 100,
            showArea: true,
            showPoint: false,
            fullWidth: true,
            lineSmooth: Chartist.Interpolation.cardinal({
                tension: 4,
                fillHoles: false
            })
        });
    }
}

new ElevationProfile('ikPbJwwEEbaMHCvgAxpQ');

