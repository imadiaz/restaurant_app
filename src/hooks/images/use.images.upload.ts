import { useState } from 'react';
import { useErrorHandler } from '../use.error.handler';
import { imagesService } from '../../service/images.service';

export const FILES_PATHS = {
  RestaurantUsers: (restaurantId: string) => `restaurants/${restaurantId}/users`,
  RestaurantsLogo: `general/restaurants/images/logo`,
  RestaurantsBanner: `general/restaurants/images/banners`,
  Products:(restaurantId: string) => `restaurants/${restaurantId}/products`,
  Drivers:(restaurantId: string) =>`restaurants/${restaurantId}/drivers/`
} as const;

export const useImagesUpload = () => {
  const [isUploading, setIsUploading] = useState(false);
  const { handleError } = useErrorHandler();

  const uploadFile = async (file: File, path: string): Promise<string | null> => {
    setIsUploading(true);
    try {
      const url = await imagesService.upload(file, path);
      return url;
    } catch (error) {
      handleError(error);
      return null;
    } finally {
      setIsUploading(false);
    }
  };



  return { uploadFile, isUploading };
};