/**
 * Comprime um arquivo de imagem no cliente de forma 100% nativa usando HTML5 Canvas.
 * Redimensiona a largura máxima proporcionalmente para 800px e exporta como Blob WebP.
 * 
 * @param file Arquivo original vindo do input type="file"
 * @param quality Qualidade da compressão WebP (0.0 a 1.0)
 */
export function compressImageToWebp(file: File, quality = 0.82): Promise<Blob> {
  return new Promise((resolve, reject) => {
    // Validação inicial do tipo de arquivo
    if (!file.type.startsWith('image/')) {
      reject(new Error('O arquivo selecionado não é uma imagem válida.'));
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new window.Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;
        const maxWidth = 800;

        // Redimensiona proporcionalmente mantendo a proporção se exceder 800px
        if (width > maxWidth) {
          height = Math.round((height * maxWidth) / width);
          width = maxWidth;
        }

        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Erro ao inicializar contexto 2D do Canvas.'));
          return;
        }

        // Limpa e desenha com anti-aliasing
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        ctx.drawImage(img, 0, 0, width, height);

        // Converte o canvas em um blob no formato .webp
        canvas.toBlob(
          (blob) => {
            if (blob) {
              resolve(blob);
            } else {
              reject(new Error('Não foi possível gerar a compressão física da imagem.'));
            }
          },
          'image/webp',
          quality
        );
      };
      
      img.onerror = () => {
        reject(new Error('Erro ao processar as dimensões da imagem.'));
      };
      
      img.src = event.target?.result as string;
    };
    
    reader.onerror = () => {
      reject(new Error('Erro ao ler arquivo local do dispositivo.'));
    };
    
    reader.readAsDataURL(file);
  });
}
