// credits: https://stackoverflow.com/questions/13762864/image-brightness-detection-in-client-side-script

function getImageBrightness(imageSrc) {
    return new Promise(function(resolve) {
        const img = document.createElement("img");
        img.style.display = "none";
        img.crossOrigin = "anonymous";
        img.src = imageSrc;
        document.body.appendChild(img);

        var colorSum = 0;

        img.onload = function () {
            // create canvas
            const canvas = document.createElement("canvas");
            canvas.width = this.width;
            canvas.height = this.height;

            const ctx = canvas.getContext("2d");
            ctx.drawImage(this, 0, 0);

            var imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
            const data = imageData.data;
            var r, g, b, avg;

            for (var x = 0, len = data.length; x < len; x += 4) {
                r = data[x];
                g = data[x + 1];
                b = data[x + 2];

                avg = Math.floor((r + g + b) / 3);
                colorSum += avg;
            }

            const brightness = Math.floor(colorSum / (this.width * this.height));
            return resolve(brightness);
        }
    })
}

function imageIsBright(imageSrc, threshold = 110) {
    return new Promise(function(resolve) {
        return getImageBrightness(imageSrc)
            .then((res) => {
                console.log('video is brigth? ', (res > threshold));
                return resolve(res > threshold);
            })
    })
}
