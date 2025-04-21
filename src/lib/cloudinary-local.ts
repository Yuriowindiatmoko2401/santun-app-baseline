/**
 * Local replacement for Cloudinary functionality
 * This provides a mock implementation for file uploads in local development
 */

// Simulate the Cloudinary widget in local development
export class LocalCloudinaryWidget {
  onSuccess: (result: any, context: any) => void;
  onFailure: (error: any) => void;
  
  constructor(options: {
    onSuccess: (result: any, context: any) => void,
    onFailure?: (error: any) => void
  }) {
    this.onSuccess = options.onSuccess;
    this.onFailure = options.onFailure || ((error) => console.error(error));
  }
  
  open() {
    // Create a file input
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.style.display = 'none';
    document.body.appendChild(input);
    
    // Handle file selection
    input.onchange = async (event) => {
      const file = (event.target as HTMLInputElement).files?.[0];
      if (!file) {
        this.onFailure(new Error('No file selected'));
        document.body.removeChild(input);
        return;
      }
      
      // Create a local URL for the file
      const localUrl = URL.createObjectURL(file);
      
      // Simulate a successful upload
      this.onSuccess({
        info: {
          secure_url: localUrl,
          public_id: `local_${Date.now()}`,
          format: file.name.split('.').pop() || 'jpg',
          width: 800, // Placeholder values
          height: 600,
        }
      }, { widget: { close: () => {} } });
      
      document.body.removeChild(input);
    };
    
    // Trigger the file dialog
    input.click();
  }
  
  close() {
    // No-op
  }
}

// Function to check if we're in local development
export const isLocalDev = () => {
  return process.env.NEXT_PUBLIC_USE_LOCAL_SERVICES === 'true';
};

// Create and export mock Cloudinary methods
export const cloudinaryLocal = {
  createUploadWidget: (options: any, callback: any) => {
    return new LocalCloudinaryWidget({
      onSuccess: (result, context) => callback(null, { event: 'success', info: result.info }),
      onFailure: (error) => callback(error, { event: 'failure' })
    });
  }
};
