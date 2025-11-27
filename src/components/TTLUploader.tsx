import React from 'react';

interface TTLUploaderProps {
  onFileLoad: (content: string) => void;
}

export const TTLUploader: React.FC<TTLUploaderProps> = ({ onFileLoad }) => {
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const content = e.target?.result as string;
        onFileLoad(content);
      };
      reader.readAsText(file);
    }
  };

  return (
    <div>
      <input 
        type="file" 
        accept=".ttl,.turtle" 
        onChange={handleFileChange}
      />
    </div>
  );
};