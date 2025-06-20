// compress.js
function compressImage(file, maxWidth, maxSize) {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = e => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        const scale = maxWidth / img.width;
        canvas.width = maxWidth;
        canvas.height = img.height * scale;

        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

        function tryCompress(quality) {
          canvas.toBlob(blob => {
            if (blob.size <= maxSize || quality <= 0.2) {
              resolve(blob);
            } else {
              tryCompress(quality - 0.1);
            }
          }, "image/jpeg", quality);
        }

        tryCompress(0.9);
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  });
}
