/*
  Put this in a bookmark:
  javascript:var s=document.createElement('script');s.src='https://reheatedcake.io/trianglifier/bookmarklet.js';document.body.appendChild(s);
*/
function trianglify(image) {
  const triangles = 40;
  const scaleAmt = 0.2;
  const slow = 0;

  if (image.width === 0 || image.height === 0)
    return false;

  const secureImage = url => fetch('https://cors-anywhere.herokuapp.com/' + url, {})
    .then(r => r.blob())
    .then(blob => URL.createObjectURL(blob))
    .then(url => new Promise((resolve, reject) => {
      const fake = new Image();
      fake.src = url;
      fake.onload = () => resolve(fake);
      fake.onerror = reject;
    }));

  const genTriangle = (w, h) => {
    const size = Math.min(w, h);
    const randMag = () => Math.random() * size/4 + size/8;
    const arcA = Math.random() * Math.PI;
    const arcB = arcA + (Math.random() * Math.PI / 4 - Math.PI / 8) + Math.PI * 2 / 3;
    const arcC = arcB + (Math.random() * Math.PI / 4 - Math.PI / 8) + Math.PI * 2 / 3;
    const polarToCartesian = (ang, mag, [x, y]) => [
      Math.floor(Math.cos(ang) * mag + x),
      Math.floor(Math.sin(ang) * mag + y),
    ];
    const center = [
      (Math.random() * 0.8 + 0.1) * w,
      (Math.random() * 0.8 + 0.1) * h,
    ];
    return {
      points: [arcA, arcB, arcC].map(rad => polarToCartesian(rad, randMag(), center)),
      center,
    };
  };

  const run = (image, dest) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    canvas.style.width = (canvas.width = ctx.canvas.width = image.width) + 'px';
    canvas.style.height = (canvas.height = ctx.canvas.height = image.height) + 'px';
    ctx.drawImage(image, 0, 0);
    for(let i = 0; i < triangles; i++) {
      const ctx = canvas.getContext('2d');
      ctx.save();
      ctx.beginPath();
      const {points: [start, ...points], center} = genTriangle(ctx.canvas.width, ctx.canvas.height);
      ctx.moveTo(...start);
      points.forEach(p => ctx.lineTo(...p));
      const scale = Math.random() * scaleAmt + 1;
      ctx.translate((center[0]-center[0]*scale), (center[1]-center[1]*scale));
      ctx.scale(scale, scale);
      ctx.clip();
      ctx.drawImage(canvas, 0, 0);
      ctx.restore();
    }

    dest.src = canvas.toDataURL();
  }

  secureImage(image.src).then(fake => run(fake, image));
}

Array.from(document.querySelectorAll('img')).forEach(trianglify);