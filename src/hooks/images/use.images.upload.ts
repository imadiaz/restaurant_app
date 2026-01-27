import { useState } from 'react';
import { useErrorHandler } from '../use.error.handler';
import { imagesService } from '../../service/images.service';


export const useImagesUpload = () => {
  const [isUploading, setIsUploading] = useState(false);
  const { handleError } = useErrorHandler();

  const upload = async (file: File): Promise<string | null> => {
    setIsUploading(true);
    try {
      const url = await imagesService.uploadImage(file);
      return url;
    } catch (error) {
      handleError(error);
      return null;
    } finally {
      setIsUploading(false);
    }
  };

  return { upload, isUploading };
};